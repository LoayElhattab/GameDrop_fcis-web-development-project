// gamedrop-frontend/src/components/common/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import { Typography, CircularProgress, Box } from '@mui/material'; // Added for loading indicator

/**
 * Protects routes, redirecting if the user is not an ADMIN.
 * Renders the nested route if the user is authenticated and has the ADMIN role.
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth(); // Get auth status, admin status, and loading state

   // While checking auth status (e.g., loading from localStorage initially)
   if (isLoading) {
     return (
       <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
         <CircularProgress />
       </Box>
     );
   }

  // If authenticated AND is admin, render the child routes
  if (isAuthenticated && isAdmin) {
    return <Outlet />;
  }

  // If not authenticated or not admin, redirect.
  // Redirect to login if not authenticated at all.
  // Redirect to homepage or a 403 page if authenticated but not admin.
  // For now, redirecting to homepage for simplicity as per prompt didn't specify 403 page.
  if (!isAuthenticated) {
     return <Navigate to="/login" replace />;
  } else {
     // Authenticated but not admin
     return <Navigate to="/" replace />; // Redirect to homepage
     // return <Navigate to="/forbidden" replace />; // Could redirect to a 403 page
  }
};

export default AdminRoute;