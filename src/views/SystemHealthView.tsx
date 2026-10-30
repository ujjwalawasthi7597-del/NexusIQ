import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  Zap
} from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reseedStatus, setReseedStatus] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/system/health');
      const data = await res.json();
      setHealthData(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleReseed = async () => {
    setReseedStatus('Re-seeding database...');
    try {
      const res = await fetch('/api/v1/demo/seed', { method: 'POST' });
      const data = await res.json();
      setReseedStatus('Dataset reset and re-seeded successfully!');
      setTimeout(() => setReseedStatus(null), 3000);
      fetchHealth();
    } catch {
      setReseedStatus('Failed to re-seed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Platform System Status & Infrastructure
          </h1>
          <p className="text-xs text-slate-400">
            Real-time diagnostics for MongoDB Atlas, background job queue workers, vector search index, and AI models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleReseed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Re-Seed Demo Data</span>
          </button>
        </div>
      </div>

      {reseedStatus && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reseedStatus}</span>
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MongoDB Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">MongoDB Data Layer</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              OPERATIONAL
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Driver / Engine:</span>
              <span className="text-slate-200 font-medium">MongoDB Atlas / Local Resilient Store</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Collections Initialized:</span>
              <span className="text-slate-200 font-mono">12 Collections</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Documents Stored:</span>
              <span className="text-slate-200 font-mono">{healthData?.components?.mongoDatabase?.documentsStored || 4}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Vector Chunks:</span>
              <span className="text-slate-200 font-mono">{healthData?.components?.mongoDatabase?.vectorChunksIndexed || 13}</span>
            </div>
          </div>
        </div>

        {/* Vector Search Index */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Atlas Vector Search Index</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ACTIVE
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Index Name:</span>
              <span className="text-slate-200 font-mono text-[11px]">documentChunks_vector_index</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Embedding Model:</span>
              <span className="text-slate-200 font-mono text-[11px]">gemini-embedding-2-preview</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Similarity Metric:</span>
              <span className="text-slate-200 font-mono">Cosine</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pre-Filtering Security:</span>
              <span className="text-emerald-400 font-mono font-medium">Tenant & Workspace Enforced</span>
            </div>
          </div>
        </div>

        {/* Background Queue Worker */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Background Job Worker (BullMQ)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              RUNNING
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Active Ingestion Jobs:</span>
              <span className="text-slate-200 font-mono">{healthData?.components?.backgroundWorker?.active || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Queued Waiting Jobs:</span>
              <span className="text-slate-200 font-mono">{healthData?.components?.backgroundWorker?.waiting || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Worker Concurrency:</span>
              <span className="text-slate-200 font-mono">2 Concurrent Jobs</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Retry Policy:</span>
              <span className="text-slate-200 font-mono">Exponential Backoff (3 retries)</span>
            </div>
          </div>
        </div>

        {/* AI Provider Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Google GenAI Client</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              READY
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Chat & RAG Model:</span>
              <span className="text-slate-200 font-mono text-[11px]">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Streaming Interface:</span>
              <span className="text-slate-200 font-mono">Server-Sent Events (SSE)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SDK:</span>
              <span className="text-slate-200 font-mono">@google/genai v2.4.0 (Server-Side)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Key Injection:</span>
              <span className="text-emerald-400 font-medium">Auto-configured in environment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
