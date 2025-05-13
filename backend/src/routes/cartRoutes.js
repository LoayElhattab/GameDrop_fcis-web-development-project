// backend/src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();

// Import cart controller functions
const {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
} = require('../controllers/cartController'); // Path relative from routes/ to controllers/

// Import authentication middleware (from Team Member 1's tasks)
const { protect } = require('../middleware/authMiddleware'); // Path relative from routes/ to middleware/

// All cart routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private (requires authentication)
router.get('/', getCart);

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private (requires authentication)
router.post('/items', addItemToCart);

// @route   PUT /api/cart/items/:productId
// @desc    Update item quantity in cart
// @access  Private (requires authentication)
router.put('/items/:productId', updateCartItemQuantity);

// @route   DELETE /api/cart/items/:productId
// @desc    Remove item from cart
// @access  Private (requires authentication)
router.delete('/items/:productId', removeCartItem);

module.exports = router; // Export the router