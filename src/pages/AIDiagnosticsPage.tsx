import React, { useRef } from 'react';
import { Bot, Sparkles, Terminal, Play, CheckCircle2, ChevronRight, HelpCircle, Activity, ShieldCheck, Database, GitCommit, Search } from 'lucide-react';
import AICanvas from '../components/AICanvas';
import { Link } from '../components/Router';

export default function AIDiagnosticsPage() {
  const aiCanvasRef = useRef<HTMLDivElement>(null);

  const handleRunDiagnostic = () => {
    // Scroll smoothly to AICanvas container
    aiCanvasRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Alert info
    alert('Autonomous diagnostics console loaded. Click "Start Autonomous AI Scan" on the AI console below to see the live investigation!');
  };

  const modelMetrics = [
    { name: 'LOG_INGESTION_SPEED', value: '45,000 entries/s' },
    { name: 'ROOT_CAUSE_SYNTHESIS', value: '8.4s average' },
    { name: 'PULL_REQUEST_SUCCESS', value: '94.2% verified' },
    { name: 'FALSE_POSITIVE_RATE', value: '&lt; 0.04%' }
  ];

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span>Features</span>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">AI Diagnostics</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            The Autonomous Root-Cause Engineer.
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            Unify codebases, logs, errors, and live deployments inside our specialized LLM telemetry core. Synthesize code corrections and SQL migrations for system incidents in seconds.
          </p>
        </div>

        {/* Static Model Telemetry parameters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900 rounded-2xl overflow-hidden mb-12 font-mono text-xs">
          {modelMetrics.map((item, idx) => (
            <div key={idx} className="bg-neutral-950 p-5">
              <span className="text-neutral-500 text-[10px] block mb-1">{item.name}</span>
              <span className="text-white font-bold" dangerouslySetInnerHTML={{ __html: item.value }} />
            </div>
          ))}
        </div>

        {/* Example Investigation Flow Visual (Static mockup illustrating capability beautifully) */}
        <div className="glass-card rounded-2xl p-6 bg-neutral-900/20 mb-16">
          <div className="border-b border-neutral-900 pb-4 mb-6">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">DIAGNOSTIC_FLOW_EXAMPLE</span>
            <h3 className="text-sm font-semibold text-white font-sans mt-0.5">Differential Code Diagnosis Mapping</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* User prompt input side (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold font-mono text-white text-xs">
                  U
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Developer Query</span>
                  <p className="text-sm text-neutral-200 font-medium">"Why did my GET /api/v1/profile API endpoint become 14x slower?"</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-neutral-400 pl-4 border-l border-indigo-500/20 py-2">
                <div className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Parsing database sequential scan registries...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Matching logs inside 22-minute git commit window...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Correlated Commit: b8d4f21 (Alex Chen)</span>
                </div>
              </div>
            </div>

            {/* AI Diagnosis Output visual mockup (7 cols) */}
            <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 font-mono text-xs text-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white uppercase text-[10px]">AI_DIAGNOSTIC_SYNTHESIZER</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded font-bold">STABLE_RESOLUTION</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-neutral-900/30 p-3 rounded-xl border border-neutral-800/60">
                <div>
                  <span className="text-neutral-500 text-[9px] block">PROBLEM_DETECTED</span>
                  <span className="text-rose-400 font-semibold">PostgreSQL Sequential Scan</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[9px] block">PERFORMANCE_IMPACT</span>
                  <span className="text-rose-400 font-semibold">1,240ms Latency Spike (+1380%)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 text-[9px] block">PROBABLE_CAUSE</span>
                <p className="font-sans text-neutral-300 leading-relaxed text-xs">
                  Commit <span className="text-indigo-400">b8d4f21</span> introduced a direct unindexed where-clause parameter on the <span className="text-indigo-300">users.uuid</span> fields in primary routes, forcing DB sequential reads across 4,200,000 index blocks.
                </p>
              </div>

              <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10 space-y-1.5 text-indigo-300 text-[11px]">
                <span className="font-bold">RECOMMENDED_NEXT_ACTION</span>
                <p className="font-sans text-[10px] text-neutral-400 leading-relaxed">
                  Generate database index <span className="text-white">idx_users_uuid</span> inside migration scripts or roll back git commit <span className="text-white">b8d4f21</span> to instantly restore &lt;100ms baseline performance.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Embedded Interactive AICanvas Component Area */}
        <div ref={aiCanvasRef} className="mb-16">
          <AICanvas />
        </div>

        {/* Run Diagnostic CTA */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-[90px] pointer-events-none" />
          <h3 className="text-2xl font-display font-semibold text-white mb-3">Begin Autonomous Incident Audits</h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Link your GitHub repository and telemetry loops, then let MeshPilot correlate slow queries, error bursts, and git code changes automatically.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRunDiagnostic}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 hover:translate-y-[-1px] cursor-pointer"
            >
              Run AI Diagnostic Console
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
