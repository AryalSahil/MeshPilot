import React, { useState } from 'react';
import { 
  Activity, Shield, AlertTriangle, Cpu, Terminal, GitBranch, Play, ArrowUpRight, 
  Settings, CheckCircle2, Circle, Clock, Layers, Flame, ArrowRight, Gauge, Lock, 
  Globe, Network, Code, Server, Check, ChevronDown, Star, FileText, HelpCircle, 
  X, RefreshCw 
} from 'lucide-react';
import { Link } from '../components/Router';
import RadarSimulation from '../components/RadarSimulation';
import AICanvas from '../components/AICanvas';
import DashboardPreview from '../components/DashboardPreview';

interface FeatureCard {
  id: string;
  title: string;
  category: string;
  description: string;
  metric: string;
  icon: React.ComponentType<any>;
  path: string;
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

// Custom, minimalist animated icon components for each feature
function UptimeIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" className="stroke-indigo-500/20" />
      <circle cx="12" cy="12" r="3" className="fill-indigo-400 stroke-none" />
      <circle cx="12" cy="12" r="6" className="animate-ping opacity-60 origin-center" style={{ animationDuration: '3s' }} />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M12 20v2M17.66 17.66l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" className="opacity-30" />
      <circle cx="12" cy="12" r="2.5" className="fill-indigo-400 stroke-none" />
      <line x1="12" y1="12" x2="16" y2="8" strokeLinecap="round" className="origin-bottom-left animate-pulse" style={{ transformOrigin: '12px 12px', animationDuration: '1.5s' }} />
    </svg>
  );
}

function ErrorTrackingIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ animationDuration: '2s' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      <circle cx="12" cy="15" r="1.5" className="fill-indigo-400 animate-ping opacity-75" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="6" height="6" rx="1.5" className="opacity-30" />
      <rect x="16" y="2" width="6" height="6" rx="1.5" className="opacity-30" />
      <rect x="9" y="16" width="6" height="6" rx="1.5" className="opacity-30" />
      <path d="M5 8v4h4M19 8v4h-4" className="stroke-indigo-400 opacity-60" />
      <circle cx="5" cy="12" r="2" className="fill-indigo-400 stroke-none animate-bounce" style={{ animationDuration: '1.8s' }} />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      <line x1="4" y1="11" x2="20" y2="11" className="stroke-indigo-300 opacity-60 animate-pulse" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" className="fill-indigo-400 animate-ping opacity-70" />
      <circle cx="12" cy="12" r="3" className="fill-indigo-400 stroke-none" />
      <path d="M12 5V2M12 19v3M5 12H2M22 12h-3" className="stroke-indigo-400 opacity-40" />
      <line x1="5" y1="5" x2="19" y2="19" className="stroke-indigo-400 opacity-20 animate-pulse" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '5s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" className="stroke-indigo-500/20" />
      <circle cx="12" cy="12" r="5" className="stroke-indigo-500/40" />
      <line x1="12" y1="12" x2="18" y2="6" strokeLinecap="round" />
    </svg>
  );
}

function DeploymentIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M6 18V6M18 18V6" className="opacity-30" strokeDasharray="2 2" />
      <circle cx="6" cy="6" r="3" className="fill-indigo-500/10" />
      <circle cx="18" cy="18" r="3" className="fill-indigo-500/10" />
      <path d="M6 12h12" className="stroke-indigo-400 animate-pulse" />
      <circle cx="12" cy="12" r="2" className="fill-indigo-300 stroke-none animate-ping" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="6" y1="20" x2="6" y2="12" className="stroke-indigo-400 animate-pulse" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="5" className="stroke-indigo-400 animate-pulse" strokeLinecap="round" style={{ animationDelay: '0.2s', animationDuration: '1.2s' }} />
      <line x1="18" y1="20" x2="18" y2="9" className="stroke-indigo-400 animate-pulse" strokeLinecap="round" style={{ animationDelay: '0.4s', animationDuration: '1s' }} />
    </svg>
  );
}

interface LandingPageProps {
  onStartSandbox: () => void;
  onNavigate: (path: string) => void;
}

export default function LandingPage({ onStartSandbox, onNavigate }: LandingPageProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('annually');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeHowStep, setActiveHowStep] = useState<number>(0);

  const [integrationsList, setIntegrationsList] = useState<Integration[]>([
    { id: 'github', name: 'GitHub', category: 'Platform', description: 'Trigger automatic code diff analysis and commit correlation.', connected: true, color: 'text-neutral-200' },
    { id: 'vercel', name: 'Vercel', category: 'Platform', description: 'Ingest deployment logs and trace edge functions on production.', connected: true, color: 'text-white' },
    { id: 'cloudflare', name: 'Cloudflare', category: 'Infrastructure', description: 'Observe edge routing speed, TLS Handshakes, and DNS latency.', connected: true, color: 'text-amber-500' },
    { id: 'supabase', name: 'Supabase', category: 'Infrastructure', description: 'Trace pg_stat_statements and check for slow SQL query execution.', connected: false, color: 'text-emerald-400' },
    { id: 'railway', name: 'Railway', category: 'Infrastructure', description: 'Record cluster logs, memory heaps, and database locks.', connected: false, color: 'text-pink-400' },
    { id: 'slack', name: 'Slack', category: 'Alerting', description: 'Deliver rich, trace-correlated alert cards to engineering channels.', connected: true, color: 'text-indigo-400' }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrationsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, connected: !item.connected };
      }
      return item;
    }));
  };

  const features: FeatureCard[] = [
    { id: 'uptime', title: 'Global Uptime Monitor', category: 'Infrastructure', description: 'Proactively test your endpoint accessibility from 22 globally distributed edge nodes every 30 seconds.', metric: '30s intervals · 22 regions', icon: UptimeIcon, path: '/features/uptime-monitor' },
    { id: 'perf', title: 'Vitals & Performance Logs', category: 'Analytics', description: 'Ingest Core Web Vitals, Time to First Byte (TTFB), memory allocations, and network bandwidth in real-time.', metric: 'TTFB tracking · V8 heap logs', icon: PerformanceIcon, path: '/features/performance' },
    { id: 'errors', title: 'Contextual Error Tracking', category: 'Debugging', description: 'Unify client & server error loops. Decompile stack traces with sourcemaps instantly.', metric: 'Exception maps · Source logs', icon: ErrorTrackingIcon, path: '/features/performance' },
    { id: 'api', title: 'End-to-End API Gateway', category: 'Infrastructure', description: 'Map upstream status codes, response payloads, and API gateway speed against precise SLA thresholds.', metric: '100% telemetry coverage', icon: ApiIcon, path: '/features/uptime-monitor' },
    { id: 'sec', title: 'Continuous Security Scans', category: 'Protection', description: 'Perform daily OWASP audits and dependency tree audits to ensure you are immune to common zero-day exploits.', metric: 'OWASP standard · Zero CVEs', icon: SecurityIcon, path: '/features/application-radar' },
    { id: 'ai', title: 'Autonomous AI Diagnosis', category: 'AI Intelligence', description: 'Our custom model matches traces, error frequencies, and GitHub commits to output production-ready hotfix PRs.', metric: 'LLM core correlation', icon: AiIcon, path: '/features/ai-diagnostics' },
    { id: 'radar', title: 'Active Application Radar', category: 'Monitoring', description: 'A highly visual Concentric Sonar layout sweeps through your service endpoints and maps connection status.', metric: 'Live sweeping arm graph', icon: RadarIcon, path: '/features/application-radar' },
    { id: 'deploy', title: 'Git & Deployment Tracking', category: 'Platform', description: 'Correlate Vercel, Railway, and Netlify pipeline build logs directly with performance fluctuations.', metric: 'GitHub action integration', icon: DeploymentIcon, path: '/features/system-hooks' },
    { id: 'reports', title: 'Clean Telemetry Briefs', category: 'Reporting', description: 'Generate weekly white-labeled system reports, downtime intervals, and optimization summaries.', metric: 'PDF & Slack exportable', icon: ReportsIcon, path: '/features/performance' }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'What types of applications does MeshPilot support?',
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
    <div className="flex flex-col">
      
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
              onClick={onStartSandbox}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5 hover:translate-y-[-1px]"
            >
              Start Monitoring Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('radar-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Dynamic Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          {/* Premium Animated Dashboard Preview component */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-indigo-500/5 to-transparent blur-md pointer-events-none" />
            <DashboardPreview />
          </div>

          {/* Trusted by developers logo grid */}
          <div className="mt-20 border-t border-neutral-900/40 pt-12">
            <p className="text-xs font-mono text-neutral-500 tracking-wider uppercase mb-6 font-semibold">POWERING INFRASTRUCTURE & HIGH-VELOCITY TEAMS AT</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
              {/* Stripe */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs font-sans group-hover:scale-105 transition-transform">S</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">stripe</span>
              </div>
              {/* Linear */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-[10px] font-sans group-hover:scale-105 transition-transform">L</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">linear</span>
              </div>
              {/* Retool */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-400 text-[10px] font-sans group-hover:scale-105 transition-transform">R</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">retool</span>
              </div>
              {/* Vercel */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-[10px] font-sans group-hover:scale-105 transition-transform">▲</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">vercel</span>
              </div>
              {/* Supabase */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-[10px] font-sans group-hover:scale-105 transition-transform">⚡</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">supabase</span>
              </div>
              {/* Cloudflare */}
              <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300 group cursor-pointer">
                <div className="w-5 h-5 rounded bg-amber-600/10 border border-amber-600/20 flex items-center justify-center font-bold text-amber-500 text-[10px] font-sans group-hover:scale-105 transition-transform">C</div>
                <span className="text-[11px] font-sans font-bold tracking-tight text-neutral-300">cloudflare</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------- INTEGRATIONS GRID -------------------------------- */}
      <section id="integrations-section" className="py-20 border-y border-neutral-900 bg-neutral-950/40 relative">
        <div className="absolute inset-y-0 right-0 w-80 bg-indigo-500/3 pointer-events-none blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ECOSYSTEM LINKAGES</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Connect Your Web Infrastructure.
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              MeshPilot runs side-by-side with your standard host environments. Ingest trace datasets with single-click hooks and configure alerting streams instantly.
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

                <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60 text-[11px] font-mono hover:text-white transition-colors duration-200 cursor-pointer">
                  <span className="text-neutral-500">INTEGRITY_CHECK</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-700'}`} />
                    <span className={item.connected ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>
                      {item.connected ? 'LINK_ACTIVE' : 'LINK_OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-neutral-900/10 border border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-400 font-mono">
              💡 Ingest custom structural records with our <Link to="/features/system-hooks" className="text-indigo-400 hover:underline">Winston API / JSON Webhook Spec</Link>.
            </p>
            <Link 
              to="/features/system-hooks"
              className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-xs text-neutral-300 font-semibold cursor-pointer"
            >
              Read Connection API Specs
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------- THE CORE CAPABILITIES / FEATURES GRID -------------------------------- */}
      <section id="features-section" className="py-24 bg-neutral-950 bg-grid-pattern relative">
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
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className="glass-card rounded-2xl p-6 glass-card-hover flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/3 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-all duration-300" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:border-neutral-800 transition-all duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{feat.category}</span>
                    </div>

                    <h4 className="text-base font-semibold text-white mb-2 font-display group-hover:text-indigo-200 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <Link to={feat.path} className="text-indigo-400 font-bold hover:underline">Explore Page &rarr;</Link>
                    <span className="text-neutral-300 font-medium">{feat.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- APPLICATION RADAR SCANNER -------------------------------- */}
      <section id="radar-section" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
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

          <RadarSimulation />
        </div>
      </section>

      {/* -------------------------------- HOW IT WORKS -------------------------------- */}
      <section id="how-it-works-section" className="py-24 border-t border-neutral-900 bg-neutral-900/10 bg-dot-pattern relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">THREE STEPS</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1.5 mb-4">
              Plug In. Analyze. Automate.
            </h2>
            <p className="text-neutral-400 text-sm">
              Click on each chapter to explore the technical details and interactive telemetry logs of our runtime engine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div 
              onClick={() => setActiveHowStep(0)}
              className={`glass-card rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                activeHowStep === 0 
                  ? 'border-indigo-500/40 bg-indigo-950/10 shadow-lg shadow-indigo-950/20 translate-y-[-2px]' 
                  : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-4xl font-display font-bold ${activeHowStep === 0 ? 'text-indigo-400' : 'text-neutral-700/60'}`}>01</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    activeHowStep === 0 ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400' : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>Connect Your Web App</span>
                  {activeHowStep === 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-sans">
                  Deploy our lightweight, asynchronous client SDK or connect via Vercel and GitHub platform authorizations in under 60 seconds.
                </p>

                {/* Expanded Detailed Tooltip Panel */}
                <div className={`overflow-hidden transition-all duration-300 origin-top ${
                  activeHowStep === 0 ? 'max-h-56 opacity-100 mt-4 pt-4 border-t border-indigo-950/40' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <p className="text-[11px] text-indigo-300 font-mono uppercase tracking-wider mb-2 font-bold">INTEGRATION TELEMETRY:</p>
                  <ul className="space-y-2 text-[11px] text-neutral-400 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">⚡</span>
                      <span>Zero-blocking asynchronous SDK script</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">⚡</span>
                      <span>Ephemeral GitHub read-only tree mapping</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">⚡</span>
                      <span>Clerk Authentication token-level alignment</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-neutral-500 font-sans italic mt-3">
                    Click steps 2 and 3 to review tracking workflows.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>ESTIMATED TIME</span>
                <span className="text-indigo-400 font-semibold">&lt; 1 minute</span>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => setActiveHowStep(1)}
              className={`glass-card rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                activeHowStep === 1 
                  ? 'border-indigo-500/40 bg-indigo-950/10 shadow-lg shadow-indigo-950/20 translate-y-[-2px]' 
                  : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-4xl font-display font-bold ${activeHowStep === 1 ? 'text-indigo-400' : 'text-neutral-700/60'}`}>02</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    activeHowStep === 1 ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400' : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-500'
                  }`}>
                    <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>Continuous Stream Analysis</span>
                  {activeHowStep === 1 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-sans">
                  Let the platform ingest telemetry data continuously. We map DB transaction locks, CDN latency, Web Vitals, and application health trends.
                </p>

                {/* Expanded Detailed Tooltip Panel */}
                <div className={`overflow-hidden transition-all duration-300 origin-top ${
                  activeHowStep === 1 ? 'max-h-56 opacity-100 mt-4 pt-4 border-t border-indigo-950/40' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <p className="text-[11px] text-indigo-300 font-mono uppercase tracking-wider mb-2 font-bold">STREAM TELEMETRY DETAILED:</p>
                  <ul className="space-y-2 text-[11px] text-neutral-400 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">📈</span>
                      <span>Real-time monitoring of Core Web Vitals (TTFB, FCP)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">📈</span>
                      <span>Continuous sonar endpoint validation sweeps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">📈</span>
                      <span>Encrypted telemetry partitioned in custom Firestore DB</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-neutral-500 font-sans italic mt-3">
                    Active state continuously streams metrics safely.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>MONITORING RECURRENCE</span>
                <span className="text-indigo-400 font-semibold">Continuous / 24-7</span>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => setActiveHowStep(2)}
              className={`glass-card rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                activeHowStep === 2 
                  ? 'border-indigo-500/40 bg-indigo-950/10 shadow-lg shadow-indigo-950/20 translate-y-[-2px]' 
                  : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-4xl font-display font-bold ${activeHowStep === 2 ? 'text-indigo-400' : 'text-neutral-700/60'}`}>03</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    activeHowStep === 2 ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400' : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>Get Autonomous AI Fixes</span>
                  {activeHowStep === 2 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-sans">
                  Receive Slack alerts with complete debugging context. Our AI agent compiles database logs, error spikes, and code diff commits to output instant PR patches.
                </p>

                {/* Expanded Detailed Tooltip Panel */}
                <div className={`overflow-hidden transition-all duration-300 origin-top ${
                  activeHowStep === 2 ? 'max-h-56 opacity-100 mt-4 pt-4 border-t border-indigo-950/40' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <p className="text-[11px] text-indigo-300 font-mono uppercase tracking-wider mb-2 font-bold">AUTOMATION IN ACTION:</p>
                  <ul className="space-y-2 text-[11px] text-neutral-400 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">🤖</span>
                      <span>Latent commit & bug correlation scanning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">🤖</span>
                      <span>Slack channels populated with trace-cards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold font-mono">🤖</span>
                      <span>One-click custom AI synthetic patch logic</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-neutral-500 font-sans italic mt-3">
                    Synthesizes error-resolution vectors automatically.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex justify-between">
                <span>AUTOMATION OUTCOME</span>
                <span className="text-indigo-400 font-semibold">1-Click Code Patch</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------- AI DIAGNOSTIC CENTER -------------------------------- */}
      <section id="ai-diagnostics-section" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
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

          <AICanvas />
        </div>
      </section>

      {/* -------------------------------- PRICING CARDS -------------------------------- */}
      <section id="pricing-section" className="py-24 border-t border-neutral-900 bg-neutral-900/10 relative">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Tier 1: Free */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 hover:border-neutral-800 transition-all">
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">DEVELOPER</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Free</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">₹0</span>
                  <span className="text-neutral-500 text-xs"> / perpetual</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  Perfect for local dev, personal portfolios, and evaluating our concentric radar simulation capabilities.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300 font-sans">
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
                onClick={onStartSandbox}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Tier 2: Pro */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 border-indigo-500/20 shadow-xl shadow-indigo-950/5 hover:border-neutral-800 transition-all relative">
              <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded tracking-widest uppercase">POPULAR</span>
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">STARTUPS</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Pro</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    {billingInterval === 'annually' ? '₹2,499' : '₹3,299'}
                  </span>
                  <span className="text-neutral-500 text-xs"> / month</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  For growing web application platforms requiring quick continuous scans, alert webhooks, and core AI suggestions.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300 font-sans">
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
                onClick={() => alert('Simulating Pro checkout. Sign up for free to get started!')}
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
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Business</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    {billingInterval === 'annually' ? '₹9,999' : '₹12,499'}
                  </span>
                  <span className="text-neutral-500 text-xs"> / month</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  Heavy performance telemetry, full security audits, custom pg_stat logs, and infinite automated AI PR actions.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300 font-sans">
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
                    <span>Enterprise database trace queries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Unlimited Autonomous AI fixes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Custom SLAs & compliance reports</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => alert('Simulating Business checkout. Sign up for free to get started!')}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Deploy Business Suite
              </button>
            </div>

            {/* Tier 4: Enterprise */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-neutral-950/40 hover:border-neutral-800 transition-all">
              <div>
                <div className="mb-6">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">ENTERPRISE</span>
                  <h4 className="text-2xl font-display font-semibold text-white mt-1">Enterprise</h4>
                </div>
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">Custom</span>
                  <span className="text-neutral-500 text-xs"> / year contract</span>
                </div>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans">
                  For cloud native organizations with multi-million request loads. Single-tenant deployments, SOC-2 validation.
                </p>

                <div className="h-px bg-neutral-900 my-6" />

                <ul className="space-y-3.5 text-xs text-neutral-300 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Infinite service endpoints monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Custom cluster telemetry ingestion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Dedicated database nodes & SOC2</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Custom fine-tuned AI model weights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>24/7 designated SLA support engineers</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => alert('Our team can design custom enterprise SLAs for your cluster. Contact details available in the footer!')}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------- CUSTOMER TESTIMONIALS -------------------------------- */}
      <section className="py-24 border-t border-neutral-900 bg-neutral-950/20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ENGINEERING VALIDATED</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Trusted by Top Operators
            </h2>
            <p className="text-neutral-400 text-sm">
              See how modern engineering teams use MeshPilot to protect uptime, prevent regressions, and scale systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="glass-card rounded-2xl p-6 border border-neutral-900 bg-neutral-900/10 flex flex-col justify-between hover:border-indigo-500/15 transition-all">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans italic">
                "MeshPilot completely transformed our incident response. Our MTTD dropped from 15 minutes to under 30 seconds, and the visual radar is phenomenal."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px] text-indigo-400">SJ</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah Jenkins</h4>
                  <p className="text-[10px] text-neutral-500 font-mono">VP of Infrastructure, Linear</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-card rounded-2xl p-6 border border-neutral-900 bg-neutral-900/10 flex flex-col justify-between hover:border-indigo-500/15 transition-all">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans italic">
                "The autonomous AI root-cause analyzer is like having a staff SRE on call 24/7. It correlates database spikes and GitHub commits instantly."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-[10px] text-amber-400">MV</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Marcus Vance</h4>
                  <p className="text-[10px] text-neutral-500 font-mono">Head of Platform, Vercel</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-card rounded-2xl p-6 border border-neutral-900 bg-neutral-900/10 flex flex-col justify-between hover:border-indigo-500/15 transition-all">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans italic">
                "With MeshPilot’s global edge pingers, we identified latency degradation in our APAC gateway before any customer reports came in."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-[10px] text-rose-400">DC</div>
                <div>
                  <h4 className="text-xs font-bold text-white">David Chen</h4>
                  <p className="text-[10px] text-neutral-500 font-mono">Lead Architect, Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- FAQ ACCORDION -------------------------------- */}
      <section id="faq-section" className="py-24 border-t border-neutral-900 bg-neutral-950 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">ANSWERS VERIFIED</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mt-1 mb-4">
              Frequently Answered Inquiries
            </h2>
            <p className="text-neutral-400 text-sm">
              Explore how we process real-time streams and maintain complete telemetry isolation.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="glass-card rounded-2xl overflow-hidden border border-neutral-900/80 bg-neutral-900/10 transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-sm md:text-base text-white hover:text-indigo-300 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-neutral-400 leading-relaxed font-sans border-t border-neutral-900/40 animate-fade-in-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- FINAL CTA -------------------------------- */}
      <section className="py-24 border-t border-neutral-900 bg-neutral-950 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">TAKE ABSOLUTE CONTROL</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mt-3 mb-6 max-w-2xl mx-auto leading-tight">
            Observe Your Web Applications with Autonomous AI.
          </h2>
          <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-sans">
            Instantly map security vulnerabilities, CDN bottlenecks, SLA latency drop-offs, and memory leak warnings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStartSandbox}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5 hover:translate-y-[-1px]"
            >
              Start Free Integration
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('radar-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Observe Radar Sonar
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
