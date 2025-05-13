// backend/src/controllers/orderController.js
const prisma = require('../config/db'); // Import Prisma Client

/**
 * Creates an order from the user's current cart.
 * Requires shipping details in the request body.
 * Assumes req.user is populated by auth middleware.
 */
const createOrder = async (req, res, next) => {
    try {
        const user_id= req.user.id;
        const {
            shipping_address_line1,
            shipping_address_line2, // Optional
            shipping_city,
            shipping_postal_code,
            shipping_country,
        } = req.body;

        // 1. Validate shipping details
        if (!shipping_address_line1 || !shipping_city || !shipping_postal_code || !shipping_country) {
            const error = new Error('Shipping address, city, postal code, and country are required.');
            error.statusCode = 400;
            return next(error);
        }

        // 2. Fetch the user's cart and its items
        const cart = await prisma.cart.findUnique({
            where: { user_id: user_id},
            include: {
                items: {
                    include: {
                        product: true, // Need product details for price_at_purchase and stock
                    },
                },
            },
        });

        // Check if cart exists and has items
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ message: 'Your cart is empty.' });
        }

        // 3. Perform final stock check and calculate total amount
        let totalAmount = 0;
        const itemsData = [];

        for (const item of cart.items) {
            // Re-fetch product to ensure latest stock and price (important!)
            const product = await prisma.product.findUnique({
                where: { id: item.product_id },
            });

            if (!product) {
                // This should ideally not happen if product is in cart, but handle
                const error = new Error(`Product with ID ${item.product_id} not found.`);
                error.statusCode = 404;
                return next(error);
            }

            if (product.stock_quantity < item.quantity) {
                // Insufficient stock for this item
                const error = new Error(`Insufficient stock for "${product.title}". Available: ${product.stock_quantity}, Requested: ${item.quantity}.`);
                error.statusCode = 400; // Bad request because of insufficient stock
                return next(error);
            }

            // Add to order items data and calculate total
            itemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: product.price, // Use current product price at purchase time
            });
            // Ensure calculation handles Decimal types if necessary, or converts
            totalAmount += product.price.toNumber() * item.quantity; // Assuming price has a .toNumber() method
        }

        // 4. Use Prisma transaction for atomicity
        // All operations inside the transaction will succeed or fail together.
        const order = await prisma.$transaction(async (tx) => {
            // Create the Order record
            const newOrder = await tx.order.create({
                data: {
                    user_id: user_id,
                    total_amount: totalAmount, // Store calculated total
                    status: 'PROCESSING', // Initial status
                    shipping_address_line1: shipping_address_line1,
                    shipping_address_line2: shipping_address_line2,
                    shipping_city: shipping_city,
                    shipping_postal_code: shipping_postal_code,
                    shipping_country: shipping_country,
                    // timestamps handled by Prisma defaults
                },
            });

            // Create OrderItem records and decrease product stock
            for (const item of itemsData) {
             await tx.orderItem.create({
                    data: {
                        order: {
                            connect: {
                                id: newOrder.id, 
                            },
                        },
                        product: {
                            connect: {
                                id: item.product_id, 
                            },
                        },
                        quantity: item.quantity,
                        price_at_purchase: item.price_at_purchase,
                    },
                });

                // Decrease product stock
                await tx.product.update({
                    where: { id: item.product_id },
                    data: {
                        stock_quantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Clear the user's cart (delete all items)
            await tx.cartItem.deleteMany({
                where: { cart_id: cart.id },
            });

            // Optionally, delete the cart itself if you implement logic where carts are temporary
            // await tx.cart.delete({ where: { id: cart.id } }); // Be cautious with this depending on getCart logic

             // Fetch the newly created order with items and product details for the response
             // This fetch needs to be inside the transaction to ensure you're reading
             // the state that will be committed.
             const createdOrderWithDetails = await tx.order.findUnique({
                 where: { id: newOrder.id },
                 include: {
                     items: {
                         include: {
                             product: true,
                         },
                     },
                 },
             });

             return createdOrderWithDetails; // Return the created order object from the transaction

        });

        // 5. Return the created order
        res.status(201).json(order);

    } catch (error) {
        // Removed console.error("Error creating order:", error);
        // Check if the error is a Prisma ClientKnownRequestError related to transaction
        // or other specific DB errors if needed for more granular responses.
        // For simplicity, just pass the error to the global error handler.
        next(error);
    }
};

/**
 * Gets all orders for the authenticated user.
 * Assumes req.user is populated by auth middleware.
 */
const getUserOrders = async (req, res, next) => {
    try {
        const user_id= req.user.id;

        const orders = await prisma.order.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                items: {
                    include: {
                        product: true, // Include product details for each order item
                    },
                },
            },
            orderBy: {
                created_at: 'desc', // Show most recent orders first
            },
        });

        res.status(200).json(orders);

    } catch (error) {
        // Removed console.error("Error fetching user orders:", error);
        next(error);
    }
};

/**
 * Gets details for a single order belonging to the authenticated user.
 * Assumes req.user is populated by auth middleware.
 */
const getSingleOrder = async (req, res, next) => {
    try {
        const user_id= req.user.id;
        const { orderId } = req.params;

         if (!orderId) {
             const error = new Error('Order ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }


        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                user_id: user_id, // Ensure the order belongs to the logged-in user
            },
            include: {
                items: {
                    include: {
                        product: true, // Include product details
                    },
                },
                user: { // Include user details for confirmation (optional, but good for admin later)
                    select: {
                        id: true, username: true, email: true
                    }
                }
            },
        });

        if (!order) {
            const error = new Error('Order not found or does not belong to this user.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json(order);

    } catch (error) {
        // Removed console.error("Error fetching single order:", error);
        next(error);
    }
};

/**
 * Gets all orders (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const getAllOrders = async (req, res, next) => {
    try {
        // Prisma query to find all orders
        const orders = await prisma.order.findMany({
            include: {
                user: { // Include user details for admin view
                    select: {
                        id: true, username: true, email: true
                    }
                },
                 items: { // Include items for quick overview if needed
                     include: {
                         product: {
                            select: { id: true, title: true } // Just product title/id in item list for overview
                         }
                     }
                 }
            },
            orderBy: {
                created_at: 'desc', // Show most recent orders first
            },
        });

        res.status(200).json(orders);

    } catch (error) {
        // Removed console.error("Error fetching all orders (Admin):", error);
        next(error);
    }
};

/**
 * Gets details for a single order by ID (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const getSingleOrderAdmin = async (req, res, next) => {
    try {
        const { orderId } = req.params;

         if (!orderId) {
             const error = new Error('Order ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }


        // Prisma query to find a single order by ID
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: {
                    include: {
                        product: true, // Include full product details for admin detail view
                    },
                },
                 user: { // Include full user details for admin view
                     select: {
                         id: true, username: true, email: true, role: true
                     }
                 }
            },
        });

        if (!order) {
            const error = new Error('Order not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json(order);

    } catch (error) {
        // Removed console.error("Error fetching single order (Admin):", error);
        next(error);
    }
};

/**
 * Updates the status of an order by ID (Admin view).
 * Requires ADMIN authorization.
 * Assumes req.user is populated by auth middleware.
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const user_id= req.user.id; // Assuming admin also has a user ID structure
        const { orderId } = req.params;
        const { status } = req.body;

         if (!orderId) {
             const error = new Error('Order ID is required in parameters.');
             error.statusCode = 400;
             return next(error);
         }
         if (!status) {
             const error = new Error('New status is required in body.');
             error.statusCode = 400;
             return next(error);
         }

        // Validate that the status is one of the allowed enum values
        // You might need to fetch the enum values from your schema or define them here
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']; // Match your Prisma enum
        const newStatus = status.toUpperCase(); // Ensure consistency

        if (!validStatuses.includes(newStatus)) {
            const error = new Error(`Invalid status "${status}". Allowed statuses are: ${validStatuses.join(', ')}`);
            error.statusCode = 400;
            return next(error);
        }

        // Fetch the current order before updating to potentially handle stock logic
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!currentOrder) {
             const error = new Error('Order not found.');
             error.statusCode = 404;
             return next(error);
        }

        const oldStatus = currentOrder.status;

        // --- Stock Logic based on Status Change (as per FRD/TRD notes) ---
        // If status changes TO CANCELLED from a non-cancelled state, return stock
        if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
            await prisma.$transaction(async (tx) => {
                // Update the order status first
                 await tx.order.update({
                     where: { id: orderId },
                     data: { status: newStatus },
                 });

                // Return stock for each item in the order
                for (const item of currentOrder.items) {
                    await tx.product.update({
                        where: { id: item.product_id },
                        data: {
                            stock_quantity: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            });

             // Fetch the updated order to return in the response
             // This fetch needs to be inside the transaction to ensure you're reading
             // the state that will be committed.
             const updatedOrder = await prisma.order.findUnique({
                 where: { id: orderId },
                 include: { items: { include: { product: true } }, user: { select: { id: true, username: true, email: true, role: true } } }
             });

             return res.status(200).json(updatedOrder); // Important: Return here after transaction

        }
        // Add other stock logic if needed (e.g., reducing stock if changing *from* cancelled to processing - less common)

        // --- Standard Status Update (if no stock change required) ---
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
             include: { // Include details for the response
                 items: {
                     include: {
                         product: true,
                     },
                 },
                 user: {
                     select: {
                         id: true, username: true, email: true, role: true
                     }
                 }
             }
        });

        res.status(200).json(updatedOrder);

    } catch (error) {
        // Removed console.error("Error updating order status (Admin):", error);
        next(error);
    }
};

// Export the customer-facing and admin functions
module.exports = {
    createOrder,
    getUserOrders,
    getSingleOrder,
    getAllOrders,
    getSingleOrderAdmin,
    updateOrderStatus,
};