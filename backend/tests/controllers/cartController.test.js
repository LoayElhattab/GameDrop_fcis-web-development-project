    // backend/src/tests/controllers/cartController.test.js

    // --- Jest Mocking Setup ---

    const mockPrisma = {
    cart: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    cartItem: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(), // In case you add logic to fetch multiple items
    },
    product: {
        findUnique: jest.fn(),
    },
    };

    // Mock the Prisma client module
    jest.mock('../../src/config/db', () => mockPrisma);

    // --- Import Controller Functions ---
    const {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    } = require('../../src/controllers/cartController');

    // --- Mock Express Objects ---
    const mockRequest = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    user: { id: 'test-user-uuid', role: 'CUSTOMER' }, // Default authenticated user
    });

    const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
    };

    const mockNext = jest.fn();

    // --- Test Suites ---
    describe('Cart Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Test Cases for getCart ---
    describe('getCart', () => {
        const mockCart = {
        id: 'cart-id',
        user_id: 'test-user-uuid',
        items: [
            {
            id: 'item-1',
            product_id: 'prod-1',
            quantity: 2,
            product: { id: 'prod-1', title: 'Game A', price: 59.99 },
            },
        ],
        };

        test('should return existing cart with items', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        await getCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: { include: { product: true } } },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockCart);
        expect(next).not.toHaveBeenCalled();
        });

        test('should create and return a new empty cart if none exists', async () => {
        const newCart = { id: 'cart-id', user_id: 'test-user-uuid', items: [] };
        mockPrisma.cart.findUnique.mockResolvedValue(null);
        mockPrisma.cart.create.mockResolvedValue(newCart);

        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        await getCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: { include: { product: true } } },
        });
        expect(mockPrisma.cart.create).toHaveBeenCalledWith({
            data: { user_id: 'test-user-uuid' },
            include: { items: { include: { product: true } } },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Cart is empty. No items found.',
            cart: [],
        });
        expect(next).not.toHaveBeenCalled();
        });

        test('should return empty cart message if cart has no items', async () => {
        const emptyCart = { id: 'cart-id', user_id: 'test-user-uuid', items: [] };
        mockPrisma.cart.findUnique.mockResolvedValue(emptyCart);

        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        await getCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: { include: { product: true } } },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Cart is empty. No items found.',
            cart: [],
        });
        expect(next).not.toHaveBeenCalled();
        });

        test('should call next with error if database operation fails', async () => {
        const dbError = new Error('Database error');
        mockPrisma.cart.findUnique.mockRejectedValue(dbError);

        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        await getCart(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
        expect(res.status).not.toHaveBeenCalled();
        });
    });

    // --- Test Cases for addItemToCart ---
    describe('addItemToCart', () => {
        const mockProduct = { id: 'prod-1', title: 'Game A', price: 59.99, stock_quantity: 10 };
        const mockCart = { id: 'cart-id', user_id: 'test-user-uuid', items: [] };

        test('should add new item to cart and return it', async () => {
        const mockCartItem = {
            id: 'item-1',
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 2,
            product: mockProduct,
        };
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.cartItem.create.mockResolvedValue(mockCartItem);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
        });
        expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
            data: {
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 2,
            },
            include: { product: true },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCartItem);
        expect(next).not.toHaveBeenCalled();
        });

        test('should update quantity of existing item in cart', async () => {
        const existingCart = {
            ...mockCart,
            items: [{ id: 'item-1', product_id: 'prod-1', quantity: 3 }],
        };
        const updatedCartItem = {
            id: 'item-1',
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 5,
            product: mockProduct,
        };
        mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.cartItem.update.mockResolvedValue(updatedCartItem);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
        });
        expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
            where: { id: 'item-1' },
            data: { quantity: 5 },
            include: { product: true },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedCartItem);
        expect(next).not.toHaveBeenCalled();
        });

        test('should create cart if none exists and add item', async () => {
        const newCart = { id: 'cart-id', user_id: 'test-user-uuid', items: [] };
        const mockCartItem = {
            id: 'item-1',
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 2,
            product: mockProduct,
        };
        mockPrisma.cart.findUnique.mockResolvedValue(null);
        mockPrisma.cart.create.mockResolvedValue(newCart);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.cartItem.create.mockResolvedValue(mockCartItem);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.cart.create).toHaveBeenCalledWith({
            data: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
            data: {
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 2,
            },
            include: { product: true },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCartItem);
        expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if product_id is missing', async () => {
        const req = mockRequest({ quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Product ID is required');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 if quantity is not positive', async () => {
        const req = mockRequest({ product_id: 'prod-1', quantity: 0 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Quantity must be positive');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if product not found', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(null);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Product not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 if insufficient stock for new item', async () => {
        const lowStockProduct = { ...mockProduct, stock_quantity: 1 };
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(lowStockProduct);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toContain('Insufficient stock');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 if insufficient stock when updating existing item', async () => {
        const lowStockProduct = { ...mockProduct, stock_quantity: 4 };
        const existingCart = {
            ...mockCart,
            items: [{ id: 'item-1', product_id: 'prod-1', quantity: 3 }],
        };
        mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
        mockPrisma.product.findUnique.mockResolvedValue(lowStockProduct);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toContain('exceeds stock');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should call next with error if database operation fails', async () => {
        const dbError = new Error('Database error');
        mockPrisma.cart.findUnique.mockRejectedValue(dbError);

        const req = mockRequest({ product_id: 'prod-1', quantity: 2 });
        const res = mockResponse();
        const next = mockNext;

        await addItemToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
        expect(res.status).not.toHaveBeenCalled();
        });
    });

    // --- Test Cases for updateCartItemQuantity ---
    describe('updateCartItemQuantity', () => {
        const mockProduct = { id: 'prod-1', title: 'Game A', price: 59.99, stock_quantity: 10 };
        const mockCart = {
        id: 'cart-id',
        user_id: 'test-user-uuid',
        items: [{ id: 'item-1', product_id: 'prod-1', quantity: 2 }],
        };

        test('should update cart item quantity and return updated item', async () => {
        const updatedCartItem = {
            id: 'item-1',
            cart_id: 'cart-id',
            product_id: 'prod-1',
            quantity: 3,
            product: mockProduct,
        };
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.cartItem.update.mockResolvedValue(updatedCartItem);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
        });
        expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
            where: { id: 'item-1' },
            data: { quantity: 3 },
            include: { product: true },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedCartItem);
        expect(next).not.toHaveBeenCalled();
        });

        test('should remove item if quantity is 0', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.cartItem.delete.mockResolvedValue({});

        const req = mockRequest({ quantity: 0 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
            where: { id: 'item-1' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart' });
        expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if productId is missing', async () => {
        const req = mockRequest({ quantity: 3 }, {});
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Product ID is required in parameters');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 if quantity is invalid', async () => {
        const req = mockRequest({ quantity: -1 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Valid quantity (0 or greater) is required');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if cart not found', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(null);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('User cart not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if item not found in cart', async () => {
        const emptyCart = { ...mockCart, items: [] };
        mockPrisma.cart.findUnique.mockResolvedValue(emptyCart);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Item not found in cart');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if product not found', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(null);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Associated product not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 if insufficient stock', async () => {
        const lowStockProduct = { ...mockProduct, stock_quantity: 2 };
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.product.findUnique.mockResolvedValue(lowStockProduct);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toContain('Cannot update quantity');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should call next with error if database operation fails', async () => {
        const dbError = new Error('Database error');
        mockPrisma.cart.findUnique.mockRejectedValue(dbError);

        const req = mockRequest({ quantity: 3 }, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await updateCartItemQuantity(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
        expect(res.status).not.toHaveBeenCalled();
        });
    });

    // --- Test Cases for removeCartItem ---
    describe('removeCartItem', () => {
        const mockCart = {
        id: 'cart-id',
        user_id: 'test-user-uuid',
        items: [{ id: 'item-1', product_id: 'prod-1', quantity: 2 }],
        };

        test('should remove item from cart and return success message', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
        mockPrisma.cartItem.delete.mockResolvedValue({});

        const req = mockRequest({}, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await removeCartItem(req, res, next);

        expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'test-user-uuid' },
            include: { items: true },
        });
        expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
            where: { id: 'item-1' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart' });
        expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if productId is missing', async () => {
        const req = mockRequest({}, {});
        const res = mockResponse();
        const next = mockNext;

        await removeCartItem(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Product ID is required in parameters');
        expect(error.statusCode).toBe(400);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if cart not found', async () => {
        mockPrisma.cart.findUnique.mockResolvedValue(null);

        const req = mockRequest({}, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await removeCartItem(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('User cart not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 404 if item not found in cart', async () => {
        const emptyCart = { ...mockCart, items: [] };
        mockPrisma.cart.findUnique.mockResolvedValue(emptyCart);

        const req = mockRequest({}, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await removeCartItem(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Item not found in cart');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        });

        test('should call next with error if database operation fails', async () => {
        const dbError = new Error('Database error');
        mockPrisma.cart.findUnique.mockRejectedValue(dbError);

        const req = mockRequest({}, { productId: 'prod-1' });
        const res = mockResponse();
        const next = mockNext;

        await removeCartItem(req, res, next);

        expect(next).toHaveBeenCalledWith(dbError);
        expect(res.status).not.toHaveBeenCalled();
        });
    });
    });