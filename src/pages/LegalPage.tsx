import React, { useState } from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from '../components/Router';

export default function LegalPage() {
  const [activeLegal, setActiveLegal] = useState<'privacy' | 'terms' | 'gdpr'>('privacy');

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">Legal</span>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-4 mb-12">
          <button
            onClick={() => setActiveLegal('privacy')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeLegal === 'privacy' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveLegal('terms')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeLegal === 'terms' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveLegal('gdpr')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeLegal === 'gdpr' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            GDPR & Compliance
          </button>
        </div>

        <div className="max-w-3xl space-y-6">
          {activeLegal === 'privacy' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-semibold text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs font-mono text-neutral-500">Last Revised: September 23, 2026</p>
              
              <div className="space-y-4 text-neutral-400 text-xs md:text-sm leading-relaxed font-sans">
                <p>
                  At MeshPilot, we prioritize protecting user telemetry metadata and codebase repositories. This document sets out how we collect, store, isolate, and audit data streams received from linked SDK trackers.
                </p>
                <h3 className="text-sm font-semibold text-white font-display pt-2">1. Data Storage Boundaries</h3>
                <p>
                  All metrics related to response latencies, Core Web Vitals parameters, HTTP response headers, and diagnostic log lists are cached securely and isolated inside single-tenant databases. No raw credentials, secure env files, or client cookie bodies are read or retained.
                </p>
                <h3 className="text-sm font-semibold text-white font-display pt-2">2. Repository Access Isolation</h3>
                <p>
                  When connecting your GitHub accounts, MeshPilot reads file trees and file line diffs on demand only. We do not permanently copy or redistribute your proprietary source code files.
                </p>
              </div>
            </div>
          )}

          {activeLegal === 'terms' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-semibold text-white tracking-tight">Terms of Service</h1>
              <p className="text-xs font-mono text-neutral-500">Last Revised: September 23, 2026</p>

              <div className="space-y-4 text-neutral-400 text-xs md:text-sm leading-relaxed font-sans">
                <p>
                  Welcome to MeshPilot. By deploying our telemetry scripts or establishing system hook triggers, you agree to comply with the legal bindings listed inside our operating rules.
                </p>
                <h3 className="text-sm font-semibold text-white font-display pt-2">1. Account Allocations & Usage limits</h3>
                <p>
                  Users may build, save, and test Trigger-Action Blueprints and monitor mock dashboards inside sandbox limits completely free. Commercial loads processing over 50,000 requests per minute require specific paid telemetry limits.
                </p>
                <h3 className="text-sm font-semibold text-white font-display pt-2">2. Liability Isolation</h3>
                <p>
                  MeshPilot serves as an operations observability suite. We are not liable for upstream server failures, cloud service outages, database record loss, or performance delays of connected systems.
                </p>
              </div>
            </div>
          )}

          {activeLegal === 'gdpr' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-semibold text-white tracking-tight">GDPR & Data Protection Regulation</h1>
              <p className="text-xs font-mono text-neutral-500">Last Revised: September 23, 2026</p>

              <div className="space-y-4 text-neutral-400 text-xs md:text-sm leading-relaxed font-sans">
                <p>
                  MeshPilot complies fully with global privacy guidelines, including the General Data Protection Regulation (GDPR) standards regarding trace logs and customer identifiers.
                </p>
                <h3 className="text-sm font-semibold text-white font-display pt-2">Data Portability and Right to be Forgotten</h3>
                <p>
                  Organizations can immediately request full deletion of trace audit histories, linked account details, and diagnostic blueprints. Purge runs execute instantly and leave no dangling metadata on edge hosts.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
