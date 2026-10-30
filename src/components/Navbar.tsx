import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Search,
  Sparkles,
  Users,
  ChevronDown,
  Building,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sliders,
} from 'lucide-react';
import type { User, Organization } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  currentRole: string;
  organization: Organization | null;
  allUsers: Array<{ id: string; name: string; email: string; role: string; avatarUrl?: string }>;
  onSwitchUser: (userId: string) => void;
  onOpenSearch: () => void;
  onNavigate: (view: string) => void;
  onReseed: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  organization,
  allUsers,
  onSwitchUser,
  onOpenSearch,
  onNavigate,
  onReseed,
  onLogout,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'org_owner':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Org Owner</span>;
      case 'org_admin':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin</span>;
      case 'dept_manager':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Manager</span>;
      case 'employee':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Employee</span>;
      case 'guest':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Guest (Read-Only)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">{role}</span>;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Organization */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-sans">
                Nexus<span className="text-indigo-400">IQ</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Knowledge Platform</p>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

        {/* Current Tenant Org Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-200">{organization?.name || 'Acme Global'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Global Quick Search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-slate-400 hover:border-slate-700 hover:text-slate-300 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search documents, policies, wikis...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Persona Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Persona / Role Simulator (Section 3 & 12 Pre-retrieval Security test) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
            title="Switch user to verify pre-retrieval security boundaries"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Role:</span>
            {getRoleBadge(currentRole)}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-1.5 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200">Security & RBAC Persona Switcher</p>
                <p className="text-[11px] text-slate-400">Test pre-retrieval document & chat authorization</p>
              </div>

              <div className="space-y-1 mt-1.5">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser?.id === u.id
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                        : 'hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-medium text-slate-100">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                    {getRoleBadge(u.role)}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    onReseed();
                    setShowRoleMenu(false);
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Demo Data</span>
                </button>
                <span className="text-[10px] text-emerald-400 font-mono">Pre-Retrieval Strict</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => onNavigate('notifications')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
        </button>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 cursor-pointer group"
            title="Account Settings"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-indigo-500 transition-all"
            />
            <div className="hidden xl:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[130px]">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{currentUser?.email}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
