import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Alert, CircularProgress, Snackbar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, isAdmin } = useAuth();
  const [openSuccess, setOpenSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const success = await login(values.email, values.password);
      if (success) {
        setOpenSuccess(true);
        setTimeout(() => {
          setOpenSuccess(false);
          if (isAdmin) {
            navigate('../', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 3000);
      }
    },
  });

  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px - 100px)',
  };

  const formContainerStyles = {
    padding: 4,
    borderRadius: 2,
    textAlign: 'center',
    backgroundColor: (theme) => theme.palette.background.paper,
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)',
    maxWidth: '400px',
    width: '100%',
  };

  const inputStyles = {
    mb: 2,
  };

  const submitButtonStyles = {
    mt: 2,
    py: 1.5,
  };

  const linkStyles = {
    mt: 2,
    display: 'block',
    color: (theme) => theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  };

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

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

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
            disabled={isLoading}
          >
            Sign In
          </Button>

          <MuiLink component={RouterLink} to="/register" variant="body2" sx={linkStyles}>
            {"Don't have an account? Sign Up"}
          </MuiLink>
        </Box>
      </Box>

      <Snackbar
        open={openSuccess}
        autoHideDuration={2000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ backgroundColor: '#1a202c', color: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1 }}>✓</Box>
            <Typography>Logged successfully.</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;