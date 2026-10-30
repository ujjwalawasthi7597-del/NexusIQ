import React, { useState } from 'react';
import {
  Sliders,
  Building,
  Cpu,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import type { Organization } from '../types/index.ts';

interface SettingsViewProps {
  organization: Organization | null;
  userRole: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ organization, userRole }) => {
  const [chatModel, setChatModel] = useState(organization?.settings.chatModel || 'gemini-3.8-flash');
  const [embeddingModel, setEmbeddingModel] = useState(
    organization?.settings.embeddingModel || 'gemini-embedding-2-preview'
  );
  const [chunkSize, setChunkSize] = useState(organization?.settings.defaultChunkSize || 500);
  const [chunkOverlap, setChunkOverlap] = useState(organization?.settings.defaultChunkOverlap || 100);
  const [topK, setTopK] = useState(organization?.settings.defaultTopK || 5);
  const [similarityThreshold, setSimilarityThreshold] = useState(
    organization?.settings.similarityThreshold || 0.45
  );
  const [strictSecurity, setStrictSecurity] = useState(
    organization?.settings.strictSecurityMode ?? true
  );
  const [saved, setSaved] = useState(false);

  const isAdmin = userRole === 'org_owner' || userRole === 'org_admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !organization) return;

    try {
      const res = await fetch(`/api/v1/organizations/${organization.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatModel,
          embeddingModel,
          defaultChunkSize: Number(chunkSize),
          defaultChunkOverlap: Number(chunkOverlap),
          defaultTopK: Number(topK),
          similarityThreshold: Number(similarityThreshold),
          strictSecurityMode: strictSecurity,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Organization & AI Retrieval Configuration
        </h1>
        <p className="text-xs text-slate-400">
          Fine-tune chunking dimensions, embedding parameters, model selection, and security policies.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration saved successfully. Future document chunks will use these parameters.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Details */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-400" />
            Tenant Organization Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Organization Name</span>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                {organization?.name || 'Acme Global Technologies Inc.'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Tenant Slug ID</span>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                {organization?.slug || 'acme-global'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Provider & Models */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            AI Model Engine & Provider Selection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Primary Chat & Synthesis Model</label>
              <select
                value={chatModel}
                disabled={!isAdmin}
                onChange={(e) => setChatModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: low latency, high grounding)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Vector Embedding Model</label>
              <select
                value={embeddingModel}
                disabled={!isAdmin}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-embedding-2-preview">gemini-embedding-2-preview (Semantic dense vector)</option>
              </select>
            </div>
          </div>
        </div>

        {/* RAG Chunking & Retrieval Parameters */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Chunking & Hybrid Search Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Target Chunk Size (Characters)</label>
              <input
                type="number"
                value={chunkSize}
                disabled={!isAdmin}
                onChange={(e) => setChunkSize(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Typical: 400 - 800 characters per chunk</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Chunk Overlap Window (Characters)</label>
              <input
                type="number"
                value={chunkOverlap}
                disabled={!isAdmin}
                onChange={(e) => setChunkOverlap(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Maintains sentence continuity across breaks</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Top-K Retrieved Chunks</label>
              <input
                type="number"
                value={topK}
                disabled={!isAdmin}
                onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Similarity Threshold Filter</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={similarityThreshold}
                disabled={!isAdmin}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Rejects low-confidence candidate chunks</span>
            </div>
          </div>
        </div>

        {/* Security Guardrail Settings */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Pre-Retrieval Access Boundary Enforcement
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-200">Strict Pre-Retrieval Document Filtering</div>
              <p className="text-[11px] text-slate-400 max-w-md">
                Guarantees that unauthorized documents are strictly excluded before vector calculations or LLM context construction.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MANDATORY ON
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
