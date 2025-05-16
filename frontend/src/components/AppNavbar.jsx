import { AppBar, Toolbar, Typography, Button, Box, IconButton, Link as MuiLink, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductSearch from './ProductSearch';
import ProductFilter from './ProductFilter';
import React, { useState } from 'react';

/**
 * Application navigation bar component.
 * Styles based on v0.dev prototype navbar.
 */
const AppNavbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    platform: '',
    genre: ''
  });
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const navbarStyles = {
    backgroundColor: '#1a202c',
    color: '#ffffff',
    boxShadow: 'none',
  };

  const logoTextStyles = {
    mr: 2,
    fontWeight: 700,
    letterSpacing: '.2rem',
    color: 'inherit',
    textDecoration: 'none',
  };

  const navLinkStyles = {
    color: 'inherit',
    textDecoration: 'none',
    mx: 1,
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  const authButtonStyles = {
    mx: 1,
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      navigate(`/search-results?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products/getProducts');
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
      [type]: value,
    };
    setFilterCriteria(newFilterCriteria);
    const params = buildQueryParams(searchTerm, newFilterCriteria);
    navigate(`/search-results${params ? `?${params}` : ''}`);
  };

  const handleLogoutClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenConfirm(false);
    setOpenSuccess(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  return (
    <AppBar position="static" sx={navbarStyles}>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          sx={logoTextStyles}
        >
          GAMEDROP
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          <Button component={RouterLink} to="/" sx={navLinkStyles}>
            Home
          </Button>
          {isAuthenticated && !isAdmin && (
            <Button component={RouterLink} to="/cart" sx={navLinkStyles}>
              Cart
            </Button>
          )}
          {isAdmin && (
            <Button component={RouterLink} to="/admin" sx={navLinkStyles}>
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
        <Box sx={{ flexGrow: 0 }}>
          {isAuthenticated ? (
            <>
              {user && (
                <Button component={RouterLink} to="/profile" sx={authButtonStyles}>
                  {user.username || 'Account'}
                </Button>
              )}
              <Button variant="outlined" color="primary" onClick={handleLogoutClick} sx={authButtonStyles}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" sx={authButtonStyles}>
                Login
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" color="primary" sx={authButtonStyles}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%', backgroundColor: '#1a202c', color: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1 }}>✓</Box>
            <Typography>Logout successfully.</Typography>
            <IconButton size="small" onClick={handleCloseSuccess}>
              <span style={{ color: '#ffffff' }}>×</span>
            </IconButton>
          </Box>
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default AppNavbar;