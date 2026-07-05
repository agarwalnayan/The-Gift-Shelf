import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { loginApi, logoutApi, getCurrentUserApi } from '../api/authApi.js';

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
    const token = localStorage.getItem('tgs_admin_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    const loggedInUser = data.data.user;

    if (!['admin', 'superadmin'].includes(loggedInUser.role)) {
      throw new Error('You do not have permission to access the admin panel');
    }

    localStorage.setItem('tgs_admin_token', data.data.token);
    setUser(loggedInUser);
    toast.success('Welcome back!');
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('tgs_admin_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
