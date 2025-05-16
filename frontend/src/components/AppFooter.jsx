import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Application footer component.
 * Styles based on v0.dev prototype footer.
 */
const AppFooter = () => {
  const { user, isAdmin } = useAuth();
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  const footerStyles = {
    backgroundColor: '#1a202c',
    color: '#ffffff',
    py: 6,
    mt: 'auto',
  };

  const linkStyles = {
    color: 'inherit',
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
            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
              Your one-stop shop for all your gaming needs.
              Buy the latest games for PlayStation, Xbox, Nintendo, and PC.
            </Typography>
          </Grid>

          {/* Account Links Section */}
          <Grid item xs={6} sm={2}>
            <Typography variant="h6" gutterBottom>
              Account
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {user && (
                <>
                  <li>
                    <MuiLink component={RouterLink} to="/profile" sx={linkStyles}>
                      My Account
                    </MuiLink>
                  </li>
                  {!isAdmin && (
                    <li>
                      <MuiLink component={RouterLink} to="/cart" sx={linkStyles}>
                        Cart
                      </MuiLink>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <MuiLink component={RouterLink} to="/admin" sx={linkStyles}>
                        Admin
                      </MuiLink>
                    </li>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Company Links Section */}
          <Grid item xs={6} sm={2}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <MuiLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setOpenTerms(true); }}
                  sx={linkStyles}
                >
                  Terms of Service
                </MuiLink>
              </li>
              <li>
                <MuiLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setOpenPrivacy(true); }}
                  sx={linkStyles}
                >
                  Privacy Policy
                </MuiLink>
              </li>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 6, textAlign: 'center', color: '#a0aec0' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} GameDrop. All rights reserved.
          </Typography>
        </Box>
      </Container>

      {/* Terms of Service Dialog */}
      <Dialog open={openTerms} onClose={() => setOpenTerms(false)}>
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome to GameDrop! By using our services, you agree to the following terms:
            <ul>
              <li>Users must provide accurate registration information.</li>
              <li>Accounts are for personal use only.</li>
              <li>GameDrop reserves the right to suspend accounts for violations.</li>
            </ul>
            Last updated: May 16, 2025.
          </DialogContentText>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={openPrivacy} onClose={() => setOpenPrivacy(false)}>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent>
          <DialogContentText>
            At GameDrop, we value your privacy. This policy outlines how we handle your data:
            <ul>
              <li>We collect email and username for account management.</li>
              <li>Your data is not shared with third parties.</li>
              <li>You can request data deletion at any time.</li>
            </ul>
            Last updated: May 16, 2025.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AppFooter;