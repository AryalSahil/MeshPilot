import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.tsx';

export interface Project {
  id: string;
  name: string;
  url: string;
  status: 'Operational' | 'Degraded' | 'Downtime';
  uptime: string;
  responseTime: number;
  errorsCount: number;
  securityScore: number | null;
  lastDeployment: string;
  environment: 'Production' | 'Staging' | 'Development';
  integrations: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  category: 'Downtime' | 'Security' | 'Performance' | 'Errors' | 'Deployments' | 'AI Diagnostics';
  time: string;
  read: boolean;
  desc: string;
}

interface DashboardContextType {
  projects: Project[];
  notifications: NotificationItem[];
  addProject: (name: string, url: string, env: 'Production' | 'Staging' | 'Development', integrations: string[]) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshProjects: () => Promise<void>;
  loadingProjects: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: NotificationItem[] = (data.notifications || []).map((n: any) => {
          // Calculate human-friendly relative time or standard formatted timestamp
          const diffMs = Date.now() - new Date(n.createdAt).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHrs = Math.floor(diffMins / 60);
          
          let relativeTime = 'Just now';
          if (diffMins > 0 && diffMins < 60) {
            relativeTime = `${diffMins}m ago`;
          } else if (diffHrs > 0 && diffHrs < 24) {
            relativeTime = `${diffHrs}h ago`;
          } else if (diffHrs >= 24) {
            relativeTime = new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
          }

          return {
            id: String(n.id),
            title: n.title,
            category: (n.category === 'Downtime' || n.category === 'Security' || n.category === 'Performance' || n.category === 'Errors' || n.category === 'Deployments' || n.category === 'AI Diagnostics') ? n.category : 'Downtime',
            time: relativeTime,
            read: n.read,
            desc: n.description
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch real-time notifications:', err);
    }
  };

  const refreshProjects = async () => {
    if (!token) return;
    setLoadingProjects(true);
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: Project[] = data.map((dbProj: any) => {
          const isAwaiting = dbProj.uptimeScore === 100 && dbProj.performanceScore === 100 && dbProj.securityScore === null && dbProj.errorScore === 100;
          return {
            id: String(dbProj.id),
            name: dbProj.name,
            url: dbProj.websiteUrl || 'No URL',
            status: dbProj.status === 'ACTIVE' ? 'Operational' : (dbProj.status === 'PAUSED' ? 'Degraded' : 'Downtime'),
            uptime: isAwaiting ? 'Awaiting data' : `${dbProj.uptimeScore}.00%`, // Use "Awaiting data" as per spec
            responseTime: isAwaiting ? 0 : dbProj.performanceScore,
            errorsCount: dbProj.errorScore !== null ? (100 - dbProj.errorScore) / 3 : 0,
            securityScore: dbProj.securityScore, // Will display null / UNKNOWN until security scanner run
            lastDeployment: '5 mins ago',
            environment: dbProj.environment === 'DEVELOPMENT' ? 'Development' : (dbProj.environment === 'STAGING' ? 'Staging' : 'Production'),
            integrations: ['Vercel', 'Supabase']
          };
        });
        setProjects(mapped);
      }
    } catch (e) {
      console.error('Failed to load projects from DB:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProjects();
      fetchNotifications();
    } else {
      setProjects([]);
      setNotifications([]);
    }
  }, [token]);

  const addProject = async (name: string, url: string, env: 'Production' | 'Staging' | 'Development', integrations: string[]) => {
    if (!token) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          websiteUrl: url,
          environment: env.toUpperCase(),
        })
      });

      if (res.ok) {
        const dbProj = await res.json();
        
        const newProj: Project = {
          id: String(dbProj.id),
          name: dbProj.name,
          url: dbProj.websiteUrl || 'No URL',
          status: 'Operational',
          uptime: 'Awaiting data',
          responseTime: 0,
          errorsCount: 0,
          securityScore: null,
          lastDeployment: 'Just now',
          environment: env,
          integrations,
        };

        setProjects(prev => [newProj, ...prev]);
        await fetchNotifications();
      } else {
        throw new Error('Failed to save project on database server');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to mark read on server:', e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!token) return;
    try {
      await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to mark all read on server:', e);
    }
  };

  return (
    <DashboardContext.Provider value={{ projects, notifications, addProject, markNotificationRead, markAllNotificationsRead, refreshProjects, loadingProjects }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
