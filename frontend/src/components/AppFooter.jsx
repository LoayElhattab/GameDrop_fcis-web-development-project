// gamedrop-frontend/src/components/common/AppFooter.jsx

import React from 'react';
import { Box, Typography, Container, Grid, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Use RouterLink for navigation

/**
 * Application footer component.
 * Styles based on v0.dev prototype footer.
 */
const AppFooter = () => {
  // Basic styling to match the prototype's dark background and layout
  const footerStyles = {
    backgroundColor: '#1a202c', // Dark background color, same as navbar
    color: '#ffffff', // White text color
    py: 6, // Padding top and bottom
    mt: 'auto', // Push footer to the bottom if content is short
  };

  const linkStyles = {
    color: 'inherit', // Inherit text color
    textDecoration: 'none',
    '&:hover': {
       textDecoration: 'underline',
    },
  };

  return (
    <Box component="footer" sx={footerStyles}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About GameDrop Section */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              GAMEDROP
            </Typography>
            <Typography variant="body2" sx={{ color: '#a0aec0' }}> {/* Lighter grey text */}
              Your one-stop shop for all your gaming needs.
              Buy the latest games for PlayStation, Xbox, Nintendo, and PC.
            </Typography>
          </Grid>

          {/* Shop Links Section */}
          <Grid item xs={6} sm={2}>
            <Typography variant="h6" gutterBottom>
              Shop
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li><MuiLink component={RouterLink} to="/" sx={linkStyles}>Home</MuiLink></li> {/* Assuming Home is the shop */}
              {/* Add links for platforms/genres if needed later */}
              {/* <li><MuiLink component={RouterLink} to="/category/playstation" sx={linkStyles}>PlayStation</MuiLink></li> */}
            </Box>
          </Grid>

          {/* Account Links Section */}
          <Grid item xs={6} sm={2}>
             <Typography variant="h6" gutterBottom>
               Account
             </Typography>
             <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li><MuiLink component={RouterLink} to="/account/profile" sx={linkStyles}>My Account</MuiLink></li>
                <li><MuiLink component={RouterLink} to="/account/orders" sx={linkStyles}>Order History</MuiLink></li>
                <li><MuiLink component={RouterLink} to="/cart" sx={linkStyles}>Cart</MuiLink></li>
                {/* Add Wishlist if implemented later */}
                {/* <li><MuiLink component={RouterLink} to="/account/wishlist" sx={linkStyles}>Wishlist</MuiLink></li> */}
             </Box>
          </Grid>

          {/* Company Links Section */}
          <Grid item xs={6} sm={2}>
             <Typography variant="h6" gutterBottom>
               Company
             </Typography>
             <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                 {/* Placeholder links */}
                <li><MuiLink href="#" sx={linkStyles}>About Us</MuiLink></li>
                <li><MuiLink href="#" sx={linkStyles}>Contact</MuiLink></li>
                <li><MuiLink href="#" sx={linkStyles}>Privacy Policy</MuiLink></li>
                <li><MuiLink href="#" sx={linkStyles}>Terms of Service</MuiLink></li>
             </Box>
          </Grid>

        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 6, textAlign: 'center', color: '#a0aec0' }}> {/* Lighter grey text */}
          <Typography variant="body2">
            © {new Date().getFullYear()} GameDrop. All rights reserved.
          </Typography>
          {/* Add social media icons if needed, styled appropriately */}
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;