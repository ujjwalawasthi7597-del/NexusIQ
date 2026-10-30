/**
 * NexusIQ — Enterprise AI Knowledge Platform
 * Database Layer: MongoDB Architecture & Tenant Data Access
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  User,
  Organization,
  OrganizationMembership,
  Department,
  Workspace,
  WorkspaceMembership,
  DocumentItem,
  DocumentPermission,
  DocumentChunk,
  Conversation,
  ConversationMessage,
  AuditLog,
  NotificationItem,
  Invitation
} from '../../types/index.ts';

// Generates 24-character hexadecimal BSON ObjectId string
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineProcess = crypto.randomBytes(5).toString('hex');
  const counter = crypto.randomBytes(3).toString('hex');
  return `${timestamp}${machineProcess}${counter}`.slice(0, 24);
}

// In-Memory & Persisted MongoDB Storage Engine
export class MongoStore {
  private static instance: MongoStore;

  public users: Map<string, User> = new Map();
  public organizations: Map<string, Organization> = new Map();
  public organizationMemberships: Map<string, OrganizationMembership> = new Map();
  public departments: Map<string, Department> = new Map();
  public workspaces: Map<string, Workspace> = new Map();
  public workspaceMemberships: Map<string, WorkspaceMembership> = new Map();
  public documents: Map<string, DocumentItem> = new Map();
  public documentPermissions: Map<string, DocumentPermission> = new Map();
  public documentChunks: Map<string, DocumentChunk> = new Map();
  public conversations: Map<string, Conversation> = new Map();
  public conversationMessages: Map<string, ConversationMessage> = new Map();
  public auditLogs: AuditLog[] = [];
  public notifications: NotificationItem[] = [];
  public invitations: Map<string, Invitation> = new Map();
  public usageEvents: Array<{
    id: string;
    organizationId: string;
    userId: string;
    eventType: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    estimatedCost: number;
    createdAt: string;
  }> = [];

  public isConnectedToAtlas: boolean = false;
  public connectionError: string | null = null;
  private storageFilePath: string = path.resolve(process.cwd(), '.nexusiq_data.json');

  private constructor() {
    this.loadFromDisk();
  }

  public static getInstance(): MongoStore {
    if (!MongoStore.instance) {
      MongoStore.instance = new MongoStore();
    }
    return MongoStore.instance;
  }

  public persistToDisk(): void {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        organizations: Array.from(this.organizations.entries()),
        organizationMemberships: Array.from(this.organizationMemberships.entries()),
        departments: Array.from(this.departments.entries()),
        workspaces: Array.from(this.workspaces.entries()),
        workspaceMemberships: Array.from(this.workspaceMemberships.entries()),
        documents: Array.from(this.documents.entries()),
        documentPermissions: Array.from(this.documentPermissions.entries()),
        documentChunks: Array.from(this.documentChunks.entries()),
        conversations: Array.from(this.conversations.entries()),
        conversationMessages: Array.from(this.conversationMessages.entries()),
        auditLogs: this.auditLogs.slice(-500),
        notifications: this.notifications.slice(-200),
        invitations: Array.from(this.invitations.entries()),
        usageEvents: this.usageEvents.slice(-1000)
      };
      fs.writeFileSync(this.storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Non-fatal if disk write cannot be completed in read-only environment
    }
  }

  public loadFromDisk(): boolean {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users) this.users = new Map(data.users);
        if (data.organizations) this.organizations = new Map(data.organizations);
        if (data.organizationMemberships) this.organizationMemberships = new Map(data.organizationMemberships);
        if (data.departments) this.departments = new Map(data.departments);
        if (data.workspaces) this.workspaces = new Map(data.workspaces);
        if (data.workspaceMemberships) this.workspaceMemberships = new Map(data.workspaceMemberships);
        if (data.documents) this.documents = new Map(data.documents);
        if (data.documentPermissions) this.documentPermissions = new Map(data.documentPermissions);
        if (data.documentChunks) this.documentChunks = new Map(data.documentChunks);
        if (data.conversations) this.conversations = new Map(data.conversations);
        if (data.conversationMessages) this.conversationMessages = new Map(data.conversationMessages);
        if (data.auditLogs) this.auditLogs = data.auditLogs;
        if (data.notifications) this.notifications = data.notifications;
        if (data.invitations) this.invitations = new Map(data.invitations);
        if (data.usageEvents) this.usageEvents = data.usageEvents;
        return true;
      }
    } catch {
      // Fresh init
    }
    return false;
  }

  public resetDatabase(): void {
    this.users.clear();
    this.organizations.clear();
    this.organizationMemberships.clear();
    this.departments.clear();
    this.workspaces.clear();
    this.workspaceMemberships.clear();
    this.documents.clear();
    this.documentPermissions.clear();
    this.documentChunks.clear();
    this.conversations.clear();
    this.conversationMessages.clear();
    this.auditLogs = [];
    this.notifications = [];
    this.invitations.clear();
    this.usageEvents = [];
    try {
      if (fs.existsSync(this.storageFilePath)) {
        fs.unlinkSync(this.storageFilePath);
      }
    } catch {}
  }
}

export const db = MongoStore.getInstance();
