import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured with base URL and auth headers

// Create the Cart Context
export const CartContext = createContext({
  cartItems: [], // Array of items in the cart, including product details and quantity
  cartTotal: 0, // Total price of items in the cart
  isLoading: false, // Loading state for API calls
  fetchCart: async () => {}, // Function to fetch the user's cart
  addItem: async (productId, quantity = 1) => {}, // Function to add or update item quantity
  updateItemQuantity: async (productId, quantity) => {}, // Function to update item quantity
  removeItem: async (productId) => {}, // Function to remove an item
  clearCart: async () => {}, // Function to clear the entire cart
});

// Create the Cart Provider component
export const CartProvider = ({ children }) => {
  // State to hold the cart items
  const [cartItems, setCartItems] = useState([]);
  // State to track loading status for API calls
  const [isLoading, setIsLoading] = useState(false);

  // Calculate cart total whenever cartItems changes
  // useMemo is used to optimize calculation and prevent unnecessary recalculations
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      // Ensure item.product and item.product.price exist before calculating
      const itemPrice = item.product?.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [cartItems]); // Recalculate only when cartItems array changes

  // --- API Interaction Functions ---

  // Function to fetch the user's cart from the backend
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      // Make GET request to fetch the cart
      const response = await apiClient.get('/api/cart');
      // Assuming the API returns an object with a 'cartItems' array
      if (response.data?.cartItems) {
        setCartItems(response.data.cartItems);
      } else {
        // Handle cases where response might be empty or unexpected
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Optionally handle error state or display a message
      setCartItems([]); // Clear cart on error to avoid displaying stale data
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add an item to the cart or update its quantity
  const addItem = async (productId, quantity = 1) => {
    setIsLoading(true);
    try {
      // Make POST request to add item
      // Backend is expected to handle adding a new item or updating quantity if item exists
      await apiClient.post('/api/cart/items', { productId, quantity });
      // After successful addition/update, refetch the cart to update local state
      await fetchCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update the quantity of an existing item in the cart
  const updateItemQuantity = async (productId, quantity) => {
    setIsLoading(true);
    try {
      // Make PUT request to update item quantity
      await apiClient.put(`/api/cart/items/${productId}`, { quantity });
      // After successful update, refetch the cart
      await fetchCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove an item from the cart
  const removeItem = async (productId) => {
    setIsLoading(true);
    try {
      // Make DELETE request to remove item
      await apiClient.delete(`/api/cart/items/${productId}`);
      // After successful removal, refetch the cart
      await fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the entire cart
  const clearCart = async () => {
    setIsLoading(true);
    try {
      // Make DELETE request to clear the cart
      // Assuming a DELETE /api/cart endpoint exists for clearing the entire cart
      await apiClient.delete('/api/cart');
      // After successful clear, update local state
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the cart when the provider mounts
  useEffect(() => {
    fetchCart();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Provide the context value to children components
  const contextValue = useMemo(() => ({
    cartItems,
    cartTotal,
    isLoading,
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
  }), [cartItems, cartTotal, isLoading]); // Only update context value if these dependencies change

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to easily access the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // This hook must be used within a CartProvider
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};