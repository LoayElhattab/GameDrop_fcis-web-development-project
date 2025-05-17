import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import AppNavbar from '../components/AppNavbar'; 

const AdminLayout = () => {
  return (
    <Box>
      <AppNavbar />
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