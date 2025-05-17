import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';
import { Snackbar, Alert, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



const CartContext = createContext({
  cartItems: [], 
  cartTotal: 0, 
  isLoading: false, 
  error: null, 
  fetchCart: async () => { }, 
  addItem: async (productId, quantity = 1) => { }, 
  updateItemQuantity: async (productId, quantity) => { },
  removeItem: async (productId) => { }, 
  clearCart: async () => { }, 
  snackbarOpen: false,
  snackbarMessage: '',
  snackbarSeverity: 'success',
  handleSnackbarClose: () => { },
});

export const CartProvider = ({ children, navigate }) => {
  const { isAuthenticated } = useAuth();


  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 
  const [showGoToCartButton, setShowGoToCartButton] = useState(false);

  const showSnackbar = useCallback((message, severity = 'success', showGoToCart = false) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowGoToCartButton(showGoToCart); 
    setSnackbarOpen(true);
  }, []); 



  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);

    setShowGoToCartButton(false);
  }, []);


  const handleGoToCartClick = useCallback(() => {
    if (navigate) { 
      navigate('/cart'); 
    }
    handleSnackbarClose(); 
  }, [navigate, handleSnackbarClose]); 

  const fetchCart = useCallback(async () => {

    if (!isAuthenticated) {
      setCartItems([]);
      setCartTotal(0);
      setIsLoading(false); 
      setError(null);
      console.log("User not authenticated. Cart state cleared.");
      return;
    }

    setIsLoading(true); 
    setError(null); 
    console.log('Fetching cart...'); // Log for debugging
    try {
      const response = await apiClient.get('/cart');

    
      if (response.data && Array.isArray(response.data.items)) {
        setCartItems(response.data.items);
        var total = 0;
        response.data.items.forEach(item => total += item.quantity * parseFloat(item.product.price));
        setCartTotal(total);
      } else {
      
        console.warn('Unexpected cart data format:', response.data);
        setCartItems([]); // Clear items if format is wrong
        setCartTotal(0);
      }

      setIsLoading(false); // Set loading state to false after success
      console.log('Cart fetched successfully:', response.data);

    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err); // Set the error state
      setIsLoading(false); // Set loading state to false after error

      setCartItems([]);
      setCartTotal(0);

     
    }
  }, [isAuthenticated, showSnackbar]); // Dependency: Add showSnackbar


  useEffect(() => {
    fetchCart(); // Call the memoized fetchCart function
  }, [fetchCart]); // Dependency: Re-run effect when fetchCart changes (which happens when isAuthenticated changes)



  const addItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      console.log("User not authenticated. Cannot add item to cart.");
      // Show a message prompting the user to log in
      showSnackbar('Please log in to add items to your cart.', 'info');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(isAuthenticated);
      console.log(`Attempting to add product ${productId} with quantity ${quantity}`);
      const response = await apiClient.post('/cart/items', { product_id: productId, quantity: quantity });
      console.log('Add item response:', response.data);

      await fetchCart();
      showSnackbar('Item added to cart!', 'success', true); // Pass true to show the "Go to Cart" button
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to update your cart.', 'info');
      return;
    }
    if (quantity <= 0) {
      console.warn("Attempted to update item quantity to zero or less via updateItemQuantity. Use removeItem instead.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to update product ${productId} quantity to ${quantity}`);
      // Make PUT request to update item quantity
      const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
      console.log('Update quantity response:', response.data);
      await fetchCart();
      showSnackbar('Cart updated.', 'success');
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove an item from the cart
  const removeItem = async (productId) => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to remove items from your cart.', 'info');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to remove product ${productId}`);
      // Make DELETE request to remove the item
      const response = await apiClient.delete(`/cart/items/${productId}`);
      console.log('Remove item response:', response.data);

      // After successful API call, fetch the updated cart state
      await fetchCart();
      // Show success message
      showSnackbar('Item removed from cart.', 'success');
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError(err);
    
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to clear your cart.', 'info');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting to clear cart');
      const response = await apiClient.post('/cart/clear'); 
      console.log('Clear cart response:', response.data);
      setCartItems([]);
      setCartTotal(0);
      await fetchCart(); 
     
      showSnackbar('Cart cleared.', 'success');
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };


  const contextValue = {
    cartItems,
    cartTotal,
    isLoading,
    error,
    fetchCart, 
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000} 
        onClose={handleSnackbarClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          action={
            <React.Fragment> {/* Use Fragment to group multiple actions */}

              {/* Always include the Close Icon Button */}
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
