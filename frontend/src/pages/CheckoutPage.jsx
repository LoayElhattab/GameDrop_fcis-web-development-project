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
  MenuItem, // For State/Country dropdowns
  CircularProgress,
  Alert,
  Link as MuiLink // Alias Link to avoid conflict with react-router-dom Link
} from '@mui/material';
import { Formik, Form, Field } from 'formik'; // Import Formik components
import * as Yup from 'yup'; // Import Yup for validation
import { useCart } from '../contexts/CartContext'; // Use the cart context
import apiClient from '../api/apiClient'; // Import apiClient
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import RouterLink and useNavigate

// Define validation schema for the shipping form using Yup
const ShippingSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  addressLine1: Yup.string().required('Address Line 1 is required'),
  addressLine2: Yup.string(), // Optional field
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string().required('ZIP Code is required'),
  country: Yup.string().required('Country is required'),
});

// Placeholder data for State and Country dropdowns
// In a real application, this would likely come from an API or a larger dataset
const states = [
  { value: 'NY', label: 'New York' },
  { value: 'CA', label: 'California' },
  // Add more states as needed
];

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  // Add more countries as needed
];

// CheckoutPage component handles the checkout process
const CheckoutPage = () => {
  // Access cart items and total from the CartContext
  const { cartItems, cartTotal, isLoading: isCartLoading, clearCart } = useCart();
  const navigate = useNavigate(); // Hook for navigation

  // State for handling order creation loading and errors
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false); // State to indicate successful order

  // Initial values for the shipping form
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  };

  // Handle the form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsOrdering(true);
    setOrderError(null);
    setOrderSuccess(false);

    // Prepare order data for the backend
    const orderData = {
      shippingAddress: {
        line1: values.addressLine1,
        line2: values.addressLine2,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
      },
      // paymentInfo: { /* Simulated payment details - not implemented in backend for this sprint */ },
      // The backend will typically use the user's current cart
      // If the backend expects cart items in the payload, you'd add:
      // items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity })),
    };

    try {
      // Call the backend API to create the order
      // Assuming the endpoint is POST /api/orders
      const response = await apiClient.post('/createOrder', orderData);

      // Handle successful order creation
      console.log('Order created successfully:', response.data);
      setOrderSuccess(true);
      // Clear the local cart state after successful order
      clearCart();
      // Optionally redirect to an order confirmation page or order history
      // navigate(`/account/orders/${response.data.orderId}`); // Example redirect
      resetForm(); // Clear the form

    } catch (error) {
      console.error('Error creating order:', error);
      // Display error message
      setOrderError(error.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsOrdering(false);
      setSubmitting(false);
    }
  };

  // If cart is empty, redirect or show a message
  // Also check for loading state before rendering
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

  // Calculate total including hardcoded shipping and tax for display purposes
  const displayTotal = (cartTotal + 15.20).toFixed(2); // Assuming $15.20 tax as per prototype

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: 'text.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Checkout
        </Typography>
        {/* Link back to cart */}
        <MuiLink component={RouterLink} to="/cart" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
          &lt; Back to Cart
        </MuiLink>
      </Box>

      {/* Two-column layout for shipping info and order summary */}
      <Grid container spacing={4}>
        {/* Left Column: Shipping Information Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Shipping Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your shipping address where you would like to receive your order.
            </Typography>

            {/* Formik Form for Shipping Information */}
            <Formik
              initialValues={initialValues}
              validationSchema={ShippingSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Grid container spacing={2}>
                    {/* First Name */}
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="firstName"
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.firstName && !!errors.firstName}
                        helperText={touched.firstName && errors.firstName}
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
                    {/* Last Name */}
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="lastName"
                        label="Last Name"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.lastName && !!errors.lastName}
                        helperText={touched.lastName && errors.lastName}
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
                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
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
                    {/* Phone Number */}
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.phoneNumber && !!errors.phoneNumber}
                        helperText={touched.phoneNumber && errors.phoneNumber}
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
                    {/* Address Line 1 */}
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
                    {/* Address Line 2 */}
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
                    {/* City */}
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
                    {/* State */}
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="state"
                        label="State"
                        select // Use select for dropdown
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={touched.state && !!errors.state}
                        helperText={touched.state && errors.state}
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
                          '.MuiSelect-icon': { color: 'text.secondary' } // Style dropdown arrow
                        }}
                      >
                        {states.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    {/* ZIP Code */}
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
                    {/* Country */}
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="country"
                        label="Country"
                        select // Use select for dropdown
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
                          '.MuiSelect-icon': { color: 'text.secondary' } // Style dropdown arrow
                        }}
                      >
                        {countries.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>

                    {/* Simulated Payment Selection (Placeholder) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Shipping Method"
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        defaultValue="standard" // Default selected value
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
                          '.MuiSelect-icon': { color: 'text.secondary' } // Style dropdown arrow
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

                    {/* Error/Success Messages */}
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

                    {/* Continue to Payment Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary" // Use secondary color for the prominent button
                        fullWidth
                        size="large"
                        disabled={isSubmitting || isOrdering || isCartLoading || cartItems.length === 0}
                        sx={{
                          // Custom styling to match prototype's purple button
                          backgroundColor: '#673ab7', // Example purple color
                          '&:hover': {
                            backgroundColor: '#5e35b1', // Darker purple on hover
                          },
                          color: 'white', // White text color
                          py: 1.5,
                          fontSize: '1rem',
                          mt: 2, // Margin top
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

        {/* Right Column: Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }} elevation={0}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'divider' }} />

            {/* List of items in summary */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}> {/* Added overflow for long lists */}
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

            <Divider sx={{ my: 2, borderColor: 'divider' }} /> {/* Margin top and bottom */}

            {/* Summary totals */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Shipping</Typography>
              {/* Hardcoded based on prototype, adjust if shipping method is selected */}
              <Typography variant="body1" sx={{ color: 'text.primary' }}>Free</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>Tax (8%)</Typography>
              {/* Hardcoded based on prototype */}
              <Typography variant="body1" sx={{ color: 'text.primary' }}>$15.20</Typography>
            </Box>

            <Divider sx={{ mb: 2, borderColor: 'divider' }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>Total</Typography>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>${displayTotal}</Typography>
            </Box>

            {/* Additional information */}
            <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
              Free shipping on orders over $35 {/* Hardcoded message */}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Secure payment processing {/* Hardcoded message */}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;