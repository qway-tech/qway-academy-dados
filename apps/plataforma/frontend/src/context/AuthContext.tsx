/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.tsx

import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { persistLogin, persistLogout, loadAuthState } from './authUtils';

export interface User {
  name: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { token: storedToken, user: storedUser } = loadAuthState();
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (newToken: string, userData: User) => {
    persistLogin(newToken, userData);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    persistLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
