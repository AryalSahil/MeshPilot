import React, { useState } from 'react';
import { useDashboard, Project } from '../context/DashboardContext';
import { useRouter, Link } from '../components/Router';
import { 
  Layers, Shield, Activity, TrendingUp, AlertOctagon, Brain, 
  GitCommit, BarChart3, Puzzle, ArrowLeft, CheckCircle, Globe,
  Settings, Terminal, HelpCircle, ExternalLink, Flame, ShieldAlert, Cpu, HardDrive
} from 'lucide-react';

// ==========================================
// 1. PROJECTS SUB-PAGE / DETAILED VIEWER
// ==========================================
export function DashboardProjectsPage() {
  const { projects } = useDashboard();
  const { path, navigate } = useRouter();

  // Detect project ID from router path (e.g., /dashboard/projects/proj_1)
  const pathParts = path.split('/');
  const projectIdSuffix = pathParts[3] || ''; // Parts: ['', 'dashboard', 'projects', 'proj_1']
  
  const selectedProject = projects.find(p => p.id === projectIdSuffix);

  if (selectedProject) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up">
        {/* Breadcrumb back */}
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to environments list</span>
        </button>

        {/* Detailed Hero */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-2xl font-display font-semibold text-white tracking-tight">{selectedProject.name}</h2>
              <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2.5 py-0.5 rounded">
                {selectedProject.environment.toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400">{selectedProject.url}</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedProject.integrations.map(integration => (
              <span key={integration} className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                {integration} Active
              </span>
            ))}
          </div>
        </div>

        {/* Project Metrics Detail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Uptime Index', val: selectedProject.uptime, sub: 'Historical SLA score' },
            { label: 'Average Ping', val: `${selectedProject.responseTime}ms`, sub: 'From 22 edge regions' },
            { label: 'Logged Incidents', val: selectedProject.errorsCount, sub: 'Unresolved warning traces' },
            { label: 'Security Grade', val: `${selectedProject.securityScore}/100`, sub: 'OWASP standard' }
          ].map((m, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-neutral-900 bg-neutral-950/40">
              <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-wider">{m.label}</span>
              <span className="text-lg font-bold text-white block mt-2">{m.val}</span>
              <span className="text-[10px] text-neutral-500 block mt-1">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Sandbox Command Console logs */}
        <div className="space-y-3.5">
          <h3 className="text-sm font-bold text-white font-sans">Edge Telemetry Command Center</h3>
          <div className="p-4 rounded-xl border border-neutral-900 bg-black font-mono text-[10px] text-neutral-400 space-y-2 leading-relaxed">
            <p className="text-neutral-600">[2026-09-24T07:11:05.184Z] INITIALIZING COMPILER CONNECTIONS...</p>
            <p className="text-emerald-400">[2026-09-24T07:11:05.290Z] INFRASTRUCTURE: DNS resolved successfully in 28ms</p>
            <p className="text-indigo-400">[2026-09-24T07:11:05.350Z] SECURITY: TLS 1.3 certificate keys confirmed valid. Remaining life: 82 days</p>
            {selectedProject.errorsCount > 0 ? (
              <p className="text-amber-400 animate-pulse">[2026-09-24T07:11:05.410Z] WARNING: {selectedProject.errorsCount} transaction warnings reported inside endpoint '/api/orders'</p>
            ) : (
              <p className="text-neutral-500">[2026-09-24T07:11:05.410Z] SYSTEM: Zero warnings reported inside execution threads.</p>
            )}
            <p className="text-neutral-600">[2026-09-24T07:11:05.500Z] HEARTBEAT OK. PING LATENCY MEASURED AT {selectedProject.responseTime}ms.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Project Environments</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Directly trace multiple live environments from one visual interface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="p-6 rounded-2xl bg-neutral-900/10 border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
                  {proj.environment}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-mono truncate mb-4">{proj.url}</p>
            </div>
            
            <button 
              onClick={() => navigate(`/dashboard/projects/${proj.id}`)}
              className="w-full py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold cursor-pointer transition-all"
            >
              Analyze Telemetry Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. MONITORING PAGE
// ==========================================
export function DashboardMonitoringPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Live Monitoring Streams</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Measure continuous connection requests, socket loops, and runtime heartbeats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Socket Connections', val: '4,210', desc: 'Active web socket pipelines', icon: Activity },
          { label: 'Trace Queue Size', val: '0 incidents', desc: 'Synchronized message payloads', icon: CheckCircle },
          { label: 'Average Ping Region', val: '22 Regions', desc: 'Simultaneous edge ping targets', icon: Globe }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900">
              <Icon className="w-5 h-5 text-indigo-400 mb-3" />
              <h4 className="text-xs font-mono text-neutral-500 uppercase">{item.label}</h4>
              <span className="text-xl font-bold text-white block mt-1">{item.val}</span>
              <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. PERFORMANCE PAGE
// ==========================================
export function DashboardPerformancePage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Performance Insights</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Detailed metrics covering TTFB, DNS resolution speed, and server response indexes.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Speed Index Correlation Breakdown</h3>
        <p className="text-xs text-neutral-400">Detailed traces across international hosting environments.</p>
        
        <div className="space-y-4 pt-2">
          {[
            { region: 'us-east-1 (N. Virginia)', speed: '42ms', load: 'Excellent' },
            { region: 'ap-northeast-1 (Tokyo)', speed: '128ms', load: 'Good' },
            { region: 'eu-west-1 (Ireland)', speed: '84ms', load: 'Excellent' },
            { region: 'sa-east-1 (São Paulo)', speed: '210ms', load: 'Fair' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono border-b border-neutral-900/50 pb-2">
              <span className="text-neutral-400">{item.region}</span>
              <div className="flex items-center gap-3">
                <span className="text-indigo-400 font-bold">{item.speed}</span>
                <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px]">{item.load}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ERRORS PAGE
// ==========================================
export function DashboardErrorsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Incident Traces & Logs</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Comprehensive audit trail of exceptions and runtime errors.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950 font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="p-3">Error Exception</th>
                <th className="p-3">Endpoint Route</th>
                <th className="p-3">Count</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-sans">
              {[
                { err: 'Database query timeout', route: '/api/orders', count: 143, severity: 'CRITICAL', status: 'Active' },
                { err: 'JWT Verification failure', route: '/auth/verify', count: 28, severity: 'HIGH', status: 'Investigating' },
                { err: 'Failed to ingest trace webhook', route: '/hooks/vercel', count: 4, severity: 'LOW', status: 'Ignored' }
              ].map((item, idx) => (
                <tr key={idx} className="text-neutral-300">
                  <td className="p-3 font-semibold text-white">{item.err}</td>
                  <td className="p-3 font-mono text-indigo-400">{item.route}</td>
                  <td className="p-3 font-mono">{item.count}</td>
                  <td className="p-3 font-mono text-red-400 font-bold">{item.severity}</td>
                  <td className="p-3 text-neutral-500">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SECURITY PAGE
// ==========================================
export function DashboardSecurityPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Security Hardening & Audits</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Automatic verification parameters covering SSL certificates, key exchanges, and OWASP vulns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Security Headers Audit
          </h3>
          <div className="space-y-3 pt-2 text-xs font-mono">
            {[
              { header: 'Strict-Transport-Security (HSTS)', status: 'Active', color: 'text-emerald-400' },
              { header: 'Content-Security-Policy (CSP)', status: 'Active', color: 'text-emerald-400' },
              { header: 'X-Content-Type-Options', status: 'Active', color: 'text-emerald-400' },
              { header: 'CORS Configuration keys', status: 'Warning', color: 'text-amber-400' }
            ].map((hdr, idx) => (
              <div key={idx} className="flex justify-between items-center pb-2 border-b border-neutral-900/50">
                <span className="text-neutral-400">{hdr.header}</span>
                <span className={`font-bold ${hdr.color}`}>{hdr.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
          <h3 className="text-sm font-bold text-white">TLS/SSL Encryption Certificate Details</h3>
          <div className="space-y-3 text-xs text-neutral-400 font-sans">
            <p>Your root certificates are being tracked automatically across 22 edge nodes.</p>
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-900 space-y-1.5 font-mono text-[11px]">
              <p className="text-white">ENCRYPTION TYPE: TLS 1.3 / ECDHE_RSA_AES_256</p>
              <p>ISSUER: Let's Encrypt Authority X3</p>
              <p>REMAINING LIFE: 82 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. RADAR PAGE
// ==========================================
export function DashboardRadarPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Concentric Application Radar</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Visualize critical application performance scores relative to established baseline telemetry parameters.</p>
      </div>

      <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 flex flex-col items-center justify-center space-y-6 min-h-80">
        <div className="relative w-48 h-48 rounded-full border border-neutral-900 flex items-center justify-center animate-spin [animation-duration:15s] select-none">
          {/* Simulated radar sweep lines */}
          <div className="absolute inset-2 rounded-full border border-neutral-900/60" />
          <div className="absolute inset-8 rounded-full border border-neutral-900/40" />
          <div className="absolute inset-16 rounded-full border border-neutral-900/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-indigo-500/30 origin-bottom" />
        </div>

        <div className="max-w-md text-center space-y-1.5">
          <h3 className="text-sm font-bold text-white">Radar Tracking In Progress</h3>
          <p className="text-xs text-neutral-400">MeshPilot is tracking speed metrics, SEO indexing, and SSL keys continually from edge servers.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. AI DIAGNOSTICS PAGE
// ==========================================
export function DashboardAIDiagnosticsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">AI Diagnostics & Recommendations</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Intelligent investigation and regression diagnostics parsed from application trace loops.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Telemetry Recommendation Summary</h3>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          MeshPilot automatically tracks anomalies inside deployment branches to pinpoint slow transactions. No manual logs configuration required.
        </p>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 text-xs font-mono text-neutral-300 space-y-2">
          <p className="text-indigo-400 font-bold">● RECENT LOG SUMMARY [Trace #418]</p>
          <p>Endpoint: /api/orders</p>
          <p>Anomaly Detected: Database query execution latency increased by 38%</p>
          <p>Possible fix: Ensure indices are initialized on orders foreign-keys to prevent pg_locks.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. DEPLOYMENTS PAGE
// ==========================================
export function DashboardDeploymentsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Release Deployments</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Track code builds and synchronized tracing deployment states.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10">
        <div className="space-y-4">
          {[
            { commit: 'Adjust foreign-keys indexing parameters', hash: 'fc92b45', env: 'Production', time: '12 mins ago', status: 'Active' },
            { commit: 'Sync security header keys', hash: 'ac7182b', env: 'Production', time: '2 hours ago', status: 'Succeeded' },
            { commit: 'Initialize dev trace pipeline hooks', hash: 'bf912a4', env: 'Development', time: 'Yesterday', status: 'Succeeded' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs border-b border-neutral-900/50 pb-3 font-mono">
              <div>
                <span className="text-white font-bold block font-sans">{item.commit}</span>
                <span className="text-neutral-500 mt-1 block">commit: {item.hash} // {item.env}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 block font-bold">{item.status}</span>
                <span className="text-neutral-500 mt-1 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. REPORTS PAGE
// ==========================================
export function DashboardReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Performance Reports</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Review weekly and monthly performance indicators parsed for engineering managers.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Downloadable Telemetry Logs</h3>
        <p className="text-xs text-neutral-400">Export high-density performance indexes as standard reports in 1-click.</p>

        <div className="pt-2">
          <button 
            onClick={() => alert('Dispatched weekly telemetry logs compilation download!')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all"
          >
            Export Weekly SLA Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. INTEGRATIONS PAGE
// ==========================================
export function DashboardIntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Active Integrations</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Wire trace telemetry directly into external developer environments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'GitHub Integration', desc: 'Sync commit diff regressions automatically', active: true },
          { name: 'Vercel API Logs', desc: 'Auto-track serverless execution indexes', active: true },
          { name: 'Supabase Postgres', desc: 'Database locking latency telemetry', active: true }
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-2">● Active Integration</span>
              <h4 className="text-sm font-bold text-white">{item.name}</h4>
              <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-500">PROVIDER</span>
              <span className="text-neutral-300">OAuth Secured</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
