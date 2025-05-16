// backend/src/controllers/adminController.js
const prisma = require('../config/db'); // Import Prisma Client

/**
 * Gets a list of all users (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const getAllUsers = async (req, res, next) => {
    try {
        // Prisma query to find all users, explicitly selecting fields to exØ´clude password hash
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
                updated_at: true,
                // Optionally include counts of related data if useful for admin overview
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
            orderBy: {
                created_at: 'asc', // Order users by creation date
            },
        });

        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};

/**
 * Gets details for a single user by ID (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

         if (!userId) {
             const error = new Error('User ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }


        // Prisma query to find a single user by ID, excluding password hash
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
                updated_at: true,
                // Include related data that might be relevant for admin detail view
                orders: { // Include a summary of recent orders
                    select: { id: true, total_amount: true, status: true, created_at: true },
                    orderBy: { created_at: 'desc' },
                    take: 5 // Limit to recent orders
                },
                 reviews: { // Include a summary of recent reviews
                     select: { id: true, rating: true, comment: true, created_at: true, product_id: true },
                     orderBy: { created_at: 'desc' },
                     take: 5 // Limit to recent reviews
                 }
            },
        });

        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};

/**
 * Updates a user's role by ID (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const updateUserRole = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const { role } = req.body; // Expected role: 'CUSTOMER' or 'ADMIN'

         if (!userId) {
             const error = new Error('User ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }
         if (!role) {
             const error = new Error('New role is required in body.');
             error.statusCode = 400;
             return next(error);
         }


        // Validate that the role is one of the allowed enum values
        const validRoles = ['CUSTOMER', 'ADMIN']; // Match your Prisma enum

        if (!validRoles.includes(role.toUpperCase())) {
            const error = new Error(`Invalid role "${role}". Allowed roles are: ${validRoles.join(', ')}`);
            error.statusCode = 400;
            return next(error);
        }

         // Prevent changing the role of the currently logged-in admin user via this endpoint if desired
         // (Optional security check)
         if (req.user.id === userId) {
             const error = new Error('Cannot change your own role via this endpoint.');
             error.statusCode = 403; // Forbidden
             return next(error);
         }


        // Prisma query to find and update the user's role
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                role: role.toUpperCase(), // Store role in uppercase as per enum convention
            },
            select: { // Select fields to return, exclude password hash
                 id: true,
                 username: true,
                 email: true,
                 role: true,
                 created_at: true,
                 updated_at: true,
             }
        });

        res.status(200).json(updatedUser);

    } catch (error) {
        // Check if the error is a "not found" error from Prisma if needed
        if (error.code === 'P2025') { // Prisma error code for record not found
             const notFoundError = new Error(`User with ID ${userId} not found.`);
             notFoundError.statusCode = 404;
             return next(notFoundError);
         }
        next(error); // Pass other errors to the general error handler
    }
};

/**
 * Deletes a user by ID (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
         if (!userId) {
             const error = new Error('User ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }

         // Prevent deleting the currently logged-in admin user via this endpoint
         // (Optional security check)
         if (req.user.id === userId) {
             const error = new Error('Cannot delete your own user account via this endpoint.');
             error.statusCode = 403; // Forbidden
             return next(error);
         }


        // Prisma query to find and delete the user
        // Be cautious: this will trigger cascading deletes if configured in schema.prisma
        // (e.g., deleting user might delete their cart, orders, reviews depending on schema)
        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
            select: { // Return confirmation fields
                 id: true, username: true, email: true
             }
        });

        res.status(200).json({ message: `User with ID ${userId} deleted successfully.`, user: deletedUser });

    } catch (error) {
        // Check if the error is a "not found" error from Prisma
         if (error.code === 'P2025') { // Prisma error code for record not found
             const notFoundError = new Error(`User with ID ${userId} not found.`);
             notFoundError.statusCode = 404;
             return next(notFoundError);
         }
        next(error); // Pass other errors to the general error handler
    }
};
const getDashboardMetrics = async (req, res, next) => {
    try {
        // Run Prisma queries concurrently for performance
        const [revenueData, productCount, activeUserCount, orderCount] = await Promise.all([
            // Calculate total revenue from completed orders
            prisma.order.aggregate({
                _sum: {
                    total_amount: true,
                },
                where: {
                    status: 'COMPLETED', // Assuming 'COMPLETED' status for finalized orders
                },
            }),
            // Count total products
            prisma.product.count(),
            // Count active users (e.g., users who have placed at least one order)
            prisma.user.count({
                where: {
                    orders: {
                        some: {}, // Users with at least one order
                    },
                },
            }),
            // Count total orders
            prisma.order.count(),
        ]);

        // Structure the response
        const metrics = {
            totalRevenue: revenueData._sum.total_amount || 0, // Handle null case
            totalProducts: productCount,
            activeUsers: activeUserCount,
            totalOrders: orderCount,
        };

        res.status(200).json(metrics);

    } catch (error) {
        next(error);
    }
};

// Export all admin controller functions
module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getDashboardMetrics,

};