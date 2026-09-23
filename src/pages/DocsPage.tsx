import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, ChevronRight, Activity, Cpu, ShieldCheck, Heart } from 'lucide-react';
import { Link } from '../components/Router';

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState<'intro' | 'webhook' | 'status'>('intro');

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">Resources</span>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-4 mb-12">
          <button
            onClick={() => setActiveDoc('intro')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeDoc === 'intro' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Documentation Introduction
          </button>
          <button
            onClick={() => setActiveDoc('webhook')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeDoc === 'webhook' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Webhook Specification
          </button>
          <button
            onClick={() => setActiveDoc('status')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeDoc === 'status' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            System Operations Status
          </button>
        </div>

        {activeDoc === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-6">
              <h1 className="text-3xl font-display font-semibold text-white tracking-tight">MeshPilot SDK Integration Manual</h1>
              <p className="text-neutral-400 text-sm leading-relaxed">
                MeshPilot traces and sweeps can be instantiated by placing our lightweight tracking script inside your primary HTML entry files, or importing our edge hook library directly.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded-2xl">
                  <h4 className="text-sm font-semibold text-white mb-2 font-display">Client-Side Script Inclusion</h4>
                  <p className="text-xs text-neutral-400 mb-3 font-sans">
                    Place this script tag in your HTML file before closing your body tag. Requires no additional webpack loaders.
                  </p>
                  <pre className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-[10px] font-mono text-indigo-300 overflow-x-auto">
{`&lt;script 
  src="https://cdn.meshpilot.in/radar-tracker.js" 
  data-app-id="mesh_app_prod_84df2" 
  defer&gt;
&lt;/script&gt;`}
                  </pre>
                </div>

                <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded-2xl">
                  <h4 className="text-sm font-semibold text-white mb-2 font-display">NextJS / React Native Imports</h4>
                  <p className="text-xs text-neutral-400 mb-3 font-sans">
                    Use our native hook components to measure First Input Delay and Core Web Vitals parameters programmatically.
                  </p>
                  <pre className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-[10px] font-mono text-indigo-300 overflow-x-auto">
{`import { useMeshRadar } from '@meshpilot/react';

export default function Layout({ children }) {
  useMeshRadar({
    environment: 'production',
    sampleRate: 0.10 // 10% sampling
  });
  return &lt;div&gt;{children}&lt;/div&gt;;
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Sidebar quick list */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs text-neutral-400">
              <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10">
                <h4 className="font-semibold text-white uppercase text-[10px] mb-3">Topic Directories</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-1 text-indigo-400 font-semibold"><ChevronRight className="w-3.5 h-3.5" /> <span>Getting Started</span></li>
                  <li className="flex items-center gap-1 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5" /> <span>Core Web Vitals API</span></li>
                  <li className="flex items-center gap-1 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5" /> <span>PostgreSQL Trace Triggers</span></li>
                  <li className="flex items-center gap-1 hover:text-white transition-all"><ChevronRight className="w-3.5 h-3.5" /> <span>Security SLA Auditing</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'webhook' && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-3xl font-display font-semibold text-white tracking-tight">System Hook API Specification</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Our automated webhook gateway dispatches raw event payloads containing trace metrics, HTTP header values, and incident levels to configured target servers.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded-2xl">
                <h4 className="text-sm font-semibold text-white mb-2 font-display">Example Payload Schema (JSON)</h4>
                <p className="text-xs text-neutral-400 mb-3">
                  Delivered via a POST request containing custom security verification headers (<span className="text-indigo-400 font-mono">X-Mesh-Signature</span>).
                </p>
                <pre className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-[10px] font-mono text-indigo-300 overflow-x-auto">
{`{
  "event_id": "evt_94df102aef",
  "timestamp": "2026-09-23T21:00:00Z",
  "incident": {
    "code": "ERR_LATENCY_SPIKE",
    "endpoint": "GET /api/v1/profile",
    "measured_latency_ms": 1240,
    "sla_threshold_ms": 300
  },
  "git_context": {
    "branch": "main",
    "commit": "b8d4f21",
    "author": "Alex Chen"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'status' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-display font-semibold text-white tracking-tight">System Infrastructure Operations Status</h1>
              <p className="text-neutral-400 text-sm leading-relaxed mt-2">
                Verify the live operating states of our distributed telemetry edge clusters, global ping centers, and autonomous trace coordinators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Telemetry Processing Core', state: 'Operational', type: 'US-East cluster' },
                { name: 'Distributed Edge Pinger Node', state: 'Operational', type: '22 global regions' },
                { name: 'AI Incident Synthesizer', state: 'Operational', type: 'Vertex Core Engine' }
              ].map((sys, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900 font-mono text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-white font-sans text-sm">{sys.name}</h4>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">{sys.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{sys.state}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 max-w-2xl">
              <h4 className="text-sm font-semibold text-white mb-2 font-display">Historical SLA Integrity</h4>
              <p className="text-xs text-neutral-400 mb-3">
                Operational integrity has maintained high availability ratings across all target quarters:
              </p>
              <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-neutral-400 bg-neutral-950 p-4 rounded-xl border border-neutral-900">
                <div className="flex justify-between"><span>Q1 2026</span><span className="text-white font-bold">99.98%</span></div>
                <div className="flex justify-between"><span>Q2 2026</span><span className="text-white font-bold">99.99%</span></div>
                <div className="flex justify-between"><span>Q3 2026</span><span className="text-white font-bold">100.00%</span></div>
                <div className="flex justify-between"><span>Q4 2026 (Target)</span><span className="text-indigo-400 font-bold">99.99%</span></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
