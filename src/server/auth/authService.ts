/**
 * NexusIQ — Centralized Authorization & Security Service
 * Enforces pre-retrieval access control, tenant isolation, and RBAC
 */

import crypto from 'crypto';
import { db } from '../db/mongo.ts';
import type {
  User,
  OrganizationRole,
  DocumentItem,
  Workspace
} from '../../types/index.ts';

// Password hashing using PBKDF2 with SHA-256 and salt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

// User role resolution for an organization
export function getUserMembershipRole(userId: string, organizationId: string): OrganizationRole | null {
  for (const m of db.organizationMemberships.values()) {
    if (m.userId === userId && m.organizationId === organizationId && m.status === 'active') {
      return m.role;
    }
  }
  return null;
}

export function getUserDepartmentIds(userId: string, organizationId: string): string[] {
  for (const m of db.organizationMemberships.values()) {
    if (m.userId === userId && m.organizationId === organizationId && m.status === 'active') {
      return m.departmentIds || [];
    }
  }
  return [];
}

export function getUserWorkspaceRole(userId: string, workspaceId: string): string | null {
  for (const wm of db.workspaceMemberships.values()) {
    if (wm.userId === userId && wm.workspaceId === workspaceId && wm.status === 'active') {
      return wm.role;
    }
  }
  return null;
}

// Security Check 1: canViewDocument
export function canViewDocument(user: User, document: DocumentItem): boolean {
  // 1. Mandatory Tenant Isolation check
  if (user.currentOrgId !== document.organizationId) {
    return false;
  }

  const role = getUserMembershipRole(user.id, user.currentOrgId);
  if (!role) return false;

  // Platform super admins and Org owners/admins have global visibility within the tenant
  if (role === 'org_owner' || role === 'org_admin') {
    return true;
  }

  // Document uploader always has access to their own document
  if (document.uploadedBy === user.id) {
    return true;
  }

  // Explicit document grant check
  for (const perm of db.documentPermissions.values()) {
    if (perm.documentId === document.id && perm.organizationId === user.currentOrgId) {
      if (perm.principalType === 'user' && perm.principalId === user.id) return true;
      if (perm.principalType === 'role' && perm.principalId === role) return true;
    }
  }

  // Department Visibility
  if (document.visibility === 'department' && document.departmentId) {
    const userDepts = getUserDepartmentIds(user.id, user.currentOrgId);
    if (userDepts.includes(document.departmentId)) {
      return true;
    }
  }

  // Workspace Visibility
  if (document.visibility === 'workspace' && document.workspaceId) {
    const ws = db.workspaces.get(document.workspaceId);
    if (ws) {
      if (ws.visibility === 'organization' && role !== 'guest') return true;
      const wsRole = getUserWorkspaceRole(user.id, document.workspaceId);
      if (wsRole) return true;
    }
  }

  // Organization-wide visibility
  if (document.visibility === 'organization' && role !== 'guest') {
    return true;
  }

  return false;
}

// Security Check 2: canUploadDocument
export function canUploadDocument(user: User, workspaceId: string): boolean {
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  if (!role || role === 'guest') return false;

  if (role === 'org_owner' || role === 'org_admin') return true;

  const ws = db.workspaces.get(workspaceId);
  if (!ws || ws.organizationId !== user.currentOrgId) return false;

  if (role === 'dept_manager') return true;

  const wsRole = getUserWorkspaceRole(user.id, workspaceId);
  return wsRole === 'manager' || wsRole === 'contributor';
}

// Security Check 3: canEditDocument
export function canEditDocument(user: User, document: DocumentItem): boolean {
  if (user.currentOrgId !== document.organizationId) return false;
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  if (!role) return false;

  if (role === 'org_owner' || role === 'org_admin') return true;
  if (document.uploadedBy === user.id) return true;

  return false;
}

// Security Check 4: canDeleteDocument
export function canDeleteDocument(user: User, document: DocumentItem): boolean {
  if (user.currentOrgId !== document.organizationId) return false;
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  if (!role) return false;

  if (role === 'org_owner' || role === 'org_admin') return true;
  if (document.uploadedBy === user.id && role !== 'guest') return true;

  return false;
}

// Security Check 5: canManageWorkspace
export function canManageWorkspace(user: User, workspace: Workspace): boolean {
  if (user.currentOrgId !== workspace.organizationId) return false;
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  if (role === 'org_owner' || role === 'org_admin') return true;
  if (workspace.ownerId === user.id) return true;

  const wsRole = getUserWorkspaceRole(user.id, workspace.id);
  return wsRole === 'manager';
}

// Security Check 6: canInviteMember
export function canInviteMember(user: User): boolean {
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  return role === 'org_owner' || role === 'org_admin' || role === 'dept_manager';
}

// Security Check 7: canViewAnalytics
export function canViewAnalytics(user: User): boolean {
  const role = getUserMembershipRole(user.id, user.currentOrgId);
  return role === 'org_owner' || role === 'org_admin' || role === 'dept_manager';
}

// Pre-retrieval Filter Generator: computes the exact set of authorized Document IDs
export function getAuthorizedDocumentIds(user: User, requestedWorkspaceId?: string): Set<string> {
  const authorizedIds = new Set<string>();

  for (const doc of db.documents.values()) {
    if (doc.organizationId !== user.currentOrgId) continue;
    if (doc.processingStatus !== 'indexed') continue;
    if (requestedWorkspaceId && doc.workspaceId !== requestedWorkspaceId) continue;

    if (canViewDocument(user, doc)) {
      authorizedIds.add(doc.id);
    }
  }

  return authorizedIds;
}

// Pre-retrieval Filter Generator: computes authorized Workspace IDs
export function getAuthorizedWorkspaceIds(user: User): Set<string> {
  const authorizedWs = new Set<string>();
  const role = getUserMembershipRole(user.id, user.currentOrgId);

  for (const ws of db.workspaces.values()) {
    if (ws.organizationId !== user.currentOrgId) continue;
    if (role === 'org_owner' || role === 'org_admin') {
      authorizedWs.add(ws.id);
      continue;
    }
    if (ws.visibility === 'organization' && role !== 'guest') {
      authorizedWs.add(ws.id);
      continue;
    }
    const wsRole = getUserWorkspaceRole(user.id, ws.id);
    if (wsRole) {
      authorizedWs.add(ws.id);
    }
  }

  return authorizedWs;
}
