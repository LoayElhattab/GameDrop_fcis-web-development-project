import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { useCart } from '../contexts/CartContext'; // Import the cart context hook
import CartDisplay from '../components/CartDisplay'; // Import the CartDisplay component

// CartPage component represents the entire shopping cart page
const CartPage = () => {
  // Access cart state and functions from the CartContext
  const { cartItems, cartTotal, isLoading, fetchCart } = useCart();

  // Use useEffect to fetch the cart data when the component mounts.
  // The fetchCart is already triggered by CartProvider on mount,
  // but calling it here again ensures data is fresh if the user navigates directly.
  // However, given CartProvider already fetches, relying on its state might be sufficient
  // and avoids duplicate fetches. For simplicity and adherence to "Fetch cart data"
  // requirement for the page, we'll ensure it's fetched.
  // Let's remove the explicit fetch here to rely solely on the CartProvider's initial fetch
  // as per TRD (State Management section implying global state managed by context).
  // If a "refresh cart" button were required, we'd use fetchCart in a handler.
  // useEffect(() => {
  //   fetchCart();
  // }, []); // Empty dependency array means this runs once on mount

  // Conditional rendering based on loading state and cart items
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress color="secondary" /> {/* Show a spinner while loading */}
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>Loading Cart...</Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>Your Cart is Empty</Typography>
        {/* Optionally add a link to browse products */}
      </Container>
    );
  }

  // If not loading and cart has items, display the CartDisplay component
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Your Cart
      </Typography>
      {/* Render the CartDisplay component, passing the cart data */}
      <CartDisplay cartItems={cartItems} cartTotal={cartTotal} />
    </Container>
  );
};

export default CartPage;