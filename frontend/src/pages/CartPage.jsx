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


const CartPage = () => {

  const { cartItems, cartTotal, isLoading, fetchCart } = useCart();


  useEffect(() => {
    fetchCart();
  }, []); 

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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Your Cart
      </Typography>
      <CartDisplay cartItems={cartItems} cartTotal={cartTotal} />
    </Container>
  );
};

export default CartPage;