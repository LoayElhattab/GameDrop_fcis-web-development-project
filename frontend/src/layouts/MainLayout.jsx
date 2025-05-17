
  import React from 'react';
  import { Outlet } from 'react-router-dom';
  import { Box } from '@mui/material';
  import AppNavbar from '../components/AppNavbar';
  import AppFooter from '../components/AppFooter'; 

  const MainLayout = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', 
        }}
      >
      
        <AppNavbar />

        <Box component="main" sx={{ flexGrow: 1, pt: 3, pb: 6 }}> 
          <Outlet />
        </Box>

        
        <AppFooter />
      </Box>
    );
  };

  export default MainLayout;