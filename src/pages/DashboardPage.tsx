import React, { useState } from 'react';
import { useDashboard, Project } from '../context/DashboardContext';
import { useRouter, Link } from '../components/Router';
import { 
  Layers, Shield, Activity, TrendingUp, AlertOctagon, Brain, 
  ArrowUpRight, AlertTriangle, ShieldCheck, Terminal, HelpCircle, 
  RefreshCw, CheckCircle, ExternalLink, Sparkles, Clock, Compass 
} from 'lucide-react';

export default function DashboardPage() {
  const { projects } = useDashboard();
  const { navigate } = useRouter();

  // Filter intervals for performance chart
  const [performanceInterval, setPerformanceInterval] = useState<'24h' | '7d' | '30d'>('7d');

  // Simulated chart data points depending on selected interval
  const performanceChartPoints = {
    '24h': [
      { label: '00:00', responseTime: 120, requests: 4200, errorRate: 0.1 },
      { label: '04:00', responseTime: 145, requests: 3100, errorRate: 0.2 },
      { label: '08:00', responseTime: 190, requests: 8400, errorRate: 0.8 },
      { label: '12:00', responseTime: 230, requests: 12500, errorRate: 1.2 },
      { label: '16:00', responseTime: 165, requests: 9200, errorRate: 0.4 },
      { label: '20:00', responseTime: 140, requests: 6300, errorRate: 0.1 }
    ],
    '7d': [
      { label: 'Mon', responseTime: 164, requests: 48000, errorRate: 0.4 },
      { label: 'Tue', responseTime: 182, requests: 51000, errorRate: 0.6 },
      { label: 'Wed', responseTime: 210, requests: 62000, errorRate: 0.9 },
      { label: 'Thu', responseTime: 145, requests: 49000, errorRate: 0.3 },
      { label: 'Fri', responseTime: 160, requests: 55000, errorRate: 0.2 },
      { label: 'Sat', responseTime: 125, requests: 35000, errorRate: 0.1 },
      { label: 'Sun', responseTime: 138, requests: 39000, errorRate: 0.1 }
    ],
    '30d': [
      { label: 'Week 1', responseTime: 178, requests: 320000, errorRate: 0.5 },
      { label: 'Week 2', responseTime: 195, requests: 350000, errorRate: 0.8 },
      { label: 'Week 3', responseTime: 154, requests: 340000, errorRate: 0.3 },
      { label: 'Week 4', responseTime: 142, requests: 310000, errorRate: 0.2 }
    ]
  };

  const currentChartData = performanceChartPoints[performanceInterval];

  // Overview metrics calculated based on local projects
  const totalProjects = projects.length;
  const operationalProjects = projects.filter(p => p.status === 'Operational').length;
  const avgUptime = '99.98%'; // Mock realistic standard SLA
  const avgPerformanceScore = Math.round(
    projects.reduce((acc, p) => acc + (p.responseTime > 300 ? 80 : 95), 0) / (projects.length || 1)
  );
  const totalErrors = projects.reduce((acc, p) => acc + p.errorsCount, 0);
  const avgSecurityScore = Math.round(
    projects.reduce((acc, p) => acc + (p.securityScore || 100), 0) / (projects.length || 1)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* 4. OVERVIEW METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Projects', value: totalProjects, sub: `${operationalProjects} operational`, icon: Layers },
          { label: 'Global Uptime', value: avgUptime, sub: 'Last 30 days telemetry', icon: Activity },
          { label: 'Performance', value: `${avgPerformanceScore}/100`, sub: 'Speed Index average', icon: TrendingUp },
          { label: 'Trace Errors', value: totalErrors, sub: 'Critical incidents flagged', icon: AlertOctagon },
          { label: 'Security Score', value: `${avgSecurityScore}/100`, sub: 'OWASP / SSL verified', icon: Shield }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-none">
                  {metric.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </div>
              <div className="mt-4">
                <span className="text-xl lg:text-2xl font-display font-semibold text-white">
                  {metric.value}
                </span>
                <p className="text-[10px] text-neutral-500 font-sans mt-1">{metric.sub}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: 6. PERFORMANCE CHART */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Performance Telemetry Logs
              </h3>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Response latency, total processed requests, and regressive traces.</p>
            </div>
            {/* Interval buttons */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
              {(['24h', '7d', '30d'] as const).map(interval => (
                <button
                  key={interval}
                  onClick={() => setPerformanceInterval(interval)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md uppercase transition-all cursor-pointer ${
                    performanceInterval === interval 
                      ? 'bg-neutral-900 text-white border border-neutral-800' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Responsive chart bar representing metrics */}
          <div className="relative w-full h-44 flex items-end justify-between px-2 pt-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-900/50 border-dashed" />
            <div className="absolute inset-x-0 top-1/4 h-px bg-neutral-900/30 border-dashed" />

            {currentChartData.map((pt, idx) => {
              // Normalize latency bar height (max 600ms)
              const barHeightPercent = Math.min((pt.responseTime / 600) * 100, 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative mx-1">
                  
                  {/* Floating tooltip */}
                  <div className="absolute bottom-full mb-2 bg-neutral-950 border border-neutral-900 rounded-xl p-2.5 shadow-xl hidden group-hover:block z-20 text-[10px] font-mono space-y-1 w-28 text-left pointer-events-none">
                    <p className="text-white font-bold">{pt.label}</p>
                    <p className="text-indigo-400">Response: {pt.responseTime}ms</p>
                    <p className="text-emerald-400">Reqs: {pt.requests.toLocaleString()}</p>
                    <p className="text-red-400">Errors: {pt.errorRate}%</p>
                  </div>

                  {/* Performance Bar */}
                  <div className="w-full bg-neutral-900/80 rounded-t-lg overflow-hidden h-32 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-950/40 via-indigo-600/60 to-indigo-500 rounded-t-md group-hover:brightness-125 transition-all"
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>
                  
                  <span className="text-[9px] font-mono text-neutral-500 mt-2 block">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-2 border-t border-neutral-900/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>Response Time (ms)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Average Requests processed successfully</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: 10. AI DIAGNOSTICS & RECOMMENDATIONS */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                AI DIAGNOSTIC INDEX
              </span>
              <span className="text-[9px] font-mono font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded">
                TELEMETRY ACTIVE
              </span>
            </div>

            <div className="mt-5 space-y-3.5 font-sans">
              <h4 className="text-sm font-semibold text-white leading-snug">
                API response time increased by 38%.
              </h4>
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-900 space-y-2.5">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Possible cause</span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Recent deployment affected the <code className="text-indigo-400 font-mono">/api/orders</code> database lock queries.
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Recommendation</span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Investigate the database query parameters introduced in deployment <code className="text-indigo-400 font-mono">#184</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard/ai-diagnostics')}
            className="w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/10 hover:border-indigo-500 text-indigo-400 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>View Investigation Dashboard</span>
          </button>
        </div>

      </div>

      {/* 5. APPLICATION HEALTH (PROJECT CARDS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Application Environments
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Real-time trace health, ping response latencies, and transaction error counts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="p-6 rounded-2xl bg-neutral-900/10 border border-neutral-900 hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Operational / Status tag indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    project.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <span className="text-xs font-semibold text-white">{project.name}</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900/50">
                  {project.environment.toUpperCase()}
                </span>
              </div>

              {/* URL */}
              <p className="text-[10px] font-mono text-neutral-400 truncate mb-5">{project.url}</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-neutral-900/80 pt-4 mb-5 text-xs font-sans">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Uptime</span>
                  <span className="font-semibold text-neutral-200">{project.uptime}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Response</span>
                  <span className="font-semibold text-neutral-200">{project.responseTime}ms</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Errors</span>
                  <span className={`font-semibold ${project.errorsCount > 0 ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {project.errorsCount} logs
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Security</span>
                  <span className="font-semibold text-neutral-200">{project.securityScore}/100</span>
                </div>
              </div>

              {/* View Project Action */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-900/50 pt-4">
                <span>UPDATED {project.lastDeployment.toUpperCase()}</span>
                <button
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="text-neutral-300 hover:text-white flex items-center gap-1 group-hover:text-indigo-400 transition-colors"
                >
                  <span>View Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOWER ROW GRID (ERRORS, SECURITY, COGNITIVE RADAR & RECENT ACTIVITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: 7. RECENT ERRORS */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Recent Incidents & Traces
              </h3>
              <p className="text-[10px] text-neutral-500 font-sans">Continuous database timeouts and authorization endpoint spikes.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/errors')}
              className="text-[10px] font-mono text-neutral-400 hover:text-indigo-400 transition-colors"
            >
              View All Errors
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-none border border-neutral-900 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950 font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="p-3">Error</th>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Occurrences</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-sans">
                {[
                  { error: 'Database timeout', endpoint: '/api/orders', count: 143, seen: '2 mins ago', status: 'Critical', color: 'text-red-400' },
                  { error: 'JWT Verification failure', endpoint: '/auth/verify', count: 28, seen: '12 mins ago', status: 'Warning', color: 'text-amber-400' },
                  { error: 'Rate limit trigger exceeded', endpoint: '/user/billing', count: 11, seen: '1 hour ago', status: 'Minor', color: 'text-indigo-400' }
                ].map((err, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/20 text-neutral-300">
                    <td className="p-3 font-semibold text-white">{err.error}</td>
                    <td className="p-3 font-mono text-[10px] text-indigo-400">{err.endpoint}</td>
                    <td className="p-3 font-mono">{err.count}</td>
                    <td className="p-3 text-neutral-500">{err.seen}</td>
                    <td className="p-3">
                      <span className={`font-mono text-[10px] font-bold ${err.color}`}>{err.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: 8. SECURITY BRIEF OVERVIEW */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security Hardening Brief
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans mt-0.5">TLS handshakes, open gateway rules, and CVE analysis.</p>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-900 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-neutral-500 block uppercase">SSL SECURE AVERAGE</span>
              <span className="text-xl font-bold font-display text-white">91 / 100</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-neutral-500 block uppercase">CVE THREATS</span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Zero Critical
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
            {[
              { val: 0, label: 'CRIT', color: 'text-red-500' },
              { val: 1, label: 'HIGH', color: 'text-amber-500' },
              { val: 4, label: 'MED', color: 'text-neutral-300' },
              { val: 7, label: 'LOW', color: 'text-neutral-500' }
            ].map((threat, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-neutral-900 bg-neutral-950/20">
                <span className={`text-sm font-bold block ${threat.color}`}>{threat.val}</span>
                <span className="text-[8px] text-neutral-500 block uppercase mt-0.5">{threat.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/dashboard/security')}
            className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 cursor-pointer transition-all"
          >
            View Security Logs
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: 9. APPLICATION RADAR PREVIEW */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Concentric Application Radar
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Interactive web application vitals index scoring.</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Performance', val: 94, color: 'bg-indigo-500' },
              { label: 'Security', val: 91, color: 'bg-indigo-500' },
              { label: 'Uptime SLA', val: 99, color: 'bg-emerald-500' },
              { label: 'API Gateway Health', val: 96, color: 'bg-indigo-500' },
              { label: 'Core SEO Index', val: 92, color: 'bg-indigo-500' },
              { label: 'Accessibility standard', val: 88, color: 'bg-indigo-400' }
            ].map((r, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-neutral-400">{r.label}</span>
                  <span className="text-white font-bold">{r.val}%</span>
                </div>
                <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/dashboard/radar')}
            className="w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/10 hover:border-indigo-500 text-indigo-400 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            Open Application Radar
          </button>
        </div>

        {/* RIGHT COLUMN: 11. RECENT ACTIVITY TIMELINE */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Activity Dispatch Logs
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans">Timeline correlation across pipeline releases and security scans.</p>
          </div>

          <div className="relative border-l border-neutral-900 pl-4 space-y-5 font-sans py-1 text-xs">
            {[
              { label: 'Deployment completed successfully', time: '5 minutes ago', desc: 'SaaS node code sync validated in Tokyo and San Francisco regions.', dot: 'bg-emerald-500' },
              { label: 'Deep security scan finished', time: '18 minutes ago', desc: 'Verified CORS certificates, CSRF tokens, and TLS 1.3 configuration keys.', dot: 'bg-indigo-500' },
              { label: 'Latency warning logged', time: '1 hour ago', desc: 'Spike of 512ms response latency on project Internal Dev API.', dot: 'bg-amber-500 animate-pulse' },
              { label: 'New project configured', time: 'Yesterday', desc: 'Setup active telemetry triggers for BCA Student Portal.', dot: 'bg-indigo-500' }
            ].map((act, idx) => (
              <div key={idx} className="relative group">
                {/* Node indicator dot */}
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-neutral-950 ${act.dot}`} />
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-white">{act.label}</span>
                    <span className="text-[9px] font-mono text-neutral-600 uppercase">{act.time}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-sans leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
