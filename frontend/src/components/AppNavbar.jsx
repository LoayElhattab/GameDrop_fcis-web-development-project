import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Snackbar, 
  Alert,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductSearch from './ProductSearch';
import ProductFilter from './ProductFilter';
import React, { useState } from 'react';
import logoImage from '../assets/images/GameDrop.png';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

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
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    display: 'flex',
    alignItems: 'center'
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
      setSearchTerm('');
    } else {
      navigate('/search-results');
    }
    setShowMobileSearch(false);
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
    setShowMobileFilter(false);
  };

  const handleLogoutClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenConfirm(false);
    setOpenSuccess(true);
    handleCloseMobileMenu();
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  const handleOpenMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchor(null);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMobileFilter(false);
  };

  const toggleMobileFilter = () => {
    setShowMobileFilter(!showMobileFilter);
    setShowMobileSearch(false);
  };

  return (
    <AppBar position="static" sx={navbarStyles}>
      <Toolbar>
        <Box component={RouterLink} to="/" sx={logoTextStyles}>
          <img src={logoImage} alt="GameDrop Logo" style={{ height: '20px', width: 'auto' }} />
        </Box>
        
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

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
          />
          <ProductFilter
            filterCriteria={filterCriteria}
            onFilterChange={handleFilterChange}
          />
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
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

        {isMobile && (
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', ml: 'auto' }}>
            <IconButton
              size="large"
              aria-label="search"
              color="inherit"
              onClick={toggleMobileSearch}
              sx={{ mr: 1 }}
            >
              <SearchIcon />
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="filter"
              color="inherit"
              onClick={toggleMobileFilter}
              sx={{ mr: 1 }}
            >
              <FilterListIcon />
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="menu"
              color="inherit"
              onClick={handleOpenMobileMenu}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>

      {showMobileSearch && (
        <Box sx={{ p: 2, display: { xs: 'block', md: 'none' } }}>
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            fullWidth
          />
        </Box>
      )}

      {showMobileFilter && (
        <Box sx={{ p: 2, display: { xs: 'block', md: 'none' } }}>
          <ProductFilter
            filterCriteria={filterCriteria}
            onFilterChange={handleFilterChange}
            fullWidth
          />
        </Box>
      )}

      <Menu
        anchorEl={mobileMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleCloseMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <MenuItem component={RouterLink} to="/" onClick={handleCloseMobileMenu}>
          Home
        </MenuItem>
        
        {isAuthenticated && !isAdmin && (
          <MenuItem component={RouterLink} to="/cart" onClick={handleCloseMobileMenu}>
            Cart
          </MenuItem>
        )}
        
        {isAdmin && (
          <MenuItem component={RouterLink} to="/admin" onClick={handleCloseMobileMenu}>
            Admin
          </MenuItem>
        )}
        
        {isAuthenticated && user && (
          <MenuItem component={RouterLink} to="/profile" onClick={handleCloseMobileMenu}>
            {user.username || 'Account'}
          </MenuItem>
        )}
        
        {isAuthenticated ? (
          <MenuItem onClick={handleLogoutClick}>
            Logout
          </MenuItem>
        ) : (
          <>
            <MenuItem component={RouterLink} to="/login" onClick={handleCloseMobileMenu}>
              Login
            </MenuItem>
            <MenuItem component={RouterLink} to="/register" onClick={handleCloseMobileMenu}>
              Register
            </MenuItem>
          </>
        )}
      </Menu>

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