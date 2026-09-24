import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  notificationsEnabled: {
    email: boolean;
    security: boolean;
    performance: boolean;
    deployments: boolean;
  };
  theme: 'dark' | 'light' | 'system';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (name: string, email: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken(true);
          setToken(idToken);

          // Call our server endpoint to sync and fetch profile
          const res = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (!res.ok) {
            throw new Error('Failed to synchronize user profile with database');
          }

          const data = await res.json();
          
          // Form target UserProfile that the frontend expects
          const profile: UserProfile = {
            id: String(data.user.id),
            name: data.user.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: data.user.email || fbUser.email || '',
            avatar: data.user.avatarUrl || fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.name || 'User')}`,
            role: data.user.role,
            status: data.user.status,
            createdAt: data.user.createdAt,
            notificationsEnabled: {
              email: true,
              security: true,
              performance: true,
              deployments: true,
            },
            theme: 'dark',
          };

          setUser(profile);
        } catch (err) {
          console.error('Error synchronizing auth state:', err);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);

      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve user profile from PostgreSQL');
      }
      const data = await res.json();

      const profile: UserProfile = {
        id: String(data.user.id),
        name: data.user.name || userCredential.user.displayName || email.split('@')[0],
        email: data.user.email,
        avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.name || 'User')}`,
        role: data.user.role,
        status: data.user.status,
        createdAt: data.user.createdAt,
        notificationsEnabled: {
          email: true,
          security: true,
          performance: true,
          deployments: true,
        },
        theme: 'dark',
      };

      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update firebase display name
      if (userCredential.user) {
        await fbUpdateProfile(userCredential.user, {
          displayName: name
        });
      }

      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);

      // Sync user to PostgreSQL database
      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to record profile in PostgreSQL database');
      }
      const data = await res.json();

      const profile: UserProfile = {
        id: String(data.user.id),
        name: name,
        email: email,
        avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        role: data.user.role,
        status: data.user.status,
        createdAt: data.user.createdAt,
        notificationsEnabled: {
          email: true,
          security: true,
          performance: true,
          deployments: true,
        },
        theme: 'dark',
      };

      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Account registration failed.');
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);

      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve Google user profile from database');
      }
      const data = await res.json();

      const profile: UserProfile = {
        id: String(data.user.id),
        name: data.user.name || userCredential.user.displayName || 'Google User',
        email: data.user.email,
        avatar: data.user.avatarUrl || userCredential.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.name || 'User')}`,
        role: data.user.role,
        status: data.user.status,
        createdAt: data.user.createdAt,
        notificationsEnabled: {
          email: true,
          security: true,
          performance: true,
          deployments: true,
        },
        theme: 'dark',
      };

      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Google Auth error:', error);
      throw new Error(error.message || 'Google Authentication failed.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
