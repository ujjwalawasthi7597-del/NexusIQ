/**
 * NexusIQ — Background Document Indexing Queue Service
 * Implements BullMQ-compatible asynchronous document ingestion lifecycle
 */

import { db, generateObjectId } from '../db/mongo.ts';
import { parseDocumentContent } from './documentParser.ts';
import { chunkDocumentPages } from './chunkingService.ts';
import { generateEmbedding } from './aiProvider.ts';

export interface IndexingJob {
  id: string;
  documentId: string;
  organizationId: string;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'active' | 'completed' | 'failed';
  error?: string;
  createdAt: number;
}

class IndexingQueue {
  private queue: IndexingJob[] = [];
  private isProcessing: boolean = false;
  private activeJobsCount: number = 0;
  private concurrency: number = 2;

  public enqueue(job: Omit<IndexingJob, 'attempts' | 'maxAttempts' | 'status' | 'createdAt'>): IndexingJob {
    const fullJob: IndexingJob = {
      ...job,
      attempts: 0,
      maxAttempts: 3,
      status: 'queued',
      createdAt: Date.now(),
    };
    this.queue.push(fullJob);

    const doc = db.documents.get(job.documentId);
    if (doc) {
      doc.processingStatus = 'queued';
      doc.indexingStatus = 'in_progress';
      db.documents.set(doc.id, doc);
    }

    // Process asynchronously without blocking HTTP response
    setTimeout(() => this.processNext(), 20);
    return fullJob;
  }

  public getQueueStats() {
    return {
      waiting: this.queue.filter((j) => j.status === 'queued').length,
      active: this.activeJobsCount,
      totalProcessed: db.documents.size,
    };
  }

  private async processNext(): Promise<void> {
    if (this.activeJobsCount >= this.concurrency) return;
    const nextJob = this.queue.find((j) => j.status === 'queued');
    if (!nextJob) return;

    nextJob.status = 'active';
    this.activeJobsCount++;

    const doc = db.documents.get(nextJob.documentId);
    if (!doc) {
      this.activeJobsCount--;
      return;
    }

    const startTime = Date.now();

    try {
      // Step 1: Extracting
      doc.processingStatus = 'extracting';
      db.documents.set(doc.id, doc);
      await new Promise((r) => setTimeout(r, 80)); // Simulate worker tick

      const parsed = parseDocumentContent(nextJob.fileName, nextJob.fileBuffer, nextJob.mimeType);
      doc.pageCount = parsed.pageCount;
      if (!doc.title || doc.title === doc.fileName) {
        doc.title = parsed.title;
      }

      // Step 2: Chunking
      doc.processingStatus = 'chunking';
      db.documents.set(doc.id, doc);
      await new Promise((r) => setTimeout(r, 60));

      const org = db.organizations.get(doc.organizationId);
      const chunkSize = org?.settings.defaultChunkSize || 500;
      const chunkOverlap = org?.settings.defaultChunkOverlap || 100;

      const chunks = chunkDocumentPages(
        doc.organizationId,
        doc.id,
        doc.workspaceId,
        doc.departmentId,
        parsed.pages,
        {
          chunkSize,
          chunkOverlap,
          modelName: org?.settings.embeddingModel || 'gemini-embedding-2-preview',
          version: doc.indexingVersion || 1,
        }
      );

      // Step 3: Embedding in batches
      doc.processingStatus = 'embedding';
      db.documents.set(doc.id, doc);

      for (const chunk of chunks) {
        chunk.embedding = await generateEmbedding(chunk.text);
        db.documentChunks.set(chunk.id, chunk);
      }

      // Step 4: Indexed & Complete
      const durationMs = Date.now() - startTime;
      doc.processingStatus = 'indexed';
      doc.indexingStatus = 'completed';
      doc.chunkCount = chunks.length;
      doc.processingDurationMs = durationMs;
      doc.updatedAt = new Date().toISOString();
      db.documents.set(doc.id, doc);

      // Create completion notification for uploader
      db.notifications.unshift({
        id: generateObjectId(),
        organizationId: doc.organizationId,
        userId: doc.uploadedBy,
        type: 'document_indexed',
        title: 'Document Ready for AI Search',
        body: `"${doc.title}" was successfully indexed (${chunks.length} chunks, ${parsed.pageCount} pages) in ${durationMs}ms.`,
        link: `/documents/${doc.id}`,
        createdAt: new Date().toISOString(),
      });

      // Record audit log
      db.auditLogs.unshift({
        id: generateObjectId(),
        organizationId: doc.organizationId,
        actorId: doc.uploadedBy,
        actorName: doc.uploaderName || 'User',
        action: 'document.indexed',
        resourceType: 'document',
        resourceId: doc.id,
        resourceName: doc.title,
        metadata: {
          chunks: chunks.length,
          pages: parsed.pageCount,
          durationMs,
        },
        createdAt: new Date().toISOString(),
      });

      nextJob.status = 'completed';
      db.persistToDisk();
    } catch (err: any) {
      nextJob.attempts++;
      if (nextJob.attempts < nextJob.maxAttempts) {
        nextJob.status = 'queued'; // Retry with backoff
      } else {
        nextJob.status = 'failed';
        nextJob.error = err.message || 'Indexing error';
        doc.processingStatus = 'failed';
        doc.indexingStatus = 'failed';
        doc.errorMessage = nextJob.error;
        db.documents.set(doc.id, doc);

        db.notifications.unshift({
          id: generateObjectId(),
          organizationId: doc.organizationId,
          userId: doc.uploadedBy,
          type: 'document_failed',
          title: 'Document Indexing Failed',
          body: `Failed to index "${doc.title}": ${err.message || 'Unknown parsing failure'}.`,
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      this.activeJobsCount--;
      this.processNext();
    }
  }
}

export const indexingQueue = new IndexingQueue();
