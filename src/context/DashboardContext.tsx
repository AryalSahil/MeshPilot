import React, { createContext, useContext, useState } from 'react';

export interface Project {
  id: string;
  name: string;
  url: string;
  status: 'Operational' | 'Degraded' | 'Downtime';
  uptime: string;
  responseTime: number;
  errorsCount: number;
  securityScore: number;
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
  addProject: (name: string, url: string, env: 'Production' | 'Staging' | 'Development', integrations: string[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj_1',
      name: 'BCA Student Portal',
      url: 'https://bca-portal.meshpilot.io',
      status: 'Operational',
      uptime: '99.99%',
      responseTime: 164,
      errorsCount: 3,
      securityScore: 94,
      lastDeployment: '5 mins ago',
      environment: 'Production',
      integrations: ['Vercel', 'Supabase'],
    },
    {
      id: 'proj_2',
      name: 'FinTech Hub Gateway',
      url: 'https://gateway.fintechhub.net',
      status: 'Operational',
      uptime: '99.97%',
      responseTime: 210,
      errorsCount: 0,
      securityScore: 98,
      lastDeployment: '1 hour ago',
      environment: 'Production',
      integrations: ['GitHub', 'Supabase'],
    },
    {
      id: 'proj_3',
      name: 'Internal Dev API',
      url: 'https://api.dev.local',
      status: 'Degraded',
      uptime: '98.45%',
      responseTime: 512,
      errorsCount: 143,
      securityScore: 82,
      lastDeployment: 'Yesterday',
      environment: 'Development',
      integrations: ['GitHub'],
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Database connection delay detected',
      category: 'Performance',
      time: '2 mins ago',
      read: false,
      desc: 'Edge node latency increased by 38% due to pg_stat lock on /api/orders query.'
    },
    {
      id: 'notif_2',
      title: 'Deployment #184 Successful',
      category: 'Deployments',
      time: '12 mins ago',
      read: false,
      desc: 'Successfully dispatched main branch deployment trace to 22 global ping regions.'
    },
    {
      id: 'notif_3',
      title: 'High vulnerability score reported',
      category: 'Security',
      time: '1 hour ago',
      read: true,
      desc: 'Missing header security keys detected on secondary web app portals.'
    }
  ]);

  const addProject = (name: string, url: string, env: 'Production' | 'Staging' | 'Development', integrations: string[]) => {
    const newProj: Project = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name,
      url,
      status: 'Operational',
      uptime: '100.00%',
      responseTime: 120,
      errorsCount: 0,
      securityScore: 96,
      lastDeployment: 'Just now',
      environment: env,
      integrations,
    };
    setProjects(prev => [newProj, ...prev]);

    // Send a real system notification for the creation
    const newNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      title: `Project "${name}" initialized`,
      category: 'Deployments',
      time: 'Just now',
      read: false,
      desc: `A new ${env} trace pipeline has been successfully wired.`
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DashboardContext.Provider value={{ projects, notifications, addProject, markNotificationRead, markAllNotificationsRead }}>
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
