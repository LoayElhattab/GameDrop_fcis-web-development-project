
// gamedrop-frontend/src/components/CartItem.jsx
import React from 'react';
import { Box, Typography, IconButton, Stack, Divider, TextField,Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../contexts/CartContext'; // Import the custom cart hook

/**
 * Renders a single item within the shopping cart display.
 * Includes product details, quantity controls, and a remove button.
 */
const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItem, isLoading } = useCart(); // Access cart functions and loading state

  // Function to handle quantity decrement
  const handleDecrementQuantity = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.productId, item.quantity - 1);
    }
  };

  // Function to handle quantity increment
  const handleIncrementQuantity = () => {
    updateItemQuantity(item.productId, item.quantity + 1);
  };

  // Function to handle item removal
  const handleRemoveItem = () => {
    removeItem(item.productId);
  };

  // Calculate the subtotal for this item
  const itemSubtotal = (item.quantity * item.product.price).toFixed(2);

  // Basic styling inspired by the v0.dev prototype screenshot
  const itemStyles = {
    display: 'flex', // Use flexbox for layout
    alignItems: 'center', // Vertically align items
    padding: 2, // Add padding
    borderBottom: '1px solid', // Add a bottom border as a separator
    borderColor: 'divider', // Use theme divider color
    '&:last-child': { // Remove bottom border for the last item
      borderBottom: 'none',
    },
  };

  const imagePlaceholderStyles = {
    width: 80, // Fixed width for the image placeholder
    height: 100, // Fixed height
    backgroundColor: 'grey.800', // Dark grey background
    marginRight: 2, // Add space to the right
    flexShrink: 0, // Prevent shrinking
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const quantityControlStyles = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderColor: 'grey.700', // Subtle border for quantity control
    borderRadius: 1, // Slightly rounded corners
    marginTop: 1, // Space above quantity control
  };

  const quantityButtonStyles = {
    padding: 0.5, // Smaller padding for buttons
    minWidth: '30px', // Ensure button is clickable
  };

  const quantityTextStyles = {
    width: '40px', // Fixed width for quantity display
    textAlign: 'center',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderColor: 'grey.700',
    paddingX: 1,
    // Hide default number input arrows
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
  };


  return (
    <Box sx={itemStyles}>
      {/* Image Placeholder */}
      <Box sx={imagePlaceholderStyles}>
        {/* Replace with actual image when available */}
        <Typography variant="caption" color="text.secondary">Image</Typography>
      </Box>

      {/* Product Details and Controls */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          {/* Title and Platform */}
          <Box>
            <Typography variant="h6">{item.product.title}</Typography>
            <Typography variant="body2" color="text.secondary">{item.product.platform}</Typography>
          </Box>
          {/* Price */}
          <Typography variant="h6">${item.product.price.toFixed(2)}</Typography> {/* Format price */}
        </Stack>

        {/* Quantity and Remove */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginTop: 1 }}>
          {/* Quantity Controls */}
          <Box sx={quantityControlStyles}>
            <IconButton
              sx={quantityButtonStyles}
              onClick={handleDecrementQuantity}
              disabled={item.quantity <= 1 || isLoading} // Disable if quantity is 1 or less, or during loading
              aria-label="decrease quantity"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            {/* Display Quantity - Using Typography or readOnly TextField for display */}
            <Typography sx={quantityTextStyles}>
               {item.quantity}
            </Typography>
            {/* If you want an input field instead, use TextField with readOnly */}
            {/* <TextField
                value={item.quantity}
                InputProps={{ readOnly: true }}
                sx={quantityTextStyles}
                variant="standard"
                disableUnderline // Remove underline
            /> */}
            <IconButton
              sx={quantityButtonStyles}
              onClick={handleIncrementQuantity}
              disabled={isLoading} // Disable during loading
              aria-label="increase quantity"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Remove Button */}
          <Button
            color="error" // Use error color for remove
            startIcon={<DeleteIcon />} // Add delete icon
            onClick={handleRemoveItem}
            disabled={isLoading} // Disable during loading
            sx={{ textTransform: 'none' }} // Prevent uppercase text
          >
            Remove
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CartItem;