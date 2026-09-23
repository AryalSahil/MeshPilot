import React, { useState, useEffect } from 'react';
import { Bot, Terminal, Play, AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Check, RefreshCw, Cpu, Database, GitBranch, ShieldAlert } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: {
    name: string;
    type: 'logs' | 'perf' | 'errors' | 'deployments';
    status: 'scanning' | 'done' | 'pending';
    details: string;
  }[];
  explanation: {
    title: string;
    rootCause: string;
    recommendation: string;
    diffCode: string;
    diffLang: string;
  };
}

export default function AICanvas() {
  const scenarios: Scenario[] = [
    {
      id: 'api-slow',
      title: '"Why did my API become slower?"',
      description: 'Investigate a sudden latency spike in your primary API Gateway endpoint.',
      steps: [
        { name: 'Scan Database Traces & Logs', type: 'logs', status: 'pending', details: 'Scanning 14,205 entries in POSTGRES_LOG...' },
        { name: 'Inspect Telemetry Vitals', type: 'perf', status: 'pending', details: 'Checking TTFB, database query latency, and cache misses...' },
        { name: 'Analyze Error Rate Correlation', type: 'errors', status: 'pending', details: 'Correlating 5xx responses with service pool size...' },
        { name: 'Cross-reference Deployments', type: 'deployments', status: 'pending', details: 'Searching GitHub repository commits in the 30-minute window...' }
      ],
      explanation: {
        title: 'API Performance Degradation Root Cause',
        rootCause: 'Commit b8d4f21 (22 mins ago) added an unindexed column query to the users table in the GET /api/v1/profile route. This caused database sequential scans, spiking read query times by 14x under load.',
        recommendation: 'Apply database index to users(uuid) to convert the sequential scan into a fast index lookup. Alternatively, revert b8d4f21 to restore baseline latency.',
        diffCode: `// ❌ BEFORE (Commit b8d4f21)
const user = await db.select().from(users)
  .where(eq(users.uuid, request.params.userId)); // ⚠️ Sequential scan

//  AFTER (AI RECOMMENDED FIX)
// Added index: CREATE INDEX idx_users_uuid ON users(uuid);
const user = await db.select().from(users)
  .where(eq(users.uuid, request.params.userId))
  .hint('idx_users_uuid'); // ⚡ Fast index lookup`,
        diffLang: 'typescript'
      }
    },
    {
      id: 'cpu-spike',
      title: '"Why is my CPU spiking at 2:00 AM?"',
      description: 'Analyze recurring early morning system resource spikes and heavy thread counts.',
      steps: [
        { name: 'Scan Cron jobs & Backups', type: 'logs', status: 'pending', details: 'Reading system crontab and docker-compose orchestration logs...' },
        { name: 'Measure Memory & Garbage Collection', type: 'perf', status: 'pending', details: 'Checking V8 engine heap memory profile and collection spikes...' },
        { name: 'Audit Third-Party Webhooks', type: 'errors', status: 'pending', details: 'Matching incoming payloads against external provider rate-limits...' },
        { name: 'Analyze Build Integrations', type: 'deployments', status: 'pending', details: 'Inspecting scheduled GitHub Action workflows & runner schedules...' }
      ],
      explanation: {
        title: 'CPU Overload Root Cause',
        rootCause: 'The scheduled daily report generator task (cron-0200) was running a heavy non-paginated aggregate query over 4 million rows, exhausting memory pool and triggering V8 aggressive garbage collection loops.',
        recommendation: 'Enable cursor pagination or chunk-based database querying inside reports/compiler.ts, and move cron scheduling to off-peak 04:00 AM UTC.',
        diffCode: `// ❌ BEFORE (Memory Overflow)
const allRecords = await db.select().from(transactions);
allRecords.map(item => compileAggregates(item));

//  AFTER (Chunk-based Streaming API)
await db.select().from(transactions)
  .chunk(1000, async (rows) => {
    await processAndStreamChunk(rows); // ⚡ Cap max heap memory at 32MB
  });`,
        diffLang: 'typescript'
      }
    },
    {
      id: 'gateway-errors',
      title: '"Why did I get random 502 Bad Gateway errors?"',
      description: 'Audit sudden connection breakages between Nginx gateway and backend server.',
      steps: [
        { name: 'Audit Nginx Access Logs', type: 'logs', status: 'pending', details: 'Parsing proxy_pass upstream connection error reports...' },
        { name: 'Trace Server Port Bound State', type: 'perf', status: 'pending', details: 'Measuring system file descriptors and TCP socket allocations...' },
        { name: 'Inspect Process Manager Health', type: 'errors', status: 'pending', details: 'Checking PM2/Docker exit codes and memory leak crashes...' },
        { name: 'Match Cluster Deployments', type: 'deployments', status: 'pending', details: 'Auditing recent Vercel Edge/Railway cluster scaling configurations...' }
      ],
      explanation: {
        title: 'Gateway Integration Root Cause',
        rootCause: 'The backend service process was crashing due to an unhandled exception (uncaughtException) inside the Redis subscription listener, causing a crash loop. Nginx threw 502s until the process auto-restarted.',
        recommendation: 'Add global uncaughtException boundaries to your entry server.ts, and implement Redis reconnection fallback logic.',
        diffCode: `// ❌ BEFORE (Uncaught Crash)
redisClient.on('message', (chan, msg) => {
  const data = JSON.parse(msg); // ⚠️ Throws SyntaxError on empty, crashing app
});

//  AFTER (Exception Guarded)
redisClient.on('message', (chan, msg) => {
  try {
    const data = JSON.parse(msg);
  } catch (err) {
    logger.warn('Skipping corrupted redis payload', err); // ✅ Guarded
  }
});`,
        diffLang: 'typescript'
      }
    }
  ];

  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);

  const resetInvestigation = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setCompletedSteps([]);
    setShowExplanation(false);
    setFixed(false);
    setLiveLog([]);
  };

  const handleStartInvestigation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setShowExplanation(false);
    setFixed(false);
    setLiveLog(['[SYSTEM] Initializing AI Intelligent Diagnostic suite...', `[SYSTEM] Targeting endpoint telemetry under target context.`]);
  };

  useEffect(() => {
    if (!isRunning || currentStepIndex === -1) return;

    if (currentStepIndex < activeScenario.steps.length) {
      const step = activeScenario.steps[currentStepIndex];
      
      // Update terminal log with realistic analysis items
      setLiveLog(prev => [
        ...prev, 
        `[SCANNING] Running ${step.name.toUpperCase()}...`,
        `[INFO] ${step.details}`
      ]);

      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStepIndex]);
        setLiveLog(prev => [
          ...prev, 
          `[SUCCESS] ${step.name} completed. Analyzed. Status: OK.`
        ]);
        
        // Move to next step
        setCurrentStepIndex(prev => prev + 1);
      }, 1600);

      return () => clearTimeout(timer);
    } else {
      // Completed all steps! Show explanation
      setIsRunning(false);
      setShowExplanation(true);
      setLiveLog(prev => [
        ...prev, 
        `[AI_AGENT] Root cause discovered! Synthesizing contextual solutions...`,
        `[SYSTEM] Diagnostic complete.`
      ]);
    }
  }, [isRunning, currentStepIndex, activeScenario]);

  const handleApplyFix = () => {
    setFixed(true);
    setLiveLog(prev => [
      ...prev,
      `[AI_ACTION] Running automated code fix & database migration...`,
      `[AI_ACTION] Index idx_users_uuid applied successfully.`,
      `[SYSTEM] Performance health optimized. Latency dropped to 94ms baseline.`
    ]);
  };

  return (
    <div className="bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden relative">
      {/* Visual background element */}
      <div className="absolute -left-48 -bottom-48 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header bar */}
      <div className="border-b border-neutral-900 bg-neutral-950/80 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-lg font-display font-semibold text-white">AI Root Cause Agent</h4>
            <p className="text-xs text-neutral-400">Zero-configuration diagnostic & trace investigation</p>
          </div>
        </div>

        {/* Selector chips */}
        <div className="flex flex-wrap gap-2">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => resetInvestigation(s)}
              disabled={isRunning}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeScenario.id === s.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' 
                  : 'bg-neutral-900/40 text-neutral-400 border border-neutral-800/60 hover:text-neutral-200'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-neutral-900">
        {/* Left Side: Simulation Progress & Interactive Controls (cols 1-7) */}
        <div className="xl:col-span-7 bg-neutral-950 p-6 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="mb-6">
              <span className="text-xs font-mono text-neutral-500 block mb-1">TARGET INVESTIGATION TARGET</span>
              <p className="text-lg text-white font-semibold flex items-center gap-2">
                {activeScenario.description}
              </p>
            </div>

            {/* Simulated Steps Checklist */}
            <div className="space-y-4">
              {activeScenario.steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                const isActive = currentStepIndex === idx;
                
                let iconClass = 'text-neutral-600';
                let borderClass = 'border-neutral-900';
                let textClass = 'text-neutral-500';

                if (isCompleted) {
                  iconClass = 'text-emerald-400';
                  borderClass = 'border-emerald-500/30 bg-emerald-500/5';
                  textClass = 'text-neutral-300';
                } else if (isActive) {
                  iconClass = 'text-indigo-400';
                  borderClass = 'border-indigo-500/30 bg-indigo-500/5';
                  textClass = 'text-white font-medium';
                }

                return (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${borderClass}`}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className={`w-5 h-5 ${iconClass}`} />
                      ) : isActive ? (
                        <RefreshCw className={`w-5 h-5 ${iconClass} animate-spin-slow`} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${textClass} flex items-center justify-between`}>
                        <span>{step.name}</span>
                        {isActive && <span className="text-xs font-mono text-indigo-400 animate-pulse">ACTIVE_TRACE</span>}
                        {isCompleted && <span className="text-xs font-mono text-emerald-400">RESOLVED</span>}
                      </div>
                      {(isActive || isCompleted) && (
                        <p className="text-xs text-neutral-400 mt-1 font-mono">
                          {isActive ? step.details : `Analyzed. Normalization parameters captured.`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 font-mono">
              ⚡ Runs across Logs, Traces, metrics, and git repositories.
            </div>
            
            <button
              onClick={handleStartInvestigation}
              disabled={isRunning || showExplanation}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isRunning || showExplanation
                  ? 'bg-neutral-900 text-neutral-500 border border-neutral-800/60 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-950/40'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Start Autonomous AI Scan
            </button>
          </div>
        </div>

        {/* Right Side: Log terminal & AI Diagnostic Output (cols 8-12) */}
        <div className="xl:col-span-5 bg-neutral-950 flex flex-col min-h-[460px]">
          {/* Terminal Display */}
          <div className="bg-neutral-950 p-4 border-b border-neutral-900 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto max-h-[160px] scrollbar-thin scrollbar-thumb-neutral-800">
            <div className="flex items-center gap-2 text-neutral-500 pb-2 border-b border-neutral-900 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>DIAGNOSTIC_STDOUT</span>
            </div>
            {liveLog.length === 0 ? (
              <span className="text-neutral-600 block">Waiting for AI scanner initialization...</span>
            ) : (
              liveLog.map((log, lidx) => {
                let color = 'text-neutral-400';
                if (log.startsWith('[SUCCESS]')) color = 'text-emerald-400';
                if (log.startsWith('[AI_AGENT]') || log.startsWith('[AI_ACTION]')) color = 'text-indigo-400';
                if (log.startsWith('[SCANNING]')) color = 'text-cyan-400';
                if (log.startsWith('[SYSTEM]')) color = 'text-neutral-500';
                
                return (
                  <div key={lidx} className={`${color} block mb-1`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>

          {/* AI Explanation Result */}
          <div className="p-6 bg-neutral-950 flex-1 flex flex-col justify-between">
            {!showExplanation ? (
              <div className="flex flex-col items-center justify-center text-center py-8 text-neutral-500 flex-1">
                <Bot className="w-8 h-8 text-neutral-700 mb-2 animate-bounce-slow" />
                <p className="text-xs">
                  Run the diagnostic scan to see the AI agent's root-cause logic and recommended patches.
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <h5 className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">AI DIAGNOSIS SOURCE</h5>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-2">{activeScenario.explanation.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 rounded-xl p-3 border border-neutral-800/40 mb-3">
                    {activeScenario.explanation.rootCause}
                  </p>
                  
                  {/* Code Diff section */}
                  <div className="rounded-xl border border-neutral-900 bg-neutral-950 overflow-hidden">
                    <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between text-[10px] text-neutral-400 font-mono border-b border-neutral-950">
                      <span>{activeScenario.explanation.diffLang}.ts</span>
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">DIFFERENTIAL_DIFF</span>
                    </div>
                    <pre className="p-3 text-[10px] text-neutral-300 font-mono leading-relaxed overflow-x-auto max-h-[140px]">
                      <code>{activeScenario.explanation.diffCode}</code>
                    </pre>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-900 flex flex-col gap-2">
                  <div className="text-[11px] text-amber-300 bg-amber-500/5 rounded-lg p-2 border border-amber-500/10 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>Deploy index patch to restore baseline API speed. Live index generation has zero downtime impact.</span>
                  </div>
                  
                  <div className="flex gap-2.5 mt-1">
                    <button
                      onClick={handleApplyFix}
                      disabled={fixed}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        fixed 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg'
                      }`}
                    >
                      {fixed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Fix Applied & Verified
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Apply Hotfix Code Patch
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => alert('Redirecting to simulated GitHub repo pull request.')}
                      className="px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/30 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Git Pull
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
