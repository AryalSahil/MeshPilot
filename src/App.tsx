import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, AlertTriangle, Cpu, Terminal, GitBranch, Play, ArrowUpRight, 
  Settings, CheckCircle2, Circle, Clock, Layers, Flame, ArrowRight, Gauge, Lock, 
  Globe, Network, Code, Server, Check, ChevronDown, Menu, X, Star, FileText, 
  HelpCircle, Heart, RefreshCw, Send, ShieldAlert, Wifi, Globe2
} from 'lucide-react';

// Import Router utilities
import { RouterProvider, useRouter, Link } from './components/Router';

// Import modular pages
import LandingPage from './pages/LandingPage';
import UptimeMonitorPage from './pages/UptimeMonitorPage';
import PerformancePage from './pages/PerformancePage';
import ApplicationRadarPage from './pages/ApplicationRadarPage';
import AIDiagnosticsPage from './pages/AIDiagnosticsPage';
import SystemHooksPage from './pages/SystemHooksPage';
import CompanyPage from './pages/CompanyPage';
import DocsPage from './pages/DocsPage';
import LegalPage from './pages/LegalPage';
import PartnersPage from './pages/PartnersPage';

// Import Auth & Dashboard Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Import Authentication Pages
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthPages';
import { AdminLoginPage } from './pages/AdminAuthPages';
import AdminDashboardLayout from './pages/AdminDashboardPages';

// Import Dashboard Core & Sub-Views
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import { 
  DashboardProjectsPage, DashboardMonitoringPage, DashboardPerformancePage, 
  DashboardErrorsPage, DashboardSecurityPage, DashboardRadarPage, 
  DashboardAIDiagnosticsPage, DashboardDeploymentsPage, DashboardReportsPage, 
  DashboardIntegrationsPage, MonitorDetailsPage 
} from './pages/DashboardSubPages';
import DashboardSettingsPage from './pages/DashboardSettingsPage';

// Inner App Layout to access routers
function AppLayout() {
  const { path, navigate } = useRouter();
  const { user, loading } = useAuth();
  const { adminUser, adminLoading } = useAdminAuth();

  // Route protection guard
  useEffect(() => {
    if (!loading && !adminLoading) {
      const isDashboardRoute = path.startsWith('/dashboard');
      const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(path);
      const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
      const isAdminLogin = path === '/admin/login';

      if (isAdminRoute) {
        if (!adminUser) {
          if (user) {
            navigate('/dashboard');
          } else {
            navigate('/admin/login');
          }
        }
      } else if (isAdminLogin) {
        if (adminUser) {
          navigate('/admin/dashboard');
        }
      } else if (isDashboardRoute) {
        if (!user) {
          navigate('/login');
        }
      } else if (isAuthRoute) {
        if (user) {
          navigate('/dashboard');
        }
      }
    }
  }, [path, user, loading, adminUser, adminLoading, navigate]);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Product dropdown hover state
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  
  // Mobile Product Accordion toggle
  const [mobileProductOpen, setMobileProductOpen] = useState(false);

  // Quick Sandbox Connection Modal
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxUrl) return;
    setSandboxLoading(true);
    setSandboxResult(null);

    setTimeout(() => {
      setSandboxLoading(false);
      setSandboxResult({
        healthScore: Math.floor(Math.random() * 8) + 91, // 91-98
        loadTime: (Math.random() * 0.4 + 0.1).toFixed(2), // 0.1s - 0.5s
        vulnerabilities: Math.random() > 0.6 ? 1 : 0,
        sslExpiry: '144 days',
        endpointsFound: Math.floor(Math.random() * 12) + 5
      });
    }, 2000);
  };

  const handleNavigateAndClose = (to: string) => {
    navigate(to);
    setMobileMenuOpen(false);
    setMobileProductOpen(false);
  };

  // Render proper view based on path
  const renderPage = () => {
    if (loading || adminLoading) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-mono text-xs text-neutral-500 gap-3">
          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
          <span>Synchronizing security node clusters...</span>
        </div>
      );
    }

    // Admin nested route switcher
    if (path.startsWith('/admin')) {
      if (path === '/admin/login') {
        return <AdminLoginPage />;
      }
      if (!adminUser) return null; // Guarded
      return <AdminDashboardLayout />;
    }

    // Dashboard nested route switcher
    if (path.startsWith('/dashboard')) {
      if (!user) return null; // Guarded

      const renderDashboardContent = () => {
        if (path === '/dashboard') {
          return <DashboardPage />;
        }
        if (path.startsWith('/dashboard/projects')) {
          return <DashboardProjectsPage />;
        }
        if (path.startsWith('/dashboard/monitors')) {
          return <MonitorDetailsPage />;
        }
        if (path === '/dashboard/monitoring') {
          return <DashboardMonitoringPage />;
        }
        if (path === '/dashboard/performance') {
          return <DashboardPerformancePage />;
        }
        if (path === '/dashboard/errors') {
          return <DashboardErrorsPage />;
        }
        if (path === '/dashboard/security') {
          return <DashboardSecurityPage />;
        }
        if (path === '/dashboard/radar') {
          return <DashboardRadarPage />;
        }
        if (path === '/dashboard/ai-diagnostics') {
          return <DashboardAIDiagnosticsPage />;
        }
        if (path === '/dashboard/deployments') {
          return <DashboardDeploymentsPage />;
        }
        if (path === '/dashboard/reports') {
          return <DashboardReportsPage />;
        }
        if (path === '/dashboard/integrations') {
          return <DashboardIntegrationsPage />;
        }
        if (path === '/dashboard/settings') {
          return <DashboardSettingsPage />;
        }
        return <DashboardPage />;
      };

      return (
        <DashboardLayout>
          {renderDashboardContent()}
        </DashboardLayout>
      );
    }

    // Authentication Page switcher
    switch (path) {
      case '/login':
        return <LoginPage />;
      case '/signup':
        return <SignUpPage />;
      case '/forgot-password':
        return <ForgotPasswordPage />;
      case '/reset-password':
        return <ResetPasswordPage />;
      case '/verify-email':
        return <VerifyEmailPage />;

      // Public Marketing pages
      case '/':
        return (
          <LandingPage 
            onStartSandbox={() => setSandboxModalOpen(true)} 
            onNavigate={(p) => navigate(p)} 
          />
        );
      case '/features/uptime-monitor':
        return <UptimeMonitorPage onStartMonitoring={() => setSandboxModalOpen(true)} />;
      case '/features/performance':
        return <PerformancePage onStartAnalysis={() => setSandboxModalOpen(true)} />;
      case '/features/application-radar':
        return <ApplicationRadarPage onRunRadar={() => setSandboxModalOpen(true)} />;
      case '/features/ai-diagnostics':
        return <AIDiagnosticsPage />;
      case '/features/system-hooks':
        return <SystemHooksPage />;
      case '/company':
        return <CompanyPage />;
      case '/company/partners':
        return <PartnersPage />;
      case '/docs':
        return <DocsPage />;
      case '/legal':
        return <LegalPage />;
      default:
        // Graceful fallback to Landing Page
        return (
          <LandingPage 
            onStartSandbox={() => setSandboxModalOpen(true)} 
            onNavigate={(p) => navigate(p)} 
          />
        );
    }
  };

  const isDashboardRoute = path.startsWith('/dashboard');
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(path);
  const isAdminRoute = path.startsWith('/admin');

  if (isDashboardRoute || isAuthRoute || isAdminRoute || loading || adminLoading) {
    return renderPage();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      
      {/* -------------------------------- STICKY NAVBAR -------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
          
          {/* Logo element */}
          <Link to="/" className="flex items-center gap-2.5 group transition-colors select-none">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white/5 border border-white/15 flex items-center justify-center">
              <img 
                src="/logo-128.png" 
                alt="MeshPilot Logo" 
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[10px] text-white font-bold tracking-tighter absolute">M</span>
            </div>
            <span className="text-lg font-display font-semibold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
              MeshPilot
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-neutral-400">
            {/* Hoverable Product Dropdown */}
            <div 
              className="relative py-4"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <button className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                <span>Product</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl animate-fade-in-down font-sans text-xs space-y-1">
                  <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-3 py-1">OPERATIONS</span>
                  <Link 
                    to="/features/uptime-monitor" 
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-all"
                  >
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Uptime Monitor</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Zero-latency SLAs</span>
                    </div>
                  </Link>
                  <Link 
                    to="/features/performance" 
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-all"
                  >
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Performance Logs</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Core web vitals tracking</span>
                    </div>
                  </Link>
                  <Link 
                    to="/features/application-radar" 
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-all"
                  >
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Application Radar</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Sonar health sweeps</span>
                    </div>
                  </Link>
                  <Link 
                    to="/features/ai-diagnostics" 
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-all"
                  >
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">AI Diagnostics</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Autonomous investigations</span>
                    </div>
                  </Link>
                  <Link 
                    to="/features/system-hooks" 
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-all"
                  >
                    <Network className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">System Hooks</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Unified stack triggers</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/#features-section" className="hover:text-white transition-colors">Features</Link>
            <Link to="/#pricing-section" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/company#careers" className="hover:text-white transition-colors">Careers</Link>
            <Link to="/company#contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Resources</Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer hover:shadow-lg hover:shadow-white/5"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Responsive Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Menu (Accordion styled) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-900 bg-neutral-950/95 backdrop-blur-2xl absolute w-full top-16 left-0 px-6 py-6 space-y-4 animate-fade-in-down shadow-2xl max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col gap-4 text-sm font-medium text-neutral-400">
              
              {/* Collapsible Mobile Products */}
              <div className="space-y-2">
                <button 
                  onClick={() => setMobileProductOpen(!mobileProductOpen)}
                  className="w-full flex items-center justify-between hover:text-white py-1 transition-colors text-left"
                >
                  <span>Product Features</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileProductOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileProductOpen && (
                  <div className="pl-4 border-l border-neutral-900 space-y-2.5 py-1 text-xs">
                    <button 
                      onClick={() => handleNavigateAndClose('/features/uptime-monitor')} 
                      className="block hover:text-white py-1 transition-colors text-left w-full"
                    >
                      Uptime Monitor
                    </button>
                    <button 
                      onClick={() => handleNavigateAndClose('/features/performance')} 
                      className="block hover:text-white py-1 transition-colors text-left w-full"
                    >
                      Performance Logs
                    </button>
                    <button 
                      onClick={() => handleNavigateAndClose('/features/application-radar')} 
                      className="block hover:text-white py-1 transition-colors text-left w-full"
                    >
                      Application Radar
                    </button>
                    <button 
                      onClick={() => handleNavigateAndClose('/features/ai-diagnostics')} 
                      className="block hover:text-white py-1 transition-colors text-left w-full"
                    >
                      AI Diagnostics
                    </button>
                    <button 
                      onClick={() => handleNavigateAndClose('/features/system-hooks')} 
                      className="block hover:text-white py-1 transition-colors text-left w-full"
                    >
                      System Hooks
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleNavigateAndClose('/#features-section')} 
                className="hover:text-white transition-colors py-1 text-left"
              >
                Features
              </button>
              <button 
                onClick={() => handleNavigateAndClose('/#pricing-section')} 
                className="hover:text-white transition-colors py-1 text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleNavigateAndClose('/company#careers')} 
                className="hover:text-white transition-colors py-1 text-left"
              >
                Careers
              </button>
              <button 
                onClick={() => handleNavigateAndClose('/company#contact')} 
                className="hover:text-white transition-colors py-1 text-left"
              >
                Contact
              </button>
              <button 
                onClick={() => handleNavigateAndClose('/docs')} 
                className="hover:text-white transition-colors py-1 text-left"
              >
                Resources & Docs
              </button>
            </nav>
            <div className="h-px bg-neutral-900 my-4" />
            <div className="flex flex-col gap-3">
              {user ? (
                <button 
                  onClick={() => handleNavigateAndClose('/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold text-center cursor-pointer hover:bg-indigo-500"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigateAndClose('/login')}
                    className="w-full py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold bg-neutral-900/40 text-center cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleNavigateAndClose('/signup')}
                    className="w-full py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold text-center cursor-pointer hover:bg-neutral-200"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------- MAIN CONTENT VIEWS -------------------------------- */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* -------------------------------- PREMIUM SAAS FOOTER -------------------------------- */}
      <footer className="border-t border-neutral-900 bg-neutral-950 pt-16 pb-12 text-xs text-neutral-500 font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 border-b border-neutral-900 pb-12 mb-12">
            
            {/* Branding Column */}
            <div className="col-span-2 lg:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative w-6 h-6 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">M</span>
                </div>
                <span className="text-sm font-semibold text-white tracking-tight">MeshPilot</span>
              </Link>
              <p className="text-neutral-500 leading-relaxed font-sans max-w-xs text-[11px]">
                Autonomous operation sweeps and unified infrastructure hooks to manage and trace performance indicators without overhead.
              </p>
              <div className="text-[10px] font-mono text-neutral-600">
                <span>Operational Region: US-EAST</span>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3.5">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features/uptime-monitor" className="hover:text-neutral-300 transition-colors">Uptime Monitor</Link></li>
                <li><Link to="/features/performance" className="hover:text-neutral-300 transition-colors">Performance Logs</Link></li>
                <li><Link to="/features/application-radar" className="hover:text-neutral-300 transition-colors">Application Radar</Link></li>
                <li><Link to="/features/ai-diagnostics" className="hover:text-neutral-300 transition-colors">AI Diagnostics</Link></li>
                <li><Link to="/features/system-hooks" className="hover:text-neutral-300 transition-colors">System Hooks</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3.5">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/company#about" className="hover:text-neutral-300 transition-colors">About Us</Link></li>
                <li><Link to="/company#careers" className="hover:text-neutral-300 transition-colors">Careers</Link></li>
                <li><Link to="/company/partners" className="hover:text-neutral-300 transition-colors">Partners</Link></li>
                <li><Link to="/company#about" className="hover:text-neutral-300 transition-colors">Press Inquiries</Link></li>
                <li><Link to="/company#contact" className="hover:text-neutral-300 transition-colors">Contact Engineering</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3.5">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/docs" className="hover:text-neutral-300 transition-colors">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-neutral-300 transition-colors">Webhook Spec</Link></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">GitHub Repository</a></li>
                <li><Link to="/company" className="hover:text-neutral-300 transition-colors">Community Hub</Link></li>
                <li><Link to="/docs" className="hover:text-neutral-300 transition-colors">System Status</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-3.5">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[10px] font-mono">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/legal" className="hover:text-neutral-300 transition-colors">Terms of Service</Link></li>
                <li><Link to="/legal" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal" className="hover:text-neutral-300 transition-colors">Data Processing</Link></li>
                <li><Link to="/legal" className="hover:text-neutral-300 transition-colors">GDPR Compliance</Link></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-600 text-[11px]">
            <span>&copy; {new Date().getFullYear()} MeshPilot Inc. All rights reserved.</span>
            <div className="flex items-center gap-1 font-mono">
              <Heart className="w-3 h-3 text-indigo-500 fill-indigo-500" />
              <span>Engineered globally with high integrity.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------- INTERACTIVE URL DIAGNOSTIC MODAL -------------------------------- */}
      {sandboxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" onClick={() => { if (!sandboxLoading) setSandboxModalOpen(false); }} />
          
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl animate-fade-in-down">
            <button 
              onClick={() => setSandboxModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white font-display">MeshPilot Diagnostic Sandbox</h3>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                Type in any web app URL to run a live telemetry audit (measuring DNS resolution, security flags, and speed parameters).
              </p>
            </div>

            <form onSubmit={handleSandboxSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="url" 
                  required
                  placeholder="https://example.com" 
                  value={sandboxUrl}
                  onChange={(e) => setSandboxUrl(e.target.value)}
                  disabled={sandboxLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sandboxLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-50 cursor-pointer"
                >
                  {sandboxLoading ? 'Auditing...' : 'Run Audit'}
                </button>
              </div>
            </form>

            {/* Audit Progress Bar */}
            {sandboxLoading && (
              <div className="mt-6 space-y-2 font-mono text-[10px] text-neutral-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>Resolving DNS edge nodes...</span>
                  </span>
                  <span>PENDING</span>
                </div>
                <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            )}

            {/* Visual Scan Results */}
            {sandboxResult && (
              <div className="mt-6 space-y-4 animate-fade-in-up font-mono text-xs">
                <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-neutral-500 block uppercase">Telemetry Health Index</span>
                    <span className="text-xl font-bold font-display text-white">{sandboxResult.healthScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-neutral-500 block uppercase">SSL SECURE</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-400">
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-0.5">
                    <span className="text-[9px] text-neutral-500 uppercase block">EDGE_TTFB</span>
                    <span className="text-white font-bold">{sandboxResult.loadTime}s</span>
                  </div>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-0.5">
                    <span className="text-[9px] text-neutral-500 uppercase block">VULNERABILITY_ERRORS</span>
                    <span className={`font-bold ${sandboxResult.vulnerabilities > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sandboxResult.vulnerabilities} issues
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-0.5 col-span-2">
                    <span className="text-[9px] text-neutral-500 uppercase block">SSL_CERT_REMAINING</span>
                    <span className="text-white font-bold">{sandboxResult.sslExpiry}</span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 leading-relaxed font-sans pt-2 border-t border-neutral-900">
                  ⚡ Setup automated, continuous scans to track performance regressive spikes inside production clusters.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Top level App wrapper with provider
export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <DashboardProvider>
            <AppLayout />
          </DashboardProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
