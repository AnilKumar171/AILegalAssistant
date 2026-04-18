import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  picture?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  googleLogin: (googleUser: { email: string; name: string; picture?: string }) => void;
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
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, validate credentials against a backend
    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    setUser({
      email,
      name: email.split('@')[0],
      provider: 'email',
    });
  };

  const signup = async (email: string, name: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    setUser({ email, name, provider: 'email' });
  };

  const googleLogin = (googleUser: { email: string; name: string; picture?: string }) => {
    setUser({
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: 'google',
    });
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
