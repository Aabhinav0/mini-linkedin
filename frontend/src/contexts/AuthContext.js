import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { handleGenericError } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Clear invalid token
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid token on any error
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting login with:', { email, password });
      
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Update user state
        setUser(user);
        setError('');
        
        console.log('Login successful, user set:', user);
        
        return { success: true };
      } else {
        const errorMessage = response.data.message || 'Login failed';
        setError(errorMessage);
        console.error('Login failed:', errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting registration with:', { name, email });
      
      const response = await api.post('/api/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Update user state
        setUser(user);
        setError('');
        
        console.log('Registration successful, user set:', user);
        
        return { success: true };
      } else {
        const errorMessage = response.data.message || 'Registration failed';
        setError(errorMessage);
        console.error('Registration failed:', errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError('');
  };

  const updateProfile = async (name, bio) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await api.put('/api/users/profile', { name, bio });
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        const errorMessage = response.data.message || 'Profile update failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshUser: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 