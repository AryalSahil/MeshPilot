import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../components/Router';
import { Settings, Shield, Bell, Eye, Layout, Trash2, CheckCircle, User } from 'lucide-react';
import { UserProfile } from '@clerk/clerk-react';

export default function DashboardSettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'saas'>('profile');

  // Settings State Inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

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

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete your MeshPilot account? This will permanently close all active environment trace telemetry nodes.');
    if (confirm) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up font-sans pb-12">
      
      <div>
        <h2 className="text-xl font-display font-semibold text-white">SaaS Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Configure developer profiles, security verification layers, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* LEFT INDEX COLUMN FOR CONFIG LINKS */}
        <div className="space-y-1.5 md:col-span-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl border text-left transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400'
                : 'bg-neutral-900/10 border-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-900/20'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Operator Profile</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('saas')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl border text-left transition-all ${
              activeTab === 'saas'
                ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400'
                : 'bg-neutral-900/10 border-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-900/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>SaaS Preferences</span>
          </button>
        </div>

        {/* MAIN SETTINGS CONTENT AREA */}
        <div className="md:col-span-3 space-y-8">
          
          {activeTab === 'profile' ? (
            /* CLERK SECURE ACCOUNT MANAGER COMPONENT */
            <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/25 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Operator Profile Management</h3>
                <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Update personal credentials, configure Multi-Factor Authentication (MFA), and link single sign-on accounts securely.</p>
              </div>

              <div className="border-t border-neutral-900 pt-6">
                <UserProfile 
                  routing="hash"
                  appearance={{
                    variables: {
                      colorPrimary: '#6366f1',
                      colorBackground: '#0a0a0a',
                      colorInputBackground: '#020202',
                      colorText: '#ffffff',
                      colorTextSecondary: '#a3a3a3',
                      colorInputText: '#ffffff',
                      colorBorder: '#171717',
                    },
                    elements: {
                      card: 'bg-transparent border-0 shadow-none p-0 max-w-full w-full',
                      navbar: 'hidden md:flex border-r border-neutral-900/60 mr-4 pr-4',
                      headerTitle: 'text-white text-base font-display font-semibold',
                      headerSubtitle: 'text-neutral-500 text-xs',
                      profileSectionPrimaryButton: 'text-indigo-400 hover:text-indigo-300 font-semibold text-xs',
                      userProfilePage__security: 'text-white',
                      userPreviewId: 'text-neutral-500 font-mono text-[10px]',
                      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs px-4 py-2 cursor-pointer border-0 transition-colors',
                      formButtonReset: 'text-neutral-400 hover:text-white text-xs cursor-pointer',
                      breadcrumbsItem: 'text-neutral-400 font-semibold text-xs',
                      breadcrumbsSeparator: 'text-neutral-600',
                      badge: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 text-[10px]',
                      formFieldLabel: 'text-[10px] font-mono text-neutral-500 uppercase mb-1.5',
                      formFieldInput: 'w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60',
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            /* CUSTOM ALERTS, APPEARANCE, AND DANGER ZONE */
            <div className="space-y-8 animate-fade-in-up">
              
              {/* ALERT PREFERENCES */}
              <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/25 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Alert Rules & Communications</h3>
                  <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Configure when MeshPilot dispatches telemetry notifications to your inbox.</p>
                </div>

                {profileSaved && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-400 flex items-center gap-2 animate-fade-in-up">
                    <CheckCircle className="w-4 h-4" />
                    <span>SaaS preferences updated successfully.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
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

                  <div className="pt-2 border-t border-neutral-900">
                    <button 
                      type="submit" 
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Save Alert Rules Configuration
                    </button>
                  </div>
                </form>
              </section>

              {/* APPEARANCE CHOICES */}
              <section className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/25 space-y-4">
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

              {/* DANGER ZONE */}
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
          )}
          
        </div>

      </div>

    </div>
  );
}
