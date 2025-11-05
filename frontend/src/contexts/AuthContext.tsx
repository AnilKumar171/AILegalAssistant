import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  dob?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, username: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userName', user.name);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
    }
  }, [user]);

  const login = async (email: string, username: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, validate credentials against a backend
    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    setUser({
      email,
      name: username,
    });
  };

  const updateProfile = async (updates: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const updatePassword = async (newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // No-op in demo. In real app, call backend to update password.
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    setUser({ email, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateProfile, updatePassword, logout }}>
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