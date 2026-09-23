import React, { useState, useEffect } from 'react';
import { Gauge, Cpu, CheckCircle2, ArrowRight, Zap, RefreshCw, AlertTriangle, Play, HelpCircle, Activity, Globe } from 'lucide-react';
import { Link } from '../components/Router';

interface SlowEndpoint {
  route: string;
  avgLatency: string;
  callsPerMin: string;
  dbQueries: number;
  status: 'healthy' | 'degraded';
}

export default function PerformancePage({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  const [activeVital, setActiveVital] = useState<'ttfb' | 'fcp' | 'lcp' | 'cls'>('ttfb');
  const [activeEndpoint, setActiveEndpoint] = useState<SlowEndpoint | null>(null);
  const [loadingTrace, setLoadingTrace] = useState(false);

  const endpoints: SlowEndpoint[] = [
    { route: 'GET /api/v1/profile', avgLatency: '1,240ms', callsPerMin: '420', dbQueries: 14, status: 'degraded' },
    { route: 'POST /api/v1/checkout', avgLatency: '94ms', callsPerMin: '120', dbQueries: 3, status: 'healthy' },
    { route: 'GET /api/v1/products/list', avgLatency: '340ms', callsPerMin: '1,850', dbQueries: 5, status: 'healthy' },
    { route: 'GET /api/v1/auth/session', avgLatency: '45ms', callsPerMin: '3,400', dbQueries: 1, status: 'healthy' }
  ];

  const vitalsInfo = {
    ttfb: { name: 'Time to First Byte', score: 92, details: 'Measures network latency and backend server response delay. Target baseline is under 200ms.', status: 'green' },
    fcp: { name: 'First Contentful Paint', score: 98, details: 'Measures browser rendering speed of primary DOM nodes. Fully optimized via edge asset compression.', status: 'green' },
    lcp: { name: 'Largest Contentful Paint', score: 94, details: 'Measures loading performance of core media or layout containers. Under 2.5s is verified.', status: 'green' },
    cls: { name: 'Cumulative Layout Shift', score: 99, details: 'Measures visual stability of page containers during load. Perfect score achieved.', status: 'green' }
  };

  const handleInspectEndpoint = (ep: SlowEndpoint) => {
    setActiveEndpoint(ep);
    setLoadingTrace(true);
    setTimeout(() => {
      setLoadingTrace(false);
    }, 800);
  };

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span>Features</span>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">Performance</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            Deep Performance Telemetry.
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            Inspect Core Web Vitals, API gateway response timings, script parsing speeds, and backend database lockups. Trace execution speeds down to the exact function call.
          </p>
        </div>

        {/* Core Web Vitals interactive analyzer grid */}
        <div className="glass-card rounded-2xl p-6 bg-neutral-900/20 mb-12">
          <div className="border-b border-neutral-900 pb-5 mb-6">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">PERFORMANCE_VITALITY</span>
            <h3 className="text-lg font-semibold text-white font-display mt-0.5">Core Web Vitals Metric Analyzer</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(vitalsInfo).map(([key, value]) => {
              const isSelected = activeVital === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveVital(key as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-neutral-900/95 border-indigo-500/40 shadow-md' 
                      : 'bg-neutral-950 border-neutral-900/60 hover:bg-neutral-900/50 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-neutral-400 uppercase">{key}</span>
                    <span className="text-emerald-400 font-bold">{value.score}% Score</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white font-sans">{value.name}</h4>
                </button>
              );
            })}
          </div>

          {/* Metric Detail Card */}
          <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-900/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">{activeVital.toUpperCase()} DETAILS</span>
              <p className="text-sm text-neutral-200 font-semibold">{vitalsInfo[activeVital].name}</p>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                {vitalsInfo[activeVital].details}
              </p>
            </div>
            <div className="md:col-span-4 bg-neutral-900/40 p-4 rounded-xl border border-neutral-900/60 flex flex-col justify-between font-mono text-xs h-24">
              <div className="flex items-center justify-between text-neutral-500">
                <span>VERIFY_STATUS</span>
                <span className="text-emerald-400 font-semibold">PASS // OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span>HEALTHY_SLA</span>
                <span className="font-bold">99.8% Green</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time endpoint list & Trace Breakdown (cols 8-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Endpoint slow requests table (8 cols) */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 bg-neutral-900/20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-900">
              <h4 className="text-xs font-mono text-neutral-400 uppercase">Upstream API Request Latency</h4>
              <span className="text-[10px] font-mono text-neutral-500">SORT_BY_SLOWEST</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-900 pb-2">
                    <th className="py-2.5 font-normal">ROUTE</th>
                    <th className="py-2.5 font-normal text-right">AVG_LATENCY</th>
                    <th className="py-2.5 font-normal text-right">CALLS_MIN</th>
                    <th className="py-2.5 font-normal text-right">DB_QUERIES</th>
                    <th className="py-2.5 font-normal text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {endpoints.map((ep, idx) => {
                    const isDegraded = ep.status === 'degraded';
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-neutral-900/30 transition-colors ${activeEndpoint?.route === ep.route ? 'bg-neutral-900/50' : ''}`}
                      >
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isDegraded ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className="text-white font-medium">{ep.route}</span>
                          </div>
                        </td>
                        <td className={`py-3.5 text-right tabular-nums font-semibold ${isDegraded ? 'text-amber-400' : 'text-neutral-300'}`}>
                          {ep.avgLatency}
                        </td>
                        <td className="py-3.5 text-right text-neutral-400 tabular-nums">{ep.callsPerMin}</td>
                        <td className="py-3.5 text-right text-neutral-400 tabular-nums">{ep.dbQueries} queries</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleInspectEndpoint(ep)}
                            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-indigo-600/20 hover:text-indigo-400 border border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                          >
                            Trace
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive trace breakdown sidebar (4 cols) */}
          <div className="lg:col-span-4">
            {activeEndpoint ? (
              <div className="glass-card rounded-2xl p-5 bg-neutral-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                  <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">TRACE_ANALYST</span>
                  <button 
                    onClick={() => setActiveEndpoint(null)}
                    className="text-neutral-500 hover:text-white font-mono text-[10px]"
                  >
                    Clear
                  </button>
                </div>

                {loadingTrace ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center font-mono text-xs text-neutral-500 gap-3">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span>Ingesting telemetry dataset...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white font-display mb-1">{activeEndpoint.route}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">Telemetry details inside 5-minute sampling window.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 text-xs font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-900">
                      <div>
                        <span className="text-neutral-500 text-[10px] block">AVG_TIME</span>
                        <span className={`font-semibold ${activeEndpoint.status === 'degraded' ? 'text-amber-400' : 'text-neutral-200'}`}>
                          {activeEndpoint.avgLatency}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px] block">STATUS</span>
                        <span className={`font-semibold ${activeEndpoint.status === 'degraded' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {activeEndpoint.status === 'degraded' ? 'DEGRADED' : 'HEALTHY'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px] font-mono text-neutral-400 pt-3 border-t border-neutral-900/60">
                      <p className="font-semibold text-white mb-2 uppercase text-[10px]">Trace Execution blocks</p>
                      <div className="flex justify-between p-1.5 rounded bg-neutral-950">
                        <span>TCP connection pool</span>
                        <span className="text-neutral-500">12ms</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-neutral-950">
                        <span>Middleware auth sweep</span>
                        <span className="text-neutral-500">14ms</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-neutral-950">
                        <span>PostgreSQL query wait</span>
                        <span className={activeEndpoint.status === 'degraded' ? 'text-amber-400 font-semibold' : 'text-neutral-500'}>
                          {activeEndpoint.status === 'degraded' ? '1,120ms' : '45ms'}
                        </span>
                      </div>
                    </div>

                    {activeEndpoint.status === 'degraded' && (
                      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/15 text-[11px] text-indigo-300">
                        <p className="font-semibold">Suggested Optimizations</p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-sans leading-relaxed">
                          This route triggers database sequential scans. Create an index on the filtered fields to restore &lt;100ms speeds.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 bg-neutral-900/20 text-center py-16 text-neutral-500 flex flex-col items-center justify-center">
                <Gauge className="w-8 h-8 text-neutral-700 mb-2 animate-bounce-slow" />
                <p className="text-xs leading-relaxed font-sans">
                  Select any API endpoint from the request telemetry table to trace execution latencies down to the exact database queries.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Start Analysis CTA Box */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-[90px] pointer-events-none" />
          <h3 className="text-2xl font-display font-semibold text-white mb-3">Begin Deep Telemetry Tracking</h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Monitor transaction locks, memory leak warnings, and layout shift parameters in continuous telemetry streams. All with under 1.4KB edge overhead.
          </p>
          <button
            onClick={onStartAnalysis}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 hover:translate-y-[-1px] cursor-pointer"
          >
            Analyze Performance Vitals
          </button>
        </div>

      </div>
    </div>
  );
}
