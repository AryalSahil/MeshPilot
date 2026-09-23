import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, AlertTriangle, Cpu, Terminal, GitBranch, Play, 
  ArrowUpRight, Settings, CheckCircle2, Circle, Clock, Layers, Flame, ArrowRight, Gauge, Lock, Globe 
} from 'lucide-react';

interface Deployment {
  id: string;
  commit: string;
  author: string;
  branch: string;
  time: string;
  status: 'success' | 'running' | 'failed';
  environment: string;
}

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<'vitals' | 'deployments' | 'logs'>('vitals');
  const [healthScore, setHealthScore] = useState(99.8);
  const [uptime, setUptime] = useState(99.99);
  const [activeErrors, setActiveErrors] = useState(2);
  const [vitals, setVitals] = useState({
    ttfb: 112,
    fcp: 0.8,
    lcp: 1.4,
    cls: 0.01,
    traffic: 1240
  });

  const [deployments, setDeployments] = useState<Deployment[]>([
    { id: 'dep-1', commit: '8d4f2b1', author: 'Alex Chen', branch: 'main', time: '12 mins ago', status: 'success', environment: 'Production' },
    { id: 'dep-2', commit: 'fa483d2', author: 'Sarah Jenkins', branch: 'feat/auth', time: '1 hr ago', status: 'success', environment: 'Preview' },
    { id: 'dep-3', commit: '9002dd9', author: 'Alex Chen', branch: 'main', time: '4 hrs ago', status: 'success', environment: 'Production' },
    { id: 'dep-4', commit: 'cc28aa1', author: 'System Sync', branch: 'cron/reports', time: '12 hrs ago', status: 'success', environment: 'Production' }
  ]);

  const [activeDeployment, setActiveDeployment] = useState<Deployment>(deployments[0]);

  // Periodic visual telemetry noise
  useEffect(() => {
    const timer = setInterval(() => {
      setVitals(prev => {
        const deltaT = Math.floor((Math.random() - 0.5) * 6);
        const deltaTraffic = Math.floor((Math.random() - 0.5) * 40);
        return {
          ...prev,
          ttfb: Math.max(80, Math.min(250, prev.ttfb + deltaT)),
          traffic: Math.max(1100, Math.min(1500, prev.traffic + deltaTraffic))
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleTriggerBuild = () => {
    const newDepId = `dep-${Date.now()}`;
    const newCommit = Math.random().toString(16).substring(2, 9);
    
    // Add running deployment
    const newDep: Deployment = {
      id: newDepId,
      commit: newCommit,
      author: 'You (Sandbox)',
      branch: 'main',
      time: 'Just now',
      status: 'running',
      environment: 'Production'
    };

    setDeployments(prev => [newDep, ...prev]);
    setActiveDeployment(newDep);
    setActiveTab('deployments');

    // Simulate completion
    setTimeout(() => {
      setDeployments(prev => prev.map(dep => {
        if (dep.id === newDepId) {
          return { ...dep, status: 'success', time: 'Completed' };
        }
        return dep;
      }));
      // Boost health score to 100% upon successful patch deployment
      setHealthScore(100.0);
    }, 4000);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 relative">
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Application Bar */}
      <div className="px-6 py-4 border-b border-neutral-900 bg-neutral-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              meshpilot-ecommerce-store.vercel.app
            </span>
          </div>
        </div>

        {/* Action center buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={handleTriggerBuild}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-950/50"
          >
            <Play className="w-3 h-3" />
            Trigger Dry Run
          </button>
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800/80">
            <button 
              onClick={() => setActiveTab('vitals')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${activeTab === 'vitals' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Vitals
            </button>
            <button 
              onClick={() => setActiveTab('deployments')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${activeTab === 'deployments' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Deployments
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Panel - Four Columns grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-900 border-b border-neutral-900 font-mono">
        <div className="bg-neutral-950/80 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">APPLICATION_HEALTH</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">OPTIMAL</span>
          </div>
          <div className="text-2xl font-display font-semibold text-white tracking-tight tabular-nums">
            {healthScore}%
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>0 Fatal Errors Active</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">UPTIME_30_DAYS</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">99.99% SLA</span>
          </div>
          <div className="text-2xl font-display font-semibold text-white tracking-tight tabular-nums">
            {uptime}%
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Last incidence: None</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">ACTIVE_EXCEPTIONS</span>
            {activeErrors > 0 ? (
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded">WARNINGS</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">CLEAN</span>
            )}
          </div>
          <div className="text-2xl font-display font-semibold text-white tracking-tight tabular-nums">
            {activeErrors}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
            <AlertTriangle className={`w-3 h-3 ${activeErrors > 0 ? 'text-amber-400' : 'text-neutral-400'}`} />
            <button 
              onClick={() => setActiveErrors(0)}
              className="hover:underline text-indigo-400 text-left font-mono text-[10px] uppercase font-medium cursor-pointer"
            >
              {activeErrors > 0 ? 'Clear warnings' : 'All traces resolved'}
            </button>
          </div>
        </div>

        <div className="bg-neutral-950/80 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">SECURITY_INTEGRITY</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">SECURE</span>
          </div>
          <div className="text-2xl font-display font-semibold text-white tracking-tight tabular-nums">
            A+ Grade
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>OWASP scan complete</span>
          </div>
        </div>
      </div>

      {/* Main Interactive tab content */}
      <div className="bg-neutral-950 p-6">
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Web Vitals card */}
            <div className="md:col-span-2 bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 relative overflow-hidden">
              <h5 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                <span>Real-Time Latency & Network Vitals</span>
                <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">LIVE_TELEMETRY</span>
              </h5>
              
              {/* Visual simulated graph */}
              <div className="h-32 flex items-end gap-1.5 border-b border-neutral-800 pb-2 relative mb-4">
                <div className="absolute top-2 left-0 text-[9px] font-mono text-neutral-600">Avg 120ms Threshold</div>
                <div className="absolute bottom-1/2 w-full border-t border-dashed border-indigo-500/20" />
                
                {/* Visual bar values */}
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/3" title="12:00"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-2/5" title="12:10"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/2" title="12:20"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/3" title="12:30"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-3/5" title="12:40"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/4" title="12:50"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/3" title="13:00"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-2/5" title="13:10"></div>
                <div className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full h-1/2" title="13:20"></div>
                <div className="bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-t w-full h-3/4 animate-pulse" title="Current: Peak load"></div>
              </div>

              {/* Metric values bar */}
              <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block mb-0.5">TTFB</span>
                  <span className="text-white font-semibold tabular-nums">{vitals.ttfb}ms</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">LCP</span>
                  <span className="text-emerald-400 font-semibold tabular-nums">{vitals.lcp}s</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">EST_TRAFFIC</span>
                  <span className="text-white font-semibold tabular-nums">{vitals.traffic} req/m</span>
                </div>
              </div>
            </div>

            {/* Smart AI recommendations block */}
            <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-mono text-indigo-400 font-bold tracking-wider mb-3 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  AI Recommendations
                </h5>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  MeshPilot AI detected {activeErrors > 0 ? 'an unindexed column pattern' : 'no anomalous activity'}.
                </p>

                {activeErrors > 0 ? (
                  <div className="p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/10 text-[11px] space-y-1.5 text-indigo-300">
                    <p className="font-semibold">Optimize DB Indices</p>
                    <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                      GET /api/v1/profile is causing sequential scans. Applying an index is recommended.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/10 text-[11px] space-y-1 text-emerald-400">
                    <p className="font-semibold">System Fully Normalized</p>
                    <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                      All systems green. Node caches fully warmed. Edge network response normal.
                    </p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => alert('Simulating AI analysis dashboard redirection')}
                className="mt-4 w-full flex items-center justify-between text-left p-2 rounded-lg bg-neutral-950 hover:bg-neutral-900 transition-all text-xs text-neutral-300 hover:text-white border border-neutral-800/60 cursor-pointer"
              >
                <span>Full Diagnostics Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Deployments list */}
            <div className="md:col-span-5 space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {deployments.map(dep => {
                const isSelected = activeDeployment.id === dep.id;
                return (
                  <button
                    key={dep.id}
                    onClick={() => setActiveDeployment(dep)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-neutral-900/90 border-indigo-500/40 shadow-md' 
                        : 'bg-neutral-950/50 border-neutral-900/60 hover:bg-neutral-900/40 hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <GitBranch className={`w-3.5 h-3.5 ${dep.status === 'running' ? 'text-indigo-400 animate-spin-slow' : 'text-neutral-500'}`} />
                      <div>
                        <div className="text-xs font-mono text-white flex items-center gap-1.5">
                          <span>commit {dep.commit}</span>
                          {dep.status === 'running' && (
                            <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.2 rounded uppercase animate-pulse">BUILDING</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{dep.branch} · {dep.time}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{dep.environment}</span>
                  </button>
                );
              })}
            </div>

            {/* Build Log detail panel */}
            <div className="md:col-span-7 bg-neutral-900/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">ACTIVE_BUILD_INTEGRITY</span>
                    <h6 className="text-sm font-semibold text-white mt-0.5">Commit: {activeDeployment.commit}</h6>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium border ${
                    activeDeployment.status === 'success' 
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20' 
                      : 'bg-indigo-950/60 text-indigo-400 border-indigo-500/20 animate-pulse'
                  }`}>
                    {activeDeployment.status === 'success' ? 'DEPLOYED_OK' : 'BUILDING...'}
                  </span>
                </div>

                <div className="font-mono text-[11px] leading-relaxed text-neutral-400 space-y-1">
                  <p><span className="text-neutral-600">[info]</span> Installing platform bundles from dependencies...</p>
                  <p><span className="text-neutral-600">[info]</span> Running pre-build static TypeScript audit...</p>
                  <p><span className="text-neutral-600">[info]</span> Minifying code chunks with esbuild optimizer...</p>
                  {activeDeployment.status === 'success' ? (
                    <p className="text-emerald-400"><span className="text-neutral-600">[success]</span> Deploy chunk hash matches origin block. Site online.</p>
                  ) : (
                    <p className="text-indigo-400 animate-pulse"><span className="text-neutral-600">[wait]</span> Pushing bundle segments to Vercel/Railway cluster...</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-3 border-t border-neutral-800/80">
                <span>By {activeDeployment.author}</span>
                <span className="hover:underline hover:text-white cursor-pointer" onClick={() => alert('Viewing detailed deployment manifest.')}>
                  View Manifest JSON
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
