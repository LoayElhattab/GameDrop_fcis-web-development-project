const prisma = require('../config/db');


const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        
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
        res.status(200).json(cart);

    } catch (error) {
        next(error);
    }
};

const addItemToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body; 

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

        const existingCartItem = cart.items.find(item => item.product_id === product_id);

        let updatedCartItem;

        if (existingCartItem) {

            const newQuantity = existingCartItem.quantity + quantity;
            if (product.stock_quantity < newQuantity) {
                const error = new Error(`Adding ${quantity} exceeds stock for ${product.title}. Available: ${product.stock_quantity - existingCartItem.quantity}`);
                error.statusCode = 400;
                return next(error);
            }

            updatedCartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
                include: { product: true } 
            });
            res.status(200).json(updatedCartItem); 
        } else {
            updatedCartItem = await prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    product_id: product_id,
                    quantity: quantity,
                },
                include: { product: true }
            });
            res.status(201).json(updatedCartItem); 
        }


    } catch (error) {
        next(error);
    }
};


const updateCartItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId: product_id } = req.params;
        const { quantity } = req.body;

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


        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: true },
        });

        if (!cart) {
           
            const error = new Error('User cart not found');
            error.statusCode = 404;
            return next(error);
        }

        const existingCartItem = cart.items.find(item => item.product_id === product_id);

        if (!existingCartItem) {
            const error = new Error('Item not found in cart');
            error.statusCode = 404;
            return next(error);
        }

        if (quantity <= 0) {
            await prisma.cartItem.delete({
                where: { id: existingCartItem.id },
            });
            return res.status(200).json({ message: 'Item removed from cart' });
        }

        const product = await prisma.product.findUnique({
            where: { id: product_id },
        });

        if (!product) {
            const error = new Error('Associated product not found');
            error.statusCode = 404;
            return next(error);
        }

        if (product.stock_quantity < quantity) {
            const error = new Error(`Cannot update quantity to ${quantity}. Available stock: ${product.stock_quantity}`);
            error.statusCode = 400;
            return next(error);
        }


        const updatedCartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: quantity },
            include: { product: true } 
        });

        res.status(200).json(updatedCartItem);

    } catch (error) {
        next(error);
    }
};
const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId: product_id } = req.params;

        if (!product_id) {
            const error = new Error('Product ID is required in parameters');
            error.statusCode = 400;
            return next(error);
        }


        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: true },
        });

        if (!cart) {
            const error = new Error('User cart not found');
            error.statusCode = 404; // Or 400
            return next(error);
        }

        const itemToRemove = cart.items.find(item => item.product_id === product_id);

        if (!itemToRemove) {
            const error = new Error('Item not found in cart');
            error.statusCode = 404;
            return next(error);
        }

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