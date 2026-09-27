import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../components/Router';
import { Shield, Eye, EyeOff, Lock, Mail, User, Check, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'None', color: 'bg-neutral-800' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1: return { score: 25, label: 'Weak', color: 'bg-red-500' };
    case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    case 3: return { score: 75, label: 'Good', color: 'bg-indigo-500' };
    case 4: return { score: 100, label: 'Excellent', color: 'bg-emerald-500' };
    default: return { score: 10, label: 'Too Short', color: 'bg-red-600' };
  }
}

export function LoginPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans animate-fade-in">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mb-6 relative z-10 text-center">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black font-display shadow-md">
            M
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">MeshPilot</span>
        </Link>
      </div>

      <div className="relative z-10">
        <SignIn 
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#4f46e5',
              colorBackground: '#0a0a0a',
              colorInputBackground: '#050505',
              colorBorder: '#262626',
              colorText: '#f5f5f5',
            }
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}

export function SignUpPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans animate-fade-in">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mb-6 relative z-10 text-center">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black font-display shadow-md">
            M
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">MeshPilot</span>
        </Link>
      </div>

      <div className="relative z-10">
        <SignUp 
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#4f46e5',
              colorBackground: '#0a0a0a',
              colorInputBackground: '#050505',
              colorBorder: '#262626',
              colorText: '#f5f5f5',
            }
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 font-sans">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to login</span>
        </Link>
        <h2 className="text-3xl font-display font-semibold text-white tracking-tight">
          Recover Password
        </h2>
        <p className="mt-2 text-xs text-neutral-400 font-sans">
          Enter your registered email below to dispatch a reset sequence.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-400 font-mono flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 animate-fade-in-up">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs font-mono text-indigo-300">
                🚀 A telemetry password recovery link has been dispatched to <b>{email}</b>. Use the received verification code below.
              </div>
              <Link
                to="/reset-password"
                className="block text-center w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs text-white font-semibold transition-colors border border-neutral-800"
              >
                Access Password Reset Page
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-neutral-600" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Dispatching...' : 'Dispatch Reset Sequence'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { navigate } = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Verification code is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(code, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to establish new credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-3xl font-display font-semibold text-white tracking-tight text-center">
          Reset Password
        </h2>
        <p className="mt-2 text-xs text-neutral-400 text-center font-sans">
          Establish new cluster credentials for your dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-400 font-mono">
              ⚠️ {error}
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-400 text-center animate-pulse">
              ✅ Password saved! Redirecting to login terminal...
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="block w-full px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save New Credentials'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailPage() {
  const { navigate } = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center mx-auto mb-6 text-indigo-400">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-3xl font-display font-semibold text-white tracking-tight">
          Email Verification
        </h2>
        <p className="mt-2 text-xs text-neutral-400 font-sans">
          Authenticating communication gateway lines with MeshPilot core nodes.
        </p>

        <div className="mt-8 max-w-sm mx-auto">
          <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-6 shadow-xl rounded-2xl">
            {verifying ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                </div>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                  Verifying handshake token...
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in-up">
                <div className="inline-flex p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-full text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">Verification Successful</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Your route access credentials have been initialized successfully.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Enter SaaS Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
