import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.baseURL = '';

interface User {
  id: number;
  name: string;
  rollNumber: string;
  email: string;
  role: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  year: number;
  semester: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexora_token'));
  const [loading, setLoading] = useState(true);

  // Set auth headers on change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('nexora_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('nexora_token');
    }
  }, [token]);

  // Load user details if token is valid on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Invalid token or session expired.');
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Set header immediately to prevent asynchronous race condition
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid credentials');
    }
  };

  const register = async (data: any) => {
    try {
      await axios.post('/api/auth/register', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await axios.get('/api/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Refresh profile failed.');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
