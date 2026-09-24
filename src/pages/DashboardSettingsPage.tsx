import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../components/Router';
import { Settings, Shield, Bell, Eye, EyeOff, Layout, Trash2, CheckCircle } from 'lucide-react';

export default function DashboardSettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { navigate } = useRouter();

  // Settings State Inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Security Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Theme choices state
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>(user?.theme || 'dark');

  // Multi-alert checklist state
  const [emailAlerts, setEmailAlerts] = useState(user?.notificationsEnabled.email ?? true);
  const [securityAlerts, setSecurityAlerts] = useState(user?.notificationsEnabled.security ?? true);
  const [performanceAlerts, setPerformanceAlerts] = useState(user?.notificationsEnabled.performance ?? true);
  const [deploymentAlerts, setDeploymentAlerts] = useState(user?.notificationsEnabled.deployments ?? true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      theme: selectedTheme,
      notificationsEnabled: {
        email: emailAlerts,
        security: securityAlerts,
        performance: performanceAlerts,
        deployments: deploymentAlerts,
      }
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    
    // Simulate updating password
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete your MeshPilot account? This will permanently close all active environment trace telemetry nodes.');
    if (confirm) {
      // Clear sessions
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up font-sans pb-12">
      
      <div>
        <h2 className="text-xl font-display font-semibold text-white">SaaS Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Configure developer profiles, security verification layers, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT INDEX COLUMN FOR CONFIG LINKS */}
        <div className="space-y-1 md:col-span-1">
          {[
            { label: 'Operator Profile', icon: Settings },
            { label: 'Security & Auth', icon: Shield },
            { label: 'Communication Alerts', icon: Bell },
            { label: 'Interface & Themes', icon: Layout }
          ].map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div 
                key={idx}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 rounded-xl bg-neutral-900/10 border border-neutral-900/50"
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{sec.label}</span>
              </div>
            );
          })}
        </div>

        {/* MAIN SETTINGS FORM STACKS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* PROFILE CARD */}
          <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Operator Profile Info</h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Configure your visual display name and workspace address.</p>
            </div>

            {profileSaved && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-400 flex items-center gap-2 animate-fade-in-up">
                <CheckCircle className="w-4 h-4" />
                <span>Profile metadata synced successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Pilot')}`} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900"
                />
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Workspace avatar</span>
                  <p className="text-xs text-neutral-400 mt-1">Sourced automatically based on initials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Full name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Workspace Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Save Profile Configuration
                </button>
              </div>
            </form>
          </section>

          {/* SECURITY & PASSWORD CHANGE */}
          <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Security & Encryption Credentials</h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Revoke access nodes and secure your operator dashboard passwords.</p>
            </div>

            {passwordSaved && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-400 flex items-center gap-2 animate-fade-in-up">
                <CheckCircle className="w-4 h-4" />
                <span>Password changed successfully.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Change Operator Password
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-neutral-900">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2">Two-Factor Authentication (2FA)</span>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-900 flex justify-between items-center text-xs">
                <div>
                  <p className="text-white font-bold font-sans">Multi-factor tokens</p>
                  <p className="text-neutral-500 text-[10px] mt-0.5">Require an extra secure token upon pipeline edits.</p>
                </div>
                <span className="text-[9px] font-mono font-bold bg-neutral-900 text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">
                  INACTIVE
                </span>
              </div>
            </div>
          </section>

          {/* COMMUNICATION ALERTS */}
          <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Alert Rules & Communications</h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Configure when MeshPilot dispatches telemetry notifications to your inbox.</p>
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'Weekly Summary Alerts', desc: 'SLA metrics summaries emailed directly every Monday.', val: emailAlerts, set: setEmailAlerts },
                { label: 'Security Spikes Alerts', desc: 'Immediate dispatch on invalid CORS or expired certificates.', val: securityAlerts, set: setSecurityAlerts },
                { label: 'Performance Warnings', desc: 'Dispatched when response latencies exceed 450ms.', val: performanceAlerts, set: setPerformanceAlerts },
                { label: 'Deployment Confirmations', desc: 'Alert upon success of production branch builds.', val: deploymentAlerts, set: setDeploymentAlerts }
              ].map((rule, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-neutral-900/40 last:border-b-0">
                  <div className="max-w-md">
                    <p className="text-white font-semibold">{rule.label}</p>
                    <p className="text-neutral-500 text-[10px] mt-0.5 leading-relaxed">{rule.desc}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={rule.val}
                    onChange={(e) => rule.set(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* APPEARANCE CHOICES */}
          <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Appearance & Theme Preferences</h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Customize the operator visual interface to match your style.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { id: 'dark', label: 'Dark Mode', desc: 'Optimal contrast' },
                { id: 'light', label: 'Light Mode', desc: 'High visibility' },
                { id: 'system', label: 'System Default', desc: 'Automatic mapping' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id as any)}
                  className={`p-4 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedTheme === theme.id 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'border-neutral-900 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  <span className="font-bold block">{theme.label}</span>
                  <span className="text-[9px] text-neutral-500 block mt-1">{theme.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* DANGER DELETION ZONE */}
          <section className="p-6 rounded-2xl border border-red-500/10 bg-red-950/5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Permanently purge all data history logs, projects, and active communication gateways.</p>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Purging your active workspace terminates tracking instantly. This action is irreversible. Ensure you export your SLA logs prior to deletion.
            </p>

            <div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/30 text-red-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Permanently Delete Account
              </button>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
