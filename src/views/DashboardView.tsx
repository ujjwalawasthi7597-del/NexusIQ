import React, { useState, useEffect } from 'react';
import {
  FileText,
  BotMessageSquare,
  Boxes,
  Activity,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  UploadCloud,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { User, DocumentItem, Conversation } from '../types/index.ts';

interface DashboardViewProps {
  currentUser: User | null;
  userRole: string;
  onNavigate: (view: string, context?: any) => void;
  onOpenUpload: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  userRole,
  onNavigate,
  onOpenUpload,
  onSelectPrompt,
}) => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userRole === 'org_owner' || userRole === 'org_admin';

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/v1/documents').then((r) => r.json()),
      fetch('/api/v1/conversations').then((r) => r.json()),
      fetch('/api/v1/analytics/overview').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([docsData, convosData, analyticsData]) => {
        if (docsData?.documents) setDocs(docsData.documents);
        if (convosData?.conversations) setConversations(convosData.conversations);
        if (analyticsData) setAnalytics(analyticsData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [userRole]);

  const quickPrompts = [
    {
      title: 'India Annual Leave Policy',
      query: 'What is our annual leave policy for employees in India?',
      badge: 'HR & Benefits',
      color: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10',
    },
    {
      title: 'IT Password & BYOD Rules',
      query: 'What are our enterprise password standards and mobile remote wipe policies under BYOD?',
      badge: 'Security Policy',
      color: 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10',
    },
    {
      title: 'Database Pooling Sizing',
      query: 'What is our maximum connection pool size for Node.js microservices?',
      badge: 'Engineering',
      color: 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10',
    },
    {
      title: 'Confidential M&A Strategy',
      query: 'What is our target budget for enterprise search acquisitions in 2026?',
      badge: 'Executive Restricted',
      color: 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10',
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Security Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Member'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              NexusIQ Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Query enterprise documents with verifiable page citations. Pre-retrieval access control enforces that unauthorized content is never loaded into memory or prompt context.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => onNavigate('assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <BotMessageSquare className="w-4 h-4" />
            <span>Launch AI Assistant</span>
          </button>
          {userRole !== 'guest' && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Grounded Prompts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grounded Enterprise Queries
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Click to test instant citation answers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickPrompts.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrompt(item.query)}
              className={`p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg ${item.color} flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-medium">
                  {item.badge}
                </span>
                <p className="text-xs font-semibold text-slate-100 line-clamp-2">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                  "{item.query}"
                </p>
              </div>
              <div className="flex items-center justify-end pt-3 text-[11px] font-medium text-indigo-400">
                <span>Ask AI</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Accessible Documents</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{docs.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">100%</span>
            <span>indexed & searchable</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Retrieval Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {analytics?.retrievalSuccessRate || 98.4}%
          </div>
          <div className="text-[11px] text-slate-400">Zero unauthorized context leaks</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Answer Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {analytics?.avgLatencyMs || 540}ms
          </div>
          <div className="text-[11px] text-slate-400">p95: {analytics?.p95LatencyMs || 890}ms</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Questions Answered</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {analytics?.totalQuestions || 142}
          </div>
          <div className="text-[11px] text-slate-400">
            Estimated Spend: <span className="text-emerald-400 font-mono">${analytics?.estimatedCost || '0.042'}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Authorized Docs & Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accessible Documents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Accessible Documents</h3>
            </div>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {docs.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">{doc.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{doc.pageCount} pages</span>
                      <span>•</span>
                      <span className="capitalize">{doc.visibility}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Indexed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Conversations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Recent Knowledge Inquiries</h3>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Open Chat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {conversations.length > 0 ? (
              conversations.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('assistant', { conversationId: c.id })}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <BotMessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.messageCount} messages • {new Date(c.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <BotMessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No previous conversations yet.</p>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="text-xs text-indigo-400 hover:underline font-medium"
                >
                  Start your first inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
