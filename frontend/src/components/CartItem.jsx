import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Paper,
  Grid // Using Grid for internal layout of the item
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Using a delete icon for remove button
import { useCart } from '../contexts/CartContext'; // Import the cart context hook

// CartItem component displays details of a single product in the cart
const CartItem = ({ item }) => {
  // Access cart context functions to update and remove items
  const { updateItemQuantity, removeItem, isLoading } = useCart();

  // Handle quantity change from the input field (if we were using an input)
  // For this task, we'll use buttons based on the prototype
  // const handleQuantityChange = (event) => {
  //   const newQuantity = parseInt(event.target.value, 10);
  //   if (!isNaN(newQuantity) && newQuantity > 0) {
  //     updateItemQuantity(item.product.id, newQuantity);
  //   }
  // };

  // Handle incrementing quantity
  const handleIncrementQuantity = () => {
    // Prevent updating if loading or quantity is already very high (optional stock check later)
    if (!isLoading) {
      updateItemQuantity(item.product.id, item.quantity + 1);
    }
  };

  // Handle decrementing quantity
  const handleDecrementQuantity = () => {
    // Only decrement if quantity is greater than 1
    if (!isLoading && item.quantity > 1) {
      updateItemQuantity(item.product.id, item.quantity - 1);
    } else if (!isLoading && item.quantity === 1) {
      // If quantity is 1, decrementing should remove the item
      removeItem(item.product.id);
    }
  };

  // Handle removing the item
  const handleRemoveItem = () => {
    if (!isLoading) {
      removeItem(item.product.id);
    }
  };

  // Calculate the subtotal for this item
  const itemSubtotal = (item.product?.price || 0) * item.quantity;

  return (
    // Use Paper for a card-like appearance, matching the prototype
    <Paper
      sx={{
        p: 2, // Padding
        mb: 2, // Margin bottom for spacing between items
        backgroundColor: 'background.paper', // Dark background for the item card
        color: 'text.primary', // Primary text color
        display: 'flex', // Use flexbox for layout
        alignItems: 'center', // Center items vertically
        gap: 2, // Gap between flex items
        border: '1px solid', // Add a subtle border
        borderColor: 'divider', // Divider color for the border
      }}
      elevation={0} // No shadow for a flat look
    >
      {/* Placeholder for product image */}
      <Box
        sx={{
          width: 80, // Fixed width for the image container
          height: 100, // Fixed height
          backgroundColor: 'grey.800', // Dark grey placeholder background
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Image
        </Typography>
        {/* You would replace this Box with an actual <img> tag */}
      </Box>

      {/* Item details and controls */}
      <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
        {/* Product Title and Platform */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
            {item.product?.title || 'Unknown Product'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.product?.platform || 'Unknown Platform'} {/* Assuming platform is available in product details */}
          </Typography>
        </Grid>

        {/* Quantity Controls */}
        <Grid item xs={6} sm={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <IconButton
              size="small"
              onClick={handleDecrementQuantity}
              disabled={isLoading}
              sx={{ color: 'text.secondary', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" sx={{ px: 1, minWidth: 24, textAlign: 'center', color: 'text.primary' }}>
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={handleIncrementQuantity}
              disabled={isLoading}
              sx={{ color: 'text.secondary', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>

        {/* Item Price */}
        <Grid item xs={6} sm={2} sx={{ textAlign: { xs: 'right', sm: 'left' } }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            ${parseFloat(item.product?.price || 0).toFixed(2)} {/* Display individual item price */}
          </Typography>
        </Grid>

        {/* Remove Button */}
        <Grid item xs={12} sm={1} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="text"
            color="error" // Use error color for remove button
            size="small"
            onClick={handleRemoveItem}
            disabled={isLoading}
            startIcon={<DeleteOutlineIcon />} // Add a delete icon
            sx={{ textTransform: 'none' }} // Prevent uppercase text
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CartItem;