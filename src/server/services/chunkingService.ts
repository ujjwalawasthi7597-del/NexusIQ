/**
 * NexusIQ — Semantic Chunking Service
 * Token-aware sliding window chunking with page and section preservation
 */

import { generateObjectId } from '../db/mongo.ts';
import type { DocumentChunk } from '../../types/index.ts';
import type { ParsedPage } from './documentParser.ts';

export interface ChunkingOptions {
  chunkSize?: number;      // Target characters per chunk (~500 chars)
  chunkOverlap?: number;   // Overlap characters (~100 chars)
  modelName?: string;
  version?: number;
}

export function chunkDocumentPages(
  organizationId: string,
  documentId: string,
  workspaceId: string,
  departmentId: string | undefined,
  pages: ParsedPage[],
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 500;
  const chunkOverlap = options.chunkOverlap || 100;
  const modelName = options.modelName || 'gemini-embedding-2-preview';
  const indexingVersion = options.version || 1;

  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const text = page.text.trim();
    if (!text) continue;

    // If page content is smaller than or around single chunk size
    if (text.length <= chunkSize + chunkOverlap) {
      chunks.push({
        id: generateObjectId(),
        organizationId,
        documentId,
        workspaceId,
        departmentId,
        chunkIndex: globalChunkIndex++,
        text,
        pageStart: page.pageNumber,
        pageEnd: page.pageNumber,
        sectionTitle: page.sectionTitle,
        sourceOffsets: { start: 0, end: text.length },
        embeddingModel: modelName,
        indexingVersion,
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // Sliding window chunking with semantic boundary preservation (sentence / paragraph)
    let startIndex = 0;
    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + chunkSize, text.length);

      // Try to break at paragraph or sentence boundary
      if (endIndex < text.length) {
        const nextBreak = text.indexOf('\n\n', endIndex - 50);
        if (nextBreak !== -1 && nextBreak <= endIndex + 50) {
          endIndex = nextBreak;
        } else {
          const nextPeriod = text.indexOf('. ', endIndex - 40);
          if (nextPeriod !== -1 && nextPeriod <= endIndex + 40) {
            endIndex = nextPeriod + 1;
          }
        }
      }

      const chunkSlice = text.slice(startIndex, endIndex).trim();
      if (chunkSlice.length > 20) {
        chunks.push({
          id: generateObjectId(),
          organizationId,
          documentId,
          workspaceId,
          departmentId,
          chunkIndex: globalChunkIndex++,
          text: chunkSlice,
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
          sectionTitle: page.sectionTitle,
          sourceOffsets: { start: startIndex, end: endIndex },
          embeddingModel: modelName,
          indexingVersion,
          createdAt: new Date().toISOString(),
        });
      }

      if (endIndex >= text.length) break;
      startIndex = Math.max(startIndex + 1, endIndex - chunkOverlap);
    }
  }

  return chunks;
}
