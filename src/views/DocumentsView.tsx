import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  RotateCw,
  Eye,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import type { DocumentItem, Workspace, Department, Citation } from '../types/index.ts';

interface DocumentsViewProps {
  onOpenUpload: () => void;
  onOpenCitation: (citation: Citation) => void;
  workspaces: Workspace[];
  departments: Department[];
  userRole: string;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onOpenUpload,
  onOpenCitation,
  workspaces,
  departments,
  userRole,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isGuest = userRole === 'guest';

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWorkspace) params.append('workspaceId', selectedWorkspace);
      if (search) params.append('search', search);

      const res = await fetch(`/api/v1/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    const interval = setInterval(loadDocuments, 5000); // Polling for async indexing status transitions
    return () => clearInterval(interval);
  }, [selectedWorkspace, search, userRole]);

  const handleDelete = async (docId: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${docTitle}" and all its vector embeddings?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to delete');
        return;
      }
      setActionMessage(`Deleted "${docTitle}". Vectors permanently purged.`);
      setTimeout(() => setActionMessage(null), 3000);
      loadDocuments();
    } catch {}
  };

  const handleReindex = async (docId: string) => {
    try {
      await fetch(`/api/v1/documents/${docId}/reindex`, { method: 'POST' });
      setActionMessage('Re-indexing job enqueued.');
      setTimeout(() => setActionMessage(null), 3000);
      loadDocuments();
    } catch {}
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Indexed
          </span>
        );
      case 'extracting':
      case 'chunking':
      case 'embedding':
      case 'queued':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 w-fit animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            {status.toUpperCase()}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Enterprise Document Library
          </h1>
          <p className="text-xs text-slate-400">
            Manage authorized knowledge files with automatic semantic chunking and vector indexing.
          </p>
        </div>

        {!isGuest && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter documents by title, filename, or tag..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Accessible Workspaces</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Document</th>
                <th className="px-4 py-3.5">Workspace</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Chunks & Pages</th>
                <th className="px-4 py-3.5">Visibility</th>
                <th className="px-4 py-3.5">Uploaded By</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.map((doc) => {
                const ws = workspaces.find((w) => w.id === doc.workspaceId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white line-clamp-1">{doc.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {doc.fileName} • {(doc.fileSize / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      <span className="font-medium">{ws?.name || 'Workspace'}</span>
                    </td>

                    <td className="px-4 py-4">{getStatusBadge(doc.processingStatus)}</td>

                    <td className="px-4 py-4 text-slate-300 font-mono">
                      <span>{doc.chunkCount || 0} chunks</span>
                      <span className="text-slate-500 block text-[10px]">{doc.pageCount} pages</span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 text-[11px]">
                        {doc.visibility}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-400">{doc.uploaderName || 'Admin'}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            onOpenCitation({
                              chunkId: '',
                              documentId: doc.id,
                              documentTitle: doc.title,
                              pageNumber: 1,
                              excerpt: doc.description || doc.title,
                              score: 1.0,
                            })
                          }
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Preview Extracted Content & Pages"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isGuest && (
                          <>
                            <button
                              onClick={() => handleReindex(doc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Re-chunk and Re-embed Document"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete and Purge Vectors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {documents.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                    No documents found matching filters or authorized for your role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
