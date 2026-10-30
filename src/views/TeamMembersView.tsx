import React, { useState, useEffect } from 'react';
import {
  Users2,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import type { Department } from '../types/index.ts';

interface TeamMembersViewProps {
  userRole: string;
  departments: Department[];
}

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({ userRole, departments }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteDept, setInviteDept] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const canInvite = userRole === 'org_owner' || userRole === 'org_admin' || userRole === 'dept_manager';

  const loadMembers = async () => {
    try {
      const res = await fetch('/api/v1/members');
      const data = await res.json();
      setMembers(data?.members || []);
    } catch {}
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          departmentIds: inviteDept ? [inviteDept] : [],
        }),
      });
      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setStatusMsg(`Invitation link generated and recorded for ${inviteEmail}.`);
        setTimeout(() => setStatusMsg(null), 4000);
        loadMembers();
      }
    } catch {}
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await fetch(`/api/v1/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      loadMembers();
    } catch {}
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-indigo-400" />
            Team Members & Access Control
          </h1>
          <p className="text-xs text-slate-400">
            Manage organization members, role-based security boundaries, and pending invitations.
          </p>
        </div>

        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Member Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3.5">User</th>
              <th className="px-4 py-3.5">Organization Role</th>
              <th className="px-4 py-3.5">Assigned Department</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Role Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => {
              const dept = departments.find((d) => m.departmentIds?.includes(d.id));
              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-medium font-mono text-[11px]">
                      {m.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {dept?.name || <span className="text-slate-500 italic">None (All-Company)</span>}
                  </td>

                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {m.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {userRole === 'org_owner' || userRole === 'org_admin' ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="org_owner">Org Owner</option>
                        <option value="org_admin">Org Admin</option>
                        <option value="dept_manager">Dept Manager</option>
                        <option value="employee">Employee</option>
                        <option value="guest">Guest (Read-Only)</option>
                      </select>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Invite Team Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Corporate Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@acmeglobal.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Role Authorization</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="employee">Employee (Search, Chat, Upload if permitted)</option>
                  <option value="dept_manager">Department Manager (Manage dept knowledge)</option>
                  <option value="org_admin">Organization Admin (Full admin privileges)</option>
                  <option value="guest">Guest (Read-only shared workspaces)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Department Assignment</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">None (Company Wide)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
