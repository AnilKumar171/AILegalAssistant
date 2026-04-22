import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  email: string;
  name: string;
  picture?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    }
    setUser(data.user);
  };

  const signup = async (email: string, name: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    }
    setUser(data.user);
  };

  const googleLogin = async (credential: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    }
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
