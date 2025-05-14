// gamedrop-frontend/src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient'; // Assuming apiClient is set up to interact with your backend

// Create the Cart Context
const CartContext = createContext();

// Custom hook to easily access the cart context
// This hook should also be exported
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
// Export this component when it's declared
export const CartProvider = ({ children }) => {
  // State to hold the cart items
  const [cartItems, setCartItems] = useState([]);
  // State to hold the calculated total price
  const [cartTotal, setCartTotal] = useState(0);
  // State to indicate loading status for API calls
  const [isLoading, setIsLoading] = useState(false);
  // State for potential errors
  const [error, setError] = useState(null);

  // Function to fetch the user's cart from the backend
  const fetchCart = useCallback(async () => {
    setIsLoading(true); // Set loading state
    setError(null); // Clear previous errors
    try {
      // Make a GET request to the cart endpoint
      // Add a small delay to simulate network latency if needed for testing loading state
      // await new Promise(resolve => setTimeout(resolve, 500));
      const response = await apiClient.get('/api/cart');
      // Update the cart items state with data from the backend
      // Assuming backend returns { items: [...] } structure
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Check if the error is because the user is not authenticated (e.g., 401 status)
      // In a real app, you might want to handle this specifically, e.g., redirect to login
      if (err.response && err.response.status === 401) {
          console.warn("User not authenticated. Cannot fetch cart.");
          setCartItems([]); // Clear cart if user is not logged in
      } else {
          setError(err); // Set error state for other errors
          setCartItems([]); // Clear cart items on other errors
      }
    } finally {
      setIsLoading(false); // Unset loading state
    }
  }, []); // useCallback memoizes the function, no external dependencies needed initially

  // Function to add a product to the cart or update quantity if already exists
  const addItem = useCallback(async (productId, quantity = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // Make a POST request to add an item to the cart
      await apiClient.post('/api/cart/items', { productId, quantity });
      // Refetch the cart to get the updated state from the backend
      await fetchCart(); // fetchCart is a dependency now
    } catch (err) {
      console.error('Error adding item to cart:', err);
       if (err.response && err.response.data && err.response.data.message) {
           setError(new Error(`Failed to add item: ${err.response.data.message}`));
       } else {
           setError(err);
       }
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]); // Dependency array includes fetchCart

  // Function to update the quantity of a specific item in the cart
  const updateItemQuantity = useCallback(async (productId, quantity) => {
    setIsLoading(true);
    setError(null);
    // Ensure quantity is a positive integer
    const validQuantity = Math.max(1, Math.floor(quantity));
    if (validQuantity !== quantity) {
        console.warn(`Adjusted quantity to minimum valid value: ${validQuantity}`);
    }

    try {
      // Make a PUT request to update the item quantity
      await apiClient.put(`/api/cart/items/${productId}`, { quantity: validQuantity });
      // Refetch the cart to get the updated state from the backend
      await fetchCart(); // fetchCart is a dependency now
    } catch (err) {
      console.error('Error updating item quantity:', err);
       if (err.response && err.response.data && err.response.data.message) {
           setError(new Error(`Failed to update quantity: ${err.response.data.message}`));
       } else {
           setError(err);
       }
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]); // Dependency array includes fetchCart

  // Function to remove an item from the cart
  const removeItem = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);
    try {
      // Make a DELETE request to remove the item
      await apiClient.delete(`/api/cart/items/${productId}`);
      // Refetch the cart to get the updated state from the backend
      await fetchCart(); // fetchCart is a dependency now
    } catch (err) {
      console.error('Error removing item from cart:', err);
       if (err.response && err.response.data && err.response.data.message) {
           setError(new Error(`Failed to remove item: ${err.response.data.message}`));
       } else {
           setError(err);
       }
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]); // Dependency array includes fetchCart

  // Function to clear the entire cart
  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Make a DELETE request to clear the cart (assuming DELETE /api/cart endpoint exists)
      await apiClient.delete('/api/cart');
      // Clear the local state immediately for responsiveness
      setCartItems([]);
      setCartTotal(0);
      console.log("Cart cleared successfully!");
    } catch (err) {
      console.error('Error clearing cart:', err);
       if (err.response && err.response.data && err.response.data.message) {
           setError(new Error(`Failed to clear cart: ${err.response.data.message}`));
       } else {
           setError(err);
       }
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed here as it clears locally and doesn't rely on fetchCart

  // Effect to fetch the cart when the provider mounts.
  // This ensures the cart is loaded when the app starts or the user logs in
  // (assuming AuthProvider remounts CartProvider or triggers a state change it listens to).
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Dependency array includes fetchCart to avoid lint warnings,
                   // but useCallback ensures fetchCart identity is stable.

  // Effect to calculate the total whenever cartItems changes
  useEffect(() => {
    // Calculate the total by iterating through cart items
    const total = cartItems.reduce((sum, item) => {
      // Ensure item and product and price exist and price is a number
      const price = item?.product?.price ? parseFloat(item.product.price) : 0;
      return sum + (price * (item?.quantity || 0));
    }, 0);
    // Update the cartTotal state
    setCartTotal(total);
  }, [cartItems]); // Dependency array includes cartItems

  // The value provided to context consumers
  const contextValue = {
    cartItems,
    cartTotal,
    isLoading,
    error, // Include error in context value
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export the CartContext itself (rarely needed directly, but good practice)
// Export the CartProvider component (needed in App.jsx)
// Export the useCart custom hook (needed in components using the context)

// CartProvider is already exported via 'export const CartProvider = ...'
// useCart is already exported via 'export const useCart = ...'

// Export the CartContext itself.
export { CartContext }; // <<< This is the only export statement needed at the end