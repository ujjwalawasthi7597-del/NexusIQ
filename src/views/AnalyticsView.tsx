import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  ThumbsUp,
  Cpu,
  Layers,
  Calendar,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import type { UsageAnalytics } from '../types/index.ts';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('14d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/v1/analytics/overview')
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [dateRange]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            AI Retrieval Analytics & Operational Spend
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry, model token consumption, query latency distributions, and answer feedback ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Questions Asked</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {analytics?.totalQuestions || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Active Enterprise Users: <span className="text-slate-200 font-semibold">{analytics?.activeUsers || 5}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Estimated AI Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ${analytics?.estimatedCost || '0.0420'}
          </div>
          <div className="text-[11px] text-slate-400">
            Total Tokens: <span className="text-indigo-300 font-mono">{(analytics?.totalTokens || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Median / p95 Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {analytics?.avgLatencyMs || 520}ms
          </div>
          <div className="text-[11px] text-slate-400">
            p95: <span className="text-slate-200 font-mono">{analytics?.p95LatencyMs || 840}ms</span> (streaming)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Answer Satisfaction Rate</span>
            <ThumbsUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {analytics?.positiveFeedbackRate || 94}%
          </div>
          <div className="text-[11px] text-slate-400">Based on authenticated user ratings</div>
        </div>
      </div>

      {/* Questions Over Time Chart Simulation */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Inquiry Volume & Incurred Token Spend</h3>
            <p className="text-xs text-slate-400">Historical question velocity across all workspaces</p>
          </div>
          <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono">
            Gemini 3.8 Flash Tier
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-slate-800">
          {analytics?.questionsOverTime?.map((pt, i) => {
            const maxVal = Math.max(...(analytics.questionsOverTime?.map((p) => p.count) || [20]));
            const heightPercent = Math.max(15, Math.round((pt.count / maxVal) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full rounded-t-lg bg-indigo-500/70 hover:bg-indigo-400 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                />
                <span className="text-[10px] text-slate-500 font-mono">{pt.date}</span>

                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-white font-mono pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  {pt.count} questions • ${pt.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Breakdown: Dept Share & Latency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Department */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Query Volume by Department
          </h3>
          <div className="space-y-3">
            {analytics?.usageByDepartment?.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{dept.name}</span>
                  <span className="text-slate-400 font-mono">
                    {dept.count} queries ({dept.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${dept.percentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            End-to-End Latency Distribution
          </h3>
          <div className="space-y-3">
            {analytics?.latencyDistribution?.map((dist, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{dist.range}</span>
                  <span className="text-slate-400 font-mono">{dist.count} requests</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{
                      width: `${Math.round(
                        (dist.count / (analytics?.totalQuestions || 1)) * 100
                      )}%`,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
