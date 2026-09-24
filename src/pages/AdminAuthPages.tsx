import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Key, Terminal, ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useRouter } from '../components/Router';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminLoginPage() {
  const { navigate } = useRouter();
  const { adminLogin } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('All security fields must be complete.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const profile = await adminLogin(email, password);
      setSuccessMsg(`Session authorized as ${profile.role}. Initializing cockpit...`);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failure. Access denied.');
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 relative font-sans overflow-x-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Return Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to main website</span>
        </button>

        {/* Card Frame */}
        <div className="rounded-2xl border border-red-500/15 bg-neutral-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top security pattern */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-600 to-indigo-600" />
          
          {/* Admin Header Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <span className="text-[10px] font-mono font-black tracking-widest text-red-500 uppercase px-2 py-0.5 rounded bg-red-950/30 border border-red-900/30">
              Administrative Gateway
            </span>
            
            <h1 className="text-xl font-bold font-display text-white tracking-tight mt-3">
              MeshPilot Admin Control
            </h1>
            <p className="text-xs text-neutral-500 max-w-xs mt-1">
              Authorized operators only. Multi-factor verification and audit-logging enabled.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-2.5 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-400">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Admin Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@meshpilot.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Passphrase / Secret</label>
                <button
                  type="button"
                  onClick={() => alert('Passwords are secured inside our hashed environment. Click one of the demo keys below to log in instantly.')}
                  className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 select-none">
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-800 bg-neutral-950 text-red-600 focus:ring-red-500/20"
                />
                <span>Remember console session</span>
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-950/40 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying clearance keys...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Authenticate Operator</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts Panel */}
        <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950 p-4 shadow-xl">
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 font-bold uppercase mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox Administrative Clearance Keys</span>
          </div>
          <p className="text-[10px] text-neutral-500 mb-3">
            Click an identity node below to pre-fill test session credentials (password is <code className="text-neutral-300 font-mono">admin123</code>):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { email: 'superadmin@meshpilot.com', role: 'SUPER_ADMIN' },
              { email: 'admin@meshpilot.com', role: 'ADMIN' },
              { email: 'support@meshpilot.com', role: 'SUPPORT' },
              { email: 'analyst@meshpilot.com', role: 'ANALYST' }
            ].map(demo => (
              <button
                key={demo.email}
                type="button"
                onClick={() => fillDemoCredentials(demo.email)}
                className="p-2 text-left rounded-lg border border-neutral-900 bg-neutral-950 hover:bg-neutral-900/60 hover:border-neutral-800 transition-all cursor-pointer group"
              >
                <span className="text-[9px] font-mono font-bold text-neutral-400 group-hover:text-neutral-200 block truncate">{demo.email}</span>
                <span className="text-[8px] font-mono text-red-500 font-bold mt-0.5 block">{demo.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
