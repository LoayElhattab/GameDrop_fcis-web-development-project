// gamedrop-frontend/src/components/common/AppNavbar.jsx

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Use RouterLink for navigation
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
// import GamepadIcon from '@mui/icons-material/Gamepad'; // Example icon if desired

/**
 * Application navigation bar component.
 * Styles based on v0.dev prototype navbar.
 */
const AppNavbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth(); // Get auth state and logout function

  // Basic styling to match the prototype's dark, slightly purple/blue look
  const navbarStyles = {
    backgroundColor: '#1a202c', // Dark background color
    color: '#ffffff', // White text color
    boxShadow: 'none', // Remove default shadow if prototype has none
  };

  const logoTextStyles = {
    mr: 2, // Margin right
    fontWeight: 700,
    letterSpacing: '.2rem',
    color: 'inherit', // Inherit text color from parent (white)
    textDecoration: 'none',
  };

  const navLinkStyles = {
     color: 'inherit', // Inherit text color
     textDecoration: 'none',
     mx: 1, // Horizontal margin
     '&:hover': {
         textDecoration: 'underline', // Simple hover effect
     },
  };

   const authButtonStyles = {
       mx: 1, // Horizontal margin
   };


  return (
    <AppBar position="static" sx={navbarStyles}>
      <Toolbar>
        {/* Site Title/Logo */}
        {/* Replace Typography with an actual image component if you have the logo */}
        <Typography
          variant="h6"
          noWrap
          component={RouterLink} // Use RouterLink for navigation
          to="/"
          sx={logoTextStyles}
        >
          GAMEDROP
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}> {/* Hide on small screens */}
           <Button component={RouterLink} to="/" sx={navLinkStyles}> {/* Use Button for better styling */}
             Home
           </Button>
           {/* Assuming index page is products list, no explicit /products route in TRD */}
           {/* <Button component={RouterLink} to="/products" sx={navLinkStyles}> */}
           {/* Products */}
           {/* </Button> */}
           {isAuthenticated && ( // Only show cart if authenticated
              <Button component={RouterLink} to="/cart" sx={navLinkStyles}>
                Cart
              </Button>
           )}
           {isAdmin && ( // Only show admin link if admin
              <Button component={RouterLink} to="/admin/dashboard" sx={navLinkStyles}>
                Admin
              </Button>
           )}
        </Box>

        {/* Auth Links/Buttons */}
        <Box sx={{ flexGrow: 0 }}>
          {isAuthenticated ? (
            <>
              {/* User Profile Link (conditional) */}
               {user && ( // Display username or "Account"
                   <Button component={RouterLink} to="/account/profile" sx={authButtonStyles}>
                     {user.username || 'Account'} {/* Display username if available */}
                   </Button>
               )}
              {/* Logout Button */}
              <Button variant="outlined" color="primary" onClick={logout} sx={authButtonStyles}>
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Login Link */}
              <Button component={RouterLink} to="/login" sx={authButtonStyles}>
                Login
              </Button>
              {/* Register Link */}
              <Button component={RouterLink} to="/register" variant="contained" color="primary" sx={authButtonStyles}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppNavbar;