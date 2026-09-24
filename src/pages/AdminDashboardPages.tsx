import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../components/Router';
import { useAdminAuth, AdminProfile } from '../context/AdminAuthContext';
import { 
  Users, Building2, Layers, CreditCard, Activity, Shield, Brain, 
  Cpu, MessageSquare, History, Settings, Search, Filter, ArrowLeft, 
  Trash2, Play, AlertTriangle, CheckCircle2, UserCheck, UserX, X,
  ExternalLink, BarChart3, TrendingUp, Sparkles, Terminal, Mail, Plus, Check
} from 'lucide-react';

// Keys for local storage representation of Mock Database
const USERS_DB_KEY = 'meshpilot_mock_users';
const PLAN_CONFIG_KEY = 'meshpilot_plans_config';
const AUDIT_LOGS_KEY = 'meshpilot_audit_logs';
const TICKETS_KEY = 'meshpilot_support_tickets';

// Default plans data
const defaultPlans = [
  { id: 'free', name: 'Free Tier', price: 0, projects: 2, monitoringLimit: '15 mins', aiLimit: '100 requests/mo', scansLimit: '1/mo', storage: '500MB', teamMembers: 1, dataRetention: '7 days' },
  { id: 'pro', name: 'Developer Pro', price: 29, projects: 10, monitoringLimit: '1 min', aiLimit: '5,000 requests/mo', scansLimit: 'Weekly', storage: '10GB', teamMembers: 3, dataRetention: '30 days' },
  { id: 'business', name: 'Business Scale', price: 99, projects: 30, monitoringLimit: '30 secs', aiLimit: '50,000 requests/mo', scansLimit: 'Daily', storage: '100GB', teamMembers: 10, dataRetention: '90 days' },
  { id: 'enterprise', name: 'Enterprise Custom', price: 499, projects: 999, monitoringLimit: '10 secs', aiLimit: 'Unlimited', scansLimit: 'Continuous', storage: '2TB', teamMembers: 99, dataRetention: '365 days' },
];

// Seed default users if they are empty
const seedUsersIfEmpty = () => {
  const existing = localStorage.getItem(USERS_DB_KEY);
  if (!existing) {
    const mockUsers = [
      { id: 'usr_101', name: 'Alice Smith', email: 'alice@acme.org', projectsCount: 3, plan: 'business', status: 'Active', lastActive: '2 min ago', createdAt: '2025-01-12', orgName: 'Acme Corp', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alice' },
      { id: 'usr_102', name: 'Bob Johnson', email: 'bob@cryptolog.io', projectsCount: 1, plan: 'free', status: 'Active', lastActive: '1 hour ago', createdAt: '2025-02-28', orgName: 'CryptoLog LLC', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bob' },
      { id: 'usr_103', name: 'Charlie Dave', email: 'charlie@deveye.tech', projectsCount: 6, plan: 'pro', status: 'Active', lastActive: '12 min ago', createdAt: '2025-03-05', orgName: 'DevEye Tech', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Charlie' },
      { id: 'usr_104', name: 'Diana Prince', email: 'diana@themiscira.net', projectsCount: 12, plan: 'enterprise', status: 'Active', lastActive: 'Just now', createdAt: '2025-01-20', orgName: 'Amazonian Lab', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Diana' },
      { id: 'usr_105', name: 'Ethan Hunt', email: 'ethan@imf.gov', projectsCount: 4, plan: 'business', status: 'Suspended', lastActive: '3 days ago', createdAt: '2025-02-14', orgName: 'Impossible Labs', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ethan' },
      { id: 'usr_106', name: 'Fiona Gallagher', email: 'fiona@southside.co', projectsCount: 2, plan: 'free', status: 'Active', lastActive: 'Yesterday', createdAt: '2025-04-01', orgName: 'SouthSide Retail', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fiona' },
      { id: 'usr_107', name: 'George Cooper', email: 'george@medford.edu', projectsCount: 5, plan: 'pro', status: 'Active', lastActive: '4 hours ago', createdAt: '2025-03-18', orgName: 'Medford Robotics', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=George' },
      { id: 'usr_108', name: 'Hannah Baker', email: 'hannah@crestmont.fm', projectsCount: 0, plan: 'free', status: 'Active', lastActive: '6 days ago', createdAt: '2025-05-12', orgName: 'Crestmont Audio', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hannah' }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(mockUsers));
  }
};

// Seed default support tickets
const seedTicketsIfEmpty = () => {
  const existing = localStorage.getItem(TICKETS_KEY);
  if (!existing) {
    const defaultTickets = [
      { id: 'tkt_301', title: 'Slow custom monitoring triggers', userEmail: 'alice@acme.org', category: 'Performance', severity: 'High', status: 'Open', message: 'We are noticing that custom checks are resolving every 2 minutes instead of every 30 seconds as stated in our Business plan. Please advice.', createdAt: '2026-09-24T06:40:00Z', replies: [] },
      { id: 'tkt_302', title: 'Vercel deployment hook fails', userEmail: 'charlie@deveye.tech', category: 'Integration', severity: 'Medium', status: 'In Progress', message: 'Vercel webhook yields status 403. Our integration settings look pristine. Please let us know if there is an outage.', createdAt: '2026-09-23T14:15:00Z', replies: [{ role: 'admin', text: 'Hi Charlie, our operations team is currently investigating the Vercel API authorization cluster.', time: '2026-09-23T16:00:00Z' }] },
      { id: 'tkt_303', title: 'Inquire enterprise SLAs', userEmail: 'diana@themiscira.net', category: 'Billing', severity: 'Low', status: 'Resolved', message: 'We would love to know if MeshPilot supports a 99.999% SLA agreement with signed contractual liabilities.', createdAt: '2026-09-22T09:12:00Z', replies: [{ role: 'admin', text: 'Hello Diana, absolutely! We provide customizable contractual SLAs for Enterprise accounts.', time: '2026-09-22T11:05:00Z' }] },
    ];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(defaultTickets));
  }
};

// Seed default plans if empty
const seedPlansIfEmpty = () => {
  const existing = localStorage.getItem(PLAN_CONFIG_KEY);
  if (!existing) {
    localStorage.setItem(PLAN_CONFIG_KEY, JSON.stringify(defaultPlans));
  }
};

// Log action to admin audit trail
export const logAuditAction = (adminEmail: string, role: string, action: string, target: string) => {
  const logsRaw = localStorage.getItem(AUDIT_LOGS_KEY);
  const logs = logsRaw ? JSON.parse(logsRaw) : [];
  
  const newLog = {
    id: 'aud_' + Math.random().toString(36).substring(2, 9),
    action,
    actor: adminEmail,
    role,
    target,
    ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(newLog); // Put new at start
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
};

export default function AdminDashboardLayout() {
  const { path, navigate } = useRouter();
  const { adminUser, adminLogout } = useAdminAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States to keep live counts and items
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Reload database variables
  const reloadData = () => {
    seedUsersIfEmpty();
    seedTicketsIfEmpty();
    seedPlansIfEmpty();
    
    setUsers(JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]'));
    setPlans(JSON.parse(localStorage.getItem(PLAN_CONFIG_KEY) || '[]'));
    setTickets(JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'));
    setAuditLogs(JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]'));
  };

  useEffect(() => {
    reloadData();
  }, [path]);

  // Handle support ticketing replies, user edits, plan modifications, etc.
  const handleUserSuspend = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
    setUsers(updated);
    
    const affectedUser = users.find(u => u.id === id);
    if (affectedUser) {
      const actionStr = affectedUser.status === 'Active' ? 'Suspended account' : 'Reactivated account';
      logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', actionStr, affectedUser.email);
    }
    reloadData();
  };

  const handleUserDelete = (id: string) => {
    const affectedUser = users.find(u => u.id === id);
    if (!affectedUser) return;
    
    if (confirm(`CRITICAL SECURITY ACTION: Are you sure you want to permanently delete user ${affectedUser.name} (${affectedUser.email}) and all their metrics?`)) {
      const updated = users.filter(u => u.id !== id);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
      setUsers(updated);
      
      logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', 'Permanently deleted user database record', affectedUser.email);
      reloadData();
      navigate('/admin/users');
    }
  };

  const sidebarLinks = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'User Control', path: '/admin/users', icon: Users },
    { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { label: 'Project Monitors', path: '/admin/projects', icon: Layers },
    { label: 'Subscription & Plans', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Platform Usage', path: '/admin/usage', icon: Activity },
    { label: 'Monitoring Nodes', path: '/admin/monitoring', icon: TrendingUp },
    { label: 'Security & Scans', path: '/admin/security', icon: Shield },
    { label: 'AI Request Logs', path: '/admin/ai', icon: Brain },
    { label: 'System Clusters', path: '/admin/system', icon: Cpu },
    { label: 'Support Queue', path: '/admin/support', icon: MessageSquare },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: History },
    { label: 'Gateway Settings', path: '/admin/settings', icon: Settings },
  ];

  // Helper calculation of MRR from user plans
  const calculateMRR = () => {
    let mrr = 0;
    users.forEach(u => {
      const p = plans.find(pl => pl.id === u.plan) || defaultPlans.find(pl => pl.id === u.plan);
      if (p) mrr += p.price;
    });
    return mrr;
  };

  // Extract selected user ID if deep linking inside users
  const pathParts = path.split('/');
  const isUserDetailPage = path.startsWith('/admin/users/') && pathParts[3];
  const selectedUserId = isUserDetailPage ? pathParts[3] : null;

  // Render Subcomponent Based on Path
  const renderAdminSubPage = () => {
    if (selectedUserId) {
      return (
        <AdminUserDetailView 
          userId={selectedUserId} 
          users={users} 
          plans={plans}
          onSuspend={handleUserSuspend} 
          onDelete={handleUserDelete} 
          onBack={() => navigate('/admin/users')}
        />
      );
    }

    switch (path) {
      case '/admin':
      case '/admin/dashboard':
        return <AdminOverviewView users={users} mrr={calculateMRR()} plans={plans} auditLogs={auditLogs} />;
      case '/admin/users':
        return (
          <AdminUsersView 
            users={users} 
            plans={plans}
            onSuspend={handleUserSuspend} 
            onDelete={handleUserDelete} 
            onView={(id) => navigate(`/admin/users/${id}`)}
          />
        );
      case '/admin/organizations':
        return <AdminOrganizationsView users={users} />;
      case '/admin/projects':
        return <AdminProjectsView users={users} />;
      case '/admin/plans':
      case '/admin/subscriptions':
        return (
          <AdminSubscriptionsView 
            users={users} 
            plans={plans} 
            onSavePlans={(updatedPlans) => {
              localStorage.setItem(PLAN_CONFIG_KEY, JSON.stringify(updatedPlans));
              setPlans(updatedPlans);
              logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', 'Updated product subscription configurations', 'System Plans Matrix');
              alert('Operational pricing models updated successfully.');
            }}
          />
        );
      case '/admin/usage':
        return <AdminUsageView users={users} />;
      case '/admin/monitoring':
        return <AdminMonitoringView />;
      case '/admin/security':
        return <AdminSecurityView />;
      case '/admin/ai':
        return <AdminAIView />;
      case '/admin/system':
        return <AdminSystemView />;
      case '/admin/support':
        return (
          <AdminSupportView 
            tickets={tickets} 
            adminUser={adminUser}
            onUpdateTickets={(updatedTickets) => {
              localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
              setTickets(updatedTickets);
              reloadData();
            }}
          />
        );
      case '/admin/audit-logs':
        return <AdminAuditLogsView auditLogs={auditLogs} onClear={() => {
          if (confirm('CRITICAL AUDIT ACTION: Are you sure you want to flush the platform audit trails? This action cannot be undone.')) {
            localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([]));
            setAuditLogs([]);
            logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', 'Flushed platform audit trails', 'Audit Repository');
            reloadData();
          }
        }} />;
      case '/admin/settings':
        return <AdminSettingsView adminUser={adminUser} />;
      default:
        return <AdminOverviewView users={users} mrr={calculateMRR()} plans={plans} auditLogs={auditLogs} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR CONTAINER */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-red-500/10 bg-neutral-950 shrink-0 h-screen sticky top-0 justify-between select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-neutral-900/50 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-950/50">
                M
              </div>
              <div>
                <span className="text-sm font-display font-semibold text-white tracking-tight block">MeshPilot</span>
                <span className="text-[8px] font-mono text-red-500 font-bold tracking-widest uppercase block -mt-0.5">Control Cockpit</span>
              </div>
            </Link>
          </div>

          {/* Admin Role Status Tag */}
          <div className="mx-4 mt-4 p-3 rounded-xl bg-red-950/10 border border-red-900/30 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold text-red-400 uppercase leading-none">{adminUser?.role}</p>
              <p className="text-[9px] text-neutral-500 mt-1 truncate">Actor: {adminUser?.name}</p>
            </div>
          </div>

          {/* Nav list */}
          <nav className="p-3 space-y-0.5 mt-2 overflow-y-auto max-h-[60vh] scrollbar-thin">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = path === link.path || (link.path !== '/admin' && path.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-red-950/10 border-l-2 border-red-500 text-red-400 font-bold' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Account Bottom Section */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <img 
                src={adminUser?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=Admin`} 
                alt="admin avatar" 
                className="w-8 h-8 rounded-full border border-red-900/30 bg-neutral-900 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{adminUser?.name}</p>
                <p className="text-[9px] font-mono text-neutral-500 truncate mt-0.5">{adminUser?.email}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                adminLogout();
                navigate('/admin/login');
              }}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/10 transition-all cursor-pointer"
              title="Terminate administrator keys"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* MOBILE TOPBAR */}
        <header className="lg:hidden h-14 border-b border-red-900/20 bg-neutral-950 px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <MenuIcon className="w-4 h-4" />
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded bg-red-600 flex items-center justify-center text-white font-black text-[10px]">
                M
              </div>
              <div>
                <span className="text-xs font-display font-bold text-white leading-none block">MeshPilot</span>
                <span className="text-[7px] font-mono text-red-500 uppercase leading-none">Admin Control</span>
              </div>
            </Link>
          </div>

          <span className="text-[9px] font-mono bg-red-950/40 text-red-400 border border-red-900/30 px-2 py-0.5 rounded">
            {adminUser?.role}
          </span>
        </header>

        {/* MOBILE OVERLAY DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            <div className="relative w-72 bg-neutral-950 border-r border-red-900/20 flex flex-col justify-between h-full z-10 animate-fade-in-right">
              <div>
                <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded bg-red-600 flex items-center justify-center text-white font-black text-[10px]">
                      M
                    </div>
                    <span className="text-xs font-display font-semibold text-white">Admin Control</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="p-3 space-y-0.5">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = path === link.path || (link.path !== '/admin' && path.startsWith(link.path));
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-red-950/10 border-l-2 border-red-500 text-red-400 font-bold' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile bottom metadata */}
              <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img 
                      src={adminUser?.avatar} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full border border-red-900/30 bg-neutral-900"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate leading-tight">{adminUser?.name}</p>
                      <p className="text-[9px] font-mono text-neutral-500 truncate">{adminUser?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      adminLogout();
                      navigate('/admin/login');
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/10"
                  >
                    <LogOutIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY VIEWPORTS */}
        <main className="flex-1 bg-neutral-950 p-4 lg:p-8 overflow-y-auto select-text">
          {renderAdminSubPage()}
        </main>
      </div>

    </div>
  );
}

// Support icons
function LogOutIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  );
}
function MenuIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  );
}


// =================================================================================================
// SUB-VIEWPORTS
// =================================================================================================

// 1. ADMIN OVERVIEW (DASHBOARD)
function AdminOverviewView({ users, mrr, plans, auditLogs }: { users: any[]; mrr: number; plans: any[]; auditLogs: any[] }) {
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const projectsTotal = users.reduce((acc, u) => acc + u.projectsCount, 0);

  // Platform statistics
  const platformCards = [
    { label: 'Total Customers', val: users.length, color: 'text-indigo-400', desc: 'Registered user nodes' },
    { label: 'Active Sessions', val: activeUsersCount, color: 'text-emerald-400', desc: 'Active in the last 24H' },
    { label: 'Monitored Projects', val: projectsTotal, color: 'text-amber-400', desc: 'Customer application targets' },
    { label: 'Telemetry Checks', val: '15,284', color: 'text-sky-400', desc: 'Health endpoints monitored' },
    { label: 'Monthly Recurring Revenue', val: `₹${mrr.toLocaleString('en-IN')}`, color: 'text-red-400', desc: 'Simulated operational index' },
    { label: 'AI Diagnostic Logs', val: '182,410', color: 'text-fuchsia-400', desc: 'Cognitive traces mapped' },
    { label: 'Vulnerability Scans', val: '32,481', color: 'text-rose-400', desc: 'Automatic OWASP probes run' },
    { label: 'System Host Status', val: 'HEALTHY', color: 'text-emerald-500 font-bold', desc: 'Clusters up on Google Cloud' }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Platform Administrator Overview</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Real-time health indices, transaction limits, and operational summaries.</p>
      </div>

      {/* Grid of 8 stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformCards.map((c, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 relative overflow-hidden group hover:border-red-500/10 transition-colors">
            <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-wider">{c.label}</span>
            <span className={`text-2xl font-bold block mt-2.5 ${c.color}`}>{c.val}</span>
            <span className="text-[10px] text-neutral-500 block mt-1 leading-normal font-sans">{c.desc}</span>
            <div className="absolute top-0 right-0 w-16 h-16 bg-neutral-900/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Charts & Interactive telemetry simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simple visual Analytics Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Registration & Request Volume</h3>
              <p className="text-[10px] text-neutral-500">Telemetry tracking across 24H, 7D, 30D, and 90D timeline</p>
            </div>
            
            <div className="flex gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              {['24H', '7D', '30D', '90D'].map((t) => (
                <button key={t} className={`px-2 py-1 text-[8px] font-mono rounded cursor-pointer ${t === '30D' ? 'bg-red-600 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 font-mono text-[9px] text-neutral-600">
            {[45, 62, 55, 78, 91, 115, 138, 110, 142, 168, 195, 230].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[8px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                <div 
                  style={{ height: `${(val / 240) * 120}px` }}
                  className="w-full rounded bg-neutral-900 group-hover:bg-red-500/50 transition-colors relative"
                >
                  <div className="absolute inset-0 bg-indigo-500/10 opacity-30 group-hover:bg-red-500/20" />
                </div>
                <span className="text-[8px] text-neutral-600 block">{idx + 1} Sep</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Plans Distribution */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Plan Matrix Distribution</h3>
            <p className="text-[10px] text-neutral-500">Breakdown of operational licenses</p>
          </div>

          <div className="space-y-3.5">
            {[
              { id: 'free', label: 'Free Tier', pct: 37, color: 'bg-neutral-700' },
              { id: 'pro', label: 'Developer Pro', pct: 25, color: 'bg-indigo-500' },
              { id: 'business', label: 'Business Scale', pct: 25, color: 'bg-amber-500' },
              { id: 'enterprise', label: 'Enterprise Custom', pct: 13, color: 'bg-red-500' }
            ].map(p => {
              const count = users.filter(u => u.plan === p.id).length;
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-white">{p.label}</span>
                    <span className="font-mono text-neutral-500">{count} users ({p.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div style={{ width: `${p.pct}%` }} className={`h-full rounded-full ${p.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Secondary Row: Active Audit logs teaser */}
      <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Critical Audit Stream (Recent Actions)</h3>
            <p className="text-[10px] text-neutral-500">Continuous non-repudiation logging stream</p>
          </div>
          <Link to="/admin/audit-logs" className="text-[10px] font-mono text-red-500 hover:text-red-400">
            View full stream
          </Link>
        </div>

        <div className="divide-y divide-neutral-900">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-neutral-600">[{log.ipAddress}]</span>
                <span className="text-neutral-300 font-bold">{log.action}</span>
                <span className="text-neutral-500">on target</span>
                <span className="text-indigo-400 font-semibold">{log.target}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">{log.actor} ({log.role})</span>
                <span className="text-[9px] text-neutral-600 block mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-[10px] font-mono text-neutral-600 text-center py-6">No administrative log entries reported in current session context.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. ADMIN USERS (USER CONTROL PANEL)
function AdminUsersView({ users, plans, onSuspend, onDelete, onView }: { users: any[]; plans: any[]; onSuspend: (id: string) => void; onDelete: (id: string) => void; onView: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');

  const getPlanDetails = (planId: string) => plans.find(p => p.id === planId) || defaultPlans.find(p => p.id === planId);

  // Filter & Search
  const processedUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()) || u.orgName.toLowerCase().includes(query.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'NAME') return a.name.localeCompare(b.name);
    if (sortBy === 'EMAIL') return a.email.localeCompare(b.email);
    if (sortBy === 'PROJECTS') return b.projectsCount - a.projectsCount;
    if (sortBy === 'CREATED') return b.createdAt.localeCompare(a.createdAt);
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-white">Platform User Control</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage user credentials, suspend, view configurations, or delete records.</p>
        </div>
      </div>

      {/* Search, filters & sorts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-neutral-950 p-4 border border-neutral-900 rounded-2xl">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, org..."
            className="w-full pl-9 pr-3 py-2 border border-neutral-800 bg-neutral-950 rounded-xl text-xs text-white focus:outline-none focus:border-red-500/50"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div>
          <select 
            value={filterPlan} 
            onChange={(e) => setFilterPlan(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 rounded-xl text-xs text-neutral-400 focus:outline-none"
          >
            <option value="ALL">All License Plans</option>
            <option value="free">Free Tier</option>
            <option value="pro">Developer Pro</option>
            <option value="business">Business Scale</option>
            <option value="enterprise">Enterprise Custom</option>
          </select>
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 rounded-xl text-xs text-neutral-400 focus:outline-none"
          >
            <option value="ALL">All States</option>
            <option value="Active">Active Nodes</option>
            <option value="Suspended">Suspended Nodes</option>
          </select>
        </div>

        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-800 bg-neutral-950 rounded-xl text-xs text-neutral-400 focus:outline-none"
          >
            <option value="NAME">Sort by Name</option>
            <option value="EMAIL">Sort by Email</option>
            <option value="PROJECTS">Sort by Project count</option>
            <option value="CREATED">Sort by Registration Date</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="border border-neutral-900 rounded-2xl bg-neutral-950/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-900/10 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Profile / Operator Name</th>
                <th className="p-4">Primary Organization</th>
                <th className="p-4">Active Projects</th>
                <th className="p-4">License Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {processedUsers.map((u) => {
                const planDetails = getPlanDetails(u.plan);
                return (
                  <tr key={u.id} className="hover:bg-neutral-900/10 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900 shrink-0" />
                      <div>
                        <p className="font-bold text-white block">{u.name}</p>
                        <p className="text-[10px] font-mono text-neutral-500 block mt-0.5">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-sans text-neutral-300">
                      <span>{u.orgName}</span>
                    </td>
                    <td className="p-4 font-mono text-indigo-400">
                      <span>{u.projectsCount} apps</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${u.plan === 'enterprise' ? 'bg-red-950 text-red-400 border border-red-900/40' : u.plan === 'business' ? 'bg-amber-950 text-amber-400 border border-amber-900/40' : u.plan === 'pro' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'}`}>
                        {planDetails?.name || u.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${u.status === 'Active' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : 'bg-red-950/40 text-red-400 border border-red-900/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => onView(u.id)}
                          className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono font-bold text-neutral-300 transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>

                        <button 
                          onClick={() => onSuspend(u.id)}
                          className={`p-1 rounded cursor-pointer ${u.status === 'Active' ? 'text-neutral-500 hover:text-amber-500 hover:bg-amber-950/10' : 'text-amber-500 hover:text-emerald-500 hover:bg-emerald-950/10'}`}
                          title={u.status === 'Active' ? 'Suspend Operator Node' : 'Activate Operator Node'}
                        >
                          {u.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                          onClick={() => onDelete(u.id)}
                          className="p-1 text-neutral-500 hover:text-red-500 hover:bg-red-950/10 rounded cursor-pointer"
                          title="Purge Operator Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs font-mono text-neutral-500">
                    No active operator records found match the current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2a. ADMIN USER DETAIL PAGE (/admin/users/:userId)
function AdminUserDetailView({ userId, users, plans, onSuspend, onDelete, onBack }: { userId: string; users: any[]; plans: any[]; onSuspend: (id: string) => void; onDelete: (id: string) => void; onBack: () => void }) {
  const u = users.find(userObj => userObj.id === userId);
  if (!u) {
    return (
      <div className="space-y-4 p-6 text-center animate-fade-in-up border border-neutral-900 rounded-2xl bg-neutral-950/40 font-mono text-xs">
        <p className="text-red-500">ERROR: Operator node not registered.</p>
        <button onClick={onBack} className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-white">
          Return to user control panel
        </button>
      </div>
    );
  }

  const planDetails = plans.find(pl => pl.id === u.plan) || defaultPlans.find(pl => pl.id === u.plan);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Return button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to user control panel</span>
      </button>

      {/* User Hero Banner */}
      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <img src={u.avatar} alt="avatar" className="w-14 h-14 rounded-full border border-neutral-800 bg-neutral-950 shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-semibold text-white tracking-tight">{u.name}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${u.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'}`}>
                {u.status}
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400">{u.email} • Organization: <span className="text-indigo-400 font-bold">{u.orgName}</span></p>
          </div>
        </div>

        {/* Action Keys */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button 
            onClick={() => onSuspend(u.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${u.status === 'Active' ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-900/40 text-amber-400' : 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-900/40 text-emerald-400'}`}
          >
            {u.status === 'Active' ? 'Suspend Node' : 'Reactivate Node'}
          </button>
          <button 
            onClick={() => onDelete(u.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition-all"
          >
            Purge Operator Record
          </button>
        </div>
      </div>

      {/* Detail grid tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details & Subscription Settings */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Operational Identity</h3>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">OPERATOR NODE ID</span>
              <span className="text-neutral-200">{u.id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">REGISTRATION DATE</span>
              <span className="text-neutral-200">{u.createdAt}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">CURRENT SLA PLAN</span>
              <span className="text-indigo-400 font-bold uppercase">{planDetails?.name || u.plan}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">MONTHLY FEES METRICS</span>
              <span className="text-neutral-200">₹{(planDetails?.price || 0).toLocaleString('en-IN')}/mo</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">DATA RETENTION INDEX</span>
              <span className="text-neutral-200">{planDetails?.dataRetention}</span>
            </div>
          </div>
        </div>

        {/* Project Limits & Quota allocations */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Allocations & Quotas</h3>
          <div className="space-y-3.5 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span className="text-neutral-500">PROJECTS SLOTS</span>
                <span className="text-neutral-300">{u.projectsCount} / {planDetails?.projects}</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full">
                <div style={{ width: `${(u.projectsCount / (planDetails?.projects || 1)) * 100}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span className="text-neutral-500">AI COGNITIVE TRANSACTIONS</span>
                <span className="text-neutral-300">142 requests / {planDetails?.aiLimit}</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full">
                <div style={{ width: '45%' }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span className="text-neutral-500">TELEMETRY CHECK FREQUENCY</span>
                <span className="text-indigo-400 font-bold uppercase">{planDetails?.monitoringLimit}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span className="text-neutral-500">STORAGE VOLUME ALLOCATION</span>
                <span className="text-neutral-300">2.1GB / {planDetails?.storage}</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full">
                <div style={{ width: '21%' }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Scan Logs */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Security scans & warnings</h3>
          <div className="space-y-2 font-mono text-[11px] leading-relaxed">
            <div className="p-2 bg-neutral-900 rounded-lg flex items-center justify-between">
              <span className="text-emerald-400 font-bold">● No Critical vulnerabilities</span>
              <span className="text-neutral-500">Clean</span>
            </div>
            <div className="p-2 bg-neutral-900 rounded-lg flex items-center justify-between">
              <span className="text-amber-400 font-bold">● 1 Medium Vulnerability</span>
              <span className="text-neutral-500">SSL config</span>
            </div>
            <div className="p-2 bg-neutral-900 rounded-lg flex items-center justify-between">
              <span className="text-indigo-400 font-bold">● OWASP Scans Confirmed</span>
              <span className="text-neutral-500">4 scans/mo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Logs & History teaser */}
      <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">User session execution streams</h3>
        <div className="p-4 rounded-xl border border-neutral-900 bg-black font-mono text-[10px] text-neutral-400 space-y-2 leading-relaxed">
          <p className="text-neutral-600">[2026-09-24T09:12:05Z] SESSION INIT: Access cleared from IP 142.250.74.46 (New Delhi, Delhi)</p>
          <p className="text-indigo-400">[2026-09-24T09:12:15Z] ROUTER EVENT: Accessed projects endpoint list.</p>
          <p className="text-emerald-400">[2026-09-24T09:13:02Z] API: Fetched operational status for environment clusters.</p>
          <p className="text-neutral-500">[2026-09-24T09:14:40Z] SESSION CLOSED: Logout command registered.</p>
        </div>
      </div>
    </div>
  );
}

// 3. ADMIN ORGANIZATIONS
function AdminOrganizationsView({ users }: { users: any[] }) {
  // Organizations can be inferred from mock users
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Organizations Matrix</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control administrative groupings and team-wide billing clusters.</p>
      </div>

      <div className="border border-neutral-900 rounded-2xl bg-neutral-950/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-900/10 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Organization</th>
                <th className="p-4">Owner Node</th>
                <th className="p-4">Allocated Members</th>
                <th className="p-4">Trace Projects</th>
                <th className="p-4">License Type</th>
                <th className="p-4">Host Node State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-900/10 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-indigo-400 font-bold">
                        {u.orgName.charAt(0)}
                      </div>
                      <span className="font-bold text-white">{u.orgName}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-neutral-300">
                    <span>{u.email}</span>
                  </td>
                  <td className="p-4 font-mono text-neutral-400">
                    <span>{u.plan === 'enterprise' ? '24 members' : u.plan === 'business' ? '8 members' : '1 member'}</span>
                  </td>
                  <td className="p-4 font-mono text-indigo-400 font-bold">
                    <span>{u.projectsCount} environments</span>
                  </td>
                  <td className="p-4 uppercase font-mono text-[10px] text-neutral-400">
                    <span>{u.plan}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-900/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Node
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. ADMIN PROJECTS
function AdminProjectsView({ users }: { users: any[] }) {
  // Extract mock subprojects
  const mockProjects = [
    { id: 'p_1', name: 'BCA Student Portal', url: 'https://bca.portal.edu', owner: 'alice@acme.org', status: 'Operational', uptime: '99.99%', response: '164ms', errors: 3, security: 94 },
    { id: 'p_2', name: 'Acme API Gateway', url: 'https://api.acme.org', owner: 'alice@acme.org', status: 'Operational', uptime: '100.00%', response: '42ms', errors: 0, security: 98 },
    { id: 'p_3', name: 'Crypto Exchange Feed', url: 'https://feed.cryptolog.io', owner: 'bob@cryptolog.io', status: 'Operational', uptime: '99.94%', response: '320ms', errors: 12, security: 88 },
    { id: 'p_4', name: 'Developer Eye SaaS', url: 'https://deveye.tech', owner: 'charlie@deveye.tech', status: 'Warning', uptime: '99.85%', response: '210ms', errors: 28, security: 81 },
    { id: 'p_5', name: 'Themiscira Network', url: 'https://themiscira.net', owner: 'diana@themiscira.net', status: 'Operational', uptime: '99.995%', response: '58ms', errors: 1, security: 99 },
    { id: 'p_6', name: 'IMF Safehouse Proxy', url: 'https://proxy.imf.gov', owner: 'ethan@imf.gov', status: 'Alert', uptime: '98.40%', response: '840ms', errors: 145, security: 64 },
    { id: 'p_7', name: 'SouthSide Inventory', url: 'https://retail.southside.co', owner: 'fiona@southside.co', status: 'Operational', uptime: '99.91%', response: '185ms', errors: 4, security: 92 },
  ];

  const handleInspect = (projName: string) => {
    alert(`PROJECT INSPECTOR: Fetching telemetry bundles for ${projName}. Secure diagnostic terminal channel initialized.`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Project Monitors Matrix</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Monitor client configurations. Do not allow silent administrative modifications.</p>
      </div>

      <div className="border border-neutral-900 rounded-2xl bg-neutral-950/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-900/10 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Project Name</th>
                <th className="p-4">Owner Operator</th>
                <th className="p-4">SLA Uptime</th>
                <th className="p-4">Errors Count</th>
                <th className="p-4">Security Score</th>
                <th className="p-4">Node State</th>
                <th className="p-4 text-center">Safety Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {mockProjects.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-900/10 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <p className="font-bold text-white leading-normal">{p.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 block mt-0.5">{p.url}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-neutral-400">
                    <span>{p.owner}</span>
                  </td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">
                    <span>{p.uptime}</span>
                  </td>
                  <td className="p-4 font-mono text-red-400 font-bold">
                    <span>{p.errors} incidents</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-mono font-bold ${p.security >= 90 ? 'text-emerald-400' : p.security >= 80 ? 'text-amber-400' : 'text-red-500'}`}>
                      {p.security} / 100
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${p.status === 'Operational' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : p.status === 'Warning' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/20' : 'bg-red-950/40 text-red-400 border border-red-900/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Operational' ? 'bg-emerald-500' : p.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleInspect(p.name)}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300 transition-colors cursor-pointer"
                    >
                      Audit Telemetry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. ADMIN SUBSCRIPTIONS & PLANS
function AdminSubscriptionsView({ users, plans, onSavePlans }: { users: any[]; plans: any[]; onSavePlans: (updated: any[]) => void }) {
  const [editingPlans, setEditingPlans] = useState<any[]>([]);

  useEffect(() => {
    if (plans.length > 0) {
      setEditingPlans(JSON.parse(JSON.stringify(plans)));
    } else {
      setEditingPlans(JSON.parse(JSON.stringify(defaultPlans)));
    }
  }, [plans]);

  const updatePlanField = (index: number, field: string, val: any) => {
    const updated = [...editingPlans];
    updated[index] = { ...updated[index], [field]: val };
    setEditingPlans(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">License Matrix & Subscriptions Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Directly configure customer tier thresholds, pricing metrics, and API transaction limits.</p>
      </div>

      {/* Plans configuration cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {editingPlans.map((p, idx) => (
          <div key={p.id} className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <span className="text-xs font-mono font-black text-red-500 uppercase">TIER CONFIG: {p.id.toUpperCase()}</span>
              <span className="text-xs font-mono text-neutral-500">Node ID: {p.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">License Name</label>
                <input 
                  type="text" 
                  value={p.name}
                  onChange={(e) => updatePlanField(idx, 'name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none focus:border-red-500/30"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Monthly Pricing (₹)</label>
                <input 
                  type="number" 
                  value={p.price}
                  onChange={(e) => updatePlanField(idx, 'price', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Max Project Slots</label>
                <input 
                  type="number" 
                  value={p.projects}
                  onChange={(e) => updatePlanField(idx, 'projects', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Telemetry Frequency</label>
                <input 
                  type="text" 
                  value={p.monitoringLimit}
                  onChange={(e) => updatePlanField(idx, 'monitoringLimit', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">AI Limit Quotas</label>
                <input 
                  type="text" 
                  value={p.aiLimit}
                  onChange={(e) => updatePlanField(idx, 'aiLimit', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Storage Allocation</label>
                <input 
                  type="text" 
                  value={p.storage}
                  onChange={(e) => updatePlanField(idx, 'storage', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={() => onSavePlans(editingPlans)}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-red-950 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Apply Security Pricing Matrix</span>
        </button>
      </div>
    </div>
  );
}

// 6. ADMIN PLATFORM USAGE
function AdminUsageView({ users }: { users: any[] }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Platform Usage Metrics</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control global limits, active load balancers, and bandwidth spikes.</p>
      </div>

      {/* Telemetry progress bars */}
      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { label: 'Global API Requests Volume', used: '1,482,410', limit: '10,000,000', pct: 14.8, color: 'bg-indigo-500' },
          { label: 'Uptime Monitoring Checks Run', used: '15,284,000', limit: '50,000,000', pct: 30.5, color: 'bg-emerald-500' },
          { label: 'AI Prompt Analysis Tokens', used: '18,410,210', limit: '100,000,000', pct: 18.4, color: 'bg-fuchsia-500' },
          { label: 'Active OWASP Security Audits', used: '32,481', limit: '200,000', pct: 16.2, color: 'bg-rose-500' },
          { label: 'Telemetry Logs Storage', used: '241.5 GB', limit: '2.0 TB', pct: 12.1, color: 'bg-amber-500' },
          { label: 'Gateway Outbound Bandwidth', used: '4.8 TB', limit: '50.0 TB', pct: 9.6, color: 'bg-sky-500' }
        ].map((item, idx) => (
          <div key={idx} className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{item.label}</span>
              <span className="font-mono text-neutral-400">{item.used} / {item.limit} ({item.pct}%)</span>
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div style={{ width: `${item.pct}%` }} className={`h-full rounded-full ${item.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. ADMIN MONITORING NODES
function AdminMonitoringView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Monitoring Cluster Node Status</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control regional edge check servers across the globe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { region: 'us-east-1 (N. Virginia)', latency: '12ms', load: '14.2%', status: 'Online', checks: '4,102/sec' },
          { region: 'asia-east-1 (Taiwan)', latency: '38ms', load: '21.5%', status: 'Online', checks: '2,940/sec' },
          { region: 'europe-west-3 (Frankfurt)', latency: '24ms', load: '18.4%', status: 'Online', checks: '3,840/sec' },
          { region: 'southamerica-east-1 (São Paulo)', latency: '84ms', load: '8.1%', status: 'Online', checks: '1,200/sec' },
          { region: 'asia-south-1 (Mumbai)', latency: '28ms', load: '24.5%', status: 'Online', checks: '3,100/sec' },
          { region: 'australia-southeast-1 (Sydney)', latency: '110ms', load: '6.2%', status: 'Online', checks: '950/sec' }
        ].map((node, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <span className="text-xs font-bold text-white font-sans">{node.region}</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                {node.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-neutral-400 leading-normal">
              <div>
                <span className="text-neutral-500 block text-[9px]">PING LATENCY</span>
                <span className="text-white block font-bold mt-0.5">{node.latency}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[9px]">NODE CPU LOAD</span>
                <span className="text-white block font-bold mt-0.5">{node.load}</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-neutral-500 block text-[9px]">ACTIVE INCOMING TELEMETRY checks</span>
                <span className="text-indigo-400 block font-bold mt-0.5">{node.checks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. ADMIN SECURITY SCANS
function AdminSecurityView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Platform Security Audits</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control global vulnerability indexes, TLS configuration reports, and continuous OWASP checks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { level: 'Critical Threat Vectors', count: 0, color: 'text-neutral-400', bg: 'bg-neutral-900/40 border-neutral-900' },
          { level: 'High Risk warnings', count: 1, color: 'text-rose-400', bg: 'bg-rose-950/10 border-rose-900/30 animate-pulse' },
          { level: 'Medium Risk items', count: 4, color: 'text-amber-400', bg: 'bg-amber-950/10 border-amber-900/30' },
          { level: 'Low Profile Warnings', count: 7, color: 'text-sky-400', bg: 'bg-indigo-950/10 border-indigo-900/30' }
        ].map((sec, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border ${sec.bg}`}>
            <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">{sec.level}</span>
            <span className={`text-3xl font-bold block mt-3 ${sec.color}`}>{sec.count}</span>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Edge firewall triggers (Recent blocked probes)</h3>
        <div className="divide-y divide-neutral-900 font-mono text-[11px] text-neutral-400 leading-relaxed">
          {[
            { ip: '185.220.101.52', attack: 'SQL Injection on /api/orders', time: '2 min ago', block: 'IP Blocked (72 hours)' },
            { ip: '45.143.203.118', attack: 'Cross Site Scripting (XSS) on /signup', time: '14 min ago', block: 'Request Dropped' },
            { ip: '82.102.23.4', attack: 'Brute force access attempt on /admin/login', time: '40 min ago', block: 'IP Blocked (Permanent)' },
            { ip: '198.51.100.42', attack: 'Directory Traversal attempt on /static', time: '1 hour ago', block: 'Request Dropped' }
          ].map((probe, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-red-500 font-bold">●</span>
                <span className="text-neutral-500">[{probe.ip}]</span>
                <span className="text-white font-bold">{probe.attack}</span>
              </div>
              <div className="text-right">
                <span className="text-rose-400 block font-bold">{probe.block}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">{probe.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 9. ADMIN AI COGNITIVE LOGS
function AdminAIView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">AI Diagnostics Engine Monitoring</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control server-side Gemini/LLM diagnostics tokens and prompt cost metrics.</p>
      </div>

      <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Continuous LLM Diagnosis Transactions</h3>
        <div className="divide-y divide-neutral-900 font-mono text-[11px] text-neutral-400 leading-relaxed">
          {[
            { model: 'Gemini-1.5-Flash', endpoint: '/api/diagnostics/usr_101', prompt: 'Analyze error logs for BCA Student Portal', cost: '$0.00012', status: 'Success' },
            { model: 'Gemini-1.5-Flash', endpoint: '/api/diagnostics/usr_103', prompt: 'Formulate query optimization tips for Postgres', cost: '$0.00028', status: 'Success' },
            { model: 'Gemini-1.5-Flash', endpoint: '/api/diagnostics/usr_104', prompt: 'Analyze trace correlation in edge proxy nodes', cost: '$0.00041', status: 'Success' },
            { model: 'Gemini-1.5-Flash', endpoint: '/api/diagnostics/usr_107', prompt: 'Recommend SSL certificate setup variables', cost: '$0.00010', status: 'Success' }
          ].map((txn, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-fuchsia-400 font-bold">●</span>
                <span className="text-neutral-500">[{txn.model}]</span>
                <span className="text-white font-bold">{txn.prompt}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 block font-bold">{txn.status}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Est. Cost: {txn.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 10. ADMIN SYSTEM CLUSTERS
function AdminSystemView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">System Infrastructure Clusters</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Real-time status of physical cluster nodes supporting MeshPilot platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Host physical nodes */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Google Cloud VM Host Nodes</h3>
          <div className="space-y-3.5 font-mono text-[11px] leading-relaxed">
            {[
              { label: 'Platform API Host VM (g1-standard-4)', cpu: '14.2%', ram: '2.4GB / 16.0GB', status: 'Healthy' },
              { label: 'Postgres Cloud SQL instance (db-custom-2-7680)', cpu: '8.4%', ram: '1.8GB / 7.5GB', status: 'Healthy' },
              { label: 'Real-time WebSocket Node cluster (g1-standard-2)', cpu: '21.0%', ram: '1.2GB / 8.0GB', status: 'Healthy' }
            ].map((node, idx) => (
              <div key={idx} className="p-3 bg-neutral-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white block font-bold">{node.label}</span>
                  <span className="text-neutral-500 block mt-0.5">CPU: {node.cpu} • RAM: {node.ram}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-900/30 px-2 py-0.5 rounded">
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Operations Logs */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Internal Telemetry Orchestrator Logs</h3>
          <div className="p-4 rounded-xl border border-neutral-900 bg-black font-mono text-[10px] text-neutral-400 space-y-2 leading-relaxed">
            <p className="text-neutral-600">[INFO] [2026-09-24T09:30:10Z] Synchronizing 6 regional endpoint monitors...</p>
            <p className="text-indigo-400">[OK] [2026-09-24T09:30:12Z] Edge nodes sync completed. Mean cluster sync latency: 14ms.</p>
            <p className="text-neutral-600">[INFO] [2026-09-24T09:31:00Z] Triggering background telemetry prune job...</p>
            <p className="text-emerald-400">[OK] [2026-09-24T09:31:02Z] Telemetry logs prior to 30 days pruned. Flushed 4.8M old check records.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// 11. ADMIN SUPPORT QUEUE
function AdminSupportView({ tickets, adminUser, onUpdateTickets }: { tickets: any[]; adminUser: AdminProfile | null; onUpdateTickets: (updated: any[]) => void }) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'In Progress',
          replies: [
            ...t.replies,
            {
              role: 'admin',
              text: replyText,
              time: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    });

    onUpdateTickets(updatedTickets);
    
    // Log action to audit trails
    logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', `Replied to support ticket #${selectedTicket.id}`, selectedTicket.userEmail);
    
    // Update active modal selected ticket
    const updatedSel = updatedTickets.find(t => t.id === selectedTicket.id);
    setSelectedTicket(updatedSel);
    setReplyText('');
  };

  const handleResolveTicket = (id: string) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t);
    onUpdateTickets(updated);
    
    const affectedTkt = tickets.find(t => t.id === id);
    if (affectedTkt) {
      logAuditAction(adminUser?.email || 'admin', adminUser?.role || 'ADMIN', `Resolved support ticket #${id}`, affectedTkt.userEmail);
    }
    
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
    }
    alert(`Ticket #${id} marked as Resolved.`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Support Tickets Queue</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Provide direct help desks assistance to registered MeshPilot customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket queue list */}
        <div className="lg:col-span-2 border border-neutral-900 rounded-2xl bg-neutral-950/40 overflow-hidden divide-y divide-neutral-900">
          <div className="p-4 bg-neutral-900/10 border-b border-neutral-900">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Incoming tickets queue</span>
          </div>

          {tickets.map(t => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTicket(t)}
              className={`p-4 hover:bg-neutral-900/20 transition-all cursor-pointer flex justify-between items-center ${selectedTicket?.id === t.id ? 'bg-red-950/10 border-l-2 border-red-500' : ''}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${t.status === 'Open' ? 'bg-rose-950 text-rose-400 border border-rose-900/30' : t.status === 'In Progress' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'}`}>
                    {t.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${t.severity === 'High' ? 'bg-red-950 text-red-500 border border-red-900/30' : 'bg-neutral-900 text-neutral-400'}`}>
                    {t.severity} Severity
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white block mt-1">{t.title}</h4>
                <p className="text-[10px] text-neutral-400 truncate max-w-sm mt-0.5">{t.message}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-indigo-400 block">{t.userEmail}</span>
                <span className="text-[9px] text-neutral-500 block mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Ticket Chat Workspace */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-red-500 uppercase font-black">TICKET WORKSPACE</span>
                  <h4 className="text-xs font-bold text-white block mt-0.5">#{selectedTicket.id} - {selectedTicket.title}</h4>
                </div>
                {selectedTicket.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-900/30 text-[9px] font-mono font-bold text-emerald-400 transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {/* Chat timeline messages */}
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin text-xs">
                {/* User message */}
                <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-900 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-neutral-500">Customer ({selectedTicket.userEmail})</span>
                  <p className="text-neutral-300 leading-relaxed font-sans">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                {selectedTicket.replies.map((rep: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-xl space-y-1 border ${rep.role === 'admin' ? 'bg-red-950/10 border-red-900/20 text-right' : 'bg-neutral-900/50 border-neutral-900 text-left'}`}>
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Administrator Reply</span>
                    <p className="text-neutral-300 leading-relaxed font-sans">{rep.text}</p>
                    <span className="text-[8px] text-neutral-500 block mt-1">{new Date(rep.time).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              {/* Reply inputs */}
              {selectedTicket.status !== 'Resolved' ? (
                <form onSubmit={handleSendReply} className="space-y-2.5">
                  <textarea 
                    rows={3}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official support reply message..."
                    className="w-full p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Transmit Official Reply
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center text-xs font-mono text-emerald-400">
                  This support ticket is fully Resolved. Thread is archived.
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-neutral-500">
              Select an incoming ticket from the queue list to initiate help desk chat.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// 12. ADMIN AUDIT TRAIL
function AdminAuditLogsView({ auditLogs, onClear }: { auditLogs: any[]; onClear: () => void }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-semibold text-white">Platform Audit Stream</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Permanent non-repudiation log trail of administrative interventions.</p>
        </div>
        <button 
          onClick={onClear}
          className="px-3.5 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 font-semibold text-xs transition-colors cursor-pointer"
        >
          Flush Audit Streams
        </button>
      </div>

      <div className="border border-neutral-900 rounded-2xl bg-neutral-950/40 overflow-hidden divide-y divide-neutral-900">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between text-xs font-mono hover:bg-neutral-900/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-neutral-600">[{log.ipAddress}]</span>
              <span className="text-neutral-300 font-bold">{log.action}</span>
              <span className="text-neutral-500">on targets</span>
              <span className="text-indigo-400 font-semibold">{log.target}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">{log.actor} ({log.role})</span>
              <span className="text-[9px] text-neutral-600 block mt-0.5">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {auditLogs.length === 0 && (
          <p className="text-xs font-mono text-neutral-600 text-center py-16">
            Zero security log events detected. No admin actions taken during this session.
          </p>
        )}
      </div>
    </div>
  );
}

// 13. ADMIN SETTINGS
function AdminSettingsView({ adminUser }: { adminUser: AdminProfile | null }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [restrictRegs, setRestrictRegs] = useState(false);
  const [sysAlert, setSysAlert] = useState('All edge cluster routers are operating within healthy metrics SLA.');

  const handleApplySettings = () => {
    alert('GATEWAY CONTROL: System parameters applied dynamically to edge cluster loaders.');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Gateway Operations Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Control global platform routers, maintain node states, or broadcast emergency warnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Toggle configs */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-5">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Edge control nodes</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Redirect public traffic to a secure hold status page.</span>
              </div>
              <input 
                type="checkbox" 
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-950 text-red-600 focus:ring-red-500/20 cursor-pointer"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block">Restrict Self-service Registration</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Disable standard /signup endpoint path routes temporarily.</span>
              </div>
              <input 
                type="checkbox" 
                checked={restrictRegs}
                onChange={(e) => setRestrictRegs(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-950 text-red-600 focus:ring-red-500/20 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Broadcast System Alert Banner */}
        <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Cluster Broadcast Message</h3>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Broadcast Content Banner</label>
              <textarea 
                rows={3}
                value={sysAlert}
                onChange={(e) => setSysAlert(e.target.value)}
                placeholder="Alert text displayed on all user dashboard headers..."
                className="w-full p-2.5 border border-neutral-800 bg-neutral-950 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleApplySettings}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-red-950"
        >
          Broadcast Gateway Updates
        </button>
      </div>
    </div>
  );
}
