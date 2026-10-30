/**
 * NexusIQ — Enterprise AI Knowledge Platform
 * Main React Application Shell with Native Built-In Enterprise Authentication
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { CitationDrawer } from './components/CitationDrawer.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';

import { DashboardView } from './views/DashboardView.tsx';
import { AiAssistantView } from './views/AiAssistantView.tsx';
import { KnowledgeSearchView } from './views/KnowledgeSearchView.tsx';
import { DocumentsView } from './views/DocumentsView.tsx';
import { WorkspacesView } from './views/WorkspacesView.tsx';
import { TeamMembersView } from './views/TeamMembersView.tsx';
import { AuditLogsView } from './views/AuditLogsView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { SystemHealthView } from './views/SystemHealthView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

import type { User, Organization, Workspace, Department, Citation } from './types/index.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('employee');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<{
    messageId: string;
    rating: 'thumbs_up' | 'thumbs_down';
  } | null>(null);

  // Active prompt transfer (e.g. from Dashboard quick prompts)
  const [activePrompt, setActivePrompt] = useState<string>('');

  // Initial Data Load
  const loadSession = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setCurrentUser(data.user);
          setCurrentRole(data.role || 'employee');
          setOrganization(data.organization);
          setAllUsers(data.allUsers || []);
        }
      }
    } catch {} finally {
      setIsInitializing(false);
    }
  };

  const loadWorkspacesAndDepts = async () => {
    try {
      const [wsRes, deptRes] = await Promise.all([
        fetch('/api/v1/workspaces').then((r) => r.json()),
        fetch('/api/v1/departments').then((r) => r.json()),
      ]);
      setWorkspaces(wsRes?.workspaces || []);
      setDepartments(deptRes?.departments || []);
    } catch {}
  };

  useEffect(() => {
    loadSession();
    loadWorkspacesAndDepts();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/v1/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setCurrentRole(data.role);
        loadWorkspacesAndDepts();
      }
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    setCurrentRole('guest');
  };

  const handleSelectPrompt = (promptText: string) => {
    setActivePrompt(promptText);
    setCurrentView('assistant');
  };

  const handleReseed = async () => {
    try {
      await fetch('/api/v1/demo/seed', { method: 'POST' });
      await loadSession();
      await loadWorkspacesAndDepts();
    } catch {}
  };

  // If initial auth check is in flight
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, render the native enterprise Sign In / Sign Up portal
  if (!currentUser) {
    return (
      <AuthScreen
        onAuthSuccess={(user, role, org) => {
          setCurrentUser(user);
          setCurrentRole(role);
          setOrganization(org);
          loadWorkspacesAndDepts();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Enterprise Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        organization={organization}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenSearch={() => setCurrentView('search')}
        onNavigate={setCurrentView}
        onReseed={handleReseed}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Enterprise Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(v) => {
            if (v !== 'assistant') setActivePrompt('');
            setCurrentView(v);
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
          userRole={currentRole}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40">
          {currentView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              userRole={currentRole}
              onNavigate={(v) => setCurrentView(v)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectPrompt={handleSelectPrompt}
            />
          )}

          {currentView === 'assistant' && (
            <AiAssistantView
              initialPrompt={activePrompt}
              onOpenCitation={(cite) => setActiveCitation(cite)}
              onOpenFeedback={(msgId, rating) => setFeedbackTarget({ messageId: msgId, rating })}
              workspaces={workspaces}
            />
          )}

          {currentView === 'search' && (
            <KnowledgeSearchView
              workspaces={workspaces}
              departments={departments}
              onOpenCitation={(cite) => setActiveCitation(cite)}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenCitation={(cite) => setActiveCitation(cite)}
              workspaces={workspaces}
              departments={departments}
              userRole={currentRole}
            />
          )}

          {currentView === 'workspaces' && (
            <WorkspacesView
              workspaces={workspaces}
              departments={departments}
              userRole={currentRole}
              onRefresh={loadWorkspacesAndDepts}
              onNavigateToDocs={(wsId) => {
                setCurrentView('documents');
              }}
            />
          )}

          {currentView === 'departments' && (
            <WorkspacesView
              workspaces={workspaces}
              departments={departments}
              userRole={currentRole}
              onRefresh={loadWorkspacesAndDepts}
              onNavigateToDocs={(wsId) => {
                setCurrentView('documents');
              }}
            />
          )}

          {currentView === 'members' && (
            <TeamMembersView userRole={currentRole} departments={departments} />
          )}

          {currentView === 'audit-logs' && <AuditLogsView />}

          {currentView === 'analytics' && <AnalyticsView />}

          {currentView === 'system-health' && <SystemHealthView />}

          {currentView === 'settings' && (
            <SettingsView organization={organization} userRole={currentRole} />
          )}

          {currentView === 'notifications' && <AuditLogsView />}
        </main>
      </div>

      {/* Interactive In-App Citation Viewer Drawer */}
      <CitationDrawer citation={activeCitation} onClose={() => setActiveCitation(null)} />

      {/* Upload Document Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        workspaces={workspaces}
        departments={departments}
        onUploadSuccess={() => {
          loadWorkspacesAndDepts();
          setCurrentView('documents');
        }}
      />

      {/* Feedback Modal */}
      {feedbackTarget && (
        <FeedbackModal
          isOpen={true}
          messageId={feedbackTarget.messageId}
          initialRating={feedbackTarget.rating}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
}
