import React, { useState, useEffect } from 'react';
import { Activity, Shield, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Layers, Sparkles, AlertCircle } from 'lucide-react';
import RadarSimulation from '../components/RadarSimulation';
import { Link } from '../components/Router';

interface RadarCategory {
  id: string;
  name: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  details: string;
  historicalDelta: string;
}

export default function ApplicationRadarPage({ onRunRadar }: { onRunRadar: () => void }) {
  const [categories, setCategories] = useState<RadarCategory[]>([
    { id: 'perf', name: 'Performance', score: 94, status: 'healthy', details: '94ms avg response time. Core Web Vitals fully green.', historicalDelta: '+2.4%' },
    { id: 'sec', name: 'Security Compliance', score: 91, status: 'healthy', details: '0 active vulnerability warnings. SSL cert expires in 120 days.', historicalDelta: 'Stable' },
    { id: 'uptime', name: 'Uptime Integrity', score: 99, status: 'healthy', details: 'No downtime incidents detected in past 30 days.', historicalDelta: '+0.01%' },
    { id: 'errors', name: 'Error Stability', score: 86, status: 'warning', details: 'GET /api/v1/profile is returning intermittent 429 rate limit exceptions.', historicalDelta: '-1.8%' },
    { id: 'api', name: 'API Health Check', score: 96, status: 'healthy', details: 'All 14 endpoints responding under SLA thresholds.', historicalDelta: 'Stable' },
    { id: 'seo', name: 'SEO Indexing', score: 92, status: 'healthy', details: 'All pages indexable. Canonical URL mappings verified.', historicalDelta: '+0.8%' },
    { id: 'access', name: 'Accessibility Score', score: 88, status: 'warning', details: 'Low contrast warnings on pricing page footer elements.', historicalDelta: '+1.2%' }
  ]);

  const [overallHealth, setOverallHealth] = useState(94);
  const [fixedIssueId, setFixedIssueId] = useState<string[]>([]);

  const handleSolveIssue = (id: string) => {
    if (fixedIssueId.includes(id)) return;
    setFixedIssueId(prev => [...prev, id]);

    setCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        return {
          ...cat,
          score: 100,
          status: 'healthy',
          details: 'All diagnostic warning items resolved, validated, and normalized.',
          historicalDelta: '+10.0% (Hotfix)'
        };
      }
      return cat;
    }));

    // Recalculate overall health
    setOverallHealth(prev => Math.min(100, Math.round(prev + (100 - categories.find(c => c.id === id)!.score) / categories.length)));
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
          <span className="text-indigo-400 font-semibold">Application Radar</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            Concentric Security & Health Sonar.
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            A continuous sonar sweep maps compliance, load distributions, exception anomalies, and rendering index speeds against standard OOWASP and Core Web Vitals thresholds.
          </p>
        </div>

        {/* Dynamic Concentric Sonar Component Core Section */}
        <div className="mb-16">
          <RadarSimulation />
        </div>

        {/* Overall Health Card and Category Scores breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Detailed Category Scores Breakdown (8 cols) */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 bg-neutral-900/20">
            <div className="border-b border-neutral-900 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">SCORE_REGISTRY</span>
                <h3 className="text-sm font-semibold text-white font-sans mt-0.5">Diagnostic Category breakdown</h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">7 parameters audited</span>
            </div>

            <div className="space-y-4">
              {categories.map(cat => {
                const isWarning = cat.status === 'warning';
                const isFixed = fixedIssueId.includes(cat.id);
                return (
                  <div key={cat.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                        <h4 className="font-semibold text-white text-sm">{cat.name}</h4>
                        <span className="font-mono text-[10px] text-neutral-500">({cat.historicalDelta})</span>
                      </div>
                      <p className="text-neutral-400 font-sans leading-relaxed text-xs">
                        {cat.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-neutral-900 pt-3 md:pt-0">
                      <div className="text-right font-mono">
                        <span className="text-neutral-500 block text-[10px]">SCORE</span>
                        <span className={`text-base font-bold font-display ${isWarning ? 'text-amber-400 font-semibold' : 'text-white'}`}>
                          {cat.score}%
                        </span>
                      </div>

                      {isWarning && (
                        <button
                          onClick={() => handleSolveIssue(cat.id)}
                          disabled={isFixed}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            isFixed 
                              ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-950'
                          }`}
                        >
                          {isFixed ? 'Patched' : 'Run Hotfix'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Health Changes and Recommendations (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Overall score dashboard */}
            <div className="glass-card rounded-2xl p-5 bg-neutral-900/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <span className="text-xs font-mono text-neutral-500 uppercase">SYSTEM_INDEX_HEALTH</span>
              <div className="text-6xl font-display font-bold text-white tracking-tighter my-4 tabular-nums">
                {overallHealth}%
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto mb-4 font-sans">
                Your application scored a weighted {overallHealth}% index compliance. High performance marks in Core Web Vitals offset small rate-limit concerns.
              </p>

              <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl text-left font-mono text-[10px] space-y-1 text-neutral-400">
                <div className="flex justify-between">
                  <span>LAST_AUDIT</span>
                  <span className="text-white">Just now (Stable)</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURITY_SLA</span>
                  <span className="text-emerald-400 font-semibold">PASS // SECURE</span>
                </div>
              </div>
            </div>

            {/* Recommendations checklist panel */}
            <div className="glass-card rounded-2xl p-5 bg-neutral-900/20">
              <h4 className="text-xs font-mono text-neutral-400 uppercase border-b border-neutral-900 pb-3 mb-3">
                Action Items Requiring Attention
              </h4>

              <div className="space-y-3 text-xs">
                {categories.filter(c => c.status === 'warning').length > 0 ? (
                  categories.filter(c => c.status === 'warning').map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-900/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>{item.name} Anomaly</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-neutral-500 font-mono text-[11px]">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <span>0 active warnings. All criteria passing completely.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Start Sweeps CTA */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-[90px] pointer-events-none" />
          <h3 className="text-2xl font-display font-semibold text-white mb-3">Run Full Sonar Radar Audits</h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Plug in staging, preview, and production environments side-by-side. Our continuous radar sweep runs with absolute zero runtime footprint.
          </p>
          <button
            onClick={onRunRadar}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 hover:translate-y-[-1px] cursor-pointer"
          >
            Run Application Radar Scan
          </button>
        </div>

      </div>
    </div>
  );
}
