// gamedrop-frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient'; // Your configured apiClient
// Assuming you have an AuthContext to check if the user is logged in
import { useAuth } from './AuthContext'; // Import useAuth - adjust the path if needed
import { Snackbar, Alert } from '@mui/material';
// Define the initial shape of your cart context state and functions
const CartContext = createContext({
  cartItems: [], // Array of items in the cart, including product details and quantity
  cartTotal: 0, // Total price of items in the cart
  isLoading: false, // Loading state for API calls
  error: null, // Error state for API calls
  fetchCart: async () => { }, // Function to fetch the user's cart
  addItem: async (productId, quantity = 1) => { }, // Function to add or update item quantity
  updateItemQuantity: async (productId, quantity) => { }, // Function to update item quantity
  removeItem: async (productId) => { }, // Function to remove an item
  clearCart: async () => { }, // Function to clear the entire cart
  // Optional: Add snackbar state if you want cart actions to trigger global notifications
  // snackbar: { open: false, message: '', severity: 'success', onClose: () => {} },
});

export const CartProvider = ({ children }) => {
  // Consume isAuthenticated from AuthContext
  const { isAuthenticated } = useAuth();

  // State to hold the cart items (array of objects, each with product details and quantity)
  const [cartItems, setCartItems] = useState([]);
  // State to hold the total price of the items in the cart
  const [cartTotal, setCartTotal] = useState(0);
  // State to indicate if a cart-related API call is in progress
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any error that occurs during API calls
  const [error, setError] = useState(null);

  // Optional: Add snackbar state and functions if not handled by AuthContext
  // const [snackbarOpen, setSnackbarOpen] = useState(false);
  // const [snackbarMessage, setSnackbarMessage] = useState('');
  // const snackbarSeverity = 'success'; // Default severity
  // const showSnackbar = (message, severity) => { ... }; // Implementation needed
  // const closeSnackbar = () => { ... }; // Implementation needed


  // Function to fetch the user's cart from the backend API
  // Memoized using useCallback to prevent unnecessary re-creations
  const fetchCart = useCallback(async () => {
    // Only attempt to fetch the cart if the user is authenticated
    if (!isAuthenticated) {
      // If not logged in, clear any existing cart data in the state
      setCartItems([]);
      setCartTotal(0);
      setIsLoading(false); // Ensure loading state is off
      setError(null);    // Clear any previous errors
      console.log("User not authenticated. Cart state cleared.");
      return; // Stop the function execution
    }

    setIsLoading(true); // Set loading state to true before the API call
    setError(null); // Clear any previous errors
    console.log('Fetching cart...'); // Log for debugging
    try {
      // Make a GET request to the backend endpoint for fetching the cart
      // apiClient is assumed to handle adding the Authorization header automatically
      const response = await apiClient.get('/cart');

      // Assuming the backend response data structure is { items: [...], total: N }
      // Update the state with the fetched cart data
      if (response.data && Array.isArray(response.data.items)) {
        setCartItems(response.data.items);
        var total = 0;
        response.data.items.forEach(item => total += item.quantity * parseFloat(item.product.price));
        setCartTotal(total); // Use 0 if total is not provided or null
      } else {
        // Handle cases where the response structure is unexpected
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

      // Optional: Clear cart state on error to avoid displaying potentially stale/incorrect data
      setCartItems([]);
      setCartTotal(0);

      // Optional: Show an error snackbar message
      // showSnackbar('Failed to load cart. Please try again.', 'error');
    }
  }, [isAuthenticated]); // Dependency: Recreate fetchCart if isAuthenticated status changes

  // Effect hook to call fetchCart when the component mounts or isAuthenticated changes
  useEffect(() => {
    fetchCart(); // Call the memoized fetchCart function
  }, [fetchCart]); // Dependency: Re-run effect when fetchCart changes (which happens when isAuthenticated changes)


  // --- Implementations for other cart management functions ---

  // Function to add a product to the cart or update its quantity
  const addItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      console.log("User not authenticated. Cannot add item to cart.");
      // Optional: Show a message prompting the user to log in
      // showSnackbar('Please log in to add items to your cart.', 'info');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(isAuthenticated);
      console.log(`Attempting to add product ${productId} with quantity ${quantity}`);
      // Make POST request to add item. Backend should handle adding or updating quantity if item exists.
      const response = await apiClient.post('/cart/items', { product_id: productId, quantity: quantity });
      console.log('Add item response:', response.data);

      // After successful API call, fetch the updated cart state from the backend
      await fetchCart();
      // Optional: Show success message
      // showSnackbar('Item added to cart.', 'success');
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError(err);
      // Optional: Show error message
      // showSnackbar('Failed to add item to cart.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update the quantity of an existing item in the cart
  const updateItemQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return; // Only for authenticated users
    // Prevent updating to zero or negative quantity via this function (removeItem should be used for removal)
    if (quantity <= 0) {
      console.warn("Attempted to update item quantity to zero or less. Use removeItem instead.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to update product ${productId} quantity to ${quantity}`);
      // Make PUT request to update item quantity
      const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
      console.log('Update quantity response:', response.data);
      setCartTotal(cartTotal + 10);
      // After successful API call, fetch the updated cart state
      await fetchCart();
      // Optional: Show success message
      // showSnackbar('Cart updated.', 'success');
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError(err);
      // Optional: Show error message
      // showSnackbar('Failed to update cart.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove an item from the cart
  const removeItem = async (productId) => {
    if (!isAuthenticated) return; // Only for authenticated users
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to remove product ${productId}`);
      // Make DELETE request to remove the item
      const response = await apiClient.delete(`/cart/items/${productId}`);
      console.log('Remove item response:', response.data);

      // After successful API call, fetch the updated cart state
      await fetchCart();
      // Optional: Show success message
      // showSnackbar('Item removed from cart.', 'success');
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError(err);
      // Optional: Show error message
      // showSnackbar('Failed to remove item.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return; // Only for authenticated users
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting to clear cart');
      // Make POST request to clear the cart (assuming this endpoint exists)
      const response = await apiClient.post('/cart/clear'); // Assuming a POST /api/cart/clear endpoint
      console.log('Clear cart response:', response.data);

      // After successful API call, clear local state and fetch (fetch might return empty cart)
      setCartItems([]);
      setCartTotal(0);
      await fetchCart(); // Fetch again to be sure state is synced with backend
      // Optional: Show success message
      // showSnackbar('Cart cleared.', 'success');
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err);
      // Optional: Show error message
      // showSnackbar('Failed to clear cart.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  // The value provided by the context to consuming components
  const contextValue = {
    cartItems,
    cartTotal,
    isLoading,
    error,
    fetchCart, // Provide the fetchCart function
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    // Include snackbar state/handlers if managed here
    // snackbar: { open: snackbarOpen, message: snackbarMessage, severity: snackbarSeverity, onClose: closeSnackbar },
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      {/* Render ConfirmationSnackbar here if cart context manages snackbars */}
      {/* <ConfirmationSnackbar
           open={snackbarOpen}
           message={snackbarMessage}
           severity={snackbarSeverity}
           onClose={closeSnackbar}
      /> */}
    </CartContext.Provider>
  );
};

// Custom hook to easily consume the CartContext in functional components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Remember to wrap your application's root component (e.g., App.jsx) with
// <CartProvider> and <AuthProvider>. AuthProvider should typically be an ancestor
// of CartProvider since CartProvider depends on useAuth.
