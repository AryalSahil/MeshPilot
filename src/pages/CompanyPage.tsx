import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Globe, ArrowRight, HelpCircle, Heart, Star, CheckCircle2, Handshake, Shield, Sparkles } from 'lucide-react';
import { Link } from '../components/Router';

type TabType = 'about' | 'careers' | 'contact' | 'partners';

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const getTabFromHash = (): TabType => {
    const hash = window.location.hash;
    if (hash.includes('#careers') || hash.includes('/company#careers')) return 'careers';
    if (hash.includes('#contact') || hash.includes('/company#contact')) return 'contact';
    if (hash.includes('#partners') || hash.includes('/company#partners')) return 'partners';
    return 'about';
  };

  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [window.location.hash]);

  const partnersList = [
    { name: 'Vercel Edge Network', tier: 'Premier Alliance', desc: 'Direct webhook pipeline integration into high-density router nodes.', status: 'Active Link' },
    { name: 'Supabase Postgres Cloud', tier: 'Strategic Database Integration', desc: 'Continuous pg_stat telemetry collection with zero index locking.', status: 'Active Link' },
    { name: 'Cloudflare Workers Gateway', tier: 'Security & CDN Ally', desc: 'In-band tracing across Cloudflare edge workers pipelines.', status: 'Active Link' },
    { name: 'Railway Infrastructure Corp', tier: 'Deployment Partner', desc: 'Synchronized cluster logging and container isolation hooks.', status: 'Active Link' }
  ];

  return (
    <div className="py-12 bg-neutral-950 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Breadcrumb / Metadata */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
          <Link to="/" className="hover:text-white">MeshPilot</Link>
          <span aria-hidden="true">/</span>
          <span className="text-indigo-400 font-semibold">Company</span>
        </div>

        {/* Dynamic sub navigation tabs */}
        <div className="flex items-center gap-1.5 md:gap-2 border-b border-neutral-900 pb-4 mb-12 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => {
              window.location.hash = '/company#about';
              setActiveTab('about');
            }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'about' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            About MeshPilot
          </button>
          <button
            onClick={() => {
              window.location.hash = '/company#careers';
              setActiveTab('careers');
            }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'careers' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Careers
          </button>
          <button
            onClick={() => {
              window.location.hash = '/company#partners';
              setActiveTab('partners');
            }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'partners' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Partners
          </button>
          <button
            onClick={() => {
              window.location.hash = '/company#contact';
              setActiveTab('contact');
            }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'contact' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'}`}
          >
            Contact & Location
          </button>
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight mb-6">
                Next-generation web infrastructure operations.
              </h1>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6 font-sans">
                At MeshPilot, we construct autonomous web telemetry engines and unified monitoring suites. Our team comprises core database engineers, compiler developers, and security researchers dedicated to reducing debugging latency down to absolute zero.
              </p>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-sans">
                Launched in 2024, our platform processes millions of daily trace iterations, helping organizations maintain reliable, high-speed interfaces for users globally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-900">
              <div className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900">
                <span className="text-3xl font-display font-bold text-white">4.2M+</span>
                <span className="text-xs font-mono text-neutral-500 block mt-1 uppercase">Daily Telemetry Sweeps</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900">
                <span className="text-3xl font-display font-bold text-white">22+</span>
                <span className="text-xs font-mono text-neutral-500 block mt-1 uppercase">Edge Ping Regions</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900">
                <span className="text-3xl font-display font-bold text-white">99.99%</span>
                <span className="text-xs font-mono text-neutral-500 block mt-1 uppercase">Uptime Guarantee SLA</span>
              </div>
            </div>
          </div>
        )}

        {/* Careers Tab */}
        {activeTab === 'careers' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl font-display font-semibold text-white mb-4">Build the future of web diagnostics.</h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-sans">
                We are searching for talented minds who enjoy optimizing systems, compiling trace logs, and configuring low-overhead edge modules. Explore open positions below.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Core Telemetry Software Engineer (Go/Rust)', type: 'Full-time / Remote', dept: 'Engineering' },
                { title: 'Senior Security Researcher (CVE / OWASP Audits)', type: 'Full-time / San Francisco', dept: 'Security' },
                { title: 'Compiler Integration Specialist (TS/V8 Runtime)', type: 'Full-time / Tokyo', dept: 'Engineering' }
              ].map((job, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-800 transition-all">
                  <div>
                    <h4 className="text-sm font-semibold text-white font-sans">{job.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                      <span>{job.dept}</span>
                      <span>·</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Applied interest for ${job.title} role!`)}
                    className="px-4 py-2 rounded-xl border border-neutral-800 hover:bg-neutral-900 hover:text-white text-neutral-300 text-xs font-semibold self-start sm:self-center cursor-pointer transition-all"
                  >
                    Apply Interest
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-display font-semibold text-white mb-4">Our Ecosystem Partners</h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-sans">
                MeshPilot cooperates with the world's leading hosting environments, cloud databases, and notification channels to offer absolute trace visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnersList.map((partner, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-neutral-900/10 border border-neutral-900 hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">{partner.tier}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/40">{partner.status}</span>
                    </div>
                    <h4 className="text-base font-semibold text-white mb-1.5 font-display">{partner.name}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-4">
                      {partner.desc}
                    </p>
                  </div>
                  <div className="h-px bg-neutral-900 my-4" />
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>CONNECTION_PROTOCOL</span>
                    <span className="text-neutral-300">HTTPS / TLS 1.3</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Partner CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/20 to-neutral-950 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-indigo-400" />
                  Become an Authorized MeshPilot Partner
                </h4>
                <p className="text-xs text-neutral-400 font-sans">
                  Integrate your cloud server, database engine, or tool into our autonomous diagnostic ecosystem.
                </p>
              </div>
              <button 
                onClick={() => alert('Our alliances team will reach out regarding standard API integration kits!')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-indigo-950/50 whitespace-nowrap"
              >
                Apply for Integration Alliance
              </button>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-semibold text-white">Get in touch with our team.</h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-sans">
                Have specific telemetry inquiries, enterprise partnership requests, or custom SLA contract questions? Send our engineering coordinators a memo directly.
              </p>

              <div className="space-y-4 text-xs font-mono text-neutral-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>support@meshpilot.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>San Francisco, California // Tokyo, Japan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>meshpilot.io</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Your coordinate message has been logged. Our dispatchers will reach out shortly.');
                (e.target as HTMLFormElement).reset();
              }}
              className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4"
            >
              <div>
                <label htmlFor="contact-email" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Your email address</label>
                <input 
                  id="contact-email"
                  type="email" 
                  required 
                  placeholder="name@company.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">How can we assist?</label>
                <textarea 
                  id="contact-message"
                  required 
                  rows={4} 
                  placeholder="Describe your inquiry..." 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Send Direct Message
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
