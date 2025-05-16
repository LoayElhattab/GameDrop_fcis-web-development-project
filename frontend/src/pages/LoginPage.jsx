import React from 'react';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useFormik } from 'formik';
import * as yup from 'yup'; // For validation
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { useEffect } from 'react';

// Define validation schema using yup
const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .required('Password is required'),
});

/**
 * Login page component.
 * Implements login form using Formik and usesAuth context.
 * Styles based on v0.dev prototype login page.
 */
const LoginPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { login, isLoading, error, isAuthenticated, isAdmin } = useAuth(); // Added isAdmin to check role

  // Redirect based on authentication and admin status
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('../', { replace: true }); // Redirect to admin dashboard if admin
      } else {
        navigate('/', { replace: true }); // Redirect to homepage if regular user
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Formik hook for form management
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Call the login function from AuthContext
      const success = await login(values.email, values.password);
      if (success && isAdmin) {
        navigate('/admin/dashboard', { replace: true }); // Immediate redirect if admin (redundant with useEffect, but ensures flow)
      }
      // Redirection is primarily handled by useEffect based on isAuthenticated and isAdmin
    },
  });

  // Basic styling to match the prototype (dark background, centered form)
  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px - 100px)', // Adjust based on navbar/footer height if needed
    // Background color is handled by the global theme and CssBaseline
  };

  const formContainerStyles = {
    padding: 4,
    borderRadius: 2,
    textAlign: 'center',
    // Use theme paper color for the form box background
    backgroundColor: (theme) => theme.palette.background.paper,
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)', // Subtle shadow like prototype
    maxWidth: '400px', // Max width for the form container
    width: '100%', // Take full width up to max
  };

  const inputStyles = {
    mb: 2, // Margin bottom between fields
  };

  const submitButtonStyles = {
    mt: 2, // Margin top for the button
    py: 1.5, // Vertical padding
  };

  const linkStyles = {
    mt: 2,
    display: 'block', // Make link a block element for margin
    color: (theme) => theme.palette.primary.main, // Use theme's primary color
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  // Don't render the form if already authenticated (useEffect will redirect)
  if (isAuthenticated) {
    return null; // Or a loading spinner if redirection isn't instant
  }

  return (
    <Container component="main" maxWidth="xs" sx={pageStyles}>
      <Box sx={formContainerStyles}>
        <Typography component="h1" variant="h5" gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: (theme) => theme.palette.text.secondary }}>
          Enter your email and password to sign in to your account
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={inputStyles}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={inputStyles}
          />
          {/* Optional: Forgot password link */}
          {/* <MuiLink component={RouterLink} to="#" variant="body2" sx={{ display: 'block', textAlign: 'right' }}>
            Forgot password?
          </MuiLink> */}

          {/* Display loading spinner if loading */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Display error message if error exists */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={submitButtonStyles}
            disabled={isLoading} // Disable button while loading
          >
            Sign In
          </Button>

          {/* Link to Register Page */}
          <MuiLink component={RouterLink} to="/register" variant="body2" sx={linkStyles}>
            {"Don't have an account? Sign Up"}
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;