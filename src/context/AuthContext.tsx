import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'meshpilot_users';
const SESSION_USER_KEY = 'meshpilot_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session on load
    const storedSession = localStorage.getItem(SESSION_USER_KEY);
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        localStorage.removeItem(SESSION_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    // Small artificial delay to simulate authenticating
    await new Promise((resolve) => setTimeout(resolve, 500));

    const storedUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
    const usersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    // Let's also check if user wants to log in with a dynamic default or any fresh user.
    // To ensure "no hardcoded fake credentials", we check stored users.
    // If empty, let's allow them to log in automatically if they sign up first, or we can check credentials.
    const foundUser = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      throw new Error('Account with this email does not exist. Please sign up first.');
    }

    if (foundUser.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    const profile: UserProfile = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundUser.name)}`,
      createdAt: foundUser.createdAt,
      notificationsEnabled: foundUser.notificationsEnabled || {
        email: true,
        security: true,
        performance: true,
        deployments: true,
      },
      theme: foundUser.theme || 'dark',
    };

    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const signup = async (name: string, email: string, password: string): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const storedUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
    const usersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    const exists = usersList.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newUserObj = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      name,
      email: email.toLowerCase(),
      password, // In a real production backend, this would be salted & hashed
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      notificationsEnabled: {
        email: true,
        security: true,
        performance: true,
        deployments: true,
      },
      theme: 'dark',
    };

    usersList.push(newUserObj);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersList));

    const profile: UserProfile = {
      id: newUserObj.id,
      name: newUserObj.name,
      email: newUserObj.email,
      avatar: newUserObj.avatar,
      createdAt: newUserObj.createdAt,
      notificationsEnabled: newUserObj.notificationsEnabled,
      theme: 'dark',
    };

    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_USER_KEY);
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedUser));

    // Also update in registered list
    const storedUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
    if (storedUsersRaw) {
      const usersList = JSON.parse(storedUsersRaw);
      const index = usersList.findIndex((u: any) => u.id === user.id);
      if (index !== -1) {
        usersList[index] = { ...usersList[index], ...updates };
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersList));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
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
