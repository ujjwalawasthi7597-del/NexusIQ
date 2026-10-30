import React, { useState } from 'react';
import {
  Search,
  FileText,
  Filter,
  Sparkles,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Building,
  Layers,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { SearchResultItem, Workspace, Department, Citation } from '../types/index.ts';

interface KnowledgeSearchViewProps {
  workspaces: Workspace[];
  departments: Department[];
  onOpenCitation: (citation: Citation) => void;
}

export const KnowledgeSearchView: React.FC<KnowledgeSearchViewProps> = ({
  workspaces,
  departments,
  onOpenCitation,
}) => {
  const [query, setQuery] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [threshold, setThreshold] = useState(0.40);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          workspaceId: workspaceId || undefined,
          departmentId: departmentId || undefined,
          threshold,
          topK: 10,
        }),
      });

      const data = await res.json();
      setResults(data?.results || []);
      setLatencyMs(data?.latencyMs || 0);
    } catch {} finally {
      setIsSearching(false);
    }
  };

  const sampleSearches = [
    'Annual leave accrual in India',
    'FIDO2 hardware key and MFA requirements',
    'Kubernetes connection pool sizing',
    'Primary caregiver parental leave weeks',
    'SOC2 customer managed encryption keys',
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" />
          Enterprise Knowledge Search
        </h1>
        <p className="text-xs text-slate-400">
          Hybrid semantic and keyword retrieval with pre-retrieval access boundary enforcement.
        </p>
      </div>

      {/* Main Search Bar & Filters */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search internal company documents, policies, wikis, guides..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Filters:
          </span>

          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto text-[11px] text-slate-400">
            <span>Relevance Threshold:</span>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500"
            />
            <span className="font-mono text-indigo-400">{(threshold * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Suggested Searches */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="text-slate-500">Suggestions:</span>
          {sampleSearches.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(s);
                setTimeout(handleSearch, 50);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {hasSearched && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-white">{results.length}</strong> authorized match(es) in{' '}
              <strong className="text-indigo-400 font-mono">{latencyMs}ms</strong>
            </span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pre-retrieval ACL filtered
            </span>
          </div>
        )}

        <div className="space-y-3">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.document.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{item.document.fileName}</span>
                      <span>•</span>
                      <span>Page {item.chunk.pageStart}</span>
                      <span>•</span>
                      <span className="capitalize text-indigo-300">{item.document.visibility}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-mono">
                    Score: {(item.score * 100).toFixed(0)}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                    {item.matchType}
                  </span>
                  <button
                    onClick={() =>
                      onOpenCitation({
                        chunkId: item.chunk.id,
                        documentId: item.document.id,
                        documentTitle: item.document.title,
                        pageNumber: item.chunk.pageStart,
                        sectionTitle: item.chunk.sectionTitle,
                        excerpt: item.chunk.text,
                        score: item.score,
                      })
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>View Context</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Excerpt text with styling */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                {item.chunk.sectionTitle && (
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    {item.chunk.sectionTitle}
                  </div>
                )}
                "{item.chunk.text}"
              </div>
            </div>
          ))}

          {hasSearched && results.length === 0 && (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No authorized documents matched</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No indexed chunks were found meeting the relevance threshold within your accessible workspaces.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
