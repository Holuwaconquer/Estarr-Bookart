import React, { createContext, useEffect, useState } from 'react'
import api from './services/api'

export const AuthContext = createContext();

const getToken = () => {
  console.log(localStorage.getItem('token') || localStorage.getItem('accessToken'));
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
  
}

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    const token = getToken();
    if (!token) {
      setAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      const res = await api.userAPI.getProfile();
      if (res && res.data) {
        setUser(res.data);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ authenticated, user, authLoading, setAuthenticated, setUser, logout, reloadProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider