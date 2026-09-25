import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../components/Router';
import { Shield, Eye, EyeOff, Lock, Mail, User, Check, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const { login, loginWithGoogle } = useAuth();
  const { navigate } = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Google Single Sign-on failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black font-display shadow-md">
            M
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">MeshPilot</span>
        </Link>
        <h2 className="text-center text-3xl font-display font-semibold text-white tracking-tight">
          Welcome back to control
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Trace pipelines, secure Postgres, and measure edge telemetry.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-400 font-mono flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

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
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-mono text-neutral-500 uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] font-mono text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-neutral-400">
                  Remember me for 30 days
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Verifying node credentials...' : 'Sign In to Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-900" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-neutral-950/80 rounded-md text-[10px] font-mono text-neutral-500 uppercase">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-neutral-800 rounded-xl bg-neutral-950 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.27-.29-.42s-.16-.3-.24-.45z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Authorize with Google Single Sign-on</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-xs text-neutral-500">Don't have an account yet? </span>
            <Link to="/signup" className="text-xs font-semibold text-indigo-400 hover:underline">
              Create Account Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignUpPage() {
  const { signup, loginWithGoogle, verifyEmailCode, signUpSession } = useAuth();
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms of service and privacy rules to register.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, password);
      
      // If Clerk has unverified fields, we show the verification overlay
      if (signUpSession && signUpSession.unverifiedFields && signUpSession.unverifiedFields.includes('email_address')) {
        setShowVerification(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setVerifyingCode(true);

    try {
      await verifyEmailCode(verificationCode);
      navigate('/dashboard');
    } catch (err: any) {
      setVerificationError(err.message || 'Email verification code is incorrect. Please try again.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth error during signup:', err);
      setError(err.message || 'Google Single Sign-on failed.');
      setSubmitting(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-900/45 flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-display font-semibold text-white tracking-tight">
            Email Verification Code
          </h2>
          <p className="mt-2 text-xs text-neutral-400">
            We have dispatched a 6-digit verification code to <b>{email}</b>.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            {verificationError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-400 font-mono flex items-start gap-2">
                <span>⚠️</span>
                <span>{verificationError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="block w-full tracking-[0.5em] text-center font-bold text-lg py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-700 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={verifyingCode}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              >
                {verifyingCode ? 'Verifying authentication code...' : 'Confirm Verification Code'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black font-display shadow-md">
            M
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">MeshPilot</span>
        </Link>
        <h2 className="text-center text-3xl font-display font-semibold text-white tracking-tight">
          Create SaaS Account
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Initialize telemetry nodes across production and staging environments instantly.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/30 backdrop-blur-md border border-neutral-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-400 font-mono flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-neutral-600" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  placeholder="Satya Nadella"
                />
              </div>
            </div>

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

            <div>
              <label htmlFor="password" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-600" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Password Strength Indicators */}
              {password && (
                <div className="mt-2 space-y-1 animate-fade-in-down">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                    <span>STRENGTH: <span className="font-bold text-neutral-300">{passwordStrength.label}</span></span>
                    <span>Min 8 chars</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-600" />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-0 focus:outline-none"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="terms" className="text-neutral-400">
                  I accept the <Link to="/legal" className="text-indigo-400 hover:underline">SaaS Terms of Use</Link> and agree to privacy tracing guidelines.
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Registering sandbox cluster...' : 'Initialize Free Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-900" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-neutral-950/80 rounded-md text-[10px] font-mono text-neutral-500 uppercase">
                  Or register with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-neutral-800 rounded-xl bg-neutral-950 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.27-.29-.42s-.16-.3-.24-.45z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Authorize with Google Single Sign-on</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-xs text-neutral-500">Already registered? </span>
            <Link to="/login" className="text-xs font-semibold text-indigo-400 hover:underline">
              Log in to Dashboard
            </Link>
          </div>
        </div>
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
