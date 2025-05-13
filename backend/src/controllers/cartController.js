// backend/src/controllers/cartController.js
const prisma = require('../config/db'); // Import Prisma Client

/**
 * Finds or creates a user's cart.
 * Includes cart items and product details for each item.
 * Assumes req.user is populated by auth middleware.
 */
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated request

        // Find the user's cart, include items and product details
        let cart = await prisma.cart.findUnique({
            where: {
                user_id: userId,
            },
            include: {
                items: { 
                    include: {
                        product: true,
                    },
                },
            },
        });

        // If no cart exists, create one for the user
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    user_id: userId,
                },
                include: { 
                    items: { 
                        include: {
                            product: true,
                        },
                    },
                },
            });
        }
        if (!cart.items || cart.items.length === 0) {
            return res.status(200).json({
                message: "Cart is empty. No items found.",
                cart: [],
            });
        }
        // Return the cart object
        res.status(200).json(cart);

    } catch (error) {
        next(error); // Pass error to the next middleware (error handler)
    }
};

/**
 * Adds a product to the user's cart or updates quantity if already exists.
 * Assumes req.user is populated by auth middleware.
 */
const addItemToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body; // Default quantity to 1

        // Validate input
        if (!product_id) {
            const error = new Error('Product ID is required');
            error.statusCode = 400;
            return next(error);
        }
        if (quantity <= 0) {
             const error = new Error('Quantity must be positive');
             error.statusCode = 400;
             return next(error);
        }


        // Find the user's cart (create if needed)
        let cart = await prisma.cart.findUnique({
            where: { user_id: userId }, 
            include: { items: true }, 
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { user_id: userId },
                include: { items: true },
            });
        }

        // Check if the product exists and is in stock
        const product = await prisma.product.findUnique({
            where: { id: product_id },
        });

        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            return next(error);
        }

         if (product.stock_quantity < quantity) {
            const error = new Error(`Insufficient stock for ${product.title}. Available: ${product.stock_quantity}`);
            error.statusCode = 400;
            return next(error);
        }


        // Check if the item already exists in the cart
        const existingCartItem = cart.items.find(item => item.product_id === product_id);

        let updatedCartItem;

        if (existingCartItem) {
            // If item exists, update the quantity
            const newQuantity = existingCartItem.quantity + quantity;

             // Re-check stock with the *new* total quantity
             if (product.stock_quantity < newQuantity) {
                const error = new Error(`Adding ${quantity} exceeds stock for ${product.title}. Available: ${product.stock_quantity - existingCartItem.quantity}`);
                error.statusCode = 400;
                return next(error);
             }

            updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
                 include: { product: true } // Include product details for response
            });
            res.status(200).json(updatedCartItem); // Return the updated item
        } else {
            // If item does not exist, create a new cart item
            updatedCartItem = await prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    product_id: product_id,
                    quantity: quantity,
                },
                include: { product: true } // Include product details for response
            });
             res.status(201).json(updatedCartItem); // Return the newly created item
        }


    } catch (error) {
        next(error);
    }
};

/**
 * Updates the quantity of an item in the user's cart.
 * If quantity is 0 or less, removes the item.
 * Assumes req.user is populated by auth middleware.
 */
const updateCartItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId: product_id  } = req.params;
        const { quantity } = req.body;

        // Validate input
        if (quantity === undefined || quantity === null || quantity < 0) {
             const error = new Error('Valid quantity (0 or greater) is required');
             error.statusCode = 400;
             return next(error);
        }
         if (!product_id) {
            const error = new Error('Product ID is required in parameters');
            error.statusCode = 400;
            return next(error);
        }


        // Find the user's cart
        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: true },
        });

        if (!cart) {
             // This case should ideally not happen if protect middleware ensures a user exists,
             // but defensive coding is good. A user must have a cart implicitly.
             // If a user is logged in but somehow has no cart, getCart would create it.
             // However, this endpoint modifies an *existing* item, so if there's no cart, there's no item to modify.
             const error = new Error('User cart not found');
             error.statusCode = 404; // Or 400 depending on desired behavior
             return next(error);
        }

        // Find the specific cart item
        const existingCartItem = cart.items.find(item => item.product_id === product_id);

        if (!existingCartItem) {
            const error = new Error('Item not found in cart');
            error.statusCode = 404;
            return next(error);
        }

        // If new quantity is 0 or less, remove the item
        if (quantity <= 0) {
            await prisma.cartItem.delete({
                where: { id: existingCartItem.id },
            });
            return res.status(200).json({ message: 'Item removed from cart' });
        }

        // Check stock for the updated quantity
         const product = await prisma.product.findUnique({
             where: { id: product_id },
         });

         if (!product) {
             // Should not happen if schema is correct and product is in cart item, but check
             const error = new Error('Associated product not found');
             error.statusCode = 404;
             return next(error);
         }

         if (product.stock_quantity < quantity) {
             const error = new Error(`Cannot update quantity to ${quantity}. Available stock: ${product.stock_quantity}`);
             error.statusCode = 400;
             return next(error);
         }


        // Update the quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: quantity },
            include: { product: true } // Include product details for response
        });

        res.status(200).json(updatedCartItem);

    } catch (error) {
        next(error);
    }
};
/**
 * Removes an item from the user's cart.
 * Assumes req.user is populated by auth middleware.
 */
const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId: product_id } = req.params;

         if (!product_id) {
            const error = new Error('Product ID is required in parameters');
            error.statusCode = 400;
            return next(error);
        }


        // Find the user's cart
        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: true },
        });

         if (!cart) {
             // Should not happen typically, see comments in updateCartItemQuantity
             const error = new Error('User cart not found');
             error.statusCode = 404; // Or 400
             return next(error);
         }


        // Find the specific cart item
        const itemToRemove = cart.items.find(item => item.product_id === product_id);

        if (!itemToRemove) {
            const error = new Error('Item not found in cart');
            error.statusCode = 404;
            return next(error);
        }

        // Delete the cart item
        await prisma.cartItem.delete({
            where: { id: itemToRemove.id },
        });

        res.status(200).json({ message: 'Item removed from cart' });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
};