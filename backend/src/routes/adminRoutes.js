// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Import Admin Controller functions (from your Task 5)
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
} = require('../controllers/adminController'); // Path relative from routes/ to controllers/

// Import Order Controller Admin functions (from your Task 4)
const {
    getAllOrders,
    getSingleOrderAdmin,
    updateOrderStatus,
} = require('../controllers/orderController'); // Path relative from routes/ to controllers/

// Import authentication and authorization middleware (from Team Member 1's tasks)
const { protect, authorize } = require('../middleware/authMiddleware'); // Path relative from routes/ to middleware/

// Define roles that can access these routes
const adminRoles = ['ADMIN'];

// --- Apply middleware to all admin routes ---
// First, ensure the user is authenticated (`protect`)
// Second, ensure the authenticated user has an ADMIN role (`authorize(adminRoles)`)
router.use(protect);
router.use(authorize(adminRoles));

// --- Admin User Management Routes ---

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:userId
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/users/:userId', getUserById);

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:userId/role', updateUserRole);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:userId', deleteUser);

// --- Admin Order Management Routes ---

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private (Admin only)
router.get('/orders', getAllOrders);

// @route   GET /api/admin/orders/:orderId
// @desc    Get order by ID (Admin view)
// @access  Private (Admin only)
router.get('/orders/:orderId', getSingleOrderAdmin);

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/orders/:orderId/status', updateOrderStatus);


module.exports = router; // Export the router