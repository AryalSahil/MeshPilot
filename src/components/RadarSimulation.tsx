import React, { useState, useEffect } from 'react';
import { Activity, Shield, ArrowUpRight, AlertTriangle, Search, Disc, CheckCircle2, ChevronRight, Gauge, RefreshCw } from 'lucide-react';

interface RadarNode {
  id: string;
  name: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  details: string;
  metric: string;
  angle: number; // degrees for positioning on concentric circle
  radius: number; // percentage from center
  icon: React.ComponentType<any>;
}

export default function RadarSimulation() {
  const [nodes, setNodes] = useState<RadarNode[]>([
    { id: 'perf', name: 'Performance', score: 98, status: 'healthy', details: '94ms avg response time. Core Web Vitals fully green.', metric: '94ms avg', angle: 45, radius: 75, icon: Gauge },
    { id: 'sec', name: 'Security', score: 95, status: 'healthy', details: '0 active vulnerability warnings. SSL cert expires in 120 days.', metric: 'A+ Grade', angle: 105, radius: 65, icon: Shield },
    { id: 'uptime', name: 'Uptime', score: 99.98, status: 'healthy', details: 'No downtime incidents detected in past 30 days.', metric: '99.98%', angle: 165, radius: 80, icon: Activity },
    { id: 'errors', name: 'Error Rate', score: 99.98, status: 'healthy', details: 'Error rate at 0.02%. 4xx/5xx requests within normal limits.', metric: '0.02%', angle: 220, radius: 70, icon: AlertTriangle },
    { id: 'seo', name: 'SEO Core', score: 92, status: 'healthy', details: 'All pages indexable. Canonical URL mappings verified.', metric: '92/100', angle: 280, radius: 60, icon: Search },
    { id: 'access', name: 'Accessibility', score: 96, status: 'healthy', details: 'Aria labels complete. Perfect contrast score across pages.', metric: '96/100', angle: 325, radius: 72, icon: CheckCircle2 },
    { id: 'api', name: 'API Gateway', score: 100, status: 'healthy', details: 'All 14 endpoints responding under SLA thresholds.', metric: '100% OK', angle: 0, radius: 55, icon: Disc }
  ]);

  const [selectedNode, setSelectedNode] = useState<RadarNode>(nodes[0]);
  const [isScanning, setIsScanning] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>(new Date().toLocaleTimeString());

  // Periodically refresh data and trigger a simulated radar check
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date().toLocaleTimeString());
      
      // Simulate microscopic fluctuations in metrics to make page feel live & highly authentic
      setNodes(prev => prev.map(node => {
        if (node.id === 'perf') {
          const delta = (Math.random() - 0.5) * 2;
          const val = Math.min(100, Math.max(90, Math.round(94 + delta)));
          return { ...node, score: Math.round(100 - (val / 10)), metric: `${val}ms avg` };
        }
        if (node.id === 'api') {
          return { ...node, lastUpdate: new Date().toLocaleTimeString() };
        }
        return node;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleFixNode = (id: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === id) {
        return {
          ...node,
          score: 100,
          status: 'healthy',
          details: `Trace optimized. All parameters normalized and validated.`
        };
      }
      return node;
    }));
    // Update selected view
    setTimeout(() => {
      setSelectedNode(curr => curr.id === id ? { ...curr, score: 100, status: 'healthy', details: `Trace optimized. All parameters normalized and validated.` } : curr);
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Visual Radar Core: Concentric Sweep (cols 1-7) */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="relative w-full max-w-[420px] aspect-square rounded-full border border-neutral-800/60 bg-neutral-950/40 p-4 flex items-center justify-center overflow-hidden">
          {/* Radial grid line markers */}
          <div className="absolute inset-4 rounded-full border border-neutral-900/60" />
          <div className="absolute inset-16 rounded-full border border-neutral-900/50" />
          <div className="absolute inset-28 rounded-full border border-neutral-900/40" />
          <div className="absolute inset-40 rounded-full border border-neutral-900/30" />
          
          {/* Crosshair axes */}
          <div className="absolute w-full h-[1px] bg-neutral-900/40 left-0 top-1/2" />
          <div className="absolute h-full w-[1px] bg-neutral-900/40 top-0 left-1/2" />

          {/* Radar Sweep arm */}
          {isScanning && (
            <div 
              className="absolute w-1/2 h-1/2 origin-bottom-right right-1/2 bottom-1/2 animate-sweep pointer-events-none"
              style={{
                background: 'conic-gradient(from 90deg at 100% 100%, transparent 60%, rgba(99, 102, 241, 0.15) 100%)'
              }}
            />
          )}

          {/* Core Center Pulse */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-pulse-ring" />
          </div>

          {/* Node Points on Radar */}
          {nodes.map(node => {
            // Calculate absolute x, y positions using angle & radius percentage
            const radAngle = (node.angle * Math.PI) / 180;
            const x = 50 + (node.radius / 2) * Math.cos(radAngle);
            const y = 50 + (node.radius / 2) * Math.sin(radAngle);

            const isSelected = selectedNode.id === node.id;
            const statusColor = node.status === 'healthy' 
              ? 'bg-emerald-500 shadow-emerald-500/50' 
              : node.status === 'warning' 
                ? 'bg-amber-500 shadow-amber-500/50' 
                : 'bg-rose-500 shadow-rose-500/50';

            const NodeIcon = node.icon;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute z-20 group -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-neutral-900/90 border-indigo-500/60 border scale-110 shadow-lg shadow-indigo-950/20' 
                    : 'bg-neutral-950/80 border-neutral-800 border hover:border-neutral-700 hover:scale-105'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`Inspect ${node.name}`}
              >
                <div className="relative flex items-center justify-center">
                  <NodeIcon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                  {/* Glowing Status Dot on corner of node */}
                  <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-neutral-950 ${statusColor}`} />
                </div>
              </button>
            );
          })}

          {/* Active sweeping ring decoration */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/5 animate-radar-pulse pointer-events-none" />
        </div>
        
        {/* Radar State Control bar */}
        <div className="mt-5 flex items-center gap-6 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScanning ? 'bg-indigo-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanning ? 'bg-indigo-500' : 'bg-amber-500'}`} />
            </span>
            <span>SYSTEM: {isScanning ? 'CONTINUOUS_SWEEP' : 'STANDBY'}</span>
          </div>
          <div>·</div>
          <div>LAST_PING: {lastCheck}</div>
          <div>·</div>
          <button 
            onClick={() => setIsScanning(!isScanning)} 
            className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
          >
            {isScanning ? 'PAUSE_SCAN' : 'RESUME_SCAN'}
          </button>
        </div>
      </div>

      {/* Selected Node Details Pane (cols 8-12) */}
      <div className="lg:col-span-5">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          {/* Subtle accent gradient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider font-semibold uppercase">INTELLIGENT RADAR NODE</span>
              <h4 className="text-2xl font-display font-semibold mt-1 text-white flex items-center gap-2">
                <selectedNode.icon className="w-6 h-6 text-indigo-400" />
                {selectedNode.name}
              </h4>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-neutral-400">Score Rating</div>
              <div className="text-2xl font-display font-bold text-white tracking-tight tabular-nums">
                {selectedNode.score}%
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-4 mb-4">
            <p className="text-sm text-neutral-300 leading-relaxed min-h-[48px]">
              {selectedNode.details}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-neutral-950/60 rounded-xl p-3 border border-neutral-900/80 mb-5 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block mb-0.5">CURRENT_METRIC</span>
              <span className="text-neutral-200 font-semibold tabular-nums">{selectedNode.metric}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">INTEGRITY_GRADE</span>
              <span className="text-emerald-400 font-semibold">PASS // SECURE</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleFixNode(selectedNode.id)}
              disabled={selectedNode.score === 100}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                selectedNode.score === 100
                  ? 'bg-neutral-900 text-neutral-500 border border-neutral-800/40 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-lg hover:shadow-indigo-950/30'
              }`}
            >
              {selectedNode.score === 100 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Node Fully Optimized
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  Run Automated Optimizer
                </>
              )}
            </button>
            <button 
              onClick={() => alert(`Simulating inspect request for ${selectedNode.name} logs.`)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/30 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              View Traces
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Informational checklist block */}
        <div className="mt-4 p-4 rounded-xl border border-neutral-900 bg-neutral-950/20 text-xs text-neutral-400 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Continuous edge sweeps capture diagnostic anomalies in &lt;100ms.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Zero impact on application runtimes or loading footprints.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
