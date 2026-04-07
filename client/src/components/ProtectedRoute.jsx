// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './Loading'; // Using your loading spinner

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Show a loading spinner while the auth state is being checked
  if (loading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  // 2. If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 3. (Previously missing logic) If roles are specified, check if the user has one of the allowed roles
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If the role doesn't match, redirect them to their default dashboard.
    // This prevents a student from accessing a warden's URL, for example.
    return <Navigate to="/dashboard" replace />;
  }

  // 4. If all checks pass, render the actual page component
  return children;
};

export default ProtectedRoute;