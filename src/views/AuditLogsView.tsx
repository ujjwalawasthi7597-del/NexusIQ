import React, { useState, useEffect } from 'react';
import { ScrollText, Shield, Search, Filter, Clock, User, Layers } from 'lucide-react';
import type { AuditLog } from '../types/index.ts';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetch('/api/v1/audit-logs')
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.resourceName?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !filterAction || log.action.startsWith(filterAction);
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('delete')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">{action}</span>;
    }
    if (action.includes('upload') || action.includes('create')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{action}</span>;
    }
    if (action.includes('switch') || action.includes('invite')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{action}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-400" />
            Immutable Security & Audit Trails
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise compliance log recording all document access, permissions, and administrative changes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>SOC2 / ISO27001 Ready</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action (e.g. document.uploaded), or resource..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Action Types</option>
          <option value="document">Document Events</option>
          <option value="workspace">Workspace Events</option>
          <option value="auth">Auth & Session Events</option>
          <option value="member">Membership Events</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-4 py-3.5">Actor</th>
              <th className="px-4 py-3.5">Action</th>
              <th className="px-4 py-3.5">Resource Target</th>
              <th className="px-6 py-3.5 text-right">Event Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                      {log.actorName[0] || 'U'}
                    </div>
                    <span className="font-medium text-slate-200">{log.actorName}</span>
                  </div>
                </td>

                <td className="px-4 py-4">{getActionBadge(log.action)}</td>

                <td className="px-4 py-4">
                  <div>
                    <span className="font-semibold text-white">{log.resourceName || log.resourceType}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      ID: {log.resourceId?.slice(0, 14) || 'system'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-400">
                  {log.metadata ? (
                    <span className="truncate max-w-[240px] inline-block">
                      {JSON.stringify(log.metadata).slice(0, 40)}...
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No audit records match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
