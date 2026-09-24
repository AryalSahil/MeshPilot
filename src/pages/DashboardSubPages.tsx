import React, { useState, useEffect } from 'react';
import { useDashboard, Project } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../components/Router';
import { 
  Layers, Shield, Activity, TrendingUp, AlertOctagon, Brain, 
  GitCommit, BarChart3, Puzzle, ArrowLeft, CheckCircle, Globe,
  Settings, Terminal, HelpCircle, ExternalLink, Flame, ShieldAlert, Cpu, HardDrive,
  Plus, Play, Pause, RefreshCw, Trash2, Clock, AlertTriangle, AlertCircle
} from 'lucide-react';

// ==========================================
// 1. PROJECTS SUB-PAGE / DETAILED VIEWER (LIVE MONITORING CORE)
// ==========================================
export function DashboardProjectsPage() {
  const { projects, refreshProjects } = useDashboard();
  const { token } = useAuth();
  const { path, navigate } = useRouter();

  // Detect project ID from router path (e.g., /dashboard/projects/1)
  const pathParts = path.split('/');
  const projectIdSuffix = pathParts[3] || ''; // Parts: ['', 'dashboard', 'projects', '1']
  const parsedProjId = parseInt(projectIdSuffix);
  
  const selectedProject = projects.find(p => p.id === projectIdSuffix);

  // Live state
  const [monitorsList, setMonitorsList] = useState<any[]>([]);
  const [loadingMonitors, setLoadingMonitors] = useState(false);
  const [uptimeStats, setUptimeStats] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'monitors' | 'performance' | 'incidents'>('overview');

  // Add Monitor Form
  const [showAddMonitorModal, setShowAddMonitorModal] = useState(false);
  const [monitorName, setMonitorName] = useState('');
  const [monitorUrl, setMonitorUrl] = useState('');
  const [monitorType, setMonitorType] = useState('HTTPS');
  const [monitorMethod, setMonitorMethod] = useState('GET');
  const [monitorInterval, setMonitorInterval] = useState('300');
  const [monitorTimeout, setMonitorTimeout] = useState('10000');
  const [monitorExpectedStatus, setMonitorExpectedStatus] = useState('200');
  const [monitorActive, setMonitorActive] = useState(true);
  const [addMonitorError, setAddMonitorError] = useState('');
  const [submittingMonitor, setSubmittingMonitor] = useState(false);

  // Edit Monitor Form
  const [showEditMonitorModal, setShowEditMonitorModal] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<any>(null);
  const [editMonitorName, setEditMonitorName] = useState('');
  const [editMonitorUrl, setEditMonitorUrl] = useState('');
  const [editMonitorType, setEditMonitorType] = useState('HTTPS');
  const [editMonitorMethod, setEditMonitorMethod] = useState('GET');
  const [editMonitorInterval, setEditMonitorInterval] = useState('300');
  const [editMonitorTimeout, setEditMonitorTimeout] = useState('10000');
  const [editMonitorExpectedStatus, setEditMonitorExpectedStatus] = useState('200');
  const [editMonitorActive, setEditMonitorActive] = useState(true);
  const [editMonitorError, setEditMonitorError] = useState('');
  const [submittingEditMonitor, setSubmittingEditMonitor] = useState(false);

  // Monitor operations
  const [checkingMonitorId, setCheckingMonitorId] = useState<number | null>(null);

  // Fetch helper
  const loadProjectData = async () => {
    if (!token || isNaN(parsedProjId)) return;

    setLoadingMonitors(true);
    setLoadingStats(true);
    setLoadingIncidents(true);
    setLoadingPerformance(true);

    try {
      // 1. Load monitors
      const monsRes = await fetch(`/api/projects/${parsedProjId}/monitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (monsRes.ok) {
        const mons = await monsRes.json();
        setMonitorsList(mons);
      }

      // 2. Load uptime stats
      const statsRes = await fetch(`/api/projects/${parsedProjId}/uptime`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUptimeStats(stats);
      }

      // 3. Load performance history
      const perfRes = await fetch(`/api/projects/${parsedProjId}/performance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (perfRes.ok) {
        const perf = await perfRes.json();
        setPerformanceData(perf);
      }

      // 4. Load incidents
      if (monitorsList.length > 0) {
        // Fetch incidents for the first monitor or all as mock fallback if none
        const incRes = await fetch(`/api/monitors/${monitorsList[0].id}/incidents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (incRes.ok) {
          const incs = await incRes.json();
          setIncidentsList(incs);
        }
      } else {
        setIncidentsList([]);
      }

    } catch (err) {
      console.error('Failed to load project real-time monitoring data:', err);
    } finally {
      setLoadingMonitors(false);
      setLoadingStats(false);
      setLoadingIncidents(false);
      setLoadingPerformance(false);
    }
  };

  useEffect(() => {
    if (token && !isNaN(parsedProjId)) {
      loadProjectData();
    }
  }, [token, projectIdSuffix]);

  // Handle Add Monitor
  const handleAddMonitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMonitorError('');
    setSubmittingMonitor(true);

    try {
      const res = await fetch(`/api/projects/${parsedProjId}/monitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: monitorName,
          url: monitorUrl,
          monitorType,
          method: monitorMethod,
          intervalSeconds: parseInt(monitorInterval),
          timeoutMs: parseInt(monitorTimeout),
          expectedStatusCode: parseInt(monitorExpectedStatus),
          active: monitorActive,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create monitor');
      }

      // Reset form
      setMonitorName('');
      setMonitorUrl('');
      setMonitorActive(true);
      setShowAddMonitorModal(false);
      await loadProjectData();
      await refreshProjects();
    } catch (err: any) {
      setAddMonitorError(err.message || 'Error occurred while creating monitor.');
    } finally {
      setSubmittingMonitor(false);
    }
  };

  // Open Edit Monitor Modal and pre-fill form
  const openEditMonitorModal = (mon: any) => {
    setEditingMonitor(mon);
    setEditMonitorName(mon.name);
    setEditMonitorUrl(mon.url);
    setEditMonitorType(mon.monitorType);
    setEditMonitorMethod(mon.method || 'GET');
    setEditMonitorInterval(String(mon.intervalSeconds));
    setEditMonitorTimeout(String(mon.timeoutMs));
    setEditMonitorExpectedStatus(String(mon.expectedStatusCode));
    setEditMonitorActive(mon.active);
    setEditMonitorError('');
    setShowEditMonitorModal(true);
  };

  // Handle Edit Monitor
  const handleEditMonitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMonitorError('');
    setSubmittingEditMonitor(true);

    try {
      const res = await fetch(`/api/monitors/${editingMonitor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editMonitorName,
          url: editMonitorUrl,
          monitorType: editMonitorType,
          method: editMonitorMethod,
          intervalSeconds: parseInt(editMonitorInterval),
          timeoutMs: parseInt(editMonitorTimeout),
          expectedStatusCode: parseInt(editMonitorExpectedStatus),
          active: editMonitorActive
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update monitor');
      }

      setShowEditMonitorModal(false);
      setEditingMonitor(null);
      await loadProjectData();
      await refreshProjects();
    } catch (err: any) {
      setEditMonitorError(err.message || 'Error occurred while updating monitor.');
    } finally {
      setSubmittingEditMonitor(false);
    }
  };

  // Run Check Now
  const handleRunCheckNow = async (monitorId: number) => {
    setCheckingMonitorId(monitorId);
    try {
      const res = await fetch(`/api/monitors/${monitorId}/check`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadProjectData();
        await refreshProjects();
      }
    } catch (err) {
      console.error('Manual trigger check failed:', err);
    } finally {
      setCheckingMonitorId(null);
    }
  };

  // Pause monitor
  const handlePauseMonitor = async (monitorId: number) => {
    try {
      const res = await fetch(`/api/monitors/${monitorId}/pause`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadProjectData();
      }
    } catch (err) {
      console.error('Pause failed:', err);
    }
  };

  // Resume monitor
  const handleResumeMonitor = async (monitorId: number) => {
    try {
      const res = await fetch(`/api/monitors/${monitorId}/resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadProjectData();
      }
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };

  // Delete monitor
  const handleDeleteMonitor = async (monitorId: number) => {
    if (confirm('Are you sure you want to permanently delete this monitor and its history?')) {
      try {
        const res = await fetch(`/api/monitors/${monitorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          await loadProjectData();
          await refreshProjects();
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  if (selectedProject) {
    const isAwaitingData = !uptimeStats || uptimeStats.totalChecks === 0;

    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up font-sans text-xs">
        {/* Breadcrumb back */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard/projects')}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to environments list</span>
          </button>
          
          <button 
            onClick={loadProjectData}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Detailed Hero */}
        <div className="p-5 rounded-xl border border-neutral-900 bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAwaitingData ? 'bg-neutral-500' : (monitorsList.some(m => m.lastStatus === 'DOWN') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} `} />
              <h2 className="text-xl font-display font-semibold text-white tracking-tight">{selectedProject.name}</h2>
              <span className="text-[9px] font-mono bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2.5 py-0.5 rounded uppercase">
                {selectedProject.environment.toUpperCase()}
              </span>
            </div>
            <p className="text-neutral-500 font-mono text-[10px]">{selectedProject.url}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddMonitorModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Monitor</span>
            </button>
          </div>
        </div>

        {/* Real-time Sub tabs navigation */}
        <div className="border-b border-neutral-900 flex gap-6 text-[10px] font-mono uppercase tracking-wider">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'monitors', label: `Monitors (${monitorsList.length})` },
            { id: 'performance', label: 'Performance Analytics' },
            { id: 'incidents', label: 'Incidents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-2.5 px-1 border-b-2 font-semibold transition-colors cursor-pointer ${activeSubTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content switcher */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Uptime (30d)', 
                  val: isAwaitingData ? 'Awaiting data' : `${uptimeStats.uptimePercentage?.toFixed(2)}%`, 
                  sub: isAwaitingData ? 'No checks run yet' : `${uptimeStats.successfulChecks} / ${uptimeStats.totalChecks} checks` 
                },
                { 
                  label: 'Avg Response Time', 
                  val: isAwaitingData ? 'Awaiting data' : `${uptimeStats.averageResponseTimeMs}ms`, 
                  sub: isAwaitingData ? 'No telemetry traces' : `Min: ${uptimeStats.minResponseTimeMs}ms / Max: ${uptimeStats.maxResponseTimeMs}ms` 
                },
                { 
                  label: 'Open Outages', 
                  val: loadingIncidents ? 'Loading...' : `${incidentsList.filter(i => i.status === 'OPEN').length}`, 
                  sub: 'Currently active alerts' 
                },
                { 
                  label: 'Security Integrity', 
                  val: 'UNKNOWN', 
                  sub: 'Security analysis not available yet' 
                }
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/40 space-y-1">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">{m.label}</span>
                  <span className="text-base font-bold text-white block truncate">{m.val}</span>
                  <span className="text-[10px] text-neutral-500 block truncate">{m.sub}</span>
                </div>
              ))}
            </div>

            {/* Health Logs Console */}
            <div className="space-y-2">
              <h3 className="font-bold text-white font-sans text-xs">Edge Cluster Status Monitor</h3>
              <div className="p-4 rounded-xl border border-neutral-900 bg-black font-mono text-[10px] text-neutral-400 space-y-2 leading-relaxed">
                {isAwaitingData ? (
                  <p className="text-neutral-500">Awaiting monitoring data. Create a monitor above to launch live telemetry checks.</p>
                ) : (
                  <>
                    <p className="text-neutral-600">[{new Date().toISOString()}] TELEMETRY CLUSTER ACTIVE...</p>
                    <p className="text-emerald-400">STATUS: Operational score validated at {uptimeStats.uptimePercentage?.toFixed(1)}%</p>
                    <p className="text-indigo-400">LATENCY: Response times range between {uptimeStats.minResponseTimeMs}ms and ${uptimeStats.maxResponseTimeMs}ms (Avg: {uptimeStats.averageResponseTimeMs}ms)</p>
                    <p className="text-neutral-500">HEARTBEAT LOG: {uptimeStats.totalChecks} secure telemetry check events completed today.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'monitors' && (
          <div className="space-y-4">
            {monitorsList.length === 0 ? (
              <div className="p-12 text-center border border-neutral-900 rounded-xl bg-neutral-900/10 space-y-3">
                <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-semibold text-white">No active monitors created yet</h4>
                <p className="text-neutral-500 max-w-sm mx-auto">Monitoring data will appear after you initialize your first HTTP/HTTPS health check monitor.</p>
                <button
                  onClick={() => setShowAddMonitorModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs transition-colors"
                >
                  Create Your First Monitor
                </button>
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-900">
                    <thead className="bg-neutral-900/40 text-[10px] font-mono text-neutral-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Monitor Name</th>
                        <th className="px-4 py-3 text-left">Target URL</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Response Time</th>
                        <th className="px-4 py-3 text-left">Uptime (30d)</th>
                        <th className="px-4 py-3 text-left">Interval</th>
                        <th className="px-4 py-3 text-left">Last Checked</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-xs text-neutral-300">
                      {monitorsList.map((mon) => (
                        <tr key={mon.id} className="hover:bg-neutral-900/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">
                            <button
                              onClick={() => navigate(`/dashboard/monitors/${mon.id}`)}
                              className="text-left font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-all cursor-pointer font-sans"
                            >
                              {mon.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono text-neutral-400 truncate max-w-xs">{mon.url}</td>
                          <td className="px-4 py-3">
                            {!mon.active ? (
                              <span className="inline-flex items-center gap-1.5 text-neutral-500 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                PAUSED
                              </span>
                            ) : mon.lastStatus === 'UP' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                OPERATIONAL
                              </span>
                            ) : mon.lastStatus === 'DOWN' ? (
                              <span className="inline-flex items-center gap-1.5 text-red-400 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                DOWN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-neutral-500 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono">{mon.lastResponseTimeMs ? `${mon.lastResponseTimeMs}ms` : '—'}</td>
                          <td className="px-4 py-3 font-mono text-neutral-400">
                            {mon.uptimePercentage !== null ? `${mon.uptimePercentage.toFixed(1)}%` : 'Awaiting data'}
                          </td>
                          <td className="px-4 py-3 font-mono">{mon.intervalSeconds / 60}m</td>
                          <td className="px-4 py-3 font-mono text-neutral-400 text-[10px]">
                            {mon.lastCheckedAt ? new Date(mon.lastCheckedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button
                              disabled={checkingMonitorId === mon.id}
                              onClick={() => handleRunCheckNow(mon.id)}
                              className="px-2 py-1 rounded bg-neutral-900 text-neutral-400 hover:text-white text-[10px] font-mono disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {checkingMonitorId === mon.id ? 'Checking...' : 'Check Now'}
                            </button>
                            {mon.active ? (
                              <button
                                onClick={() => handlePauseMonitor(mon.id)}
                                className="px-2 py-1 rounded bg-neutral-900 text-amber-500/80 hover:text-amber-400 text-[10px] font-mono transition-colors cursor-pointer"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={() => handleResumeMonitor(mon.id)}
                                className="px-2 py-1 rounded bg-neutral-900 text-emerald-500/80 hover:text-emerald-400 text-[10px] font-mono transition-colors cursor-pointer"
                              >
                                Resume
                              </button>
                            )}
                            <button
                              onClick={() => openEditMonitorModal(mon)}
                              className="px-2 py-1 rounded bg-neutral-900 text-indigo-400 hover:text-indigo-300 text-[10px] font-mono transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMonitor(mon.id)}
                              className="px-2 py-1 rounded bg-neutral-900 text-red-500/80 hover:text-red-400 text-[10px] font-mono transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'performance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white font-sans text-xs">Response Time History</h3>
            {performanceData.length === 0 ? (
              <div className="p-8 text-center border border-neutral-900 rounded-xl bg-neutral-900/10 text-neutral-500">
                Not enough monitoring performance data yet. Performance history will render after your checks run.
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-neutral-900 bg-neutral-950/30 space-y-4">
                <div className="h-48 flex items-end justify-between gap-1 pt-6 border-b border-neutral-900 relative">
                  <div className="absolute top-0 left-0 text-[9px] font-mono text-neutral-500">Latency (ms)</div>
                  
                  {performanceData.slice(-30).map((check: any, idx: number) => {
                    const hPercentage = Math.min(100, Math.max(8, (check.responseTimeMs / 1000) * 100));
                    return (
                      <div key={idx} className="flex-1 group relative flex flex-col items-center">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono px-2 py-1 rounded text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          {check.responseTimeMs}ms ({check.status})
                        </div>
                        <div 
                          style={{ height: `${hPercentage}%` }} 
                          className={`w-full rounded-t ${check.status === 'UP' ? 'bg-indigo-600/80 group-hover:bg-indigo-500' : 'bg-red-500/80 group-hover:bg-red-400'} transition-all`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                  <span>← Older traces</span>
                  <span>Latest Checks (30 nodes)</span>
                  <span>Just now →</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'incidents' && (
          <div className="space-y-4">
            {incidentsList.length === 0 ? (
              <div className="p-8 text-center border border-neutral-900 rounded-xl bg-neutral-900/10 text-neutral-500 font-mono">
                No incidents recorded. Telemetry streams are fully healthy.
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20">
                <table className="min-w-full divide-y divide-neutral-900">
                  <thead className="bg-neutral-900/40 text-[10px] font-mono text-neutral-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Incident Detail</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Started At</th>
                      <th className="px-4 py-3 text-left">Resolved At</th>
                      <th className="px-4 py-3 text-left">Failures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300">
                    {incidentsList.map((inc) => (
                      <tr key={inc.id} className="hover:bg-neutral-900/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{inc.summary || 'Outage reported'}</td>
                        <td className="px-4 py-3">
                          {inc.status === 'OPEN' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-red-400 bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded uppercase">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              OPEN OUTAGE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded uppercase">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              RESOLVED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-400">{new Date(inc.startedAt).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-neutral-400">{inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString() : '—'}</td>
                        <td className="px-4 py-3 font-mono">{inc.failureCount} checks</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Monitor Modal Drawer */}
        {showAddMonitorModal && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-white font-display">Add Telemetry Monitor</h3>
                <button 
                  onClick={() => setShowAddMonitorModal(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {addMonitorError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-[11px] font-mono text-red-400 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{addMonitorError}</span>
                </div>
              )}

              <form onSubmit={handleAddMonitorSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Monitor Name</label>
                  <input
                    type="text"
                    required
                    value={monitorName}
                    onChange={(e) => setMonitorName(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                    placeholder="API Gateway Health"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    value={monitorUrl}
                    onChange={(e) => setMonitorUrl(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                    placeholder="https://api.yourcompany.com/v1/health"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Type</label>
                    <select
                      value={monitorType}
                      onChange={(e) => setMonitorType(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                    >
                      <option value="HTTPS">HTTPS</option>
                      <option value="HTTP">HTTP</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Method</label>
                    <select
                      value={monitorMethod}
                      onChange={(e) => setMonitorMethod(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                    >
                      <option value="GET">GET</option>
                      <option value="HEAD">HEAD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Interval</label>
                    <select
                      value={monitorInterval}
                      onChange={(e) => setMonitorInterval(e.target.value)}
                      className="block w-full px-2 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none"
                    >
                      <option value="60">1 min</option>
                      <option value="300">5 min</option>
                      <option value="600">10 min</option>
                      <option value="900">15 min</option>
                      <option value="1800">30 min</option>
                      <option value="3600">60 min</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Timeout (ms)</label>
                    <input
                      type="number"
                      required
                      value={monitorTimeout}
                      onChange={(e) => setMonitorTimeout(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Status Code</label>
                    <input
                      type="number"
                      required
                      value={monitorExpectedStatus}
                      onChange={(e) => setMonitorExpectedStatus(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Initial Status</label>
                  <select
                    value={monitorActive ? 'true' : 'false'}
                    onChange={(e) => setMonitorActive(e.target.value === 'true')}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="true">Active (Starts monitoring immediately)</option>
                    <option value="false">Paused (Created but checks are disabled)</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowAddMonitorModal(false)}
                    className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMonitor}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submittingMonitor ? 'Validating node...' : 'Create Monitor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Monitor Modal Drawer */}
        {showEditMonitorModal && editingMonitor && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-white font-display">Edit Telemetry Monitor</h3>
                <button 
                  onClick={() => { setShowEditMonitorModal(false); setEditingMonitor(null); }}
                  className="text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {editMonitorError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-[11px] font-mono text-red-400 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{editMonitorError}</span>
                </div>
              )}

              <form onSubmit={handleEditMonitorSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Monitor Name</label>
                  <input
                    type="text"
                    required
                    value={editMonitorName}
                    onChange={(e) => setEditMonitorName(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                    placeholder="API Gateway Health"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    value={editMonitorUrl}
                    onChange={(e) => setEditMonitorUrl(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                    placeholder="https://api.yourcompany.com/v1/health"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Type</label>
                    <select
                      value={editMonitorType}
                      onChange={(e) => setEditMonitorType(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                    >
                      <option value="HTTPS">HTTPS</option>
                      <option value="HTTP">HTTP</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Method</label>
                    <select
                      value={editMonitorMethod}
                      onChange={(e) => setEditMonitorMethod(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                    >
                      <option value="GET">GET</option>
                      <option value="HEAD">HEAD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Interval</label>
                    <select
                      value={editMonitorInterval}
                      onChange={(e) => setEditMonitorInterval(e.target.value)}
                      className="block w-full px-2 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none"
                    >
                      <option value="60">1 min</option>
                      <option value="300">5 min</option>
                      <option value="600">10 min</option>
                      <option value="900">15 min</option>
                      <option value="1800">30 min</option>
                      <option value="3600">60 min</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Timeout (ms)</label>
                    <input
                      type="number"
                      required
                      value={editMonitorTimeout}
                      onChange={(e) => setEditMonitorTimeout(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Status Code</label>
                    <input
                      type="number"
                      required
                      value={editMonitorExpectedStatus}
                      onChange={(e) => setEditMonitorExpectedStatus(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Status</label>
                  <select
                    value={editMonitorActive ? 'true' : 'false'}
                    onChange={(e) => setEditMonitorActive(e.target.value === 'true')}
                    className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="true">Active (Continuous checks enabled)</option>
                    <option value="false">Paused (No automated checks)</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => { setShowEditMonitorModal(false); setEditingMonitor(null); }}
                    className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEditMonitor}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submittingEditMonitor ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Project Environments</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Directly trace multiple live environments from one visual interface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="p-6 rounded-2xl bg-neutral-900/10 border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
                  {proj.environment}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-mono truncate mb-4">{proj.url}</p>
            </div>
            
            <button 
              onClick={() => navigate(`/dashboard/projects/${proj.id}`)}
              className="w-full py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold cursor-pointer transition-all"
            >
              Analyze Telemetry Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. MONITORING PAGE
// ==========================================
export function DashboardMonitoringPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Live Monitoring Streams</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Measure continuous connection requests, socket loops, and runtime heartbeats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Socket Connections', val: '4,210', desc: 'Active web socket pipelines', icon: Activity },
          { label: 'Trace Queue Size', val: '0 incidents', desc: 'Synchronized message payloads', icon: CheckCircle },
          { label: 'Average Ping Region', val: '22 Regions', desc: 'Simultaneous edge ping targets', icon: Globe }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-neutral-900/10 border border-neutral-900">
              <Icon className="w-5 h-5 text-indigo-400 mb-3" />
              <h4 className="text-xs font-mono text-neutral-500 uppercase">{item.label}</h4>
              <span className="text-xl font-bold text-white block mt-1">{item.val}</span>
              <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. PERFORMANCE PAGE
// ==========================================
export function DashboardPerformancePage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Performance Insights</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Detailed metrics covering TTFB, DNS resolution speed, and server response indexes.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Speed Index Correlation Breakdown</h3>
        <p className="text-xs text-neutral-400">Detailed traces across international hosting environments.</p>
        
        <div className="space-y-4 pt-2">
          {[
            { region: 'us-east-1 (N. Virginia)', speed: '42ms', load: 'Excellent' },
            { region: 'ap-northeast-1 (Tokyo)', speed: '128ms', load: 'Good' },
            { region: 'eu-west-1 (Ireland)', speed: '84ms', load: 'Excellent' },
            { region: 'sa-east-1 (São Paulo)', speed: '210ms', load: 'Fair' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono border-b border-neutral-900/50 pb-2">
              <span className="text-neutral-400">{item.region}</span>
              <div className="flex items-center gap-3">
                <span className="text-indigo-400 font-bold">{item.speed}</span>
                <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px]">{item.load}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ERRORS PAGE
// ==========================================
export function DashboardErrorsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Incident Traces & Logs</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Comprehensive audit trail of exceptions and runtime errors.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950 font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="p-3">Error Exception</th>
                <th className="p-3">Endpoint Route</th>
                <th className="p-3">Count</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-sans">
              {[
                { err: 'Database query timeout', route: '/api/orders', count: 143, severity: 'CRITICAL', status: 'Active' },
                { err: 'JWT Verification failure', route: '/auth/verify', count: 28, severity: 'HIGH', status: 'Investigating' },
                { err: 'Failed to ingest trace webhook', route: '/hooks/vercel', count: 4, severity: 'LOW', status: 'Ignored' }
              ].map((item, idx) => (
                <tr key={idx} className="text-neutral-300">
                  <td className="p-3 font-semibold text-white">{item.err}</td>
                  <td className="p-3 font-mono text-indigo-400">{item.route}</td>
                  <td className="p-3 font-mono">{item.count}</td>
                  <td className="p-3 font-mono text-red-400 font-bold">{item.severity}</td>
                  <td className="p-3 text-neutral-500">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SECURITY PAGE
// ==========================================
export function DashboardSecurityPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Security Hardening & Audits</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Automatic verification parameters covering SSL certificates, key exchanges, and OWASP vulns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Security Headers Audit
          </h3>
          <div className="space-y-3 pt-2 text-xs font-mono">
            {[
              { header: 'Strict-Transport-Security (HSTS)', status: 'Active', color: 'text-emerald-400' },
              { header: 'Content-Security-Policy (CSP)', status: 'Active', color: 'text-emerald-400' },
              { header: 'X-Content-Type-Options', status: 'Active', color: 'text-emerald-400' },
              { header: 'CORS Configuration keys', status: 'Warning', color: 'text-amber-400' }
            ].map((hdr, idx) => (
              <div key={idx} className="flex justify-between items-center pb-2 border-b border-neutral-900/50">
                <span className="text-neutral-400">{hdr.header}</span>
                <span className={`font-bold ${hdr.color}`}>{hdr.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
          <h3 className="text-sm font-bold text-white">TLS/SSL Encryption Certificate Details</h3>
          <div className="space-y-3 text-xs text-neutral-400 font-sans">
            <p>Your root certificates are being tracked automatically across 22 edge nodes.</p>
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-900 space-y-1.5 font-mono text-[11px]">
              <p className="text-white">ENCRYPTION TYPE: TLS 1.3 / ECDHE_RSA_AES_256</p>
              <p>ISSUER: Let's Encrypt Authority X3</p>
              <p>REMAINING LIFE: 82 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. RADAR PAGE
// ==========================================
export function DashboardRadarPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Concentric Application Radar</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Visualize critical application performance scores relative to established baseline telemetry parameters.</p>
      </div>

      <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 flex flex-col items-center justify-center space-y-6 min-h-80">
        <div className="relative w-48 h-48 rounded-full border border-neutral-900 flex items-center justify-center animate-spin [animation-duration:15s] select-none">
          {/* Simulated radar sweep lines */}
          <div className="absolute inset-2 rounded-full border border-neutral-900/60" />
          <div className="absolute inset-8 rounded-full border border-neutral-900/40" />
          <div className="absolute inset-16 rounded-full border border-neutral-900/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-indigo-500/30 origin-bottom" />
        </div>

        <div className="max-w-md text-center space-y-1.5">
          <h3 className="text-sm font-bold text-white">Radar Tracking In Progress</h3>
          <p className="text-xs text-neutral-400">MeshPilot is tracking speed metrics, SEO indexing, and SSL keys continually from edge servers.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. AI DIAGNOSTICS PAGE
// ==========================================
export function DashboardAIDiagnosticsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">AI Diagnostics & Recommendations</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Intelligent investigation and regression diagnostics parsed from application trace loops.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Telemetry Recommendation Summary</h3>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          MeshPilot automatically tracks anomalies inside deployment branches to pinpoint slow transactions. No manual logs configuration required.
        </p>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 text-xs font-mono text-neutral-300 space-y-2">
          <p className="text-indigo-400 font-bold">● RECENT LOG SUMMARY [Trace #418]</p>
          <p>Endpoint: /api/orders</p>
          <p>Anomaly Detected: Database query execution latency increased by 38%</p>
          <p>Possible fix: Ensure indices are initialized on orders foreign-keys to prevent pg_locks.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. DEPLOYMENTS PAGE
// ==========================================
export function DashboardDeploymentsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Release Deployments</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Track code builds and synchronized tracing deployment states.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10">
        <div className="space-y-4">
          {[
            { commit: 'Adjust foreign-keys indexing parameters', hash: 'fc92b45', env: 'Production', time: '12 mins ago', status: 'Active' },
            { commit: 'Sync security header keys', hash: 'ac7182b', env: 'Production', time: '2 hours ago', status: 'Succeeded' },
            { commit: 'Initialize dev trace pipeline hooks', hash: 'bf912a4', env: 'Development', time: 'Yesterday', status: 'Succeeded' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs border-b border-neutral-900/50 pb-3 font-mono">
              <div>
                <span className="text-white font-bold block font-sans">{item.commit}</span>
                <span className="text-neutral-500 mt-1 block">commit: {item.hash} // {item.env}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 block font-bold">{item.status}</span>
                <span className="text-neutral-500 mt-1 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. REPORTS PAGE
// ==========================================
export function DashboardReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Performance Reports</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Review weekly and monthly performance indicators parsed for engineering managers.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Downloadable Telemetry Logs</h3>
        <p className="text-xs text-neutral-400">Export high-density performance indexes as standard reports in 1-click.</p>

        <div className="pt-2">
          <button 
            onClick={() => alert('Dispatched weekly telemetry logs compilation download!')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all"
          >
            Export Weekly SLA Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. INTEGRATIONS PAGE
// ==========================================
export function DashboardIntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Active Integrations</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Wire trace telemetry directly into external developer environments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'GitHub Integration', desc: 'Sync commit diff regressions automatically', active: true },
          { name: 'Vercel API Logs', desc: 'Auto-track serverless execution indexes', active: true },
          { name: 'Supabase Postgres', desc: 'Database locking latency telemetry', active: true }
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-2">● Active Integration</span>
              <h4 className="text-sm font-bold text-white">{item.name}</h4>
              <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-500">PROVIDER</span>
              <span className="text-neutral-300">OAuth Secured</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 11. MONITOR DETAILS PAGE (LIVE TELEMETRY VIEW)
// ==========================================
export function MonitorDetailsPage() {
  const { path, navigate } = useRouter();
  const { token } = useAuth();

  // Detect monitor ID from router path (e.g., /dashboard/monitors/1)
  const pathParts = path.split('/');
  const monitorIdStr = pathParts[3] || '';
  const monitorId = parseInt(monitorIdStr);

  const [monitor, setMonitor] = useState<any>(null);
  const [loadingMonitor, setLoadingMonitor] = useState(true);
  const [checksData, setChecksData] = useState<any[]>([]);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const [loadingPerf, setLoadingPerf] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncs, setLoadingIncs] = useState(false);

  // Filters & Pagination
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalChecks, setTotalChecks] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!token || isNaN(monitorId)) return;
    setLoadingMonitor(true);
    setLoadingChecks(true);
    setLoadingPerf(true);
    setLoadingIncs(true);

    try {
      // 1. Fetch monitor details
      const monRes = await fetch(`/api/monitors/${monitorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (monRes.ok) {
        const data = await monRes.json();
        setMonitor(data);
      }

      // 2. Fetch incidents
      const incRes = await fetch(`/api/monitors/${monitorId}/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data);
      }

      // 3. Fetch performance metrics (passes days filter)
      const perfRes = await fetch(`/api/monitors/${monitorId}/performance?days=${daysFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerformance(data);
      }

      // 4. Fetch checks list (paginated)
      const checksRes = await fetch(`/api/monitors/${monitorId}/checks?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (checksRes.ok) {
        const data = await checksRes.json();
        setChecksData(data.checks || []);
        setTotalChecks(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load monitor telemetry details:', err);
    } finally {
      setLoadingMonitor(false);
      setLoadingChecks(false);
      setLoadingPerf(false);
      setLoadingIncs(false);
    }
  };

  useEffect(() => {
    if (token && !isNaN(monitorId)) {
      loadData();
    }
  }, [token, monitorId, daysFilter, page]);

  const handleManualCheck = async () => {
    if (refreshing || isNaN(monitorId)) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/monitors/${monitorId}/check`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to trigger manual check:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePauseToggle = async () => {
    if (!monitor) return;
    const endpoint = monitor.active ? 'pause' : 'resume';
    try {
      const res = await fetch(`/api/monitors/${monitorId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(`Failed to ${endpoint} monitor:`, err);
    }
  };

  if (loadingMonitor && !monitor) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-80 font-mono text-neutral-500 text-xs gap-3">
        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
        <span>Syncing telemetry stream layers...</span>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="p-8 text-center border border-neutral-900 rounded-xl bg-neutral-900/10 space-y-3 font-mono text-xs max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="text-sm font-semibold text-white">Telemetry monitor not found</h4>
        <p className="text-neutral-500">The monitor node identifier might be deprecated or belongs to an foreign workspace.</p>
        <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate percentiles if we have series
  const rawChartSeries = performance?.chartSeries || [];
  const validTimes = rawChartSeries
    .map((c: any) => c.responseTimeMs)
    .filter((t: any): t is number => typeof t === 'number' && t > 0);

  // Percentile helper locally
  const getPercentileVal = (pct: number) => {
    if (validTimes.length === 0) return 0;
    const sorted = [...validTimes].sort((a, b) => a - b);
    const index = Math.ceil((pct / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };

  const p50 = getPercentileVal(50);
  const p95 = getPercentileVal(95);
  const p99 = getPercentileVal(99);

  const activeChecks = rawChartSeries;
  const isAwaiting = activeChecks.length === 0;
  
  // Calculate uptime %
  const successfulChecks = activeChecks.filter((c: any) => c.status === 'UP').length;
  const totalValidChecks = activeChecks.length;
  const uptimeScore = totalValidChecks > 0 ? (successfulChecks / totalValidChecks) * 100 : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up font-sans text-xs">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/dashboard/projects/${monitor.projectId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to {monitor.project?.name || 'Project'} workspace</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monitor Hero Banner */}
      <div className="p-5 rounded-xl border border-neutral-900 bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${!monitor.active ? 'bg-neutral-600' : (monitor.lastStatus === 'DOWN' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')} `} />
            <h2 className="text-xl font-display font-semibold text-white tracking-tight">{monitor.name}</h2>
            <span className="text-[9px] font-mono bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2.5 py-0.5 rounded uppercase">
              {monitor.method}
            </span>
            <span className="text-[9px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800 px-2.5 py-0.5 rounded uppercase">
              {monitor.intervalSeconds / 60}m INTERVAL
            </span>
          </div>
          <p className="text-neutral-500 font-mono text-[10px] break-all max-w-xl">{monitor.url}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePauseToggle}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${monitor.active ? 'border-neutral-800 hover:bg-neutral-900 text-amber-500' : 'border-emerald-800 hover:bg-emerald-950/20 text-emerald-400'}`}
          >
            {monitor.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{monitor.active ? 'Pause Monitor' : 'Resume Monitor'}</span>
          </button>
          
          <button
            onClick={handleManualCheck}
            disabled={refreshing || !monitor.active}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Run Check Now'}</span>
          </button>
        </div>
      </div>

      {/* Days window filter bar */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">TELEMETRY WINDOW COVERAGE</span>
        <div className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5 font-mono text-[10px]">
          {[
            { val: 1, label: '24h' },
            { val: 7, label: '7d' },
            { val: 30, label: '30d' },
            { val: 90, label: '90d' }
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => { setDaysFilter(opt.val); setPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${daysFilter === opt.val ? 'bg-indigo-600 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Uptime Score', 
            val: isAwaiting ? 'Awaiting data' : (uptimeScore !== null ? `${uptimeScore.toFixed(2)}%` : '—'), 
            sub: isAwaiting ? 'No monitoring runs' : `${successfulChecks} successful checks` 
          },
          { 
            label: 'Average Speed', 
            val: isAwaiting ? 'Awaiting data' : `${performance?.average || 0}ms`, 
            sub: isAwaiting ? 'No latency telemetry' : `Min: ${performance?.minimum || 0}ms / Max: ${performance?.maximum || 0}ms` 
          },
          { 
            label: 'Percentile Latency', 
            val: isAwaiting ? 'Awaiting data' : `p95: ${p95}ms`, 
            sub: isAwaiting ? 'No historical traces' : `p50: ${p50}ms / p99: ${p99}ms` 
          },
          { 
            label: 'Operational Status', 
            val: !monitor.active ? 'PAUSED' : (monitor.lastStatus || 'UNKNOWN'), 
            sub: monitor.active ? `Next scheduled check: ${monitor.nextCheckAt ? new Date(monitor.nextCheckAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}` : 'Suspended' 
          }
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/40 space-y-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">{m.label}</span>
            <span className="text-base font-bold text-white block truncate">{m.val}</span>
            <span className="text-[10px] text-neutral-500 block truncate">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Concentric Timeline (Visual contribution style) */}
      <div className="p-5 rounded-xl border border-neutral-900 bg-neutral-950/20 space-y-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
          <span>Uptime Reliability Grid</span>
          <span>Latest {activeChecks.length} checks</span>
        </div>
        
        {isAwaiting ? (
          <div className="p-4 text-center text-neutral-500 font-mono">No telemetry traces logged for this window.</div>
        ) : (
          <div className="space-y-4">
            {/* Blinking Grid nodes */}
            <div className="flex flex-wrap gap-1 bg-black/20 p-2.5 rounded-lg border border-neutral-900">
              {activeChecks.map((check: any, idx: number) => {
                let colorClass = 'bg-neutral-800';
                if (check.status === 'UP') colorClass = 'bg-emerald-500 hover:bg-emerald-400';
                else if (check.status === 'DOWN') colorClass = 'bg-red-500 hover:bg-red-400';
                else if (check.status === 'TIMEOUT') colorClass = 'bg-amber-500 hover:bg-amber-400';
                else if (check.status === 'ERROR') colorClass = 'bg-purple-500 hover:bg-purple-400';
                
                return (
                  <div 
                    key={idx} 
                    className={`w-3.5 h-7 rounded ${colorClass} transition-all cursor-help relative group`}
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-neutral-900 border border-neutral-800 text-[9px] font-mono px-2 py-1 rounded text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {new Date(check.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {check.status} • {check.responseTimeMs}ms
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
              <span>← Older traces</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> UP</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> DOWN</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> TIMEOUT</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> ERROR</span>
              </div>
              <span>Just now →</span>
            </div>
          </div>
        )}
      </div>

      {/* Latency History Chart */}
      <div className="p-5 rounded-xl border border-neutral-900 bg-neutral-950/20 space-y-3">
        <h3 className="font-bold text-white font-sans text-xs">Edge Response Latency Over Time</h3>
        {isAwaiting ? (
          <div className="p-6 text-center text-neutral-500 font-mono">Performance history will populate as health checks resolve.</div>
        ) : (
          <div className="space-y-4">
            <div className="h-44 flex items-end justify-between gap-1 pt-6 border-b border-neutral-900 relative">
              <div className="absolute top-0 left-0 text-[9px] font-mono text-neutral-500">Latency (ms)</div>
              
              {activeChecks.slice(-30).map((check: any, idx: number) => {
                const maxAllowed = 1500; // Cap visual reference for bar heights
                const hPercentage = Math.min(100, Math.max(8, (check.responseTimeMs / maxAllowed) * 100));
                return (
                  <div key={idx} className="flex-1 group relative flex flex-col items-center">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono px-2 py-1 rounded text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {check.responseTimeMs}ms ({check.status})
                    </div>
                    <div 
                      style={{ height: `${hPercentage}%` }} 
                      className={`w-full rounded-t ${check.status === 'UP' ? 'bg-indigo-600/80 group-hover:bg-indigo-500' : 'bg-red-500/80 group-hover:bg-red-400'} transition-all`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] font-mono text-neutral-500">
              <span>← Older traces</span>
              <span>Latest Logs (Max 30 check nodes)</span>
              <span>Just now →</span>
            </div>
          </div>
        )}
      </div>

      {/* Check History Table & Incidents split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check History table */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-white font-sans text-xs">Historical Telemetry Checks</h3>
          
          <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20">
            <table className="min-w-full divide-y divide-neutral-900 text-xs">
              <thead className="bg-neutral-900/40 text-[9px] font-mono text-neutral-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Timestamp</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Code</th>
                  <th className="px-4 py-2.5 text-left">Response Time</th>
                  <th className="px-4 py-2.5 text-left">Diagnostic Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {checksData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 font-mono">No historical checks logged for this window.</td>
                  </tr>
                ) : (
                  checksData.map((check) => (
                    <tr key={check.id} className="hover:bg-neutral-900/10">
                      <td className="px-4 py-2.5 font-mono text-neutral-400 text-[10px]">
                        {new Date(check.checkedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${check.status === 'UP' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-red-400 bg-red-950/20 border border-red-900/30'}`}>
                          {check.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-neutral-400">{check.statusCode || '—'}</td>
                      <td className="px-4 py-2.5 font-mono">{check.responseTimeMs}ms</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-500 text-[10px] max-w-xs truncate" title={check.errorMessage}>
                        {check.errorType ? `${check.errorType}: ${check.errorMessage || 'Unknown failure'}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination bar */}
          {totalChecks > limit && (
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 border-t border-neutral-900 pt-3">
              <span>Showing {checksData.length} of {totalChecks} entries</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-30 cursor-pointer text-white hover:border-neutral-700"
                >
                  Previous
                </button>
                <button
                  disabled={page * limit >= totalChecks}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-30 cursor-pointer text-white hover:border-neutral-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Incident tracker list */}
        <div className="space-y-3 text-left">
          <h3 className="font-bold text-white font-sans text-xs">Recent Incidents</h3>
          
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="p-6 text-center border border-neutral-900 rounded-xl bg-neutral-900/10 text-neutral-500 font-mono">
                No outage incidents recorded.
              </div>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="p-3.5 rounded-xl border border-neutral-900 bg-neutral-950/40 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${inc.status === 'OPEN' ? 'text-red-400 bg-red-950/20 border border-red-900/30' : 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'}`}>
                      {inc.status}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">{new Date(inc.startedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-white leading-relaxed">{inc.summary}</p>
                  <div className="text-[10px] font-mono text-neutral-500 space-y-0.5 border-t border-neutral-900/40 pt-1.5">
                    <p>DURATION: {inc.resolvedAt ? `${Math.round((new Date(inc.resolvedAt).getTime() - new Date(inc.startedAt).getTime()) / 60000)} minutes` : 'Ongoing'}</p>
                    <p>CHECKS DETECTED: {inc.failureCount} failed rounds</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
