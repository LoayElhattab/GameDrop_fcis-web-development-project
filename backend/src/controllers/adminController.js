const prisma = require('../config/db'); 

const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
                updated_at: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
            orderBy: {
                created_at: 'asc', 
            },
        });

        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

         if (!userId) {
             const error = new Error('User ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }

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
                orders: { 
                    select: { id: true, total_amount: true, status: true, created_at: true },
                    orderBy: { created_at: 'desc' },
                    take: 5 
                },
                 reviews: { 
                     select: { id: true, rating: true, comment: true, created_at: true, product_id: true },
                     orderBy: { created_at: 'desc' },
                     take: 5 
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

const deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
         if (!userId) {
             const error = new Error('User ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }
         if (req.user.id === userId) {
             const error = new Error('Cannot delete your own user account via this endpoint.');
             error.statusCode = 403; // Forbidden
             return next(error);
         }
        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
            select: { 
                 id: true, username: true, email: true
             }
        });

        res.status(200).json({ message: `User with ID ${userId} deleted successfully.`, user: deletedUser });

    } catch (error) {
         if (error.code === 'P2025') { 
             const notFoundError = new Error(`User with ID ${userId} not found.`);
             notFoundError.statusCode = 404;
             return next(notFoundError);
         }
        next(error);
    }
};
const getDashboardMetrics = async (req, res, next) => {
    try {
        const allProducts = await prisma.product.findMany({
            where: {
                stock_quantity: { gt: 0 },
                is_deleted: false,
            },
        });

        const allUsers = await prisma.user.findMany();

        const allOrders = await prisma.order.findMany({
            where: {
                status: 'COMPLETED',
            },
        });
        const [revenueData, productCount, userCount, orderCount] = await Promise.all([
            prisma.order.aggregate({
                _sum: {
                    total_amount: true,
                },
                where: {
                    status: 'COMPLETED', 
                },
            }),
            prisma.product.count({
                where: {
                    stock_quantity: { gt: 0 },
                    is_deleted: false,
                },
            }),
            prisma.user.count(),
            prisma.order.count(),
        ]);

        console.log('All Products (stock_quantity > 0, is_deleted: false):', allProducts);
        console.log('All Users:', allUsers);
        console.log('All Completed Orders:', allOrders);
        console.log('Revenue Data:', revenueData);
        console.log('Product Count:', productCount);
        console.log('User Count:', userCount);
        console.log('Order Count:', orderCount);

        const metrics = {
            totalRevenue: revenueData._sum.total_amount || 0, 
            totalProducts: productCount,
            activeUsers: userCount,
            totalOrders: orderCount,
        };

        res.status(200).json(metrics);

    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        next(error);
    }
};
module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    getDashboardMetrics,

};