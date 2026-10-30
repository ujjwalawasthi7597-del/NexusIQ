import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Check,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import type { Citation } from '../types/index.ts';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [docDetails, setDocDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!citation) return;
    setCurrentPage(citation.pageNumber || 1);
    setIsLoading(true);

    fetch(`/api/v1/documents/${citation.documentId}/preview`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or missing document');
        return res.json();
      })
      .then((data) => {
        setDocDetails(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [citation]);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentChunks = docDetails?.chunks?.filter((c: any) => c.pageStart === currentPage) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full text-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{citation.documentTitle}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Source
                </span>
                <span>•</span>
                <span>Page {citation.pageNumber}</span>
                {citation.sectionTitle && (
                  <>
                    <span>•</span>
                    <span className="line-clamp-1 max-w-[200px]">{citation.sectionTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Highlighted Citation Box */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Grounding Evidence Excerpt
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Excerpt'}</span>
              </button>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed font-sans border-l-2 border-indigo-400 pl-3 italic">
              "{citation.excerpt}"
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-indigo-500/20">
              <span>Relevance Score: <strong className="text-indigo-300">{(citation.score * 100).toFixed(0)}%</strong></span>
              <span>Chunk ID: <code className="font-mono text-[11px] text-slate-300">{citation.chunkId.slice(0, 10)}...</code></span>
            </div>
          </div>

          {/* Full Page Context Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Document Content Context
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-300 font-mono">
                  Page {currentPage} of {docDetails?.document?.pageCount || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(docDetails?.document?.pageCount || 1, p + 1))}
                  disabled={currentPage >= (docDetails?.document?.pageCount || 1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap min-h-[220px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 text-slate-500">
                  <span>Loading source document context...</span>
                </div>
              ) : currentChunks.length > 0 ? (
                currentChunks.map((chunk: any, i: number) => {
                  const isHighlighted = chunk.text.includes(citation.excerpt.slice(0, 40));
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded mb-2 transition-colors ${
                        isHighlighted ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-500/40' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 mb-1 font-sans font-medium">
                        {chunk.sectionTitle || `Section Chunk #${chunk.chunkIndex + 1}`}
                      </div>
                      {chunk.text}
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic">No text extracted for page {currentPage}.</div>
              )}
            </div>
          </div>

          {/* Document Metadata Panel */}
          {docDetails?.document && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Document Security & Metadata</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">File Name</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block">
                    {docDetails.document.fileName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Uploaded By</span>
                  <span className="text-slate-200">{docDetails.document.uploaderName || 'Admin'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Visibility ACL</span>
                  <span className="text-indigo-300 capitalize">{docDetails.document.visibility}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Indexed Chunks</span>
                  <span className="text-slate-200 font-mono">{docDetails.document.chunkCount || '5'} Chunks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-retrieval verified for current organization session</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
