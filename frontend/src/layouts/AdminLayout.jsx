import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import AppNavbar from '../components/AppNavbar'; // استورد الـ AppNavbar

/**
 * Layout component for admin pages.
 * Includes the AppNavbar and renders the page content via Outlet.
 */
const AdminLayout = () => {
  return (
    <Box>
      {/* ضيف الـ AppNavbar هنا */}
      <AppNavbar />
      {/* المحتوى بتاع صفحات الأدمن */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Admin Area
        </Typography>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;