import React, { useState } from 'react';
import { Network, GitBranch, Shield, Bell, CheckCircle2, AlertTriangle, ArrowRight, Settings, HelpCircle, Code, Plus } from 'lucide-react';
import { Link } from '../components/Router';

interface WebhookRule {
  id: string;
  trigger: string;
  action: string;
  status: boolean;
}

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'disconnected';
  iconName: string;
}

export default function SystemHooksPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'github', name: 'GitHub Integration', category: 'Deployment', description: 'Correlate commit hashes and file diff history with latency spikes.', status: 'connected', iconName: 'GH' },
    { id: 'vercel', name: 'Vercel Deployment', category: 'Hosting', description: 'Trace serverless functions and edge execution speeds.', status: 'connected', iconName: 'VC' },
    { id: 'cloudflare', name: 'Cloudflare Worker', category: 'Edge DNS', description: 'Monitor DNS resolving delays, TLS handshake caps, and CDN cache rates.', status: 'connected', iconName: 'CF' },
    { id: 'supabase', name: 'Supabase Postgres', category: 'Database', description: 'Trace slow pg_stat_statements and connection pool warnings.', status: 'disconnected', iconName: 'SB' },
    { id: 'railway', name: 'Railway Cluster', category: 'Hosting', description: 'Observe CPU allocations and docker container memory limits.', status: 'disconnected', iconName: 'RW' },
    { id: 'slack', name: 'Slack Alerting', category: 'Notifications', description: 'Broadcast high-density trace alerts to engineering channels.', status: 'connected', iconName: 'SL' },
    { id: 'discord', name: 'Discord Webhook', category: 'Notifications', description: 'Deliver raw diagnostic cards directly into developer servers.', status: 'disconnected', iconName: 'DC' }
  ]);

  const [webhookRules, setWebhookRules] = useState<WebhookRule[]>([
    { id: 'rule-1', trigger: 'Uptime SLA falls below 99.9%', action: 'Alert Dev Team in Slack & Trigger AI Log Scan', status: true },
    { id: 'rule-2', trigger: 'Vercel deployment succeeds', action: 'Run Application Radar sweep & warm edge cache', status: true },
    { id: 'rule-3', trigger: 'Database memory usage spikes &gt; 90%', action: 'Stream process stack metrics to Webhook Gateway', status: false }
  ]);

  const [activeRuleTrigger, setActiveRuleTrigger] = useState('');
  const [activeRuleAction, setActiveRuleAction] = useState('');

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'connected' ? 'disconnected' : 'connected'
        };
      }
      return item;
    }));
  };

  const handleToggleRule = (id: string) => {
    setWebhookRules(prev => prev.map(rule => {
      if (rule.id === id) {
        return { ...rule, status: !rule.status };
      }
      return rule;
    }));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRuleTrigger || !activeRuleAction) return;

    const newRule: WebhookRule = {
      id: `rule-${Date.now()}`,
      trigger: activeRuleTrigger,
      action: activeRuleAction,
      status: true
    };

    setWebhookRules(prev => [...prev, newRule]);
    setActiveRuleTrigger('');
    setActiveRuleAction('');
    alert('Custom System Hook Blueprint rule added and verified!');
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
          <span className="text-indigo-400 font-semibold">System Hooks</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
            Unified Infrastructure Hooks.
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed font-sans">
            Connect external git repositories, CDN clusters, serverless handlers, and database providers. Setup custom Trigger-Action rules to automate alerting streams and incident diagnostics.
          </p>
        </div>

        {/* Service Integrations Cards (Status Switch clickable) */}
        <div className="mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase">SERVICE_DIRECTORY</span>
            <h3 className="text-xl font-semibold text-white font-display mt-0.5">Connected Developer Ecosystem</h3>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Toggle the switch controls on each card to connect or isolate external hosts and notification centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(item => (
              <div 
                key={item.id} 
                className="glass-card rounded-2xl p-5 bg-neutral-900/20 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center font-bold font-mono text-white text-xs">
                        {item.iconName}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">{item.category}</span>
                      </div>
                    </div>

                    {/* Switch Toggle Button */}
                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.status === 'connected' ? 'bg-indigo-600' : 'bg-neutral-800'
                      }`}
                      role="switch"
                      aria-checked={item.status === 'connected'}
                      title={`Toggle ${item.name}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.status === 'connected' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-6 min-h-[36px]">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-500">HOOK_STATE</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-700'}`} />
                    <span className={item.status === 'connected' ? 'text-emerald-400' : 'text-neutral-500'}>
                      {item.status === 'connected' ? 'MONITORING_HOOK_ACTIVE' : 'HOOK_OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* If-Then Blueprint Rules Creator and List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Rules list (7 cols) */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 bg-neutral-900/20">
            <div className="border-b border-neutral-900 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">HOOK_BLUEPRINTS</span>
                <h3 className="text-sm font-semibold text-white font-sans mt-0.5">Active Trigger-Action Blueprints</h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">{webhookRules.length} rules loaded</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {webhookRules.map(rule => (
                <div key={rule.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold uppercase text-[10px]">RULE_SET_STATUS</span>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                        rule.status 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/20' 
                          : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                      }`}
                    >
                      {rule.status ? 'ACTIVE // RUNNING' : 'STANDBY // INACTIVE'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-300">
                    <div>
                      <span className="text-neutral-500 text-[10px] block uppercase mb-0.5">IF_EVENT_TRIGGER</span>
                      <p className="font-sans font-medium text-xs text-white">{rule.trigger}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block uppercase mb-0.5">THEN_AUTOMATED_ACTION</span>
                      <p className="font-sans font-medium text-xs text-white">{rule.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Rule Creator (5 cols) */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-2xl p-5 bg-neutral-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="border-b border-neutral-900 pb-3 mb-4">
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">BLUEPRINT_BUILDER</span>
                <h4 className="text-sm font-semibold text-white font-sans mt-0.5">Create Custom Action Blueprint</h4>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label htmlFor="trigger-select" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">If event occurs</label>
                  <select 
                    id="trigger-select"
                    value={activeRuleTrigger}
                    onChange={(e) => setActiveRuleTrigger(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/60 cursor-pointer"
                  >
                    <option value="">Select Trigger Incident...</option>
                    <option value="Uptime latency exceeds 400ms average">Uptime latency exceeds 400ms average</option>
                    <option value="New code commit pushed to GitHub">New code commit pushed to GitHub</option>
                    <option value="PostgreSQL database pool runs out of open sockets">PostgreSQL database pool runs out of open sockets</option>
                    <option value="Exception crash loop throws 5xx series errors">Exception crash loop throws 5xx series errors</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="action-select" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1.5">Then execute action</label>
                  <select 
                    id="action-select"
                    value={activeRuleAction}
                    onChange={(e) => setActiveRuleAction(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/60 cursor-pointer"
                  >
                    <option value="">Select Target Action...</option>
                    <option value="Halt release bundle and notify PagerDuty channel">Halt release bundle and notify PagerDuty channel</option>
                    <option value="Trigger AI trace scanner and output code suggestion log">Trigger AI trace scanner and output code suggestion log</option>
                    <option value="Recycle server process threads and warm Cloudflare cache">Recycle server process threads and warm Cloudflare cache</option>
                    <option value="Ping Slack channel and export SLA audit Brief text">Ping Slack channel and export SLA audit Brief text</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save Blueprint Rule
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Connect Stack CTA */}
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-[90px] pointer-events-none" />
          <h3 className="text-2xl font-display font-semibold text-white mb-3">Unify Your Engineering Stack</h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Link development nodes and notification webhooks in under a minute. Harness high-density alerting streams completely free during sandbox setup.
          </p>
          <button
            onClick={() => alert('Integrate pipeline triggers inside the main console. Deploy a free sandbox to activate live git synchronization.')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40 hover:translate-y-[-1px] cursor-pointer"
          >
            Connect Your Stack Now
          </button>
        </div>

      </div>
    </div>
  );
}
