import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
  useClerk
} from '@clerk/clerk-react';
import {
  Key,
  Shield,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';

interface ClerkAuthContextType {
  isClerkConfigured: boolean;
  clerkKey: string | null;
  saveClerkKey: (key: string) => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType>({
  isClerkConfigured: false,
  clerkKey: null,
  saveClerkKey: () => {},
});

export const useClerkAuth = () => useContext(ClerkAuthContext);

// Check publishable key from env or localStorage
const getStoredOrEnvKey = (): string | null => {
  const envKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;
  if (envKey && envKey !== 'pk_test_YOUR_CLERK_PUBLISHABLE_KEY' && (envKey.startsWith('pk_test_') || envKey.startsWith('pk_live_'))) {
    return envKey;
  }
  const localKey = localStorage.getItem('nexusiq_clerk_pub_key');
  if (localKey && (localKey.startsWith('pk_test_') || localKey.startsWith('pk_live_'))) {
    return localKey;
  }
  return null;
};

// Component that syncs Clerk user identity with NexusIQ backend
const ClerkUserSyncer: React.FC<{ onUserSynced?: (user: any) => void }> = ({ onUserSynced }) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress || '';
    const name = user.fullName || user.firstName || email.split('@')[0] || 'User';

    // Auto-sync with NexusIQ backend
    fetch('/api/v1/auth/clerk-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkId: user.id,
        email,
        name,
        avatarUrl: user.imageUrl,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user && onUserSynced) {
          onUserSynced(data.user);
        }
      })
      .catch(() => {});
  }, [user, isLoaded]);

  return null;
};

// Fallback Clerk Config & Auth Screen when no key is set yet
const ClerkSetupScreen: React.FC<{ onKeySaved: (key: string) => void }> = ({ onKeySaved }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim().startsWith('pk_test_') && !inputKey.trim().startsWith('pk_live_')) {
      setError('Clerk Publishable Key must start with "pk_test_" or "pk_live_"');
      return;
    }
    setError(null);
    onKeySaved(inputKey.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/25">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              Nexus<span className="text-indigo-400">IQ</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
              CLERK AUTH
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise Multi-Tenant Knowledge Assistant with Clerk Identity & Access Management
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Key className="w-4 h-4" />
              <span>Connect Clerk Authentication</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NexusIQ uses <strong>Clerk</strong> for enterprise authentication, social SSO, multi-factor authentication (MFA), and organization identity.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Clerk Publishable Key (<code className="font-mono text-indigo-300">pk_test_...</code>)
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="pk_test_dGhpcy1pcy1hLWV4YW1wbGUtY2xlcmsta2V5JA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Activate Clerk Authentication
            </button>
          </form>

          {/* Instructions */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">Quick 2-minute setup:</div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Open your free <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">Clerk Dashboard <ExternalLink className="w-3 h-3" /></a></li>
              <li>Go to <strong>API Keys</strong> and copy your <strong>Publishable key</strong> (<code className="text-slate-300">pk_test_...</code>)</li>
              <li>Paste it above or add <code className="text-slate-300">VITE_CLERK_PUBLISHABLE_KEY</code> to your environment</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClerkAuthWrapper: React.FC<{
  children: React.ReactNode;
  onUserSynced?: (user: any) => void;
}> = ({ children, onUserSynced }) => {
  const [clerkKey, setClerkKey] = useState<string | null>(getStoredOrEnvKey());

  const handleSaveKey = (key: string) => {
    localStorage.setItem('nexusiq_clerk_pub_key', key);
    setClerkKey(key);
  };

  const contextValue: ClerkAuthContextType = {
    isClerkConfigured: Boolean(clerkKey),
    clerkKey,
    saveClerkKey: handleSaveKey,
  };

  // If no Clerk Publishable Key is provided yet, show setup screen
  if (!clerkKey) {
    return (
      <ClerkAuthContext.Provider value={contextValue}>
        <ClerkSetupScreen onKeySaved={handleSaveKey} />
      </ClerkAuthContext.Provider>
    );
  }

  return (
    <ClerkAuthContext.Provider value={contextValue}>
      <ClerkProvider publishableKey={clerkKey}>
        <ClerkUserSyncer onUserSynced={onUserSynced} />
        {/* If signed in, render the full NexusIQ enterprise platform */}
        <SignedIn>{children}</SignedIn>

        {/* If signed out, render Clerk's official SignIn portal */}
        <SignedOut>
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
            <div className="w-full max-w-md space-y-6 flex flex-col items-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/25">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                  Nexus<span className="text-indigo-400">IQ</span>
                </h1>
                <p className="text-xs text-slate-400">Sign in to your enterprise knowledge workspace</p>
              </div>

              {/* Clerk Sign In Component with sleek dark appearance */}
              <div className="w-full flex justify-center">
                <SignIn
                  routing="hash"
                  appearance={{
                    elements: {
                      card: 'bg-slate-900 border border-slate-800 shadow-2xl text-slate-100',
                      headerTitle: 'text-white font-bold',
                      headerSubtitle: 'text-slate-400 text-xs',
                      socialButtonsBlockButton: 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700',
                      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold',
                      formFieldInput: 'bg-slate-950 border-slate-800 text-white',
                      footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                    },
                  }}
                />
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('nexusiq_clerk_pub_key');
                  setClerkKey(null);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-400 underline transition-colors"
              >
                Change Clerk API Key
              </button>
            </div>
          </div>
        </SignedOut>
      </ClerkProvider>
    </ClerkAuthContext.Provider>
  );
};
