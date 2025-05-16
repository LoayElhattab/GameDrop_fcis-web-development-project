// gamedrop-frontend/src/components/common/AppNavbar.jsx


import { AppBar, Toolbar, Typography, Button, Box, IconButton, Link as MuiLink } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Use RouterLink for navigation
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import ProductSearch from './ProductSearch';
import React, { useState } from 'react';
import ProductFilter from './ProductFilter';
// import GamepadIcon from '@mui/icons-material/Gamepad'; // Example icon if desired

/**
 * Application navigation bar component.
 * Styles based on v0.dev prototype navbar.
 */
const AppNavbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    platform: '', genre: ''
  });
  const navigate = useNavigate(); // Hook for navigation

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
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handler for when the search is submitted (e.g., Enter key or search icon click)
  const handleSearchSubmit = () => {
    if (searchTerm.trim()) { // Only navigate if the search term is not empty
      // Navigate to the /products page with the search term as a query parameter
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // Optional: Show a message or just navigate to products page without search
      navigate('/products');
    }
  };
  const buildQueryParams = (currentSearchTerm, currentFilterCriteria) => {
    const params = new URLSearchParams();
    if (currentSearchTerm) {
      params.set('search', encodeURIComponent(currentSearchTerm.trim()));
    }
    if (currentFilterCriteria.platform) {
      params.set('platform', encodeURIComponent(currentFilterCriteria.platform));
    }
    if (currentFilterCriteria.genre) {
      params.set('genre', encodeURIComponent(currentFilterCriteria.genre));
    }
    return params.toString();
  };
  const handleFilterChange = ({ type, value }) => {
    const newFilterCriteria = {
      ...filterCriteria,
      [type]: value, // Update the specific filter type (platform or genre)
    };
    setFilterCriteria(newFilterCriteria);
    const params = buildQueryParams(searchTerm, newFilterCriteria);
    // Navigate to the /products page with the search term as a query parameter
    navigate(`/products${params ? `?${params}` : ''}`);
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
            <Button  component={RouterLink} to="/admin" sx={navLinkStyles}>
              Admin
            </Button>
          )}

        </Box>
        <ProductSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
        <ProductFilter
          filterCriteria={filterCriteria}
          onFilterChange={handleFilterChange}
        />
        {/* Auth Links/Buttons */}
        <Box sx={{ flexGrow: 0 }}>
          {isAuthenticated ? (
            <>
              {/* User Profile Link (conditional) */}
              {user && ( // Display username or "Account"
                <Button component={RouterLink} to="/profile" sx={authButtonStyles}>
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