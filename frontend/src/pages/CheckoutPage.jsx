import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../contexts/CartContext';
import apiClient from '../api/apiClient';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Define validation schema for the shipping form using Yup
const ShippingSchema = Yup.object().shape({
  addressLine1: Yup.string().required('Address Line 1 is required'),
  addressLine2: Yup.string(), // Optional field
  city: Yup.string().required('City is required'),
  zipCode: Yup.string().required('ZIP Code is required'),
  country: Yup.string().required('Country is required'),
});

// Placeholder data for Country dropdown
const countries = [
  { value: 'EG', label: 'Egypt' },
  { value: 'US', label: 'United States' },
  // Add more countries as needed
];

// CheckoutPage component
const CheckoutPage = () => {
  const { cartItems, cartTotal, isLoading: isCartLoading, clearCart } = useCart();
  const navigate = useNavigate();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const initialValues = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    country: '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsOrdering(true);
    setOrderError(null);
    setOrderSuccess(false);

    const orderData = {
      shipping_address_line1: values.addressLine1,
      shipping_address_line2: values.addressLine2,
      shipping_city: values.city,
      shipping_postal_code: values.zipCode,
      shipping_country: values.country,
    };

    try {
      const response = await apiClient.post('./orders/createOrder', orderData);
      console.log('Order created successfully:', response.data);
      
      setTimeout(() =>{navigate('/');}, 3000);
      
      setOrderSuccess(true);
      clearCart();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError(error.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsOrdering(false);
      setSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress color="secondary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>Loading Cart...</Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>Your Cart is Empty</Typography>
        <MuiLink component={RouterLink} to="/" sx={{ mt: 2 }}>
          Browse Games
        </MuiLink>
      </Container>
    );
  }

  const displayTotal = (cartTotal + 15.20).toFixed(2);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: 'text.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Checkout
        </Typography>
        <MuiLink component={RouterLink} to="/cart" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
          &lt; Back to Cart
        </MuiLink>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Shipping Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your shipping address where you would like to receive your order.
            </Typography>

            <Formik
              initialValues={initialValues}
              validationSchema={ShippingSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="addressLine1"
                        label="Address"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.addressLine1 && !!errors.addressLine1}
                        helperText={touched.addressLine1 && errors.addressLine1}
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="addressLine2"
                        label="Address Line 2 (Optional)"
                        fullWidth
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="city"
                        label="City"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.city && !!errors.city}
                        helperText={touched.city && errors.city}
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="zipCode"
                        label="ZIP Code"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.zipCode && !!errors.zipCode}
                        helperText={touched.zipCode && errors.zipCode}
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="country"
                        label="Country"
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.country && !!errors.country}
                        helperText={touched.country && errors.country}
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                          '.MuiSelect-icon': { color: 'text.secondary' }
                        }}
                      >
                        {countries.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Shipping Method"
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        defaultValue="standard"
                        InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        InputProps={{ sx: { color: 'text.primary' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                          '& label.Mui-focused': { color: 'secondary.main' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                          '.MuiSelect-icon': { color: 'text.secondary' }
                        }}
                      >
                        <MenuItem value="standard">
                          Standard Shipping (3-5 business days) - Free
                        </MenuItem>
                        <MenuItem value="express">
                          Express Shipping (1-2 business days) - $12.99
                        </MenuItem>
                      </TextField>
                    </Grid>

                    {orderError && (
                      <Grid item xs={12}>
                        <Alert severity="error">{orderError}</Alert>
                      </Grid>
                    )}
                    {orderSuccess && (
                      <Grid item xs={12}>
                        <Alert severity="success">Order placed successfully!</Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="large"
                        disabled={isSubmitting || isOrdering || isCartLoading || cartItems.length === 0}
                        sx={{
                          backgroundColor: '#673ab7',
                          '&:hover': { backgroundColor: '#5e35b1' },
                          color: 'white',
                          py: 1.5,
                          fontSize: '1rem',
                          mt: 2,
                        }}
                      >
                        {isSubmitting || isOrdering ? <CircularProgress size={24} color="inherit" /> : 'Continue to Payment'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'divider' }} />

            <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.product?.title || 'Unknown Product'} ({item.quantity})
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2, borderColor: 'divider' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Shipping</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>Free</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Tax (8%)</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>$15.20</Typography>
            </Box>

            <Divider sx={{ mb: 2, borderColor: 'divider' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>Total</Typography>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>${displayTotal}</Typography>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
              Free shipping on orders over $35
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Secure payment processing
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;