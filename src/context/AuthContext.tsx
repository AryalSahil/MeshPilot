import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  useAuth as useClerkAuth, 
  useUser as useClerkUser, 
  useSignIn as useClerkSignIn, 
  useSignUp as useClerkSignUp 
} from '@clerk/clerk-react';

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
  verifyEmailCode: (code: string) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  signUpSession: any; // Allow screens to access signup state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded: authLoaded, sessionId, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useClerkSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useClerkSignUp();

  // Sync with Clerk auth state
  useEffect(() => {
    if (!authLoaded) return;

    const syncUser = async () => {
      if (sessionId && clerkUser) {
        try {
          const idToken = await getToken();
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
            name: data.user.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            email: data.user.email || clerkUser.emailAddresses[0]?.emailAddress || '',
            avatar: data.user.avatarUrl || clerkUser.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.name || 'User')}`,
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
          console.error('Error synchronizing auth state with backend:', err);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    syncUser();
  }, [authLoaded, sessionId, clerkUser, getToken]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!signInLoaded) throw new Error('Clerk authentication service is not fully initialized.');
    try {
      const res = await signIn.create({
        identifier: email,
        password,
      });

      if (res.status === 'complete') {
        await setSignInActive({ session: res.createdSessionId });
        
        // Return dummy profile immediately, useEffect will resolve the real state
        return {
          id: 'temp',
          name: email.split('@')[0],
          email,
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          notificationsEnabled: { email: true, security: true, performance: true, deployments: true },
          theme: 'dark',
        };
      } else {
        throw new Error(`Sign in status is: ${res.status}`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Authentication failed. Please check credentials.');
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<UserProfile> => {
    if (!signUpLoaded) throw new Error('Clerk registration service is not fully initialized.');
    try {
      const res = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
      });

      if (res.status === 'complete') {
        await setSignUpActive({ session: res.createdSessionId });
      } else {
        // Prepare verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }

      return {
        id: 'temp',
        name,
        email,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        notificationsEnabled: { email: true, security: true, performance: true, deployments: true },
        theme: 'dark',
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Account registration failed.');
    }
  };

  const verifyEmailCode = async (code: string): Promise<UserProfile> => {
    if (!signUpLoaded) throw new Error('Clerk registration service is not fully initialized.');
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === 'complete') {
        await setSignUpActive({ session: res.createdSessionId });
        return {
          id: 'temp',
          name: 'User',
          email: 'email@example.com',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          notificationsEnabled: { email: true, security: true, performance: true, deployments: true },
          theme: 'dark',
        };
      } else {
        throw new Error(`Verification status: ${res.status}`);
      }
    } catch (error: any) {
      console.error('Verify email code error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Email verification failed.');
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    if (!signInLoaded) throw new Error('Clerk authentication service is not fully initialized.');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
    } catch (error: any) {
      console.error('ForgotPassword error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Failed to dispatch reset code.');
    }
  };

  const resetPassword = async (code: string, newPassword: string): Promise<void> => {
    if (!signInLoaded) throw new Error('Clerk authentication service is not fully initialized.');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
      } else {
        throw new Error(`Reset status: ${result.status}`);
      }
    } catch (error: any) {
      console.error('ResetPassword error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Failed to establish new credentials.');
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    if (!signInLoaded) throw new Error('Clerk authentication service is not fully initialized.');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
      return {} as any;
    } catch (error: any) {
      console.error('Google Auth error:', error);
      throw new Error(error.errors?.[0]?.message || error.message || 'Google Authentication failed.');
    }
  };

  const logout = async () => {
    try {
      await clerkSignOut();
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
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      signup, 
      loginWithGoogle, 
      logout, 
      updateProfile,
      verifyEmailCode,
      forgotPassword,
      resetPassword,
      signUpSession: signUp
    }}>
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
