// gamedrop-frontend/src/layouts/AdminLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material'; // Added Typography for a simple header

/**
 * Basic layout component for admin pages.
 * Initially just renders the page content via Outlet.
 * Could be extended with an admin sidebar/navbar later.
 */
const AdminLayout = () => {
  // Basic admin layout - renders children
  return (
    <Box sx={{ p: 3 }}> {/* Add some padding around admin content */}
      {/* A simple indicator this is the admin area */}
      <Typography variant="h4" gutterBottom component="h1">
      </Typography>
      
      <Outlet /> {/* Renders the matched route's component */}
    </Box>
  );
};

export default AdminLayout;