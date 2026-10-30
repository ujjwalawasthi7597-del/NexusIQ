import React from 'react';
import {
  LayoutDashboard,
  BotMessageSquare,
  Search,
  Files,
  Boxes,
  Briefcase,
  Users2,
  ScrollText,
  BarChart3,
  Sliders,
  Activity,
  UploadCloud,
  Lock
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  userRole: string;
  queueActiveCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenUpload,
  userRole,
  queueActiveCount = 0,
}) => {
  const isGuest = userRole === 'guest';
  const isAdmin = userRole === 'org_owner' || userRole === 'org_admin';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: BotMessageSquare, highlight: true },
    { id: 'search', label: 'Knowledge Search', icon: Search },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'workspaces', label: 'Workspaces', icon: Boxes },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'members', label: 'Team Members', icon: Users2 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'analytics', label: 'Analytics & Costs', icon: BarChart3, adminOnly: true },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Quick Upload Action Button */}
        {!isGuest ? (
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Guest Mode (Read-Only)</span>
          </div>
        )}

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
            Main Workspace
          </p>
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin && userRole !== 'dept_manager') return null;

            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'assistant' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
                {item.id === 'documents' && queueActiveCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono animate-pulse">
                    {queueActiveCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Security Status Footer */}
      <div className="p-4 border-t border-slate-900/80 bg-slate-950/80">
        <div className="rounded-xl p-3 bg-slate-900/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pre-Retrieval Shield
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Content is filtered by tenant and ACL before vector distance or context synthesis.
          </p>
        </div>
      </div>
    </aside>
  );
};
