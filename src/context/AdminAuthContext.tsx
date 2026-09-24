import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'ANALYST';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  createdAt: string;
  lastActive: string;
}

interface AdminAuthContextType {
  adminUser: AdminProfile | null;
  adminLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<AdminProfile>;
  adminLogout: () => void;
  updateAdminProfile: (updates: Partial<AdminProfile>) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_ADMINS_KEY = 'meshpilot_admins';
const SESSION_ADMIN_KEY = 'meshpilot_admin_session';

// Helper to seed initial admins if they do not exist
const seedAdminsIfEmpty = () => {
  const existing = localStorage.getItem(LOCAL_ADMINS_KEY);
  if (!existing) {
    const initialAdmins = [
      {
        id: 'adm_1',
        name: 'Sarah Connor',
        email: 'superadmin@meshpilot.com',
        password: 'admin123',
        role: 'SUPER_ADMIN',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah',
        createdAt: '2025-01-10T08:30:00Z',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'adm_2',
        name: 'John Doe',
        email: 'admin@meshpilot.com',
        password: 'admin123',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=John',
        createdAt: '2025-02-15T09:12:00Z',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'adm_3',
        name: 'Marcus Wright',
        email: 'support@meshpilot.com',
        password: 'admin123',
        role: 'SUPPORT',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Marcus',
        createdAt: '2025-03-01T14:20:00Z',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'adm_4',
        name: 'Kyle Reese',
        email: 'analyst@meshpilot.com',
        password: 'admin123',
        role: 'ANALYST',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kyle',
        createdAt: '2025-04-18T11:45:00Z',
        lastActive: new Date().toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(initialAdmins));
  }
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    seedAdminsIfEmpty();
    
    // Load existing admin session
    const storedSession = localStorage.getItem(SESSION_ADMIN_KEY);
    if (storedSession) {
      try {
        setAdminUser(JSON.parse(storedSession));
      } catch (e) {
        localStorage.removeItem(SESSION_ADMIN_KEY);
      }
    }
    setAdminLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<AdminProfile> => {
    // Artificial delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    seedAdminsIfEmpty();
    const storedAdminsRaw = localStorage.getItem(LOCAL_ADMINS_KEY);
    const adminsList = storedAdminsRaw ? JSON.parse(storedAdminsRaw) : [];

    const foundAdmin = adminsList.find((a: any) => a.email.toLowerCase() === email.trim().toLowerCase());

    if (!foundAdmin) {
      throw new Error('No administrative account found with this email.');
    }

    if (foundAdmin.password !== password) {
      throw new Error('Invalid security passphrase. Access denied.');
    }

    // Update last active
    foundAdmin.lastActive = new Date().toISOString();
    const updatedAdmins = adminsList.map((a: any) => a.id === foundAdmin.id ? foundAdmin : a);
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(updatedAdmins));

    const profile: AdminProfile = {
      id: foundAdmin.id,
      name: foundAdmin.name,
      email: foundAdmin.email,
      avatar: foundAdmin.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundAdmin.name)}`,
      role: foundAdmin.role,
      createdAt: foundAdmin.createdAt,
      lastActive: foundAdmin.lastActive,
    };

    localStorage.setItem(SESSION_ADMIN_KEY, JSON.stringify(profile));
    setAdminUser(profile);
    return profile;
  };

  const adminLogout = () => {
    localStorage.removeItem(SESSION_ADMIN_KEY);
    setAdminUser(null);
  };

  const updateAdminProfile = (updates: Partial<AdminProfile>) => {
    if (!adminUser) return;
    const updated = { ...adminUser, ...updates };
    setAdminUser(updated);
    localStorage.setItem(SESSION_ADMIN_KEY, JSON.stringify(updated));

    const storedAdminsRaw = localStorage.getItem(LOCAL_ADMINS_KEY);
    if (storedAdminsRaw) {
      const list = JSON.parse(storedAdminsRaw);
      const index = list.findIndex((a: any) => a.id === adminUser.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(list));
      }
    }
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminLoading, adminLogin, adminLogout, updateAdminProfile }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
