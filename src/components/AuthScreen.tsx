import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any, role: string, org: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOrg, setSignupOrg] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo accounts for instant 1-click evaluation
  const demoAccounts = [
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@acmeglobal.com',
      role: 'Org Owner & CISO',
      roleKey: 'org_owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      desc: 'Full tenant admin, executive board documents & M&A access',
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@acmeglobal.com',
      role: 'HR Lead (Org Admin)',
      roleKey: 'org_admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      desc: 'Owner of Acme Global Leave & Time-Off Policy 2026',
    },
    {
      name: 'David Chen',
      email: 'david.chen@acmeglobal.com',
      role: 'Eng Manager',
      roleKey: 'dept_manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      desc: 'Access to Microservices & Kubernetes architecture specs',
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@acmeglobal.com',
      role: 'Employee',
      roleKey: 'employee',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      desc: 'Standard employee permissions & grounded policy search',
    },
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@auditors.com',
      role: 'Guest Auditor (Read-Only)',
      roleKey: 'guest',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      desc: 'Restricted to shared public policies only',
    },
  ];

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const emailToUse = directEmail || loginEmail;
    if (!emailToUse.trim()) {
      setError('Please provide an email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse.trim(),
          password: loginPassword || 'NexusIQ2026!',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      onAuthSuccess(data.user, data.role, data.organization);
    } catch (err: any) {
      setError(err.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim()) {
      setError('Name and work email are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          orgName: signupOrg.trim() || `${signupName.trim()}'s Organization`,
          password: signupPassword || 'NexusIQ2026!',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization account');
      }

      onAuthSuccess(data.user, 'org_owner', data.organization);
    } catch (err: any) {
      setError(err.message || 'Sign up error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        {/* Brand Logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/25">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            Nexus<span className="text-indigo-400">IQ</span>
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
            ENTERPRISE
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Secure, Multi-Tenant, RAG-Powered Enterprise Knowledge Workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-6 px-4 shadow-2xl sm:rounded-2xl sm:px-8 space-y-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@acmeglobal.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Demo: NexusIQ2026!</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Dr. Jordan Lee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="jordan.lee@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  Company or Organization Name
                </label>
                <input
                  type="text"
                  value={signupOrg}
                  onChange={(e) => setSignupOrg(e.target.value)}
                  placeholder="e.g. Horizon Biotech Inc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create strong password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Isolated Tenant & Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 1-CLICK DEMO PERSONAS ACCELERATOR */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick 1-Click Role Logins
              </span>
              <span className="text-[10px] text-slate-500">Test ACL & Security</span>
            </div>

            <div className="space-y-1.5">
              {demoAccounts.map((account) => (
                <button
                  type="button"
                  key={account.email}
                  onClick={() => handleLogin(undefined, account.email)}
                  className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {account.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{account.desc}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 border ${account.badgeColor}`}>
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-500">
          <span>Enterprise Pre-retrieval Security Model • AES-256 Vector Encryption • Zero Third-Party Keys Required</span>
        </div>
      </div>
    </div>
  );
};
