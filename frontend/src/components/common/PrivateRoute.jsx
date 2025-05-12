// gamedrop-frontend/src/components/common/PrivateRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import { Typography, CircularProgress, Box } from '@mui/material'; // Added for loading indicator

/**
 * Protects routes, redirecting to login if the user is not authenticated.
 * Renders the nested route if authenticated.
 */
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Get authentication status and loading state

  // While checking auth status (e.g., loading from localStorage initially)
  if (isLoading) {
     return (
       <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
         <CircularProgress />
       </Box>
     );
  }

  // If authenticated, render the child routes
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated and not loading, redirect to the login page
  return <Navigate to="/login" replace />; // 'replace' prevents going back to the protected page after login
};

export default PrivateRoute;