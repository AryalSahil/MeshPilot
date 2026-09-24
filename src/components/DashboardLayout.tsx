import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard, Project } from '../context/DashboardContext';
import { useRouter, Link } from './Router';
import { 
  Shield, Bell, Plus, Menu, X, LogOut, Settings, LayoutDashboard, 
  Layers, Activity, TrendingUp, AlertOctagon, Radio, Brain, GitCommit, 
  BarChart3, Puzzle, Globe, Github, Database, Sparkles, CheckSquare, Square
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { projects, notifications, addProject, markNotificationRead, markAllNotificationsRead } = useDashboard();
  const { path, navigate } = useRouter();

  // Modal & Drawer visibility toggles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // New Project Form Inputs State
  const [newProjName, setNewProjName] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');
  const [newProjEnv, setNewProjEnv] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const toggleIntegration = (name: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjUrl) return;

    addProject(newProjName, newProjUrl, newProjEnv, selectedIntegrations);
    
    // Reset Form & Close
    setNewProjName('');
    setNewProjUrl('');
    setNewProjEnv('Production');
    setSelectedIntegrations([]);
    setAddModalOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const sidebarLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/dashboard/projects', icon: Layers },
    { label: 'Monitoring', path: '/dashboard/monitoring', icon: Activity },
    { label: 'Performance', path: '/dashboard/performance', icon: TrendingUp },
    { label: 'Errors', path: '/dashboard/errors', icon: AlertOctagon },
    { label: 'Security', path: '/dashboard/security', icon: Shield },
    { label: 'Application Radar', path: '/dashboard/radar', icon: Radio },
    { label: 'AI Diagnostics', path: '/dashboard/ai-diagnostics', icon: Brain },
    { label: 'Deployments', path: '/dashboard/deployments', icon: GitCommit },
    { label: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
    { label: 'Integrations', path: '/dashboard/integrations', icon: Puzzle },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR CONTAINER */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-900 bg-neutral-950/80 backdrop-blur-md shrink-0 h-screen sticky top-0 justify-between select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-neutral-900/50 flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                M
              </div>
              <span className="text-md font-display font-semibold text-white tracking-tight">MeshPilot</span>
            </Link>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = path === link.path || (link.path !== '/dashboard' && path.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400 font-bold' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Profile Bottom Box */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Pilot')}`} 
                alt="user avatar" 
                className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name || 'Mesh Pilot'}</p>
                <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">{user?.email || 'guest@meshpilot.io'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/10 transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE TOPBAR HEADER */}
        <header className="lg:hidden h-14 border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                M
              </div>
              <span className="text-sm font-display font-semibold text-white tracking-tight">MeshPilot</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Notify */}
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-neutral-950" />
              )}
            </button>
          </div>
        </header>

        {/* MOBILE SIDEBAR DRAWERS / OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="relative w-72 max-w-sm bg-neutral-950 border-r border-neutral-900 flex flex-col justify-between h-full z-10 animate-fade-in-right">
              <div>
                <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                      M
                    </div>
                    <span className="text-sm font-display font-semibold text-white">MeshPilot Dashboard</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="p-3 space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = path === link.path || (link.path !== '/dashboard' && path.startsWith(link.path));
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                          isActive 
                            ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400 font-bold' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User bottom metadata */}
              <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img 
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Pilot')}`} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name || 'Mesh Pilot'}</p>
                      <p className="text-[10px] font-mono text-neutral-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP HEADER DESKTOP / ACTIONS */}
        <div className="hidden lg:flex items-center justify-between border-b border-neutral-900/80 bg-neutral-950/50 px-8 py-4 sticky top-0 z-30 backdrop-blur-md select-none">
          <div>
            <h2 className="text-base font-semibold text-white font-sans">
              Good morning, {user?.name || 'Operator'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Here's what's happening across your applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Project Button */}
            <button 
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer relative ${notificationsOpen ? 'bg-neutral-900 text-white' : ''}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-neutral-950" />
                )}
              </button>

              {/* Notification dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-neutral-900 bg-neutral-950 p-4 shadow-2xl animate-fade-in-down z-50">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 px-1.5 py-0.5 rounded-md">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => markAllNotificationsRead()}
                      className="text-[10px] font-mono text-neutral-500 hover:text-white transition-all"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] font-mono text-neutral-600 text-center py-6">No notifications currently</p>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => markNotificationRead(item.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            item.read 
                              ? 'bg-neutral-950/40 border-neutral-900/60 text-neutral-400' 
                              : 'bg-indigo-950/10 border-indigo-900/20 text-neutral-200 hover:bg-indigo-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">{item.category}</span>
                            <span className="text-[9px] font-mono text-neutral-600">{item.time}</span>
                          </div>
                          <h4 className="text-[11px] font-bold mt-1 text-white leading-tight">{item.title}</h4>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-sans">{item.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE TOPBAR COMPACT ACTION OVERLAYS */}
        <div className="lg:hidden flex items-center justify-between bg-neutral-950 border-b border-neutral-900/50 px-4 py-2 text-xs select-none">
          <span className="font-semibold text-white">Active Operational Panel</span>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
          >
            <Plus className="w-3 h-3" />
            <span>Add Project</span>
          </button>
        </div>

        {/* MOBILE NOTIFICATION FLOATING CONTAINER */}
        {notificationsOpen && lgHiddenNotifications()}

        {/* PRIMARY SUB-PAGE VIEWPORTS */}
        <main className="flex-1 bg-neutral-950 p-4 lg:p-8 min-h-0 select-text overflow-y-auto">
          {children}
        </main>
      </div>

      {/* PROJECT ADDITION MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" onClick={() => setAddModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl animate-fade-in-down">
            <button 
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white font-display">Initialize Trace Project</h3>
              <p className="text-xs text-neutral-400 font-sans">
                Set up a new monitoring node environment. MeshPilot will instantly start collecting trace logs.
              </p>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Acme Billing Dashboard" 
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Website URL</label>
                <input 
                  type="url" 
                  required
                  value={newProjUrl}
                  onChange={(e) => setNewProjUrl(e.target.value)}
                  placeholder="https://acme.com" 
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Environment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Production', 'Staging', 'Development'] as const).map(env => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setNewProjEnv(env)}
                      className={`py-2 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                        newProjEnv === env 
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold' 
                          : 'border-neutral-900 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-2">Optional Integrations</label>
                <div className="space-y-2">
                  {[
                    { id: 'GitHub', desc: 'Auto build pipeline regression diagnostics', icon: Github },
                    { id: 'Vercel', desc: 'Direct hook correlation into serverless routers', icon: Globe },
                    { id: 'Supabase', desc: 'Continuous slow PG query transaction scanning', icon: Database }
                  ].map(integration => {
                    const Icon = integration.icon;
                    const isSelected = selectedIntegrations.includes(integration.id);
                    return (
                      <div 
                        key={integration.id}
                        onClick={() => toggleIntegration(integration.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                          isSelected ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-neutral-900 bg-neutral-950/20 hover:border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <div>
                            <span className="text-xs font-bold text-white block">{integration.id}</span>
                            <span className="text-[9px] text-neutral-500 block">{integration.desc}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white">
                            <span className="text-[10px]">✔</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-neutral-800" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-all"
                >
                  Configure Trace Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Compact floating dropdown support helper specifically for responsive mobile viewports
  function lgHiddenNotifications() {
    return (
      <div className="fixed top-24 right-4 left-4 z-50 rounded-2xl border border-neutral-900 bg-neutral-950/95 backdrop-blur-md p-4 shadow-2xl animate-fade-in-down lg:hidden">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-3">
          <span className="text-xs font-bold text-white">Notifications ({unreadCount} new)</span>
          <button 
            onClick={() => {
              markAllNotificationsRead();
              setNotificationsOpen(false);
            }} 
            className="text-[10px] font-mono text-neutral-500 hover:text-white"
          >
            Mark all as read
          </button>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {notifications.map(item => (
            <div 
              key={item.id} 
              onClick={() => markNotificationRead(item.id)}
              className={`p-2.5 rounded-xl border text-xs ${
                item.read ? 'border-neutral-900 text-neutral-400' : 'bg-indigo-950/10 border-indigo-900/20 text-neutral-100'
              }`}
            >
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-indigo-400">{item.category}</span>
                <span className="text-neutral-500">{item.time}</span>
              </div>
              <h4 className="font-bold mt-1 text-white leading-tight">{item.title}</h4>
              <p className="text-[10px] text-neutral-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
