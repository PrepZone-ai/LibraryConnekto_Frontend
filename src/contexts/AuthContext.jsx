import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, getAuthToken, setAuthToken, removeAuthToken, isTokenValid } from '../lib/api';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' or 'student'
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'student' - for non-logged in users

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Load selected role from localStorage
        const storedRole = localStorage.getItem('selectedRole');
        if (storedRole) {
          setSelectedRole(storedRole);
        }

        const token = getAuthToken();
        if (token && isTokenValid()) {
          // Token exists and is valid, decode it
          try {
            const payload = JSON.parse(atob(token.split('.')[1])); // Basic JWT decode
            setUser({
              id: payload.sub,
              email: payload.email,
              user_type: payload.user_type,
              student_id: payload.student_id,
              is_first_login: payload.is_first_login,
              name: payload.name || payload.email,
              admin_name: payload.admin_name || payload.email,
              library_name: payload.library_name || '',
            });
            setUserType(payload.user_type);
            setIsLoggedIn(true);
          } catch (error) {
            console.error("Failed to decode token:", error);
            removeAuthToken(); // Clear invalid token
          }
        } else if (token) {
          // Token exists but is invalid/expired
          console.log("Token expired or invalid, clearing...");
          removeAuthToken();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, userType, mode = 'signin') => {
    try {
      let endpoint, response;
      
      if (mode === 'signup' && userType === 'admin') {
        endpoint = '/auth/admin/signup';
        response = await apiClient.post(endpoint, { email, password });
        // For signup, we don't set tokens yet, just return success
        return { success: true, message: 'Signup successful! Please verify your email.' };
      } else {
        endpoint = userType === 'admin' ? '/auth/admin/signin' : '/auth/student/signin';
        response = await apiClient.post(endpoint, { email, password });
      }
      
      setAuthToken(response.access_token);
      setUserType(userType);
      setIsLoggedIn(true);
      
      // Set user from token payload
      let payload = null;
      try {
        payload = JSON.parse(atob(response.access_token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          user_type: payload.user_type,
          student_id: payload.student_id,
          is_first_login: payload.is_first_login,
          name: payload.name || payload.email,
          admin_name: payload.admin_name || payload.email,
          library_name: payload.library_name || '',
        });
      } catch (tokenError) {
        console.error("Failed to decode token:", tokenError);
        setUser({
          email: email,
          user_type: userType,
        });
      }
      
      // For admin users, check if admin details are complete
      if (userType === 'admin') {
        try {
          const adminDetails = await apiClient.get('/admin/details');
          return { 
            success: true, 
            needsAdminDetails: !adminDetails.is_complete,
            adminDetails: adminDetails
          };
        } catch (error) {
          console.error("Failed to fetch admin details:", error);
          return { success: true, needsAdminDetails: true };
        }
      }
      
      // For student users, check if this is first login
      if (userType === 'student' && payload && payload.is_first_login) {
        return { 
          success: true, 
          isFirstLogin: true,
          studentId: payload.student_id
        };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setUserType(null);
    setIsLoggedIn(false);
    // Keep selectedRole in localStorage even after logout
  };

  const setRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role);
  };

  const clearRole = () => {
    setSelectedRole(null);
    localStorage.removeItem('selectedRole');
  };

  const value = {
    user,
    setUser,
    loading,
    isLoggedIn,
    userType,
    selectedRole,
    login,
    logout,
    setRole,
    clearRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
