import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'


export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/user/check-auth', { withCredentials: true})
    .then((res) =>{
      setAuthenticated(true)
      setUser(res.data.user)
    }).catch((err) =>{
      console.log(err);
      setAuthenticated(false);
      setUser(null);
    }).finally(() => setAuthLoading(false));
  }, [])
  
  return (
    <AuthContext.Provider value={{ authenticated, user, authLoading, setAuthenticated, setUser}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider