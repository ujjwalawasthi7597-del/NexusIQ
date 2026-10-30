/**
 * NexusIQ — Enterprise Demo Seed Data
 * Generates realistic enterprise organization (Acme Corp), departments,
 * users with distinct roles, workspaces, and indexed policy documents.
 */

import { db, generateObjectId } from '../db/mongo.ts';
import { hashPassword } from '../auth/authService.ts';
import { generateEmbedding } from '../services/aiProvider.ts';
import type {
  User,
  Organization,
  Department,
  Workspace,
  DocumentItem,
  DocumentChunk
} from '../../types/index.ts';

export async function seedDemoData(): Promise<{ orgId: string; users: User[] }> {
  db.resetDatabase();

  const orgId = 'org_acme_corp_global';
  const ownerId = 'usr_elena_rostova';
  const engMgrId = 'usr_david_chen';
  const hrLeadId = 'usr_sarah_jenkins';
  const employeeId = 'usr_marcus_vance';
  const guestId = 'usr_alex_rivera';

  // 1. Organization
  const acmeOrg: Organization = {
    id: orgId,
    name: 'Acme Global Technologies Inc.',
    slug: 'acme-global',
    ownerId: ownerId,
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    settings: {
      allowedDomains: ['acmeglobal.com'],
      defaultChunkSize: 500,
      defaultChunkOverlap: 100,
      defaultTopK: 5,
      similarityThreshold: 0.45,
      chatModel: 'gemini-3.8-flash',
      embeddingModel: 'gemini-embedding-2-preview',
      strictSecurityMode: true,
    },
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.organizations.set(orgId, acmeOrg);

  // 2. Departments
  const deptHr: Department = {
    id: 'dept_hr',
    organizationId: orgId,
    name: 'Human Resources & People',
    description: 'Global talent acquisition, compensation, benefits, and workplace culture.',
    managerIds: [hrLeadId],
    memberCount: 14,
    documentCount: 4,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const deptEng: Department = {
    id: 'dept_eng',
    organizationId: orgId,
    name: 'Engineering & Infrastructure',
    description: 'Cloud platform, microservices architecture, DevOps, and backend systems.',
    managerIds: [engMgrId],
    memberCount: 48,
    documentCount: 6,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const deptSec: Department = {
    id: 'dept_sec',
    organizationId: orgId,
    name: 'Information Security & Compliance',
    description: 'SOC2 Type II, ISO 27001, data protection, and enterprise governance.',
    managerIds: [ownerId],
    memberCount: 8,
    documentCount: 3,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.departments.set(deptHr.id, deptHr);
  db.departments.set(deptEng.id, deptEng);
  db.departments.set(deptSec.id, deptSec);

  // 3. Workspaces
  const wsGeneral: Workspace = {
    id: 'ws_company_policies',
    organizationId: orgId,
    name: 'All-Company Global Policies',
    description: 'Standard operational guidelines, company handbook, and global HR benefits.',
    ownerId: ownerId,
    visibility: 'organization',
    status: 'active',
    memberCount: 70,
    documentCount: 2,
    createdAt: new Date('2026-01-16').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const wsEngineering: Workspace = {
    id: 'ws_eng_arch',
    organizationId: orgId,
    name: 'Engineering Systems & Architecture',
    description: 'Cloud microservices standards, database pooling, and API contracts.',
    ownerId: engMgrId,
    visibility: 'restricted',
    departmentId: 'dept_eng',
    status: 'active',
    memberCount: 48,
    documentCount: 2,
    createdAt: new Date('2026-01-18').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const wsExec: Workspace = {
    id: 'ws_exec_strategy',
    organizationId: orgId,
    name: 'Executive & Strategic Planning',
    description: 'Strictly confidential boardroom roadmaps, M&A, and financial budgets.',
    ownerId: ownerId,
    visibility: 'private',
    status: 'active',
    memberCount: 3,
    documentCount: 1,
    createdAt: new Date('2026-01-20').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.workspaces.set(wsGeneral.id, wsGeneral);
  db.workspaces.set(wsEngineering.id, wsEngineering);
  db.workspaces.set(wsExec.id, wsExec);

  // 4. Users with Distinct Enterprise Roles
  const { hash: demoHash, salt: demoSalt } = hashPassword('NexusIQ2026!');

  const users: User[] = [
    {
      id: ownerId,
      name: 'Elena Rostova',
      email: 'elena.rostova@acmeglobal.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      platformRole: 'user',
      currentOrgId: orgId,
      departmentId: 'dept_sec',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2026-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: engMgrId,
      name: 'David Chen',
      email: 'david.chen@acmeglobal.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      platformRole: 'user',
      currentOrgId: orgId,
      departmentId: 'dept_eng',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2026-01-17').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: hrLeadId,
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@acmeglobal.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      platformRole: 'user',
      currentOrgId: orgId,
      departmentId: 'dept_hr',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2026-01-18').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: employeeId,
      name: 'Marcus Vance',
      email: 'marcus.vance@acmeglobal.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      platformRole: 'user',
      currentOrgId: orgId,
      departmentId: 'dept_eng',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2026-02-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: guestId,
      name: 'Alex Rivera (External Auditor)',
      email: 'alex.rivera@auditors.com',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
      platformRole: 'user',
      currentOrgId: orgId,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date('2026-02-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  users.forEach((u) => db.users.set(u.id, u));

  // Organization Memberships
  db.organizationMemberships.set('mem_1', {
    id: 'mem_1',
    organizationId: orgId,
    userId: ownerId,
    role: 'org_owner',
    departmentIds: ['dept_sec', 'dept_hr', 'dept_eng'],
    status: 'active',
    joinedAt: new Date('2026-01-15').toISOString(),
  });

  db.organizationMemberships.set('mem_2', {
    id: 'mem_2',
    organizationId: orgId,
    userId: engMgrId,
    role: 'dept_manager',
    departmentIds: ['dept_eng'],
    status: 'active',
    joinedAt: new Date('2026-01-17').toISOString(),
  });

  db.organizationMemberships.set('mem_3', {
    id: 'mem_3',
    organizationId: orgId,
    userId: hrLeadId,
    role: 'org_admin',
    departmentIds: ['dept_hr'],
    status: 'active',
    joinedAt: new Date('2026-01-18').toISOString(),
  });

  db.organizationMemberships.set('mem_4', {
    id: 'mem_4',
    organizationId: orgId,
    userId: employeeId,
    role: 'employee',
    departmentIds: ['dept_eng'],
    status: 'active',
    joinedAt: new Date('2026-02-01').toISOString(),
  });

  db.organizationMemberships.set('mem_5', {
    id: 'mem_5',
    organizationId: orgId,
    userId: guestId,
    role: 'guest',
    departmentIds: [],
    status: 'active',
    joinedAt: new Date('2026-02-15').toISOString(),
  });

  // Workspace memberships
  db.workspaceMemberships.set('wsm_1', {
    id: 'wsm_1',
    organizationId: orgId,
    workspaceId: wsGeneral.id,
    userId: employeeId,
    role: 'contributor',
    status: 'active',
    joinedAt: new Date('2026-02-01').toISOString(),
  });

  db.workspaceMemberships.set('wsm_2', {
    id: 'wsm_2',
    organizationId: orgId,
    workspaceId: wsEngineering.id,
    userId: employeeId,
    role: 'contributor',
    status: 'active',
    joinedAt: new Date('2026-02-01').toISOString(),
  });

  // 5. Seed Documents with Rich Content & Real Embeddings

  // Document 1: Acme Global Leave Policy 2026 (Answering: "What is our annual leave policy for employees in India?")
  const docLeave: DocumentItem = {
    id: 'doc_leave_policy_2026',
    organizationId: orgId,
    workspaceId: wsGeneral.id,
    departmentId: 'dept_hr',
    uploadedBy: hrLeadId,
    uploaderName: 'Sarah Jenkins (HR Lead)',
    title: 'Acme Global Leave & Time-Off Policy 2026',
    description: 'Comprehensive guidelines for paid time off, sick leave, parental benefits, and country-specific statutory leaves including India, US, and UK.',
    fileName: 'Acme_Global_Leave_Policy_2026.pdf',
    storageKey: 'uploads/Acme_Global_Leave_Policy_2026.pdf',
    mimeType: 'application/pdf',
    fileSize: 428000,
    checksum: 'a89c72e21b7f3320c90d51381e4b48074da8fa71d3',
    tags: ['hr', 'policy', 'leave', 'benefits', 'india', 'vacation'],
    visibility: 'organization',
    processingStatus: 'indexed',
    indexingStatus: 'completed',
    indexingVersion: 1,
    pageCount: 8,
    chunkCount: 5,
    processingDurationMs: 1420,
    createdAt: new Date('2026-01-22T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-22T10:00:00Z').toISOString(),
  };

  const leaveChunks: Array<Omit<DocumentChunk, 'embedding'>> = [
    {
      id: 'chunk_leave_1',
      organizationId: orgId,
      documentId: docLeave.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_hr',
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 1,
      sectionTitle: 'Section 1: Global Time-Off Principles & Core Working Hours',
      text: 'Acme Global Technologies provides paid time off (PTO) to foster work-life balance and mental well-being. All regular full-time employees are entitled to standard statutory leaves in accordance with local labor jurisdiction, plus company-designated wellness flex days. Core working hours are defined as 10:00 AM to 4:00 PM local time.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-22').toISOString(),
    },
    {
      id: 'chunk_leave_2',
      organizationId: orgId,
      documentId: docLeave.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_hr',
      chunkIndex: 1,
      pageStart: 2,
      pageEnd: 2,
      sectionTitle: 'Section 2: Sick Leave and Compassionate Absences',
      text: 'Employees are granted 12 days of paid medical/sick leave per calendar year. A certified physician note is required for consecutive sick leaves exceeding 3 business days. Compassionate bereavement leave of up to 5 consecutive paid working days is provided for immediate family members.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-22').toISOString(),
    },
    {
      id: 'chunk_leave_3',
      organizationId: orgId,
      documentId: docLeave.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_hr',
      chunkIndex: 2,
      pageStart: 3,
      pageEnd: 3,
      sectionTitle: 'Section 3: Parental Leave and Caregiver Support',
      text: 'Primary caregivers are eligible for 20 weeks of fully paid maternity/parental leave. Secondary caregivers receive 8 weeks of fully paid paternity leave, which can be taken anytime within the first 12 months following birth or adoption.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-22').toISOString(),
    },
    {
      id: 'chunk_leave_4',
      organizationId: orgId,
      documentId: docLeave.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_hr',
      chunkIndex: 3,
      pageStart: 4,
      pageEnd: 4,
      sectionTitle: 'Section 4: Country Addendum — India (Statutory & Annual Leaves)',
      text: 'For all permanent employees based in India (Bangalore and Gurgaon development centers): Employees receive 24 days of Earned/Annual Leave per calendar year, accrued at 2.0 days per completed month of service. In addition, India employees receive 12 days of Casual/Sick Leave, and 10 declared National and Festival Holidays announced annually by People Operations. Up to 15 days of unused Earned Leave can be carried forward into the subsequent calendar year or encashed upon separation as per the Indian Factories & Shops Establishment Acts.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-22').toISOString(),
    },
    {
      id: 'chunk_leave_5',
      organizationId: orgId,
      documentId: docLeave.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_hr',
      chunkIndex: 4,
      pageStart: 5,
      pageEnd: 5,
      sectionTitle: 'Section 5: Leave Application Workflow & Manager Approval',
      text: 'All planned vacation requests exceeding 3 days must be submitted through the Acme HR Portal at least two weeks in advance. Line managers must review and approve or decline requests within 3 business days. Retrospective leave applications are only permitted for urgent medical emergencies.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-22').toISOString(),
    },
  ];

  // Document 2: IT Security & BYOD Policy
  const docSec: DocumentItem = {
    id: 'doc_it_security_2026',
    organizationId: orgId,
    workspaceId: wsGeneral.id,
    departmentId: 'dept_sec',
    uploadedBy: ownerId,
    uploaderName: 'Elena Rostova (CISO & Owner)',
    title: 'Enterprise Information Security & BYOD Policy v4.2',
    description: 'Mandatory cryptographic standards, hardware-backed multi-factor authentication, remote device wiping, and SOC2 compliance controls.',
    fileName: 'IT_Security_and_BYOD_Policy_v4.pdf',
    storageKey: 'uploads/IT_Security_and_BYOD_Policy_v4.pdf',
    mimeType: 'application/pdf',
    fileSize: 312000,
    checksum: 'b331048f72a4901cb91280389146187b5a8e2',
    tags: ['security', 'soc2', 'passwords', 'mfa', 'encryption', 'byod'],
    visibility: 'organization',
    processingStatus: 'indexed',
    indexingStatus: 'completed',
    indexingVersion: 1,
    pageCount: 6,
    chunkCount: 3,
    processingDurationMs: 980,
    createdAt: new Date('2026-01-25T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-25T14:30:00Z').toISOString(),
  };

  const secChunks: Array<Omit<DocumentChunk, 'embedding'>> = [
    {
      id: 'chunk_sec_1',
      organizationId: orgId,
      documentId: docSec.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_sec',
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 1,
      sectionTitle: 'Section 1: Authentication & Password Standards',
      text: 'All workforce accounts must enforce Hardware Security Key (FIDO2 / WebAuthn) or time-based one-time password (TOTP) multi-factor authentication. Passwords must be at least 16 characters long containing upper, lower, numerals, and special symbols, and must not match the last 10 historical passwords.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-25').toISOString(),
    },
    {
      id: 'chunk_sec_2',
      organizationId: orgId,
      documentId: docSec.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_sec',
      chunkIndex: 1,
      pageStart: 2,
      pageEnd: 2,
      sectionTitle: 'Section 2: Mobile Device Management & Remote Wipe',
      text: 'Any personal mobile phone or tablet accessing Acme corporate emails, Slack, or GitHub must enroll in the Acme MDM profile. The Security Operations Center reserves the legal authority to remotely wipe corporate sandboxes or full devices immediately upon confirmed report of device theft, loss, or employee termination.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-25').toISOString(),
    },
    {
      id: 'chunk_sec_3',
      organizationId: orgId,
      documentId: docSec.id,
      workspaceId: wsGeneral.id,
      departmentId: 'dept_sec',
      chunkIndex: 2,
      pageStart: 3,
      pageEnd: 3,
      sectionTitle: 'Section 3: Data Classification & Encryption at Rest',
      text: 'All customer data and internal source code is classified as Confidential or Restricted. Production data stores must enforce AES-256-GCM encryption at rest with customer-managed keys (CMEK) and TLS 1.3 in transit. Production database credentials must never be committed to source code or stored in unencrypted client config files.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-01-25').toISOString(),
    },
  ];

  // Document 3: Engineering Architecture Guide (restricted to Engineering workspace)
  const docEng: DocumentItem = {
    id: 'doc_eng_arch_2026',
    organizationId: orgId,
    workspaceId: wsEngineering.id,
    departmentId: 'dept_eng',
    uploadedBy: engMgrId,
    uploaderName: 'David Chen (Eng Manager)',
    title: 'Microservices Architecture & Kubernetes Production Playbook',
    description: 'Technical blueprints for containerized service deployment, connection pool sizing, circuit breakers, and gRPC communication standards.',
    fileName: 'Microservices_Architecture_and_Kubernetes_Guide.docx',
    storageKey: 'uploads/Microservices_Architecture_and_Kubernetes_Guide.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 615000,
    checksum: 'c4591a27e9140b912f91a5e1820b4119d',
    tags: ['engineering', 'kubernetes', 'microservices', 'grpc', 'devops', 'resilience'],
    visibility: 'workspace',
    processingStatus: 'indexed',
    indexingStatus: 'completed',
    indexingVersion: 1,
    pageCount: 12,
    chunkCount: 3,
    processingDurationMs: 1650,
    createdAt: new Date('2026-02-05T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-02-05T09:15:00Z').toISOString(),
  };

  const engChunks: Array<Omit<DocumentChunk, 'embedding'>> = [
    {
      id: 'chunk_eng_1',
      organizationId: orgId,
      documentId: docEng.id,
      workspaceId: wsEngineering.id,
      departmentId: 'dept_eng',
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 1,
      sectionTitle: 'Section 1: Service Mesh & Inter-Service gRPC Protocol',
      text: 'Synchronous internal microservice communication must standardize on Protobuf v3 contracts over HTTP/2 gRPC channels within the Istio service mesh. Mutual TLS (mTLS) with SPIFFE identity certificates is enforced at the sidecar level. Default RPC timeout is 2500ms with a maximum of 2 retries on idempotent status codes.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-02-05').toISOString(),
    },
    {
      id: 'chunk_eng_2',
      organizationId: orgId,
      documentId: docEng.id,
      workspaceId: wsEngineering.id,
      departmentId: 'dept_eng',
      chunkIndex: 1,
      pageStart: 4,
      pageEnd: 4,
      sectionTitle: 'Section 4: Database Connection Pooling & Scale-to-Zero',
      text: 'Each Node.js pod must allocate a maximum connection pool size of 15 connections to prevent exhausting primary cluster sockets during horizontal pod autoscaling (HPA). Connection idle timeout is set to 30 seconds. Redis sentinel clusters handle transient distributed locking and queue ingestion.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-02-05').toISOString(),
    },
    {
      id: 'chunk_eng_3',
      organizationId: orgId,
      documentId: docEng.id,
      workspaceId: wsEngineering.id,
      departmentId: 'dept_eng',
      chunkIndex: 2,
      pageStart: 7,
      pageEnd: 7,
      sectionTitle: 'Section 7: Incident Response, PagerDuty, and SLA Commitments',
      text: 'P1 Severity outages (API error rates > 2.5% for more than 5 minutes) page the tier-1 on-call engineer within 120 seconds. Post-mortem root cause analysis (RCA) blameless retrospectives must be published in Confluence within 72 business hours.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-02-05').toISOString(),
    },
  ];

  // Document 4: Executive Confidential Strategy (strictly in private workspace)
  const docExec: DocumentItem = {
    id: 'doc_exec_roadmap_2026',
    organizationId: orgId,
    workspaceId: wsExec.id,
    uploadedBy: ownerId,
    uploaderName: 'Elena Rostova (Owner)',
    title: 'Boardroom Strategic M&A and AI Expansion Roadmap 2026-2027',
    description: 'CONFIDENTIAL: Financial projections, target acquisitions, and Enterprise ARR milestones for Series C round.',
    fileName: 'Boardroom_Strategic_Roadmap_Q4.md',
    storageKey: 'uploads/Boardroom_Strategic_Roadmap_Q4.md',
    mimeType: 'text/markdown',
    fileSize: 95000,
    checksum: 'e99214710294b019da82104882190',
    tags: ['board', 'confidential', 'mergers', 'financials', 'executive'],
    visibility: 'private',
    processingStatus: 'indexed',
    indexingStatus: 'completed',
    indexingVersion: 1,
    pageCount: 4,
    chunkCount: 2,
    processingDurationMs: 820,
    createdAt: new Date('2026-02-10T16:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-10T16:00:00Z').toISOString(),
  };

  const execChunks: Array<Omit<DocumentChunk, 'embedding'>> = [
    {
      id: 'chunk_exec_1',
      organizationId: orgId,
      documentId: docExec.id,
      workspaceId: wsExec.id,
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 1,
      sectionTitle: 'CONFIDENTIAL: Acquisition Targets & Seed Capital',
      text: 'Acme Corporation has earmarked $45,000,000 for tuck-in acquisitions in enterprise search and RAG indexing infrastructure during Q3 2026. Target valuation multiples are capped at 8x forward ARR.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-02-10').toISOString(),
    },
    {
      id: 'chunk_exec_2',
      organizationId: orgId,
      documentId: docExec.id,
      workspaceId: wsExec.id,
      chunkIndex: 1,
      pageStart: 2,
      pageEnd: 2,
      sectionTitle: 'CONFIDENTIAL: Global Enterprise Expansion & Revenue Targets',
      text: 'Projected Net New ARR target for FY2026 is $82,000,000 with a focus on financial services and defense compliance verticals.',
      embeddingModel: 'gemini-embedding-2-preview',
      indexingVersion: 1,
      createdAt: new Date('2026-02-10').toISOString(),
    },
  ];

  // Store documents
  db.documents.set(docLeave.id, docLeave);
  db.documents.set(docSec.id, docSec);
  db.documents.set(docEng.id, docEng);
  db.documents.set(docExec.id, docExec);

  // Compute real embeddings and store chunks
  const allRawChunks = [...leaveChunks, ...secChunks, ...engChunks, ...execChunks];
  for (const c of allRawChunks) {
    const embedding = await generateEmbedding(c.text);
    db.documentChunks.set(c.id, {
      ...c,
      embedding,
    });
  }

  // Sample Audit Logs
  db.auditLogs.push(
    {
      id: generateObjectId(),
      organizationId: orgId,
      actorId: ownerId,
      actorName: 'Elena Rostova',
      action: 'organization.created',
      resourceType: 'organization',
      resourceId: orgId,
      resourceName: 'Acme Global Technologies Inc.',
      createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
    },
    {
      id: generateObjectId(),
      organizationId: orgId,
      actorId: hrLeadId,
      actorName: 'Sarah Jenkins',
      action: 'document.uploaded',
      resourceType: 'document',
      resourceId: docLeave.id,
      resourceName: docLeave.title,
      metadata: { pages: 8, chunks: 5 },
      createdAt: new Date('2026-01-22T10:00:00Z').toISOString(),
    },
    {
      id: generateObjectId(),
      organizationId: orgId,
      actorId: ownerId,
      actorName: 'Elena Rostova',
      action: 'document.uploaded',
      resourceType: 'document',
      resourceId: docSec.id,
      resourceName: docSec.title,
      metadata: { pages: 6, chunks: 3 },
      createdAt: new Date('2026-01-25T14:30:00Z').toISOString(),
    },
    {
      id: generateObjectId(),
      organizationId: orgId,
      actorId: engMgrId,
      actorName: 'David Chen',
      action: 'workspace.created',
      resourceType: 'workspace',
      resourceId: wsEngineering.id,
      resourceName: wsEngineering.name,
      createdAt: new Date('2026-01-18T11:00:00Z').toISOString(),
    }
  );

  // Sample Usage Events for Analytics
  const models = ['gemini-3.8-flash', 'gemini-3.8-flash', 'gemini-embedding-2-preview'];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString();
    const count = 12 + Math.floor(Math.sin(i) * 6) + Math.floor(Math.random() * 8);
    for (let j = 0; j < count; j++) {
      db.usageEvents.push({
        id: generateObjectId(),
        organizationId: orgId,
        userId: employeeId,
        eventType: 'chat_query',
        model: models[j % models.length],
        inputTokens: 380 + Math.floor(Math.random() * 250),
        outputTokens: 210 + Math.floor(Math.random() * 180),
        latencyMs: 420 + Math.floor(Math.random() * 600),
        estimatedCost: 0.00018 + Math.random() * 0.00015,
        createdAt: dateStr,
      });
    }
  }

  // Sample Notifications
  db.notifications.push(
    {
      id: generateObjectId(),
      organizationId: orgId,
      userId: employeeId,
      type: 'document_indexed',
      title: 'New Policy Available',
      body: 'Acme Global Leave & Time-Off Policy 2026 has been indexed and is searchable.',
      link: `/documents/${docLeave.id}`,
      createdAt: new Date('2026-01-22T10:05:00Z').toISOString(),
    },
    {
      id: generateObjectId(),
      organizationId: orgId,
      userId: employeeId,
      type: 'access_granted',
      title: 'Workspace Access Granted',
      body: 'You have been added as contributor to Engineering Systems & Architecture.',
      link: `/workspaces/${wsEngineering.id}`,
      createdAt: new Date('2026-02-01T09:00:00Z').toISOString(),
    }
  );

  db.persistToDisk();
  return { orgId, users };
}
