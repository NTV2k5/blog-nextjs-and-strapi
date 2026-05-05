'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  loading: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedJwt = Cookies.get('jwt');
    const savedUser = Cookies.get('user');

    if (savedJwt && savedUser) {
      setJwt(savedJwt);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (newJwt: string, newUser: User) => {
    setJwt(newJwt);
    setUser(newUser);
    
    Cookies.set('jwt', newJwt, { expires: 7 }); // Expires in 7 days
    Cookies.set('user', JSON.stringify(newUser), { expires: 7 });
  };

  const logout = () => {
    setJwt(null);
    setUser(null);
    Cookies.remove('jwt');
    Cookies.remove('user');
  };

  return (
    <AuthContext.Provider value={{ user, jwt, loading, login, logout }}>
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
