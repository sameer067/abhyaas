import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/client';

interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  broadcast_message: string | null;
}

interface AuthContextType {
  coach: Coach | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; broadcast_message?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    const storedCoach = localStorage.getItem('coach');
    if (stored && storedCoach) {
      setToken(stored);
      setCoach(JSON.parse(storedCoach));
    }
    setLoading(false);
  }, []);

  const persist = (t: string, c: Coach) => {
    localStorage.setItem('token', t);
    localStorage.setItem('coach', JSON.stringify(c));
    setToken(t);
    setCoach(c);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    persist(data.access_token, data.coach);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    persist(data.access_token, data.coach);
  };

  const updateProfile = async (body: { name?: string; phone?: string; broadcast_message?: string }) => {
    const { data } = await api.put('/api/auth/profile', body);
    const updated = { ...data } as Coach;
    localStorage.setItem('coach', JSON.stringify(updated));
    setCoach(updated);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('coach');
    setToken(null);
    setCoach(null);
  };

  return (
    <AuthContext.Provider value={{ coach, token, login, register, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
