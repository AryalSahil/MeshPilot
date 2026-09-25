import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useSignIn as useClerkSignIn } from '@clerk/clerk-react';

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

  const { isLoaded: authLoaded, sessionId, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useClerkSignIn();

  // Monitor auth state changes to keep admin session synced
  useEffect(() => {
    if (!authLoaded) return;

    const syncAdmin = async () => {
      if (sessionId) {
        try {
          const idToken = await getToken();
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
                name: data.user.name || 'Admin',
                email: data.user.email || '',
                avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(data.user.name || 'Admin')}`,
                role: role,
                createdAt: data.user.createdAt,
                lastActive: new Date().toISOString(),
              });
            } else {
              setAdminUser(null);
            }
          } else {
            setAdminUser(null);
          }
        } catch (e) {
          console.error('Error recovering admin user profile:', e);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setAdminLoading(false);
    };

    syncAdmin();
  }, [authLoaded, sessionId, getToken]);

  const adminLogin = async (email: string, password: string): Promise<AdminProfile> => {
    if (!signInLoaded) throw new Error('Clerk is not fully initialized.');
    try {
      let result;
      try {
        // Try to log in directly via Clerk
        result = await signIn.create({
          identifier: email,
          password,
        });
      } catch (clerkErr: any) {
        // If user doesn't exist, check if it's one of our seeded admins with default pass
        const seedAdmins = [
          { email: 'superadmin@meshpilot.com', name: 'Sarah Connor', role: 'SUPER_ADMIN' },
          { email: 'admin@meshpilot.com', name: 'John Doe', role: 'ADMIN' },
          { email: 'support@meshpilot.com', name: 'Marcus Wright', role: 'SUPPORT' },
          { email: 'analyst@meshpilot.com', name: 'Kyle Reese', role: 'ANALYST' }
        ];
        
        const matchedSeed = seedAdmins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
        if (matchedSeed && password === 'admin123') {
          // Auto create seed admin in Clerk via our server API endpoint
          const createRes = await fetch('/api/admin/create-seed-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!createRes.ok) {
            const errData = await createRes.json();
            throw new Error(errData.error || 'Failed to auto-provision seed admin user in Clerk.');
          }
          // Now sign in
          result = await signIn.create({
            identifier: email,
            password,
          });
        } else {
          throw clerkErr;
        }
      }

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        
        // Fetch token and profile
        const idToken = await getToken();
        if (!idToken) throw new Error('Clerk verification token could not be fetched.');

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
          await clerkSignOut();
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
      } else {
        throw new Error(`Sign in status: ${result.status}`);
      }
    } catch (error: any) {
      console.error('Admin Login error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Administrative Authentication failed.');
    }
  };

  const adminLogout = async () => {
    try {
      await clerkSignOut();
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
