/**
 * NexusIQ — Enterprise AI Knowledge Platform
 * Core TypeScript Domain Types & Interfaces
 */

export type PlatformRole = 'super_admin' | 'user';

export type OrganizationRole = 
  | 'org_owner' 
  | 'org_admin' 
  | 'dept_manager' 
  | 'employee' 
  | 'guest';

export type WorkspaceRole = 'manager' | 'contributor' | 'viewer';

export type DocumentVisibility = 'organization' | 'department' | 'workspace' | 'private' | 'restricted';

export type DocumentProcessingStatus = 
  | 'uploaded' 
  | 'queued' 
  | 'extracting' 
  | 'chunking' 
  | 'embedding' 
  | 'indexed' 
  | 'failed' 
  | 'deleting';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  platformRole: PlatformRole;
  currentOrgId: string;
  departmentId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  passwordHash?: string;
  salt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logoUrl?: string;
  settings: {
    allowedDomains: string[];
    defaultChunkSize: number;
    defaultChunkOverlap: number;
    defaultTopK: number;
    similarityThreshold: number;
    chatModel: string;
    embeddingModel: string;
    strictSecurityMode: boolean;
  };
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  departmentIds: string[];
  status: 'active' | 'invited' | 'suspended';
  joinedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  managerIds: string[];
  memberCount?: number;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: 'organization' | 'restricted' | 'private';
  departmentId?: string;
  status: 'active' | 'archived';
  memberCount?: number;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembership {
  id: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: 'active';
  joinedAt: string;
}

export interface DocumentPermission {
  id: string;
  organizationId: string;
  documentId: string;
  principalType: 'user' | 'role' | 'department' | 'workspace';
  principalId: string;
  permissions: Array<'read' | 'write' | 'admin'>;
  grantedBy: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  organizationId: string;
  workspaceId: string;
  departmentId?: string;
  uploadedBy: string;
  uploaderName?: string;
  title: string;
  description?: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  tags: string[];
  visibility: DocumentVisibility;
  processingStatus: DocumentProcessingStatus;
  indexingStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  indexingVersion: number;
  pageCount: number;
  chunkCount: number;
  processingDurationMs?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  organizationId: string;
  documentId: string;
  workspaceId: string;
  departmentId?: string;
  chunkIndex: number;
  text: string;
  embedding?: number[];
  pageStart: number;
  pageEnd: number;
  sectionTitle?: string;
  sourceOffsets?: { start: number; end: number };
  embeddingModel: string;
  indexingVersion: number;
  createdAt: string;
}

export interface Citation {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  sectionTitle?: string;
  excerpt: string;
  score: number;
  url?: string;
}

export interface ConversationMessage {
  id: string;
  organizationId: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: 'sent' | 'generating' | 'completed' | 'failed';
  citations?: Citation[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    estimatedCost: number;
  };
  feedback?: {
    rating: 'thumbs_up' | 'thumbs_down';
    comment?: string;
    category?: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  workspaceId?: string;
  title: string;
  status: 'active' | 'archived';
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceType: 'organization' | 'document' | 'workspace' | 'department' | 'membership' | 'auth' | 'settings' | 'query';
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  userId: string;
  type: 'document_indexed' | 'document_failed' | 'invitation' | 'access_granted' | 'system_alert';
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  departmentIds: string[];
  invitedBy: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface UsageAnalytics {
  totalQuestions: number;
  activeUsers: number;
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
  estimatedCost: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  retrievalSuccessRate: number;
  positiveFeedbackRate: number;
  questionsOverTime: Array<{ date: string; count: number; cost: number }>;
  usageByDepartment: Array<{ name: string; count: number; percentage: number }>;
  usageByModel: Array<{ model: string; count: number; tokens: number }>;
  latencyDistribution: Array<{ range: string; count: number }>;
}

export interface SearchResultItem {
  chunk: DocumentChunk;
  document: DocumentItem;
  score: number;
  matchType: 'vector' | 'keyword' | 'hybrid';
  highlightExcerpt: string;
}
