import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Or your preferred API client

// Create an axios instance for your API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend server address
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a token exists to keep the user logged in on page refresh
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        // Handle cases where localStorage might have invalid JSON
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, phone) => {
    try {
      const response = await api.post('/auth/login', { username, phone });
      
      // The backend response is expected to be { token: '...', user: { ... } }
      const { token: newToken, user: userData } = response.data;

      // --- ✅ THE FIX IS HERE ---
      // Log the actual user data we received to confirm it's correct
      console.log("User data set in context:", userData); 
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state and axios headers
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      // Return a structured error for the component to display
      return { success: false, message: error.response?.data?.message || 'An unexpected error occurred.' };
    }
  };

  const logout = () => {
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};