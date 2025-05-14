// gamedrop-frontend/src/components/CartDisplay.jsx
import React from 'react';
import { Box, Typography, Button, Stack, Divider, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem'; // Import CartItem component
import { useCart } from '../contexts/CartContext'; // Import the custom cart hook

/**
 * Displays the list of cart items and the order summary.
 * Uses CartItem component to render each item.
 */
const CartDisplay = () => {
  // Access cart state and functions from the context
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate(); // Hook for navigation

  // Dummy values for shipping and tax (as per screenshot)
  const shipping = 0; // Free shipping
  const taxRate = 0.08; // 8% tax rate
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.product.price)), 0);
  const tax = subtotal * taxRate;
  const totalWithTaxAndShipping = subtotal + tax + shipping;


  // Styling for the main container and layout
  const containerStyles = {
    display: 'grid', // Use CSS Grid for the two-column layout
    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, // Single column on small screens, two on medium+
    gap: 4, // Gap between columns
    paddingY: 4, // Vertical padding
  };

  // Styling for the cart items section
  const cartItemsSectionStyles = {
    backgroundColor: 'grey.900', // Dark background for the section
    padding: 2, // Add padding
    borderRadius: 2, // Rounded corners
  };

  // Styling for the order summary section
  const orderSummarySectionStyles = {
    backgroundColor: 'grey.900', // Dark background for the section
    padding: 3, // Add padding
    borderRadius: 2, // Rounded corners
    height: 'fit-content', // Fit content height
    position: { md: 'sticky' }, // Make sticky on medium+ screens
    top: { md: 80 }, // Stick to the top with some offset (adjust based on your header height)
  };

  // Styling for the summary details (Subtotal, Shipping, Tax, Total)
  const summaryDetailStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 1, // Space between detail lines
  };

  const summaryTotalStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 2, // Space above total line
    paddingTop: 2, // Padding above total line
    borderTop: '1px solid', // Top border for the total line
    borderColor: 'divider', // Use theme divider color
  };

  // Styling for the checkout button
  const checkoutButtonStyles = {
    marginTop: 3, // Space above the button
    paddingY: 1.5, // Vertical padding for a larger button
    fontSize: '1rem', // Larger font size
    textTransform: 'none', // Prevent uppercase text
    backgroundColor: 'primary.main', // Use the primary color from the theme (should be purple in dark theme)
    '&:hover': {
        backgroundColor: 'primary.dark', // Darker shade on hover
    }
  };


  // Handle navigation to checkout page
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Box sx={containerStyles}>
      {/* Left Column: Cart Items List */}
      <Box sx={cartItemsSectionStyles}>
        {/* Render each item using the CartItem component */}
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </Box>

      {/* Right Column: Order Summary */}
      <Paper elevation={0} sx={orderSummarySectionStyles}> {/* Use Paper for elevated/card look */}
        <Typography variant="h5" gutterBottom>Order Summary</Typography>

        {/* Summary Details */}
        <Box sx={summaryDetailStyles}>
          <Typography variant="body1" color="text.secondary">Subtotal</Typography>
          <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
        </Box>

        <Box sx={summaryDetailStyles}>
          <Typography variant="body1" color="text.secondary">Shipping</Typography>
          <Typography variant="body1">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
        </Box>

        <Box sx={summaryDetailStyles}>
          <Typography variant="body1" color="text.secondary">Tax ({(taxRate * 100).toFixed(0)}%)</Typography>
          <Typography variant="body1">${tax.toFixed(2)}</Typography>
        </Box>

        {/* Total */}
        <Box sx={summaryTotalStyles}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${totalWithTaxAndShipping.toFixed(2)}</Typography>
        </Box>

        {/* Proceed to Checkout Button */}
        <Button
          variant="contained"
          fullWidth
          sx={checkoutButtonStyles}
          onClick={handleProceedToCheckout}
          disabled={cartItems.length === 0} // Disable if cart is empty
        >
          Proceed to Checkout
        </Button>

        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ marginTop: 1 }}>
            Free shipping on orders over $35
        </Typography> {/* Static text as seen in screenshot */}

      </Paper>
    </Box>
  );
};

export default CartDisplay;