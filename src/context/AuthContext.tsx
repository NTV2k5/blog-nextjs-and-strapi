'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export type UserRole = 'authenticated' | 'admin' | 'manager' | 'director' | string;

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    type: UserRole;
  };
}

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  loading: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  /** Fetch fresh user data including role from Strapi */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserWithRole = async (token: string): Promise<User | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=role`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const savedJwt = Cookies.get('jwt');
    const savedUser = Cookies.get('user');

    if (savedJwt && savedUser) {
      setJwt(savedJwt);
      // Load cached user first for immediate UI
      const cached = JSON.parse(savedUser) as User;
      setUser(cached);

      // Then fetch fresh data with role in background
      fetchUserWithRole(savedJwt).then((fresh) => {
        if (fresh) {
          setUser(fresh);
          Cookies.set('user', JSON.stringify(fresh), { expires: 7 });
        }
      });
    }
    setLoading(false);
  }, []);

  const login = async (newJwt: string, newUser: User) => {
    // Fetch user with role after login
    const userWithRole = await fetchUserWithRole(newJwt);
    const finalUser = userWithRole || newUser;

    setJwt(newJwt);
    setUser(finalUser);
    Cookies.set('jwt', newJwt, { expires: 7 });
    Cookies.set('user', JSON.stringify(finalUser), { expires: 7 });
  };

  const logout = () => {
    setJwt(null);
    setUser(null);
    Cookies.remove('jwt');
    Cookies.remove('user');
  };

  const refreshUser = async () => {
    if (!jwt) return;
    const fresh = await fetchUserWithRole(jwt);
    if (fresh) {
      setUser(fresh);
      Cookies.set('user', JSON.stringify(fresh), { expires: 7 });
    }
  };

  return (
    <AuthContext.Provider value={{ user, jwt, loading, login, logout, refreshUser }}>
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
