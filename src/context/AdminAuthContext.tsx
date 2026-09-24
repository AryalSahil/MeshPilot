import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

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

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Monitor auth state changes to keep admin session synced
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const res = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            const role = data.user.role as AdminRole;
            const adminRoles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'];
            
            if (adminRoles.includes(role)) {
              setAdminUser({
                id: String(data.user.id),
                name: data.user.name || fbUser.displayName || 'Admin',
                email: data.user.email || fbUser.email || '',
                avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(data.user.name || 'Admin')}`,
                role: role,
                createdAt: data.user.createdAt,
                lastActive: new Date().toISOString(),
              });
            } else {
              // Not an admin, clear admin state
              setAdminUser(null);
            }
          }
        } catch (e) {
          console.error('Error recovering admin user profile:', e);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setAdminLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<AdminProfile> => {
    try {
      let userCredential;
      try {
        // Try to log in directly via Firebase
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr: any) {
        // If user doesn't exist, check if it's one of our seeded admins with default pass
        const seedAdmins = [
          { email: 'superadmin@meshpilot.com', name: 'Sarah Connor', role: 'SUPER_ADMIN' },
          { email: 'admin@meshpilot.com', name: 'John Doe', role: 'ADMIN' },
          { email: 'support@meshpilot.com', name: 'Marcus Wright', role: 'SUPPORT' },
          { email: 'analyst@meshpilot.com', name: 'Kyle Reese', role: 'ANALYST' }
        ];
        
        const matchedSeed = seedAdmins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
        if (matchedSeed && password === 'admin123') {
          // Auto create seed admin in Firebase
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw fbErr;
        }
      }

      const idToken = await userCredential.user.getIdToken();
      
      // Load user profile from DB to verify role
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to synchronize admin profile with server');
      }

      const data = await res.json();
      const role = data.user.role as AdminRole;
      const adminRoles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'];

      if (!adminRoles.includes(role)) {
        await signOut(auth);
        throw new Error('Access Denied: You do not have administrative privileges.');
      }

      const profile: AdminProfile = {
        id: String(data.user.id),
        name: data.user.name || 'Admin',
        email: data.user.email,
        avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(data.user.name || 'Admin')}`,
        role: role,
        createdAt: data.user.createdAt,
        lastActive: new Date().toISOString(),
      };

      setAdminUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Admin Login error:', error);
      throw new Error(error.message || 'Administrative Authentication failed.');
    }
  };

  const adminLogout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
    } catch (error) {
      console.error('Admin Signout error:', error);
    }
  };

  const updateAdminProfile = (updates: Partial<AdminProfile>) => {
    if (!adminUser) return;
    setAdminUser(prev => prev ? { ...prev, ...updates } : null);
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
