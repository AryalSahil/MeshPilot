import React, { useState } from 'react';
import { 
  Handshake, Sparkles, Shield, Cpu, ExternalLink, Network, Database, Globe, 
  Layers, Cloud, Code2, Users, ArrowUpRight, CheckCircle, RefreshCw, Terminal 
} from 'lucide-react';
import { Link } from '../components/Router';

interface Partner {
  id: string;
  name: string;
  tier: 'Global Strategic' | 'Premier Alliance' | 'Ecosystem Integrator';
  category: 'Infrastructure' | 'Database' | 'Platform' | 'Security';
  desc: string;
  logoLetter: string;
  benefits: string[];
  connectionStatus: 'Verified' | 'Beta' | 'Early Access';
}

export default function PartnersPage() {
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [allianceSigned, setAllianceSigned] = useState(false);

  const partners: Partner[] = [
    {
      id: 'vercel',
      name: 'Vercel Edge Network',
      tier: 'Global Strategic',
      category: 'Platform',
      desc: 'Seamless deployment hook correlation with zero-config edge functions. Track build latency and telemetry in real-time.',
      logoLetter: 'V',
      benefits: ['Instant webhook callbacks', 'Differential git telemetry mapping', 'Edge runtime error maps'],
      connectionStatus: 'Verified'
    },
    {
      id: 'supabase',
      name: 'Supabase Postgres Cloud',
      tier: 'Premier Alliance',
      category: 'Database',
      desc: 'Optimize database transactions and track locks without indexing overhead. Stream pg_stat_statements metrics directly.',
      logoLetter: 'S',
      benefits: ['Postgres CPU telemetry', 'Index bloat scanning', 'Slow transaction alerts'],
      connectionStatus: 'Verified'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Workers Gateway',
      tier: 'Global Strategic',
      category: 'Infrastructure',
      desc: 'Integrates natively across Cloudflare Workers CDN nodes. Gain visibility into handshakes, edge caches, and DNS speeds.',
      logoLetter: 'C',
      benefits: ['TLS Handshake latency maps', 'CDN edge caching tracking', 'Global request rate logs'],
      connectionStatus: 'Verified'
    },
    {
      id: 'railway',
      name: 'Railway Infrastructure Corp',
      tier: 'Ecosystem Integrator',
      category: 'Infrastructure',
      desc: 'Connect cluster logs, container metrics, and isolated cloud heaps in seconds. Standardized trace callbacks enabled.',
      logoLetter: 'R',
      benefits: ['Container memory metrics', 'Cluster network logs', 'Automated host scaling alerts'],
      connectionStatus: 'Verified'
    },
    {
      id: 'github',
      name: 'GitHub Action Suites',
      tier: 'Global Strategic',
      category: 'Platform',
      desc: 'Correlate pipeline workflow logs directly with application release health. Spot code regression instantly upon deployment.',
      logoLetter: 'G',
      benefits: ['GitHub Actions trigger logs', 'Pull Request diff analysis', 'Automated code fixes'],
      connectionStatus: 'Verified'
    },
    {
      id: 'auth0',
      name: 'Auth0 Security Systems',
      tier: 'Premier Alliance',
      category: 'Security',
      desc: 'Track user authentication flow errors, identity latencies, and token token-exchange metrics automatically.',
      logoLetter: 'A',
      benefits: ['JWT trace correlation', 'Auth rate-limit logs', 'Secured session audit trails'],
      connectionStatus: 'Early Access'
    }
  ];

  const filteredPartners = partnerFilter === 'all' 
    ? partners 
    : partners.filter(p => p.category.toLowerCase() === partnerFilter.toLowerCase());

  return (
    <div className="py-16 bg-neutral-950 min-h-screen text-neutral-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[300px] bg-indigo-500/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-emerald-500/3 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-6">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true" className="text-neutral-700">/</span>
          <Link to="/company" className="hover:text-white">Company</Link>
          <span aria-hidden="true" className="text-neutral-700">/</span>
          <span className="text-indigo-400 font-semibold">Partners</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest bg-indigo-950/40 px-3 py-1 rounded-md border border-indigo-900/30">
            STRATEGIC ALLIANCES
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight mt-6 mb-6 leading-tight">
            Our Ecosystem Partners & Integrations
          </h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            MeshPilot coordinates with world-class cloud providers, database platforms, and hosting nodes to trace your performance variables natively. Seamless integration takes less than 60 seconds with zero runtime overhead.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-4 mb-10 overflow-x-auto scrollbar-none whitespace-nowrap">
          {['all', 'infrastructure', 'database', 'platform', 'security'].map(cat => (
            <button
              key={cat}
              onClick={() => setPartnerFilter(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer capitalize ${
                partnerFilter === cat 
                  ? 'bg-neutral-900 text-white border border-neutral-800' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(partner => (
            <div 
              key={partner.id}
              className="glass-card rounded-2xl p-6 bg-neutral-900/10 border border-neutral-900 hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Radial Hover Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/2 group-hover:bg-indigo-500/5 rounded-full blur-xl transition-all" />

              <div>
                {/* Logo & Category Row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white font-bold font-display text-base shadow-inner">
                      {partner.logoLetter}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {partner.name}
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{partner.category}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    partner.connectionStatus === 'Verified' 
                      ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
                      : 'bg-indigo-950/30 text-indigo-400 border-indigo-900/30'
                  }`}>
                    {partner.connectionStatus}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-6">
                  {partner.desc}
                </p>

                {/* Benefits List */}
                <div className="space-y-2 mb-6">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2.5">INTEGRATION BENEFITS</span>
                  {partner.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Specs Metadatas */}
              <div className="pt-4 border-t border-neutral-900/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>TIER // {partner.tier.toUpperCase()}</span>
                <span className="text-neutral-400 flex items-center gap-1 group-hover:text-white transition-colors cursor-pointer">
                  <span>API Specs</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Alliance Form Container */}
        <div className="mt-16 p-8 rounded-2xl bg-neutral-900/10 border border-neutral-900 relative overflow-hidden">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-indigo-500/2 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-xl relative z-10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">
                ALLIANCE DISCOVERY
              </span>
              <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                Become an Authorized Partner
              </h2>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Connect your cloud hosting provider, Postgres platform, or API gateway into MeshPilot. Expand security verification audits for mutual enterprise customers.
              </p>
            </div>

            {allianceSigned ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-400 animate-fade-in-up">
                🤝 Alliance application logged successfully. Our partnership board directors will respond within 2 business days.
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setAllianceSigned(true);
                }}
                className="space-y-3 max-w-md"
              >
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    placeholder="Your company name" 
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                  <input 
                    type="email" 
                    required 
                    placeholder="Email address" 
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Apply for Partnership Alliance &rarr;
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
