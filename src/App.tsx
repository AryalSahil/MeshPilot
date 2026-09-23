import React, { useState } from 'react';
import { 
  Activity, Shield, AlertTriangle, Cpu, Terminal, GitBranch, Play, ArrowUpRight, 
  Settings, CheckCircle2, Circle, Clock, Layers, Flame, ArrowRight, Gauge, Lock, 
  Globe, Zap, Network, Code, Server, Check, ChevronDown, Menu, X, Star, FileText, 
  Send, HelpCircle, Heart, RefreshCw 
} from 'lucide-react';

// Subcomponents loaded from our modular structure
import RadarSimulation from './components/RadarSimulation';
import AICanvas from './components/AICanvas';
import DashboardPreview from './components/DashboardPreview';

interface FeatureCard {
  id: string;
  title: string;
  category: string;
  description: string;
  metric: string;
  icon: React.ComponentType<any>;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Integration {
  id: string;
  name: string;
  category: 'Platform' | 'Infrastructure' | 'Alerting';
  description: string;
  connected: boolean;
  color: string;
}

export default function App() {
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick Sandbox Connection Modal
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Pricing Interval Toggle
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('annually');

  // Active FAQ index state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Integrations active state simulation
  const [integrationsList, setIntegrationsList] = useState<Integration[]>([
    { id: 'github', name: 'GitHub', category: 'Platform', description: 'Trigger automatic code diff analysis and commit correlation.', connected: true, color: 'text-neutral-200' },
    { id: 'vercel', name: 'Vercel', category: 'Platform', description: 'Ingest deployment logs and trace edge functions on production.', connected: true, color: 'text-white' },
    { id: 'netlify', name: 'Netlify', category: 'Platform', description: 'Monitor CDN bandwidth, form submissions, and serverless logs.', connected: false, color: 'text-sky-400' },
    { id: 'railway', name: 'Railway', category: 'Infrastructure', description: 'Record cluster logs, memory heaps, and database locks.', connected: false, color: 'text-pink-400' },
    { id: 'supabase', name: 'Supabase', category: 'Infrastructure', description: 'Trace pg_stat_statements and check for slow SQL query execution.', connected: false, color: 'text-emerald-400' },
    { id: 'cloudflare', name: 'Cloudflare', category: 'Infrastructure', description: 'Observe edge routing speed, TLS Handshakes, and DNS latency.', connected: true, color: 'text-amber-500' },
    { id: 'slack', name: 'Slack', category: 'Alerting', description: 'Deliver rich, trace-correlated alert cards to engineering channels.', connected: true, color: 'text-indigo-400' },
    { id: 'discord', name: 'Discord', category: 'Alerting', description: 'Broadcast webhook warnings directly to your developer servers.', connected: false, color: 'text-blue-400' },
    { id: 'webhooks', name: 'Webhooks', category: 'Alerting', description: 'Send raw structural JSON payloads to custom HTTP endpoints.', connected: false, color: 'text-neutral-400' }
  ]);

  // Demo selection or simulate video walk-through
  const [demoSelected, setDemoSelected] = useState(false);

  const toggleIntegration = (id: string) => {
    setIntegrationsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, connected: !item.connected };
      }
      return item;
    }));
  };

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
        vulnerabilities: Math.random() > 0.5 ? 1 : 0,
        sslExpiry: '144 days',
        endpointsFound: Math.floor(Math.random() * 12) + 5
      });
    }, 2000);
  };

  const features: FeatureCard[] = [
    { id: 'uptime', title: 'Global Uptime Monitor', category: 'Infrastructure', description: 'Proactively test your endpoint accessibility from 22 globally distributed edge nodes every 30 seconds.', metric: '30s intervals · 22 regions', icon: Globe },
    { id: 'perf', title: 'Vitals & Performance Logs', category: 'Analytics', description: 'Ingest Core Web Vitals, Time to First Byte (TTFB), memory allocations, and network bandwidth in real-time.', metric: 'TTFB tracking · V8 heap logs', icon: Gauge },
    { id: 'errors', title: 'Contextual Error Tracking', category: 'Debugging', description: 'Unify client & server error loops. Decompile stack traces with sourcemaps instantly.', metric: 'Exception maps · Source logs', icon: AlertTriangle },
    { id: 'api', title: 'End-to-End API Gateway', category: 'Infrastructure', description: 'Map upstream status codes, response payloads, and API gateway speed against precise SLA thresholds.', metric: '100% telemetry coverage', icon: Network },
    { id: 'sec', title: 'Continuous Security Scans', category: 'Protection', description: 'Perform daily OWASP audits and dependency tree audits to ensure you are immune to common zero-day exploits.', metric: 'OWASP standard · Zero CVEs', icon: Shield },
    { id: 'ai', title: 'Autonomous AI Diagnosis', category: 'AI Intelligence', description: 'Our custom model matches traces, error frequencies, and GitHub commits to output production-ready hotfix PRs.', metric: 'LLM core correlation', icon: Cpu },
    { id: 'radar', title: 'Active Application Radar', category: 'Monitoring', description: 'A highly visual Concentric Sonar layout sweeps through your service endpoints and maps connection status.', metric: 'Live sweeping arm graph', icon: Activity },
    { id: 'deploy', title: 'Git & Deployment Tracking', category: 'Platform', description: 'Correlate Vercel, Railway, and Netlify pipeline build logs directly with performance fluctuations.', metric: 'GitHub action integration', icon: GitBranch },
    { id: 'reports', title: 'Clean Telemetry Briefs', category: 'Reporting', description: 'Generate weekly white-labeled system reports, downtime intervals, and optimization summaries.', metric: 'PDF & Slack exportable', icon: FileText }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'What types of applications does MeshPilot Radar support?',
      answer: 'MeshPilot integrates natively with Next.js, React, Node.js, Python, Go, and Svelte applications. It is framework-agnostic and can ingest telemetry via our zero-config API gateway proxies, server SDKs, or webhooks.'
    },
    {
      question: 'How does the Autonomous AI Investigation work?',
      answer: 'When a metric (like latency or database CPU load) spikes or an error triggers, our agent retrieves relevant application logs, database pg_stat_statements, and GitHub commits. It correlates the exact timeframe to locate the root cause and outputs a production-ready patch.'
    },
    {
      question: 'Does MeshPilot impact client-side application loading times?',
      answer: 'No. Our client SDK is optimized for high performance, loading asynchronously with a footprint of less than 1.4KB. All server telemetry is processed out-of-band at the edge, ensuring zero runtime latency impact.'
    },
    {
      question: 'Can I connect multiple staging and production environments?',
      answer: 'Yes! You can configure separate environments (Production, Preview, Staging, Local) per project. Deployments are automatically tagged and compared to previous runs to prevent regression drops.'
    },
    {
      question: 'How are alerts delivered to my team?',
      answer: 'You can stream alerts to Slack, Discord, PagerDuty, or standard Webhook servers. Our alerting payloads include complete visual code traces, logs, and a click-to-apply AI hotfix suggestion.'
    },
    {
      question: 'Is application and repository data securely isolated?',
      answer: 'Absolutely. MeshPilot encrypts all database coordinates, source metadata, and API credentials at rest and in transit. Your git codebase is read on an ephemeral, sandboxed, read-only container purely during code correlation scans.'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* -------------------------------- NAVBAR -------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Zone 1: Single Brand Logo Element */}
          <a href="#" className="flex items-center gap-2.5 group transition-colors">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white/5 border border-white/15 flex items-center justify-center">
              <img 
                src="/logo-128.png" 
                alt="MeshPilot Logo" 
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  // Fallback if logo not found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[10px] text-white font-bold tracking-tighter absolute">M</span>
            </div>
            <span className="text-lg font-display font-semibold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
              MeshPilot <span className="text-indigo-400 font-mono text-xs font-semibold tracking-widest uppercase ml-1.5">RADAR</span>
            </span>
          </a>

          {/* Zone 2: Navigation Links (4-6 links) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#radar" className="hover:text-white transition-colors">Radar Sweeper</a>
            <a href="#ai-diag" className="hover:text-white transition-colors">AI Diagnostics</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => alert('Demo accounts are automatically loaded in the main console sandbox. To simulate, use the View Live Sandbox button.')}
              className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => setSandboxModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer hover:shadow-lg hover:shadow-white/5"
            >
              Get Started Free
            </button>
          </div>

          {/* Responsive Mobile Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-900 bg-neutral-950/95 backdrop-blur-2xl absolute w-full top-16 left-0 px-6 py-6 space-y-4 animate-fade-in-down shadow-2xl">
            <nav className="flex flex-col gap-4 text-sm font-medium text-neutral-400">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                How It Works
              </a>
              <a 
                href="#radar" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Radar Sweeper
              </a>
              <a 
                href="#ai-diag" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                AI Diagnostics
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Pricing
              </a>
            </nav>
            <div className="h-px bg-neutral-900 my-4" />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  alert('Demo accounts are automatically pre-loaded in our Sandbox.');
                }}
                className="w-full py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold bg-neutral-900/40 text-center cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSandboxModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold text-center cursor-pointer hover:bg-neutral-200"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------- HERO SECTION -------------------------------- */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-dot-pattern">
        {/* Radial mesh background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[350px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-brand-primary/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          
          {/* Subtle Metadata Kicker */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-neutral-500 mb-6">
            <span>Autonomous Monitoring</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>AI Root-Cause Analytics</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Zero Runtime Overhead</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1] text-wrap">
            Your Web Application.<br />
            One <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Intelligent Control Center</span>.
          </h1>

          <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Continuous real-time observability over uptime, performance vitals, error logs, and security compliance. Use autonomous AI diagnostics to locate and repair performance anomalies instantly.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={() => setSandboxModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5 hover:translate-y-[-1px]"
            >
              Start Monitoring Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('radar');
                element?.scrollIntoView({ behavior: 'smooth' });
                setDemoSelected(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Dynamic Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          {/* Premium Animated Dashboard Preview component */}
          <div className="relative">
            {/* Visual glow frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-indigo-500/5 to-transparent blur-md pointer-events-none" />
            <DashboardPreview />
          </div>

          {/* Trusted by developers logo grid */}
          <div className="mt-20 border-t border-neutral-900/60 pt-12">
            <p className="text-xs font-mono text-neutral-500 tracking-wider uppercase mb-6">INTEGRATES AND AUDITS NATIVE DEPLOYMENTS ON</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-items-center opacity-40 hover:opacity-60 transition-opacity duration-300">
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">VERCEL</span>
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">GITHUB</span>
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">NETLIFY</span>
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">RAILWAY</span>
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">SUPABASE</span>
              <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400">CLOUDFLARE</span>
            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------- INTEGRATION CARD COMPONENT -------------------------------- */}
      <section id="integrations" className="py-20 border-y border-neutral-900 bg-neutral-950/40 relative">
        <div className="absolute inset-y-0 right-0 w-80 bg-indigo-500/3 pointer-events-none blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ECOSYSTEM LINKAGES</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Connect Your Web Infrastructure.
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              MeshPilot Radar runs side-by-side with your standard host environments. Ingest trace datasets with single-click hooks and configure alerting streams instantly.
            </p>
          </div>

          {/* Interactive Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationsList.map(item => (
              <div 
                key={item.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300 bg-neutral-900/20"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800/80 flex items-center justify-center font-mono font-bold text-white text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">{item.category}</span>
                      </div>
                    </div>

                    {/* Simulation Switch Button */}
                    <button
                      onClick={() => toggleIntegration(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.connected ? 'bg-indigo-600' : 'bg-neutral-800'
                      }`}
                      role="switch"
                      aria-checked={item.connected}
                      title={`Simulate connecting ${item.name}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.connected ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 min-h-[36px]">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60 text-[11px] font-mono">
                  <span className="text-neutral-500">INTEGRITY_CHECK</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-700'}`} />
                    <span className={item.connected ? 'text-emerald-400' : 'text-neutral-500'}>
                      {item.connected ? 'LINK_ACTIVE' : 'LINK_OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-neutral-900/10 border border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-400 font-mono">
              💡 Ingest custom structural records with our <span className="text-indigo-400">Winston API / JSON Webhook Spec</span>.
            </p>
            <button 
              onClick={() => alert('Winston Spec and manual integration documents are hosted in our public GitHub registry.')}
              className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-xs text-neutral-300 font-semibold cursor-pointer"
            >
              Read Connection API Specs
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------- THE CORE CAPABILITIES / FEATURES GRID -------------------------------- */}
      <section id="features" className="py-24 bg-neutral-950 bg-grid-pattern relative">
        <div className="absolute inset-0 bg-neutral-950/70 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ROBUST CAPABILITIES</span>
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mt-1.5 mb-4">
              Monitored Deeply.<br />Managed Autonomously.
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Ditch separate dashboard interfaces for logs, speed vitals, vulnerabilities, and error alerts. MeshPilot converges telemetry signals into one unified, intelligent center.
            </p>
          </div>

          {/* Asymmetric Bento layout / Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className="glass-card rounded-2xl p-6 glass-card-hover flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle inner radial glow */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/3 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-all duration-300" />
                  
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:border-neutral-800 transition-all duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{feat.category}</span>
                    </div>

                    <h4 className="text-base font-semibold text-white mb-2 font-display group-hover:text-indigo-200 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>SPECIFICATION</span>
                    <span className="text-neutral-300 font-medium">{feat.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- APPLICATION RADAR SCANNER (SECTION 6) -------------------------------- */}
      <section id="radar" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-emerald/3 pointer-events-none blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ACTIVE RADAR SUITE</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1.5 mb-4">
              The Real-Time Application Radar
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Hover and click nodes on the continuous concentric radar to evaluate security integrity, edge load distribution, network response vitals, and accessibility targets.
            </p>
          </div>

          {/* Embedded Active Sonar simulation component */}
          <RadarSimulation />
        </div>
      </section>

      {/* -------------------------------- HOW IT WORKS (SECTION 4) -------------------------------- */}
      <section id="how-it-works" className="py-24 border-t border-neutral-900 bg-neutral-900/10 bg-dot-pattern relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">THREE STEPS</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1.5 mb-4">
              Plug In. Analyze. Automate.
            </h2>
            <p className="text-neutral-400 text-sm">
              We design complex tracing logic to run in three simple chapters.
            </p>
          </div>

          {/* Editorial Steps with Visual Hairline linkages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between bg-neutral-950/40">
              <div>
                <span className="text-4xl font-display font-bold text-indigo-500/20 block mb-4">01</span>
                <h4 className="text-lg font-semibold text-white mb-2">Connect Your Web App</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  Deploy our lightweight, asynchronous client SDK or connect via Vercel and GitHub platform authorizations in under 60 seconds.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>ESTIMATED TIME</span>
                <span className="text-indigo-400 font-semibold">&lt; 1 minute</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between bg-neutral-950/40">
              <div>
                <span className="text-4xl font-display font-bold text-indigo-500/20 block mb-4">02</span>
                <h4 className="text-lg font-semibold text-white mb-2">Continuous Stream Analysis</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  Let the platform ingest telemetry data continuously. We map DB transaction locks, CDN latency, Web Vitals, and application health trends.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>MONITORING RECURRENCE</span>
                <span className="text-indigo-400 font-semibold">Continuous / 24-7</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between bg-neutral-950/40">
              <div>
                <span className="text-4xl font-display font-bold text-indigo-500/20 block mb-4">03</span>
                <h4 className="text-lg font-semibold text-white mb-2">Get Autonomous AI Fixes</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  Receive Slack alerts with complete debugging context. Our AI agent compiles database logs, error spikes, and code diff commits to output instant PR patches.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>AUTOMATION OUTCOME</span>
                <span className="text-indigo-400 font-semibold">1-Click Code Patch</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------- AI DIAGNOSTIC CENTER (SECTION 5) -------------------------------- */}
      <section id="ai-diag" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-500/3 pointer-events-none blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">AI AUTOMATED RECONSTRUCTION</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Intelligent Autonomous Tracing
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Experience our AI diagnostic interface. Run simulated root-cause investigations below over common real-world developer incident cases and test code-patch synthesis.
            </p>
          </div>

          {/* Core Interactive AI diagnostic terminal simulator component */}
          <AICanvas />
        </div>
      </section>

      {/* -------------------------------- PRICING CARDS -------------------------------- */}
      <section id="pricing" className="py-24 border-t border-neutral-900 bg-neutral-900/10 relative">
        <div className="absolute inset-y-0 left-0 w-80 bg-brand-accent/3 pointer-events-none blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">PRICING TIERS</span>
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Predictable, Developer-First Rates.
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Unlock unlimited AI-powered traces and system diagnostic scans. Choose a tier fitted to your monthly request volume.
            </p>

            {/* Toggle Switch */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-neutral-950 border border-neutral-900/80">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  billingInterval === 'monthly' 
                    ? 'bg-neutral-900 text-white shadow' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingInterval('annually')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingInterval === 'annually' 
                    ? 'bg-neutral-900 text-white shadow' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase font-mono tracking-widest">SAVE 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Tier 1: Free */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 hover:border-neutral-800 transition-all">
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">DEVELOPER</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Free Sandbox</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">$0</span>
                  <span className="text-neutral-500 text-xs"> / perpetual</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Perfect for local dev, personal portfolios, and evaluating our concentric radar simulation capabilities.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Up to 3 endpoints monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>5-minute diagnostic intervals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Standard trace log ingestion</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-500">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>No Git/Deployment correlations</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-500">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>No Autonomous AI fixes</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setSandboxModalOpen(true)}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Launch Sandbox
              </button>
            </div>

            {/* Tier 2: Pro */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 border-indigo-500/20 shadow-xl shadow-indigo-950/5 hover:border-neutral-800 transition-all relative">
              <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded tracking-widest uppercase">POPULAR</span>
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">STARTUPS</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Radar Pro</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    {billingInterval === 'annually' ? '$39' : '$49'}
                  </span>
                  <span className="text-neutral-500 text-xs"> / month</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  For growing web application platforms requiring quick continuous scans, alert webhooks, and core AI suggestions.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Up to 15 endpoints monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>30-second continuous intervals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>GitHub/Vercel continuous sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Autonomous AI diagnostics (100/mo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Slack/Discord notification webhooks</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => alert('Simulating Pro checkout. Sign up for a free sandbox to get started!')}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
              >
                Deploy Pro Suite
              </button>
            </div>

            {/* Tier 3: Business */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 hover:border-neutral-800 transition-all">
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">SCALE</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Radar Business</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    {billingInterval === 'annually' ? '$159' : '$199'}
                  </span>
                  <span className="text-neutral-500 text-xs"> / month</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Heavy performance telemetry, full security audits, custom pg_stat logs, and infinite automated AI PR actions.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Up to 100 endpoints monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>10-second high-density sweeps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Custom trace retention (90 days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Unlimited Autonomous AI diagnostics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>SLA uptime breach reports (PDF)</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => alert('Simulating Business checkout. Subscribe to get full cluster capacity.')}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Deploy Business Suite
              </button>
            </div>

            {/* Tier 4: Enterprise */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 hover:border-neutral-800 transition-all">
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">ENTERPRISE</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Custom Engine</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">Custom</span>
                  <span className="text-neutral-500 text-xs"> / contract</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Dedicated clusters, on-prem telemetry proxies, custom OWASP rule validations, and dedicated technical coordinators.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Infinite active endpoints</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Sub-second diagnostics gateway</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>On-Prem / Private Cloud telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>SLA compliance guarantees (99.999%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Custom isolated LLM deployment</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => alert('Redirecting to simulated Enterprise partnership coordinator.')}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Contact Partnerships
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------- FAQ ACCORDION LIST -------------------------------- */}
      <section id="faq" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">COMMON ENQUIRIES</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Answers For Your Engineering Teams
            </h2>
            <p className="text-neutral-400 text-sm">
              Everything you need to know about MeshPilot Radar telemetry mechanics.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between text-white font-medium text-sm md:text-base cursor-pointer hover:bg-neutral-900/30 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs md:text-sm text-neutral-400 leading-relaxed font-sans border-t border-neutral-900/60 pt-4 bg-neutral-900/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- FINAL CTA BANNER -------------------------------- */}
      <section className="py-24 border-t border-neutral-900 bg-neutral-950 relative bg-dot-pattern">
        {/* Decorative background visual lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">DEPLOY TONIGHT</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mt-1 mb-6 leading-tight">
            Take Control of Your Web Applications.
          </h2>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Connect your host environment in under a minute. Experience the power of globally distributed latency tests and autonomous AI code diagnostics completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setSandboxModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              Start Free Integration
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all cursor-pointer"
            >
              Learn More Capabilities
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>No credit card required</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-minute setup</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cancel telemetry at any time</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- FOOTER -------------------------------- */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-16 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
            
            {/* Column 1: Brand Wordmark */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md overflow-hidden bg-white/5 border border-white/15 flex items-center justify-center text-[9px] text-white font-bold font-mono">
                  MP
                </div>
                <span className="text-sm font-semibold tracking-tight text-white font-display">
                  MeshPilot Radar
                </span>
              </div>
              <p className="text-neutral-500 leading-relaxed max-w-xs font-sans">
                An advanced developer infrastructure telemetry platform by MeshPilot. Monitor, secure, and debug web stacks autonomously using artificial intelligence.
              </p>
              <div className="text-[10px] font-mono text-neutral-600">
                PLATFORM: STABLE_RELEASE // v4.22
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h5 className="font-semibold text-white uppercase tracking-wider font-mono text-[10px]">Product</h5>
              <ul className="space-y-2 font-sans">
                <li><a href="#features" className="hover:text-neutral-300 transition-colors">Uptime Monitor</a></li>
                <li><a href="#features" className="hover:text-neutral-300 transition-colors">Performance logs</a></li>
                <li><a href="#radar" className="hover:text-neutral-300 transition-colors">Application Radar</a></li>
                <li><a href="#ai-diag" className="hover:text-neutral-300 transition-colors">AI Diagnostics</a></li>
                <li><a href="#integrations" className="hover:text-neutral-300 transition-colors">System Hooks</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h5 className="font-semibold text-white uppercase tracking-wider font-mono text-[10px]">Company</h5>
              <ul className="space-y-2 font-sans">
                <li><a href="#" className="hover:text-neutral-300 transition-colors">About MeshPilot</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">We are hiring</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Partner suite</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Press room</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Contact office</a></li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="space-y-3">
              <h5 className="font-semibold text-white uppercase tracking-wider font-mono text-[10px]">Resources</h5>
              <ul className="space-y-2 font-sans">
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Platform manuals</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Winston Webhook Spec</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Community Forum</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Operational Status</a></li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div className="space-y-3">
              <h5 className="font-semibold text-white uppercase tracking-wider font-mono text-[10px]">Legal</h5>
              <ul className="space-y-2 font-sans">
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Privacy charter</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">Telemetry processing</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">GDPR audit</a></li>
                <li><a href="#" className="hover:text-neutral-300 transition-colors">SLA Guarantee</a></li>
              </ul>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-600">
              <span>© {new Date().getFullYear()} MeshPilot. All telemetry blocks signed.</span>
            </div>
            
            {/* Soft designer credit matching MeshPilot theme */}
            <div className="flex items-center gap-1 text-[10px] text-neutral-600 font-sans">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
              <span>for high-performance web engineering.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------- GET STARTED SANDBOX MODAL -------------------------------- */}
      {sandboxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 w-full max-w-[480px] relative overflow-hidden shadow-2xl">
            {/* Glow backing */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <button 
              onClick={() => {
                setSandboxModalOpen(false);
                setSandboxResult(null);
                setSandboxUrl('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">MeshPilot Interactive Sandbox</h4>
                <p className="text-[11px] text-neutral-400">Simulate a telemetry diagnostic scan on your app URL</p>
              </div>
            </div>

            <form onSubmit={handleSandboxSubmit} className="space-y-4">
              <div>
                <label htmlFor="sandbox-url-input" className="block text-[11px] font-mono text-neutral-500 uppercase mb-1.5">Application Endpoint URL</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 font-mono text-xs">
                    https://
                  </span>
                  <input
                    id="sandbox-url-input"
                    type="text"
                    required
                    placeholder="my-cool-website.com"
                    value={sandboxUrl}
                    onChange={(e) => setSandboxUrl(e.target.value.replace(/^https?:\/\//, ''))}
                    className="w-full pl-18 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sandboxLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-800 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {sandboxLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Connecting & Ingesting Edge Traces...
                  </>
                ) : (
                  'Run Live Sandbox Diagnostic'
                )}
              </button>
            </form>

            {/* Simulated diagnostic report results card */}
            {sandboxResult && (
              <div className="mt-5 p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30 font-mono text-xs space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-900 text-[10px] text-neutral-500">
                  <span>TELEMETRY_REPORT_GENERATED</span>
                  <span className="text-indigo-400 font-bold">100% OK</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">EST_LOAD_TIME</span>
                    <span className="text-emerald-400 font-bold">{sandboxResult.loadTime} seconds</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">HEALTH_SCORE</span>
                    <span className="text-white font-bold">{sandboxResult.healthScore}% Optimal</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">ENDPOINTS_MAPPED</span>
                    <span className="text-white font-bold">{sandboxResult.endpointsFound} detected</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">CVE_WARNINGS</span>
                    <span className={sandboxResult.vulnerabilities > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {sandboxResult.vulnerabilities > 0 ? '1 warning' : '0 issues found'}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-neutral-900" />
                <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                  🎉 Connection successful! This is a simulated telemetry block showing healthy response vitals on your app. Register for a permanent Pro API key to enable full trace retention.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
