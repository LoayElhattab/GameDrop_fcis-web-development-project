// gamedrop-frontend/src/pages/RegisterPage.jsx

import React from 'react';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Alert, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useFormik } from 'formik';
import * as yup from 'yup'; // For validation
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { useEffect } from 'react';

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
    .min(8, 'Password should be of minimum 8 characters length') // Example complexity
    .required('Password is required'),
  confirmPassword: yup
    .string('Confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match') // Match password field
    .required('Confirm Password is required'),
  terms: yup
     .boolean()
     .oneOf([true], 'You must accept the terms and privacy policy') // Require terms acceptance
     .required('You must accept the terms and privacy policy'),
});

/**
 * Register page component.
 * Implements registration form using Formik and usesAuth context.
 * Styles based on v0.dev prototype register page.
 */
const RegisterPage = () => {
   const navigate = useNavigate(); // Hook for navigation
  const { register, isLoading, error, isAuthenticated } = useAuth(); // Get register function, state from auth context

   // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true }); // Redirect to homepage
    }
  }, [isAuthenticated, navigate]);


  // Formik hook for form management
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
      // Call the register function from AuthContext
      // Note: confirmPassword and terms are frontend validation only,
      // do not send them to the backend register endpoint.
      const success = await register(values.username, values.email, values.password);
      // Redirection handled by the useEffect hook above if success updates isAuthenticated
    },
  });

  // Basic styling to match the prototype (similar to login page)
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
    mt: 3, // Margin top for the button
    py: 1.5, // Vertical padding
  };

   const termsStyles = {
       mt: 1, // Margin top
       mb: 2, // Margin bottom
       '& .MuiFormControlLabel-label': {
           fontSize: '0.875rem', // Adjust font size
           color: (theme) => theme.palette.text.secondary, // Lighter text color
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

    // Don't render the form if already authenticated (useEffect will redirect)
   if (isAuthenticated) {
       return null; // Or a loading spinner
   }


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
                 <MuiLink href="#" target="_blank" rel="noopener" sx={linkStyles}>Terms of Service</MuiLink>{' '}
                 and{' '}
                 <MuiLink href="#" target="_blank" rel="noopener" sx={linkStyles}>Privacy Policy</MuiLink>
               </span>
             }
             sx={termsStyles}
           />
            {formik.touched.terms && formik.errors.terms && (
                 <Typography variant="caption" color="error" sx={{ display: 'block', mt: -1, mb: 2 }}>
                     {formik.errors.terms}
                 </Typography>
            )}


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
            Create Account
          </Button>

           {/* Optional: Social Login Placeholders */}
            {/* <Typography variant="body2" sx={{ my: 2, color: (theme) => theme.palette.text.secondary }}> */}
            {/* OR CONTINUE WITH */}
            {/* </Typography> */}
            {/* <Button fullWidth variant="outlined" sx={{ mb: 1 }}>Google</Button> */}
            {/* <Button fullWidth variant="outlined">Facebook</Button> */}

          {/* Link to Login Page */}
           <MuiLink component={RouterLink} to="/login" variant="body2" sx={linkStyles}>
            {"Already have an account? Sign In"}
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;