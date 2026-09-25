import React, { useState, useEffect } from 'react';
import { useDashboard, Project } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../components/Router';
import { 
  Layers, Shield, Activity, TrendingUp, AlertOctagon, Brain, 
  GitCommit, BarChart3, Puzzle, ArrowLeft, CheckCircle, Globe,
  Settings, Terminal, HelpCircle, ExternalLink, Flame, ShieldAlert, Cpu, HardDrive,
  Plus, Play, Pause, RefreshCw, Trash2, Clock, AlertTriangle, AlertCircle, Key
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

  // API Monitors State
  const [apiMonitorsList, setApiMonitorsList] = useState<any[]>([]);
  const [loadingApiMonitors, setLoadingApiMonitors] = useState(false);
  
  // Selected API Monitor details/checks history
  const [selectedApiMonitorId, setSelectedApiMonitorId] = useState<number | null>(null);
  const [selectedApiMonitor, setSelectedApiMonitor] = useState<any | null>(null);
  const [apiChecks, setApiChecks] = useState<any[]>([]);
  const [apiIncidents, setApiIncidents] = useState<any[]>([]);
  const [apiPerformance, setApiPerformance] = useState<any | null>(null);
  const [loadingApiDetail, setLoadingApiDetail] = useState(false);

  // Add API Monitor form state
  const [showAddApiModal, setShowAddApiModal] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiInterval, setApiInterval] = useState('300');
  const [apiTimeout, setApiTimeout] = useState('10000');
  const [apiExpectedStatus, setApiExpectedStatus] = useState('200');
  const [apiExpectedContentType, setApiExpectedContentType] = useState('');
  const [apiHeaders, setApiHeaders] = useState('{}');
  const [apiBody, setApiBody] = useState('');
  const [apiValidationType, setApiValidationType] = useState('none');
  const [apiJsonPath, setApiJsonPath] = useState('');
  const [apiOperator, setApiOperator] = useState('exists');
  const [apiExpectedValue, setApiExpectedValue] = useState('');
  const [apiActive, setApiActive] = useState(true);
  const [addApiError, setAddApiError] = useState('');
  const [submittingApi, setSubmittingApi] = useState(false);

  // API Monitor check manual triggers loading state
  const [checkingApiId, setCheckingApiId] = useState<number | null>(null);

  // Fetch helper
  const loadProjectData = async () => {
    if (!token || isNaN(parsedProjId)) return;

    setLoadingMonitors(true);
    setLoadingStats(true);
    setLoadingIncidents(true);
    setLoadingPerformance(true);
    setLoadingApiMonitors(true);

    try {
      // 1. Load monitors
      const monsRes = await fetch(`/api/projects/${parsedProjId}/monitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (monsRes.ok) {
        const mons = await monsRes.json();
        setMonitorsList(mons);
      }

      // 2. Load API monitors
      const apiMonsRes = await fetch(`/api/projects/${parsedProjId}/api-monitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (apiMonsRes.ok) {
        const apiMons = await apiMonsRes.json();
        setApiMonitorsList(apiMons);
      }

      // 3. Load uptime stats
      const statsRes = await fetch(`/api/projects/${parsedProjId}/uptime`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUptimeStats(stats);
      }

      // 4. Load performance history
      const perfRes = await fetch(`/api/projects/${parsedProjId}/performance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (perfRes.ok) {
        const perf = await perfRes.json();
        setPerformanceData(perf);
      }

      // 5. Load incidents
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
      setLoadingApiMonitors(false);
    }
  };

  // Helper to load specific API Monitor detailed stats/checks/incidents
  const loadApiMonitorDetail = async (id: number) => {
    if (!token) return;
    setLoadingApiDetail(true);
    setSelectedApiMonitor(null);
    try {
      // Detail
      const dRes = await fetch(`/api/api-monitors/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dRes.ok) {
        const details = await dRes.json();
        setSelectedApiMonitor(details);
      }

      // Checks
      const cRes = await fetch(`/api/api-monitors/${id}/checks?limit=15`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cRes.ok) {
        const data = await cRes.json();
        setApiChecks(data.checks || []);
      }

      // Incidents
      const iRes = await fetch(`/api/api-monitors/${id}/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (iRes.ok) {
        const incs = await iRes.json();
        setApiIncidents(incs || []);
      }

      // Performance stats
      const pRes = await fetch(`/api/api-monitors/${id}/performance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pRes.ok) {
        const stats = await pRes.json();
        setApiPerformance(stats);
      }

    } catch (err) {
      console.error('Failed to load API monitor detail:', err);
    } finally {
      setLoadingApiDetail(false);
    }
  };

  useEffect(() => {
    if (token && !isNaN(parsedProjId)) {
      loadProjectData();
      setSelectedApiMonitorId(null);
      setSelectedApiMonitor(null);
    }
  }, [token, projectIdSuffix]);

  useEffect(() => {
    if (selectedApiMonitorId) {
      loadApiMonitorDetail(selectedApiMonitorId);
    }
  }, [selectedApiMonitorId]);

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

  // Add API Monitor Handler
  const handleAddApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddApiError('');
    setSubmittingApi(true);

    try {
      // Parse custom headers
      let headersParsed = {};
      if (apiHeaders) {
        try {
          headersParsed = JSON.parse(apiHeaders);
        } catch (err) {
          throw new Error('Invalid JSON format inside Request Headers. Use key-value string pairs, e.g. {"Authorization": "Bearer {{MY_SECRET}}"}.');
        }
      }

      // Compile response validations structure
      let responseValidation: any = null;
      if (apiValidationType !== 'none') {
        responseValidation = {
          type: apiValidationType,
          jsonPath: apiValidationType === 'json_path' ? apiJsonPath : undefined,
          operator: apiValidationType === 'json_path' ? apiOperator : undefined,
          expectedValue: apiExpectedValue || undefined
        };
      }

      const res = await fetch(`/api/projects/${parsedProjId}/api-monitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: apiName,
          endpointUrl: apiUrl,
          method: apiMethod,
          intervalSeconds: parseInt(apiInterval),
          timeoutMs: parseInt(apiTimeout),
          expectedStatusCode: parseInt(apiExpectedStatus),
          expectedContentType: apiExpectedContentType || undefined,
          requestHeaders: headersParsed,
          requestBody: apiBody || undefined,
          responseValidation,
          active: apiActive
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create API monitor');
      }

      // Reset form
      setApiName('');
      setApiUrl('');
      setApiHeaders('{}');
      setApiBody('');
      setApiExpectedContentType('');
      setApiJsonPath('');
      setApiExpectedValue('');
      setApiValidationType('none');
      setApiActive(true);
      setShowAddApiModal(false);
      await loadProjectData();
    } catch (err: any) {
      setAddApiError(err.message || 'Error occurred while creating API monitor.');
    } finally {
      setSubmittingApi(false);
    }
  };

  // Run API Check manual trigger
  const handleRunApiCheckNow = async (id: number) => {
    setCheckingApiId(id);
    try {
      const res = await fetch(`/api/api-monitors/${id}/check`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadProjectData();
        if (selectedApiMonitorId === id) {
          await loadApiMonitorDetail(id);
        }
      }
    } catch (err) {
      console.error('Manual API check trigger failed:', err);
    } finally {
      setCheckingApiId(null);
    }
  };

  // Delete API Monitor
  const handleDeleteApiMonitor = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this API monitor and its performance history?')) {
      try {
        const res = await fetch(`/api/api-monitors/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setSelectedApiMonitorId(null);
          setSelectedApiMonitor(null);
          await loadProjectData();
        }
      } catch (err) {
        console.error('Delete API monitor failed:', err);
      }
    }
  };

  // Pause API Monitor
  const handlePauseApiMonitor = async (id: number) => {
    try {
      const res = await fetch(`/api/api-monitors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: false })
      });
      if (res.ok) {
        await loadProjectData();
        if (selectedApiMonitorId === id) loadApiMonitorDetail(id);
      }
    } catch (err) {
      console.error('Pause failed:', err);
    }
  };

  // Resume API Monitor
  const handleResumeApiMonitor = async (id: number) => {
    try {
      const res = await fetch(`/api/api-monitors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: true })
      });
      if (res.ok) {
        await loadProjectData();
        if (selectedApiMonitorId === id) loadApiMonitorDetail(id);
      }
    } catch (err) {
      console.error('Resume failed:', err);
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
            { id: 'monitors', label: `Standard Monitors (${monitorsList.length})` },
            { id: 'apiMonitors', label: `API Monitors (${apiMonitorsList.length})` },
            { id: 'performance', label: 'Performance Analytics' },
            { id: 'incidents', label: 'Incidents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedApiMonitorId(null);
                setSelectedApiMonitor(null);
              }}
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
// ==========================================
// 4. ERRORS PAGE (REAL ERROR TRACKING ARCHITECTURE)
// ==========================================
export function DashboardErrorsPage() {
  const { projects } = useDashboard();
  const { token } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'errors' | 'keys' | 'releases'>('errors');

  // Errors state
  const [errorsList, setErrorsList] = useState<any[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [errorTotalCount, setErrorTotalCount] = useState(0);
  const [errorsPage, setErrorsPage] = useState(1);
  const [selectedErrorId, setSelectedErrorId] = useState<number | null>(null);
  const [errorDetail, setErrorRecord] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Timeline events state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineTotal, setTimelineTotal] = useState(0);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Ingestion Keys state
  const [keysList, setKeysList] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState(false);

  // Releases state
  const [releasesList, setReleasesList] = useState<any[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [newReleaseVersion, setNewReleaseVersion] = useState('');
  const [newReleaseCommit, setNewReleaseCommit] = useState('');
  const [newReleaseEnv, setNewReleaseEnv] = useState('PRODUCTION');
  const [submittingRelease, setSubmittingRelease] = useState(false);

  // Error Filters
  const [filterEnv, setFilterEnv] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Status Copying
  const [copiedIndex, setCopiedIndex] = useState(false);

  // Load active project automatically if projects list is available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(parseInt(projects[0].id));
    }
  }, [projects]);

  // Load Errors
  const loadErrors = async () => {
    if (!token || !selectedProjectId) return;
    setLoadingErrors(true);
    try {
      const url = new URL(`/api/projects/${selectedProjectId}/errors`, window.location.origin);
      url.searchParams.append('page', String(errorsPage));
      url.searchParams.append('limit', '10');
      if (filterEnv) url.searchParams.append('environment', filterEnv);
      if (filterSeverity) url.searchParams.append('severity', filterSeverity);
      if (filterStatus) url.searchParams.append('status', filterStatus);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setErrorsList(data.errors || []);
        setErrorTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load error groups:', err);
    } finally {
      setLoadingErrors(false);
    }
  };

  // Load Ingestion Keys
  const loadKeys = async () => {
    if (!token || !selectedProjectId) return;
    setLoadingKeys(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/ingestion-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKeysList(data || []);
      }
    } catch (err) {
      console.error('Failed to load keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  };

  // Load Releases
  const loadReleases = async () => {
    if (!token || !selectedProjectId) return;
    setLoadingReleases(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/releases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReleasesList(data || []);
      }
    } catch (err) {
      console.error('Failed to load releases:', err);
    } finally {
      setLoadingReleases(false);
    }
  };

  // Trigger loads based on active subtab
  useEffect(() => {
    if (selectedProjectId) {
      if (activeTab === 'errors') loadErrors();
      if (activeTab === 'keys') loadKeys();
      if (activeTab === 'releases') loadReleases();
    }
  }, [selectedProjectId, activeTab, errorsPage, filterEnv, filterSeverity, filterStatus, searchQuery]);

  // Load individual error detail
  const loadErrorDetail = async (errorId: number) => {
    if (!token) return;
    setLoadingDetail(true);
    setErrorRecord(null);
    try {
      const res = await fetch(`/api/errors/${errorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setErrorRecord(data);
        // Reset timeline page
        setTimelinePage(1);
        loadTimelineEvents(errorId, 1);
      }
    } catch (err) {
      console.error('Failed to load error detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load error occurrence timeline events (paginated)
  const loadTimelineEvents = async (errorId: number, page: number) => {
    if (!token) return;
    setLoadingTimeline(true);
    try {
      const res = await fetch(`/api/errors/${errorId}/events?page=${page}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimelineEvents(data.events || []);
        setTimelineTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load timeline events:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Mutate error state (Resolve, Reopen, Ignore)
  const handleUpdateErrorState = async (errorId: number, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/errors/${errorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await loadErrors();
        await loadErrorDetail(errorId);
      }
    } catch (err) {
      console.error('Failed to update error state:', err);
    }
  };

  // Assign error to user
  const handleAssignUser = async (errorId: number, userIdStr: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/errors/${errorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTo: userIdStr ? parseInt(userIdStr) : null })
      });
      if (res.ok) {
        await loadErrors();
        await loadErrorDetail(errorId);
      }
    } catch (err) {
      console.error('Failed to assign user:', err);
    }
  };

  // Generate Ingestion Key
  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || submittingKey) return;
    setSubmittingKey(true);
    setGeneratedRawKey(null);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/ingestion-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedRawKey(data.rawKey);
        setNewKeyName('');
        await loadKeys();
      }
    } catch (err) {
      console.error('Key generation failed:', err);
    } finally {
      setSubmittingKey(false);
    }
  };

  // Revoke Ingestion Key
  const handleRevokeKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to permanently revoke this ingestion key? SDK clients using this key will immediately be blocked.')) return;
    try {
      const res = await fetch(`/api/ingestion-keys/${keyId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadKeys();
      }
    } catch (err) {
      console.error('Revocation failed:', err);
    }
  };

  // Register a release version
  const handleRegisterReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseVersion || submittingRelease) return;
    setSubmittingRelease(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/releases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          version: newReleaseVersion,
          commitSha: newReleaseCommit || null,
          environment: newReleaseEnv
        })
      });
      if (res.ok) {
        setNewReleaseVersion('');
        setNewReleaseCommit('');
        await loadReleases();
      }
    } catch (err) {
      console.error('Release registry failed:', err);
    } finally {
      setSubmittingRelease(false);
    }
  };

  const handleCopyStack = (trace: string) => {
    navigator.clipboard.writeText(trace);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  // Compute actual aggregated metrics from errorsList for selected project
  // "Do not show metrics when there is insufficient data. Use 'Awaiting error data' instead of fake values."
  const projectErrorsList = errorsList;
  const isAwaitingData = projectErrorsList.length === 0 && !loadingErrors;

  const totalOpenErrors = projectErrorsList.filter(e => e.status === 'OPEN').length;
  const totalCriticalErrors = projectErrorsList.filter(e => e.severity === 'CRITICAL' && e.status === 'OPEN').length;
  const totalAffectedUsers = projectErrorsList.reduce((acc, curr) => acc + (curr.affectedUsersCount || 0), 0);
  const totalOccurrences = projectErrorsList.reduce((acc, curr) => acc + (curr.occurrenceCount || 0), 0);
  
  // Calculate errors seen in last 24h
  const errorsTodayCount = projectErrorsList.filter(e => {
    const lastSeen = new Date(e.lastSeenAt);
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
    return lastSeen > dayAgo;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans text-xs">
      {/* Header section with Project selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Real Error Tracking & Grouping</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Production telemetry engine grouping raw occurrences into deterministic incident buckets.</p>
        </div>

        {/* Project Dropdown selection */}
        {projects.length > 0 && (
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-wider">Operational Target</span>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                setSelectedProjectId(parseInt(e.target.value));
                setSelectedErrorId(null);
                setErrorRecord(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.environment})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Subtabs Navigation */}
      <div className="border-b border-neutral-900 flex gap-6 text-[10px] font-mono uppercase tracking-wider">
        {[
          { id: 'errors', label: 'Errors & Issues' },
          { id: 'keys', label: 'Secure Ingestion Keys' },
          { id: 'releases', label: 'Release Tracking' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-1 border-b-2 font-semibold transition-colors cursor-pointer ${activeTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT Switcher */}

      {activeTab === 'errors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Error list pane (left/center) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Open Issues', val: isAwaitingData ? 'Awaiting error data' : totalOpenErrors, sub: 'Requires investigation' },
                { label: 'Critical Errors', val: isAwaitingData ? 'Awaiting error data' : totalCriticalErrors, sub: 'Immediate risk vectors' },
                { label: 'Errors Today (24h)', val: isAwaitingData ? 'Awaiting error data' : errorsTodayCount, sub: 'Hourly frequency' },
                { label: 'Error Rate Events', val: isAwaitingData ? 'Awaiting error data' : totalOccurrences, sub: 'Telemetry signals count' },
                { label: 'Affected Users', val: isAwaitingData ? 'Awaiting error data' : totalAffectedUsers, sub: 'Secure unique hashes' },
                { label: 'New Issues (30d)', val: isAwaitingData ? 'Awaiting error data' : projectErrorsList.length, sub: 'Recent distinct fingerprints' }
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/40 space-y-1">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">{m.label}</span>
                  <span className={`font-bold block truncate ${isAwaitingData ? 'text-neutral-500 text-xs font-mono font-normal' : 'text-white text-base'}`}>
                    {m.val}
                  </span>
                  <span className="text-[10px] text-neutral-600 block truncate">{m.sub}</span>
                </div>
              ))}
            </div>

            {/* Error Filters */}
            <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/20 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search error messages..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setErrorsPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60 w-48"
                />

                <select
                  value={filterSeverity}
                  onChange={(e) => { setFilterSeverity(e.target.value); setErrorsPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="ERROR">ERROR</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                  <option value="DEBUG">DEBUG</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setErrorsPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="IGNORED">IGNORED</option>
                </select>
              </div>

              {loadingErrors && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>

            {/* Errors List Table */}
            {errorsList.length === 0 ? (
              <div className="p-12 text-center border border-neutral-900 rounded-2xl bg-neutral-950/10 space-y-3 font-mono text-neutral-500">
                <ShieldAlert className="w-8 h-8 text-neutral-700 mx-auto" />
                <h4 className="text-white font-sans text-sm font-semibold">No issues matching filters found</h4>
                <p className="max-w-sm mx-auto text-neutral-600">Integrate MeshPilot Error SDK into your source code utilizing an ingestion key to trace production exceptions.</p>
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-900 text-left">
                    <thead className="bg-neutral-900/40 text-[9px] font-mono text-neutral-500 uppercase">
                      <tr>
                        <th className="p-3">Exception / Issue</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3 text-center">Occurrences</th>
                        <th className="p-3 text-center">Users</th>
                        <th className="p-3">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-neutral-300">
                      {errorsList.map((err) => (
                        <tr 
                          key={err.id}
                          onClick={() => {
                            setSelectedErrorId(err.id);
                            loadErrorDetail(err.id);
                          }}
                          className={`hover:bg-neutral-900/20 transition-colors cursor-pointer ${selectedErrorId === err.id ? 'bg-indigo-950/10 text-white border-l-2 border-indigo-500' : ''}`}
                        >
                          <td className="p-3">
                            <div className="font-semibold block truncate max-w-sm text-white">{err.message}</div>
                            <span className="text-[10px] text-neutral-500 font-mono block truncate max-w-sm">
                              {err.exceptionType} • fingerprint: {err.fingerprint.slice(0, 8)}...
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              err.severity === 'CRITICAL' ? 'bg-red-950/30 text-red-400 border border-red-900/30' :
                              err.severity === 'ERROR' ? 'bg-orange-950/30 text-orange-400 border border-orange-900/30' :
                              'bg-neutral-900 text-neutral-400 border border-neutral-800'
                            }`}>
                              {err.severity}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-center">{err.occurrenceCount}</td>
                          <td className="p-3 font-mono text-center">{err.affectedUsersCount}</td>
                          <td className="p-3 font-mono text-neutral-500 text-[10px]">
                            {new Date(err.lastSeenAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {errorTotalCount > 10 && (
                  <div className="p-3 bg-neutral-900/30 border-t border-neutral-900 flex justify-between items-center font-mono text-[10px]">
                    <button
                      disabled={errorsPage === 1}
                      onClick={() => setErrorsPage(p => p - 1)}
                      className="px-2 py-1 rounded bg-neutral-950 hover:bg-neutral-900 text-neutral-400 disabled:opacity-50"
                    >
                      ← Previous
                    </button>
                    <span className="text-neutral-500">Page {errorsPage} of {Math.ceil(errorTotalCount / 10)}</span>
                    <button
                      disabled={errorsPage >= Math.ceil(errorTotalCount / 10)}
                      onClick={() => setErrorsPage(p => p + 1)}
                      className="px-2 py-1 rounded bg-neutral-950 hover:bg-neutral-900 text-neutral-400 disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Detail Pane */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 min-h-[300px]">
              {!selectedErrorId ? (
                <div className="text-center py-16 text-neutral-600 space-y-2">
                  <Terminal className="w-6 h-6 text-neutral-800 mx-auto" />
                  <p className="font-mono text-[11px]">Select an error incident trace to load detailed diagnostic diagnostics.</p>
                </div>
              ) : loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-2 font-mono">
                  <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span>Loading full crashdump telemetry...</span>
                </div>
              ) : errorDetail ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-wider">Crash Trace Details</span>
                    <h3 className="text-sm font-semibold text-white leading-snug">{errorDetail.message}</h3>
                    <p className="font-mono text-[10px] text-neutral-400 block">{errorDetail.exceptionType}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-3 gap-2">
                    {errorDetail.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleUpdateErrorState(errorDetail.id, 'RESOLVED')}
                        className="px-2 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/50 text-emerald-400 text-[10px] font-semibold tracking-wide transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateErrorState(errorDetail.id, 'OPEN')}
                        className="px-2 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/50 text-indigo-400 text-[10px] font-semibold tracking-wide transition-colors cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}

                    {errorDetail.status !== 'IGNORED' ? (
                      <button
                        onClick={() => handleUpdateErrorState(errorDetail.id, 'IGNORED')}
                        className="px-2 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-[10px] font-semibold tracking-wide transition-colors cursor-pointer"
                      >
                        Ignore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateErrorState(errorDetail.id, 'OPEN')}
                        className="px-2 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/50 text-indigo-400 text-[10px] font-semibold tracking-wide transition-colors cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}

                    <div className="text-right">
                      <select
                        value={errorDetail.assignedTo || ''}
                        onChange={(e) => handleAssignUser(errorDetail.id, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-[10px] text-neutral-300 font-semibold cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        <option value="1">Assigned (Me)</option>
                      </select>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-[10px] text-neutral-400 font-mono">
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">Severity</span>
                      <span className="text-white font-bold">{errorDetail.severity}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">Status</span>
                      <span className={`font-bold ${errorDetail.status === 'RESOLVED' ? 'text-emerald-400' : 'text-red-400'}`}>{errorDetail.status}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">First Seen</span>
                      <span className="text-neutral-300">{new Date(errorDetail.firstSeenAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">Last Seen</span>
                      <span className="text-neutral-300">{new Date(errorDetail.lastSeenAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">Occurrence Count</span>
                      <span className="text-white font-bold">{errorDetail.occurrenceCount}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 uppercase block">Affected Users</span>
                      <span className="text-white font-bold">{errorDetail.affectedUsersCount}</span>
                    </div>
                  </div>

                  {/* Stack Trace display safely */}
                  {errorDetail.stackTrace && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Stack Frame Dump</label>
                        <button
                          onClick={() => handleCopyStack(errorDetail.stackTrace)}
                          className="px-2 py-0.5 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-950 font-mono text-[9px] text-neutral-400 hover:text-white"
                        >
                          {copiedIndex ? 'Copied!' : 'Copy Stack Trace'}
                        </button>
                      </div>
                      <pre className="p-3 bg-black border border-neutral-900 rounded-xl font-mono text-[9px] text-red-300/80 overflow-auto max-h-48 scrollbar-none leading-relaxed text-left">
                        {errorDetail.stackTrace}
                      </pre>
                    </div>
                  )}

                  {/* Chronological events timeline for this group */}
                  <div className="space-y-2 pt-2 border-t border-neutral-900">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Occurrence Timeline ({timelineTotal})</span>
                    {loadingTimeline ? (
                      <span className="text-neutral-600 font-mono text-[9px] block">Refreshing traces...</span>
                    ) : timelineEvents.length === 0 ? (
                      <span className="text-neutral-600 font-mono text-[9px] block">No trace instances found.</span>
                    ) : (
                      <div className="space-y-1.5">
                        {timelineEvents.map((evt) => (
                          <div key={evt.id} className="p-2 rounded bg-neutral-950 border border-neutral-900 text-[10px] text-neutral-400 space-y-1">
                            <div className="flex justify-between font-mono text-[9px]">
                              <span className="text-white">{new Date(evt.occurredAt).toLocaleString()}</span>
                              <span className="text-indigo-400 uppercase">{evt.environment}</span>
                            </div>
                            {evt.url && <div className="truncate text-neutral-500 font-mono text-[9px]">URL: {evt.url}</div>}
                            <div className="flex justify-between text-[9px] font-mono text-neutral-600">
                              <span>OS: {evt.operatingSystem || '—'} / Browser: {evt.browser || '—'}</span>
                              {evt.release && <span className="text-neutral-500">Rel: {evt.release}</span>}
                            </div>
                          </div>
                        ))}

                        {/* Timeline Pagination */}
                        {timelineTotal > 5 && (
                          <div className="flex justify-between items-center text-[9px] font-mono pt-1 text-neutral-500">
                            <button
                              disabled={timelinePage === 1}
                              onClick={() => { setTimelinePage(p => p - 1); loadTimelineEvents(errorDetail.id, timelinePage - 1); }}
                              className="hover:text-white"
                            >
                              ← Prev
                            </button>
                            <span>Timeline {timelinePage} / {Math.ceil(timelineTotal / 5)}</span>
                            <button
                              disabled={timelinePage >= Math.ceil(timelineTotal / 5)}
                              onClick={() => { setTimelinePage(p => p + 1); loadTimelineEvents(errorDetail.id, timelinePage + 1); }}
                              className="hover:text-white"
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: Ingestion Keys */}
      {activeTab === 'keys' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Key Creation Form */}
          <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              Generate API SDK Ingestion Key
            </h3>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              MeshPilot secures client-side telemetry ingestion by demanding hash verification of credentials. Never store cleartext key records on your servers.
            </p>

            <form onSubmit={handleCreateKeySubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Key Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="Production Web SDK client"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={submittingKey}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center cursor-pointer transition-colors"
              >
                {submittingKey ? 'Hashing...' : 'Generate New Ingestion Key'}
              </button>
            </form>

            {/* Ingestion Key Single-reveal Banner */}
            {generatedRawKey && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/60 space-y-2 animate-fade-in-up">
                <span className="text-[8px] font-mono font-bold bg-indigo-500 text-white px-2 py-0.5 rounded uppercase">CRITICAL WARNING</span>
                <p className="text-[10px] text-neutral-300 leading-relaxed">
                  This raw ingestion credential will be shown <strong>only once</strong> for security. Copy it now and supply it inside your client headers configuration.
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedRawKey}
                    className="flex-1 px-3 py-1.5 rounded bg-black font-mono text-[10px] text-indigo-300 border border-neutral-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopyStack(generatedRawKey)}
                    className="px-3 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Keys list */}
          <div className="lg:col-span-2 space-y-4">
            {loadingKeys ? (
              <div className="text-center py-12 font-mono text-neutral-500">Loading active keys...</div>
            ) : keysList.length === 0 ? (
              <div className="p-12 text-center border border-neutral-900 rounded-2xl bg-neutral-950/10 text-neutral-500 font-mono">
                No telemetry ingestion keys registered for this project.
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                <table className="min-w-full divide-y divide-neutral-900 text-left">
                  <thead className="bg-neutral-900/40 text-[9px] font-mono text-neutral-500 uppercase">
                    <tr>
                      <th className="p-3">Key Identifier</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Generated At</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300">
                    {keysList.map((key) => (
                      <tr key={key.id} className="hover:bg-neutral-900/10 transition-colors font-mono">
                        <td className="p-3 font-sans font-semibold text-white">{key.name}</td>
                        <td className="p-3">
                          {key.revokedAt ? (
                            <span className="text-[9px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">REVOKED</span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-3 text-[10px] text-neutral-400">{new Date(key.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-[10px] text-neutral-400">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never used'}
                        </td>
                        <td className="p-3 text-right">
                          {!key.revokedAt && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-red-950/20 text-red-400 border border-neutral-800 hover:border-red-900/30 text-[10px] cursor-pointer font-sans font-semibold"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: Release tracking */}
      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Release registry form */}
          <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              Register Release Build
            </h3>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Coordinate exceptions with specific version targets to diagnose which code deployment or git commit sha triggered performance degradations.
            </p>

            <form onSubmit={handleRegisterReleaseSubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Version String</label>
                <input
                  type="text"
                  required
                  placeholder="v1.4.2"
                  value={newReleaseVersion}
                  onChange={(e) => setNewReleaseVersion(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Commit SHA (Optional)</label>
                <input
                  type="text"
                  placeholder="8df294af189b"
                  value={newReleaseCommit}
                  onChange={(e) => setNewReleaseCommit(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Environment</label>
                <select
                  value={newReleaseEnv}
                  onChange={(e) => setNewReleaseEnv(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none"
                >
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="STAGING">STAGING</option>
                  <option value="DEVELOPMENT">DEVELOPMENT</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingRelease}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center cursor-pointer transition-colors"
              >
                {submittingRelease ? 'Registering...' : 'Register Release Deployment'}
              </button>
            </form>
          </div>

          {/* Releases list */}
          <div className="lg:col-span-2 space-y-4">
            {loadingReleases ? (
              <div className="text-center py-12 font-mono text-neutral-500">Loading deployments version tracker...</div>
            ) : releasesList.length === 0 ? (
              <div className="p-12 text-center border border-neutral-900 rounded-2xl bg-neutral-950/10 text-neutral-500 font-mono">
                No software release versions registered for this environment yet.
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                <table className="min-w-full divide-y divide-neutral-900 text-left">
                  <thead className="bg-neutral-900/40 text-[9px] font-mono text-neutral-500 uppercase">
                    <tr>
                      <th className="p-3">Version</th>
                      <th className="p-3">Target Environment</th>
                      <th className="p-3">Commit Reference</th>
                      <th className="p-3">Error Traces Included</th>
                      <th className="p-3">Deployed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300">
                    {releasesList.map((rel) => (
                      <tr key={rel.id} className="hover:bg-neutral-900/10 transition-colors font-mono text-xs">
                        <td className="p-3 text-white font-bold">{rel.version}</td>
                        <td className="p-3">
                          <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-bold">
                            {rel.environment}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-neutral-400">{rel.commitSha || '—'}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rel.errorCount > 0 ? 'bg-red-950/20 text-red-400' : 'bg-emerald-950/20 text-emerald-400'}`}>
                            {rel.errorCount} crash traces
                          </span>
                        </td>
                        <td className="p-3 text-[10px] text-neutral-500">{new Date(rel.deployedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

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
