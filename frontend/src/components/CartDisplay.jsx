import React from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import CartItem from './CartItem'; 


const CartDisplay = ({ cartItems, cartTotal }) => {
  const navigate = useNavigate();


  const handleCheckoutClick = () => {
    navigate('/checkout'); 
  };

  return (
    <Grid container spacing={4}>
      {/* Left Column: Cart Items List */}
      <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
          Cart Items ({cartItems.length})
        </Typography>
        <Box>
          {cartItems.map((item) => (
      
            <CartItem key={item.id} item={item} />
          ))}
        </Box>
      </Grid>

      {/* Right Column: Order Summary */}
      <Grid item xs={12} md={4}>
        {/* Use Paper for the order summary card */}
        <Paper
          sx={{
            p: 3, // Padding
            backgroundColor: 'background.paper', // Dark background
            color: 'text.primary', // Primary text color
            border: '1px solid', // Subtle border
            borderColor: 'divider', // Divider color for border
          }}
          elevation={0} // No shadow
        >
          <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
            Order Summary
          </Typography>
          <Divider sx={{ mb: 2, borderColor: 'divider' }} /> {/* Divider */}

          {/* Summary details */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>${cartTotal.toFixed(2)}</Typography> {/* Display calculated total */}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Shipping</Typography>
            {/* Placeholder for shipping logic - hardcoded Free for now based on prototype */}
            <Typography variant="body1" sx={{ color: 'text.primary' }}>Free</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Tax (8%)</Typography>
            {/* Placeholder for tax logic - hardcoded value based on prototype */}
            <Typography variant="body1" sx={{ color: 'text.primary' }}>$15.20</Typography>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'divider' }} /> {/* Divider */}

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>Total</Typography>
            {/* Display the total including hardcoded shipping and tax */}
            <Typography variant="h6" sx={{ color: 'text.primary' }}>${(cartTotal + cartTotal * 0.08).toFixed(2)}</Typography> {/* Adjust calculation based on actual tax/shipping */}
          </Box>

          {/* Proceed to Checkout Button */}
          <Button
            variant="contained"
            color="secondary" // Use secondary color for the prominent purple button
            fullWidth // Make button full width
            size="large" // Large size
            onClick={handleCheckoutClick}
            // Disable if cart is empty or loading
            disabled={cartItems.length === 0}
            sx={{
            
              backgroundColor: '#673ab7', // Example purple color (adjust as needed to match theme)
              '&:hover': {
                backgroundColor: '#5e35b1', // Darker purple on hover
              },
              color: 'white', // White text color
              py: 1.5, // Vertical padding
              fontSize: '1rem', // Larger font size
            }}
          >
            Proceed to Checkout
          </Button>

          {/* Free shipping message */}
          <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
            Free shipping on orders over $35 {/* Hardcoded message based on prototype */}
          </Typography>
          {/* Secure payment message */}
          <Typography variant="body2" align="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
            Secure payment processing {/* Hardcoded message */}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CartDisplay;