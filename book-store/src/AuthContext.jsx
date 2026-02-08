import React, { createContext, useEffect, useState } from 'react'
import { authAPI } from './services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // Add this


  const clearAuth = () => {
    setUser(null);
    setAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
  };

  // Load user profile from localStorage on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Check if token exists BEFORE clearing anything
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        console.log('🔑 Token exists on init:', !!token);
        console.log('👤 User exists on init:', !!userStr);
        
        // If no token or user, don't need to verify
        if (!token || !userStr) {
          console.log('⚠️ No token or user found, skipping auth check');
          setIsInitialized(true);
          setAuthLoading(false);
          return;
        }
        
        // Try to restore the user from localStorage
        try {
          const user = JSON.parse(userStr);
          setUser(user);
          setAuthenticated(true);
          console.log('✅ Restored user from localStorage:', user.email);
        } catch (e) {
          console.error('❌ Failed to parse user from localStorage:', e);
          clearAuth();
          setIsInitialized(true);
          setAuthLoading(false);
          return;
        }
        
        // Then verify with server
        console.log('🔄 Verifying auth with server...');
        await checkAuth();
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        clearAuth();
      } finally {
        console.log('✅ Auth initialization complete');
        setIsInitialized(true);
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.login(credentials);
      
      console.log('Login response:', response);
      
      if (response.status === true && response.data) {
        const userData = response.data;
        const token = userData.token || userData.accessToken;
        
        console.log('🔐 Token to save:', token);
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('accessToken', token);
          console.log('✅ Token saved to localStorage');
        }
        
        setUser(userData);
        setAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      } else if (response.user) {
        const userData = response.user;
        const token = userData.token || userData.accessToken;
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('accessToken', token);
        }
        
        setUser(userData);
        setAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      } else if (response.token) {
        // Handle case where token is in response root
        const token = response.token;
        const userData = response.user || response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
        
        setUser(userData);
        setAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: { ...userData, token } };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      clearAuth();
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      // If no token, don't even call the API
      if (!token) {
        console.log('🔐 No token found, clearing auth');
        clearAuth();
        return;
      }
      
      const response = await authAPI.checkAuth();
      
      console.log('Auth check response:', response);
      
      if (response.authenticated === true && response.user) {
        const userData = response.user;
        const newToken = userData.token || response.token || token;
        
        // Update token if new one is provided
        if (newToken && newToken !== token) {
          localStorage.setItem('token', newToken);
          localStorage.setItem('accessToken', newToken);
        }
        
        setUser(userData);
        setAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Clear auth if not authenticated
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    } finally {
      setAuthLoading(false);
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    }
  }

  const updateUser = (updatedData) => {
    console.log('Updating user context with:', updatedData);
    
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...updatedData,
        phone: updatedData.phone || updatedData.phonenumber || prevUser?.phone || prevUser?.phonenumber,
        phonenumber: updatedData.phonenumber || updatedData.phone || prevUser?.phonenumber || prevUser?.phone
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.status && response.data) {
        const userData = {
          ...response.data,
          phone: response.data.phone || response.data.phonenumber,
          phonenumber: response.data.phonenumber || response.data.phone
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated, 
      user, 
      authLoading, 
      isInitialized, // Add this to the value
      login,
      logout, 
      updateUser,
      checkAuth,
      refreshUser,
      reloadProfile: checkAuth,
      setAuthenticated,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;