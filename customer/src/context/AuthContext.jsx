import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  loginApi,
  registerApi,
  logoutApi,
  getCurrentUserApi,
} from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await getCurrentUserApi();
      setUser(data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('tgs_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    localStorage.setItem('tgs_token', data.data.token);
    setUser(data.data.user);
    toast.success('Welcome back!');
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await registerApi(payload);
    localStorage.setItem('tgs_token', data.data.token);
    setUser(data.data.user);
    toast.success('Account created successfully');
    return data.data.user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('tgs_token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
