// gamedrop-frontend/src/pages/CartPage.jsx
import React, { useEffect } from 'react';
// --- CORRECTED IMPORTS ---
// Combined all necessary imports from @mui/material into one statement
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
// Import the empty cart icon
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
// Import Link for navigation from react-router-dom
import { Link } from 'react-router-dom';
// Import CartDisplay component
import CartDisplay from '../components/CartDisplay';
// Import the custom cart hook
import { useCart } from '../contexts/CartContext';

/**
 * The main page component for displaying the shopping cart.
 * Fetches cart data and conditionally renders CartDisplay or status messages.
 */
const CartPage = () => {
  // Access cart state from the context
  const { cartItems, isLoading, error, fetchCart } = useCart();

  // Styles for the page container
  const pageContainerStyles = {
    paddingY: 4, // Vertical padding for the page
    minHeight: '80vh', // Ensure a minimum height for the page
  };

  // Styles for the loading state
  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh', // Center loading spinner vertically
  };

  // --- ENHANCED Styles for the empty cart message container ---
  const emptyCartMessageStyles = {
    display: 'flex', // Use flexbox
    flexDirection: 'column', // Stack children vertically
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically in the container
    minHeight: '60vh', // Give it a substantial minimum height within the container
    textAlign: 'center', // Center text
    padding: 3, // Add padding
    backgroundColor: 'grey.900', // Dark background for the empty state area
    borderRadius: 2, // Rounded corners
    marginTop: 4, // Space below the page title
    color: 'text.secondary', // Use secondary text color for contrast
  };


  // Conditionally render based on loading state, errors, and cart items
  let content;
  if (isLoading) {
    content = (
      <Box sx={loadingStyles}>
        <CircularProgress /> {/* Show loading spinner */}
      </Box>
    );
  } else if (error) {
      content = (
          <Typography variant="h6" color="error" sx={{ textAlign: 'center', marginTop: 4 }}>
              Error loading cart. Please try again.
          </Typography>
      );
  }
  // --- ENHANCED JSX for the empty cart state ---
  else if (cartItems.length === 0) {
    content = (
      <Box sx={emptyCartMessageStyles}> {/* Use the updated styles */}
        {/* Empty Cart Icon */}
        <ShoppingCartOutlinedIcon sx={{ fontSize: 80, mb: 2, color: 'text.secondary' }} /> {/* Add a large icon */}

        {/* Empty Cart Message */}
        <Typography variant="h5" gutterBottom>
          Your cart is empty.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Looks like you haven't added anything to your cart yet. Browse our games to find something you like!
        </Typography>

        {/* Start Shopping Button */}
        {/* Use Button component as a RouterLink to the homepage */}
        <Button
          variant="contained" // Use contained variant for prominence
          color="primary" // Use primary color (should be purple in your dark theme)
          component={Link} // Use Link for navigation
          to="/" // Navigate to the homepage (or your products listing page)
          sx={{ textTransform: 'none', fontSize: '1rem', paddingX: 3, paddingY: 1.5 }} // Custom styling
        >
          Start Shopping
        </Button>
      </Box>
    );
  }
  // --- END OF ENHANCED JSX ---
  else {
    // If not loading and cart has items, display the CartDisplay component
    content = <CartDisplay />;
  }

  return (
    <Container maxWidth="lg" sx={pageContainerStyles}> {/* Use Container for max width */}
      <Typography variant="h4" gutterBottom sx={{ marginBottom: 4 }}>
        Your Cart ({cartItems.length} items) {/* Display item count */}
      </Typography>

      {content} {/* Render the determined content */}

    </Container>
  );
};

export default CartPage;