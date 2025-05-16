import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Alert, CircularProgress, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogContentText, Snackbar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

// Define validation schema using yup
const validationSchema = yup.object({
  username: yup
    .string('Enter your username')
    .required('Username is required'),
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string('Confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  terms: yup
     .boolean()
     .oneOf([true], 'You must accept the terms and privacy policy')
     .required('You must accept the terms and privacy policy'),
});

/**
 * Register page component.
 * Implements registration form using Formik and usesAuth context.
 * Styles based on v0.dev prototype register page.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const success = await register(values.username, values.email, values.password);
      if (success) {
        setIsRegisterSuccess(true);
        setOpenSuccess(true);
        setTimeout(() => {
          setOpenSuccess(false);
          navigate('/login', { replace: true });
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
    mt: 3,
    py: 1.5,
  };

  const termsStyles = {
    mt: 1,
    mb: 2,
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
      color: (theme) => theme.palette.text.secondary,
    }
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
          Create an account
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: (theme) => theme.palette.text.secondary }}>
          Enter your information to create an account
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            sx={inputStyles}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={inputStyles}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            sx={inputStyles}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="terms"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color="primary"
              />
            }
            label={
              <span>
                I agree to the{' '}
                <MuiLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setOpenTerms(true); }}
                  sx={linkStyles}
                >
                  Terms of Service
                </MuiLink>{' '}
                and{' '}
                <MuiLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setOpenPrivacy(true); }}
                  sx={linkStyles}
                >
                  Privacy Policy
                </MuiLink>
              </span>
            }
            sx={termsStyles}
          />
          {formik.touched.terms && formik.errors.terms && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: -1, mb: 2 }}>
              {formik.errors.terms}
            </Typography>
          )}

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
            Create Account
          </Button>

          <MuiLink component={RouterLink} to="/login" variant="body2" sx={linkStyles}>
            {"Already have an account? Sign In"}
          </MuiLink>
        </Box>
      </Box>

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

      {/* Success Snackbar */}
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ backgroundColor: '#1a202c', color: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1 }}>✓</Box>
            <Typography>Account created successfully.</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;