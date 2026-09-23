import React, { useState, useEffect } from 'react';
import { Globe, Clock, CheckCircle2, AlertTriangle, ArrowRight, Shield, Activity, RefreshCw, Signal, HelpCircle } from 'lucide-react';
import { Link } from '../components/Router';

interface Incident {
  id: string;
  endpoint: string;
  type: string;
  duration: string;
  date: string;
  status: 'resolved' | 'investigating';
}

export default function UptimeMonitorPage({ onStartMonitoring }: { onStartMonitoring: () => void }) {
  const [intervalSecs, setIntervalSecs] = useState<number>(30);
  const [activeRegion, setActiveRegion] = useState<string>('global');
  const [activeTab, setActiveTab] = useState<'all' | 'resolved' | 'investigating'>('all');
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [chartData, setChartData] = useState<number[]>([120, 115, 118, 125, 110, 105, 130, 120, 112, 115, 122, 118, 120, 109, 114, 118]);

  const [incidents, setIncidents] = useState<Incident[]>([
    { id: 'inc-1', endpoint: 'POST /api/v1/checkout', type: '502 Bad Gateway', duration: '4 min 12s', date: 'March 14, 2026', status: 'resolved' },
    { id: 'inc-2', endpoint: 'GET /api/v1/profile', type: 'High Latency Warning', duration: '18 min 4s', date: 'March 10, 2026', status: 'resolved' },
    { id: 'inc-3', endpoint: 'POST /api/v1/auth/session', type: 'Connection Reset', duration: '2 min 40s', date: 'March 02, 2026', status: 'resolved' }
  ]);

  const regions = [
    { id: 'global', name: 'Global Average', latency: '116ms' },
    { id: 'us-east', name: 'N. Virginia (US-East)', latency: '42ms' },
    { id: 'eu-west', name: 'Frankfurt (EU-West)', latency: '88ms' },
    { id: 'ap-east', name: 'Singapore (AP-East)', latency: '174ms' },
    { id: 'jp-east', name: 'Tokyo (JP-East)', latency: '162ms' }
  ];

  // Fluctuating response chart
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const next = [...prev.slice(1)];
        const base = activeRegion === 'us-east' ? 40 : activeRegion === 'eu-west' ? 88 : activeRegion === 'ap-east' ? 170 : activeRegion === 'jp-east' ? 160 : 115;
        const jitter = (Math.random() - 0.5) * (intervalSecs === 10 ? 4 : 12);
        next.push(Math.round(base + jitter));
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRegion, intervalSecs]);

  const handleTriggerAlert = () => {
    setAlertTriggered(true);
    setTimeout(() => {
      setAlertTriggered(false);
    }, 4500);
  };

  const filteredIncidents = incidents.filter(inc => {
    if (activeTab === 'all') return true;
    return inc.status === activeTab;
  });

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span>Features</span>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">Uptime Monitor</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            Zero-Latency Global Availability Auditing.
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            Monitor endpoint reachability, HTTP response headers, and core CDN latency from 22 globally distributed edge nodes. Catch SLA breaches before they impact your client sessions.
          </p>
        </div>

        {/* Key availability metrics grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card rounded-2xl p-5 bg-neutral-900/10 font-mono">
            <span className="text-xs text-neutral-500 block mb-1">GLOBAL_AVAILABILITY</span>
            <div className="text-3xl font-display font-bold text-white tracking-tight">99.982%</div>
            <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Normal operations verified</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-neutral-900/10 font-mono">
            <span className="text-xs text-neutral-500 block mb-1">AVG_RESPONSE_TIME</span>
            <div className="text-3xl font-display font-bold text-indigo-400 tracking-tight">116ms</div>
            <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Calculated across 22 edge nodes</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-neutral-900/10 font-mono">
            <span className="text-xs text-neutral-500 block mb-1">INCIDENTS_RESOLVED</span>
            <div className="text-3xl font-display font-bold text-white tracking-tight">14 / 14</div>
            <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span>SLA within safe parameters</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-neutral-900/10 font-mono">
            <span className="text-xs text-neutral-500 block mb-1">LAST_VERIFICATION</span>
            <div className="text-3xl font-display font-bold text-white tracking-tight">3.1s ago</div>
            <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-neutral-400 animate-spin-slow" />
              <span>Continuously sweeping</span>
            </p>
          </div>
        </div>

        {/* Realistic Dashboard Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Main Monitor Details Panel (7 cols) */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 bg-neutral-900/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5 mb-5">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">LIVE_VISUALIZER</span>
                <h3 className="text-lg font-semibold text-white font-display">Regional Latency & Status Graphs</h3>
              </div>

              {/* Intervals Selection Buttons */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-900 font-mono text-[10px]">
                <button
                  onClick={() => setIntervalSecs(30)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${intervalSecs === 30 ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  30s Sweeps
                </button>
                <button
                  onClick={() => setIntervalSecs(10)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${intervalSecs === 10 ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  10s Sweeps
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
                </button>
              </div>
            </div>

            {/* Simulated Edge Latency Graphic Area */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {regions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRegion(r.id)}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs cursor-pointer transition-all ${
                      activeRegion === r.id 
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300' 
                        : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {r.name} ({r.latency})
                  </button>
                ))}
              </div>

              {/* Response graph canvas mock */}
              <div className="h-44 bg-neutral-950 rounded-2xl border border-neutral-900 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>STREAMING</span>
                </div>
                
                {/* Latency markers */}
                <div className="absolute top-4 left-4 text-[9px] font-mono text-neutral-600">300ms SLA Limit</div>
                <div className="absolute bottom-12 left-4 text-[9px] font-mono text-neutral-600">Base speed</div>
                
                {/* Horizontal reference lines */}
                <div className="absolute top-8 left-0 w-full border-t border-dashed border-rose-500/10" />
                <div className="absolute bottom-16 left-0 w-full border-t border-dashed border-neutral-900" />

                {/* Vertical interactive grid bars */}
                <div className="flex items-end gap-1 px-4 h-28 border-b border-neutral-900 pb-2 flex-1">
                  {chartData.map((val, idx) => {
                    const heightPercent = Math.min(100, Math.max(10, (val / 300) * 100));
                    return (
                      <div 
                        key={idx}
                        className="bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t w-full"
                        style={{ height: `${heightPercent}%` }}
                        title={`${val}ms latency`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-2 mt-2">
                  <span>Past 30 iterations</span>
                  <span className="tabular-nums">Interval: {intervalSecs}s</span>
                </div>
              </div>
            </div>

            {/* Continuous Uptime History Bar grid */}
            <div className="space-y-2 border-t border-neutral-900 pt-6">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5 text-indigo-400" />
                  Uptime History (Past 30 Days)
                </span>
                <span>Availability: 99.98%</span>
              </div>
              
              {/* Vertical uptime slices representation */}
              <div className="flex gap-[2px] h-6 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
                {Array.from({ length: 60 }).map((_, i) => {
                  const isGap = i === 14 || i === 42; // Simulated small outages
                  const color = isGap ? 'bg-amber-500/80 hover:bg-amber-400' : 'bg-emerald-500/80 hover:bg-emerald-400';
                  const label = isGap ? 'Latency drop or 502 warning' : '100% active availability';
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm ${color} transition-colors cursor-help`}
                      title={`Day ${30 - Math.floor(i/2)}: ${label}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>30 days ago</span>
                <span>Today (Operational)</span>
              </div>
            </div>

          </div>

          {/* Incidents & Alerts side pane (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Alert Simulator console */}
            <div className="glass-card rounded-2xl p-5 bg-neutral-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/5 rounded-full blur-xl pointer-events-none" />
              
              <h4 className="text-sm font-semibold text-white font-display flex items-center gap-2 mb-3">
                <Signal className="w-4 h-4 text-rose-400" />
                Slack Alerting Gateway
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-sans">
                MeshPilot instantly delivers high-density diagnostic alerts directly into your Slack or Discord developer channels.
              </p>

              <button
                onClick={handleTriggerAlert}
                disabled={alertTriggered}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold tracking-wide border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {alertTriggered ? 'Delivering Webhook...' : 'Simulate Slack Webhook Incident'}
              </button>

              {/* Slack simulated notification box pop-in */}
              {alertTriggered && (
                <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-neutral-950 font-sans text-xs space-y-2 animate-fade-in-up">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>[SLACK_WEBHOOK] CRITICAL_INCIDENT</span>
                  </div>
                  <p className="font-semibold text-white">502 Bad Gateway detected on primary checkout route</p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Triggered from <span className="text-indigo-400">Frankfurt-Node</span>. Server returned 502 during database connection exhaustion.
                  </p>
                  <div className="flex gap-2 font-mono text-[9px] pt-1 border-t border-neutral-900 text-neutral-500">
                    <span>Severity: Severe</span>
                    <span>·</span>
                    <span>Incident Code: E_PG_CON_602</span>
                  </div>
                </div>
              )}
            </div>

            {/* Incident History filter list */}
            <div className="glass-card rounded-2xl p-5 bg-neutral-900/20">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h4 className="text-xs font-mono text-neutral-400 uppercase">Recent Outage Incidents</h4>
                <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-900 font-mono text-[9px]">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-2 py-1 rounded cursor-pointer ${activeTab === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveTab('resolved')}
                    className={`px-2 py-1 rounded cursor-pointer ${activeTab === 'resolved' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredIncidents.map(inc => (
                  <div key={inc.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-900/80 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{inc.endpoint}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-1.5 py-0.2 rounded font-bold">RESOLVED</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 flex justify-between">
                      <span>Outage: {inc.type}</span>
                      <span>{inc.duration}</span>
                    </div>
                    <div className="text-[9px] text-neutral-500">{inc.date}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Start Monitoring Callout Panel */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-[90px] pointer-events-none" />
          <h3 className="text-2xl font-display font-semibold text-white mb-3">Begin Continuous Availability Sweeps</h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Plug in your production URLs and immediately verify uptime SLA trends. Establish alert channels to notify engineers before user metrics decline.
          </p>
          <button
            onClick={onStartMonitoring}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 hover:translate-y-[-1px] cursor-pointer"
          >
            Start Monitoring Now
          </button>
        </div>

      </div>
    </div>
  );
}
