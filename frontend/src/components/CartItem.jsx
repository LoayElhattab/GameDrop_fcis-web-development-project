import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Paper,
  Grid 
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; 
import { useCart } from '../contexts/CartContext'; 

const CartItem = ({ item }) => {
 
  const { updateItemQuantity, removeItem, isLoading } = useCart();



  const handleIncrementQuantity = () => {
    if (!isLoading) {
      updateItemQuantity(item.product.id, item.quantity + 1);
    }
  };

  const handleDecrementQuantity = () => {
    if (!isLoading && item.quantity > 1) {
      updateItemQuantity(item.product.id, item.quantity - 1);
    } else if (!isLoading && item.quantity === 1) {
      removeItem(item.product.id);
    }
  };

  const handleRemoveItem = () => {
    if (!isLoading) {
      removeItem(item.product.id);
    }
  };

  const itemSubtotal = (item.product?.price || 0) * item.quantity;

  return (
    <Paper
      sx={{
        p: 2, // Padding
        mb: 2, // Margin bottom for spacing between items
        backgroundColor: 'background.paper', 
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
          width: 80, 
          height: 100, 
          backgroundColor: 'grey.800',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0, 
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