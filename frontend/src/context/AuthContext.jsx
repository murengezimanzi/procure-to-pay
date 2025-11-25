import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On page reload, restore user from local storage
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username) {
      setUser({ username, role });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // 1. Call the backend
      const response = await api.post('/auth/token/', { username, password });
      
      // 2. Extract data (This works because we updated the Serializer in the previous step)
      const { access, refresh, role, username: dbUsername } = response.data;
      
      // 3. Save to Local Storage (so it persists on refresh)
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', dbUsername);
      localStorage.setItem('role', role); // <--- This is the key fix!

      // 4. Update React State
      setUser({ username: dbUsername, role });
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);