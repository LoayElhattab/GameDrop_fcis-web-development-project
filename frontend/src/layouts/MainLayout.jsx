  // gamedrop-frontend/src/layouts/MainLayout.jsx

  import React from 'react';
  import { Outlet } from 'react-router-dom';
  import { Box } from '@mui/material';
  import AppNavbar from '../components/AppNavbar'; // Placeholder, will be created in Task 4
  import AppFooter from '../components/AppFooter'; // Placeholder, will be created in Task 4

  /**
   * Main layout component for public and authenticated user pages.
   * Includes a Navbar, Footer, and renders the page content via Outlet.
   */
  const MainLayout = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', // Ensure layout takes at least full viewport height
        }}
      >
        {/* App Navbar (placeholder) */}
        <AppNavbar />

        {/* Main content area - grows to fill available space */}
        <Box component="main" sx={{ flexGrow: 1, pt: 3, pb: 6 }}> {/* Added some padding */}
          <Outlet /> {/* Renders the matched route's component */}
        </Box>

        {/* App Footer (placeholder) */}
        <AppFooter />
      </Box>
    );
  };

  export default MainLayout;