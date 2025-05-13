// backend/src/tests/controllers/cartController.test.js

// --- Jest Mocking Setup ---

// Define the mock Prisma client object.
// Prefixing with 'mock' makes it accessible inside the jest.mock factory.
// Ensure all Prisma methods used in cartController.js are mocked here.
const mockPrisma = {
    cart: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    cartItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(), // Added in case createOrder uses this on cart items
    },
    product: {
        findUnique: jest.fn(),
        update: jest.fn(), // Added in case createOrder uses this
    },
    // Add other models if needed for later tests (Orders, OrderItem, User etc. for other controller tests)
    $transaction: jest.fn(async (callback) => {
        // Mock Prisma transactions - call the callback with the mock client
        // This is a simplified mock; complex transaction logic might need more detailed mocking
        return await callback(mockPrisma);
    }),
};

// Mock the module that exports the prisma client instance.
// IMPORTANT: The path here ('src/config/db' or '../src/config/db' or another relative path)
// MUST correctly resolve to your backend/src/config/db.js file from Jest's perspective.
// This is the line that caused the previous error and needs to be fixed in your setup.
jest.mock('../../src/config/db', () => mockPrisma); // <-- This path might need adjustment in your Jest config/setup

// Note: If you are testing controllers that use authentication middleware (`protect`),
// you might need to mock the middleware here as well, depending on how you want to test.
// For these controller unit tests, we assume `req.user` is already populated by the (mocked) middleware.


// --- Import Controller Functions ---

// Now import the controller functions you want to test
// This import path should be correct as it's relative from the test file
const {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
} = require('../../src/controllers/cartController'); // Path from tests/controllers/ to src/controllers/

// --- Mock Express Objects ---

// Mock Express request, response, and next objects
const mockRequest = (body = {}, params = {}, query = {}) => ({
    body: body,
    params: params,
    query: query,
    user: { id: 'test-user-uuid', role: 'CUSTOMER' }, // Mock req.user as provided by auth middleware
    // Add other user properties like 'role' if needed for authorization tests later
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

// --- Your Test Suites ---

describe('Cart Controller', () => {
    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        // Clear all mock calls and reset mock implementations
        jest.clearAllMocks();

        // Optional: Reset mock implementations to their original state if needed
        // mockPrisma.cart.findUnique.mockReset();
        // ... reset other mocks as needed
    });

    // --- Test Cases for getCart ---
    describe('getCart', () => {
        test('should return existing cart for a user', async () => {
            // Arrange: Define the mock data that Prisma should return
            const mockCart = {
                id: 'cart-uuid',
                user_id: 'test-user-uuid',
                items: [
                    { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: 'prod-uuid-1', quantity: 2, product: { id: 'prod-uuid-1', title: 'Game 1', price: 59.99 } },
                ],
            };

            // Tell the mock Prisma client what to return when findUnique is called
            mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

            // Act: Call the controller function with mock req, res, next
            const req = mockRequest(); // No body, params, query needed for getCart
            const res = mockResponse();
            const next = mockNext;

            await getCart(req, res, next);

            // Assert: Check if the response status and JSON body are as expected
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
                where: { user_id: 'test-user-uuid' },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCart);
            expect(next).not.toHaveBeenCalled(); // Ensure next was not called (no errors)
        });

        test('should create a new cart if none exists', async () => {
             // Arrange: Simulate Prisma returning null for findUnique (cart not found)
             mockPrisma.cart.findUnique.mockResolvedValue(null);

             // Arrange: Define the structure of the cart that should be created
             const newMockCart = {
                 id: 'new-cart-uuid',
                 user_id: 'test-user-uuid',
                 items: [] // Newly created cart starts empty
             };

             // Tell the mock Prisma client what to return when create is called
             // We mock the return value to match the include structure expected by the controller
             mockPrisma.cart.create.mockResolvedValue(newMockCart);

             // Act: Call the controller function
             const req = mockRequest();
             const res = mockResponse();
             const next = mockNext;

             await getCart(req, res, next);

             // Assert: Check if findUnique was called, then create was called, and the response is correct
             expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
                where: { user_id: 'test-user-uuid' },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
             expect(mockPrisma.cart.create).toHaveBeenCalledWith({
                 data: { user_id: 'test-user-uuid' },
                 include: {
                     items: {
                         include: {
                             product: true,
                         },
                     },
                 },
             });
             expect(res.status).toHaveBeenCalledWith(200);
             expect(res.json).toHaveBeenCalledWith(newMockCart);
             expect(next).not.toHaveBeenCalled();
         });

         test('should call next with error if a database operation fails', async () => {
             // Arrange: Simulate a database error
             const dbError = new Error('Database connection failed');
             mockPrisma.cart.findUnique.mockRejectedValue(dbError); // findUnique throws an error

             // Act: Call the controller function
             const req = mockRequest();
             const res = mockResponse();
             const next = mockNext;

             await getCart(req, res, next);

             // Assert: Check if next was called with the error
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled(); // Ensure no response was sent by controller
             expect(res.json).not.toHaveBeenCalled(); // Ensure no response was sent by controller
         });
    });

    // --- Test Cases for addItemToCart ---
    describe('addItemToCart', () => {
        test('should add a new item to an existing cart', async () => {
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [] };
            const productToAdd = { id: 'prod-uuid-1', title: 'New Game', price: 49.99, stock_quantity: 10 };
            const newItemQuantity = 1;
            const createdCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: 'prod-uuid-1', quantity: newItemQuantity, product: productToAdd };

            // Mock Prisma calls
            mockPrisma.cart.findUnique.mockResolvedValue({ ...existingCart, items: [] }); // Cart exists, is empty
            mockPrisma.product.findUnique.mockResolvedValue(productToAdd); // Product exists and in stock
            mockPrisma.cartItem.create.mockResolvedValue(createdCartItem); // Successfully create item

            const req = mockRequest({ product_id: productToAdd.id, quantity: newItemQuantity }); // Pass product_id and quantity in the body
            const res = mockResponse();
            const next = mockNext;

            await addItemToCart(req, res, next);

            // Assert Prisma calls
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productToAdd.id } });
            expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
                data: {
                    cart_id: existingCart.id,
                    product_id: productToAdd.id,
                    quantity: newItemQuantity,
                },
                include: { product: true }
            });
            // Assert Response
            expect(res.status).toHaveBeenCalledWith(201); // 201 Created for new item
            expect(res.json).toHaveBeenCalledWith(createdCartItem);
            expect(next).not.toHaveBeenCalled();
        });

        test('should update quantity if item already exists in cart', async () => {
            const productToAdd = { id: 'prod-uuid-1', title: 'Existing Game', price: 59.99, stock_quantity: 10 };
            const existingCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: productToAdd.id, quantity: 2, product: productToAdd };
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [existingCartItem] };
            const quantityToAdd = 3; // Add 3 to existing 2, total 5
            const updatedCartItem = { ...existingCartItem, quantity: existingCartItem.quantity + quantityToAdd };

            // Mock Prisma calls
            mockPrisma.cart.findUnique.mockResolvedValue(existingCart); // Cart exists, has item
            mockPrisma.product.findUnique.mockResolvedValue(productToAdd); // Product exists and in stock
            mockPrisma.cartItem.update.mockResolvedValue(updatedCartItem); // Successfully update item

            const req = mockRequest({ product_id: productToAdd.id, quantity: quantityToAdd }); // Pass product_id and quantity in the body
            const res = mockResponse();
            const next = mockNext;

            await addItemToCart(req, res, next);

             // Assert Prisma calls
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productToAdd.id } });
            expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
                where: { id: existingCartItem.id },
                data: { quantity: updatedCartItem.quantity },
                include: { product: true }
            });
            // Assert Response
            expect(res.status).toHaveBeenCalledWith(200); // 200 OK for update
            expect(res.json).toHaveBeenCalledWith(updatedCartItem);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if product ID is missing', async () => {
            const req = mockRequest({ /* session */ }, { quantity: 1 }); // Missing product_id
            const res = mockResponse();
            const next = mockNext;

            await addItemToCart(req, res, next);

            expect(res.status).not.toHaveBeenCalled(); // Should be handled by next(error)
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0]; // Get the error passed to next
            expect(error.message).toBe('Product ID is required');
            expect(error.statusCode).toBe(400);
        });

         test('should return 400 if quantity is zero or negative when adding new item', async () => {
            const req = mockRequest({ product_id: 'prod-uuid-1', quantity: 0 }); // Pass product_id and quantity in the body
             const res = mockResponse();
             const next = mockNext;

             await addItemToCart(req, res, next);

             expect(next).toHaveBeenCalled();
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Quantity must be positive');
             expect(error.statusCode).toBe(400);
         });

         test('should return 404 if product is not found when adding item', async () => {
             const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [] }; // Cart is empty
             mockPrisma.cart.findUnique.mockResolvedValue({ ...existingCart, items: [] });
             mockPrisma.product.findUnique.mockResolvedValue(null); // Product not found

             const req = mockRequest({ product_id: 'non-existent-prod', quantity: 1 }); // Pass product_id and quantity in the body
             const res = mockResponse();
             const next = mockNext;

             await addItemToCart(req, res, next);

             expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-prod' } });
             expect(next).toHaveBeenCalled();
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Product not found');
             expect(error.statusCode).toBe(404);
         });

         test('should return 400 if insufficient stock when adding new item', async () => {
             const productToAdd = { id: 'prod-uuid-1', title: 'Limited Stock Game', price: 59.99, stock_quantity: 5 };
             const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [] };
             const quantityToAdd = 10; // Requesting more than available stock

             mockPrisma.cart.findUnique.mockResolvedValue({ ...existingCart, items: [] });
             mockPrisma.product.findUnique.mockResolvedValue(productToAdd);

             const req = mockRequest({ product_id: productToAdd.id, quantity: quantityToAdd }); // Pass product_id and quantity in the body
             const res = mockResponse();
             const next = mockNext;

             await addItemToCart(req, res, next);

             expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productToAdd.id } });
             expect(next).toHaveBeenCalled();
             const error = next.mock.calls[0][0];
             expect(error.message).toContain('Insufficient stock');
             expect(error.statusCode).toBe(400);
         });

         test('should return 400 if updating quantity exceeds stock', async () => {
            const productToAdd = { id: 'prod-uuid-1', title: 'Limited Stock Game', price: 59.99, stock_quantity: 5 };
            const existingCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: productToAdd.id, quantity: 3, product: productToAdd };
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [existingCartItem] };
            const quantityToAdd = 3; // Adding 3 to existing 3, total 6, exceeds stock of 5

            mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
            mockPrisma.product.findUnique.mockResolvedValue(productToAdd);

            const req = mockRequest({ product_id: productToAdd.id, quantity: quantityToAdd }); // Pass product_id and quantity in the body
            const res = mockResponse();
            const next = mockNext;

            await addItemToCart(req, res, next);

            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productToAdd.id } });
            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain(`Adding ${quantityToAdd} exceeds stock`);
            expect(error.statusCode).toBe(400);
         });

        // Add more tests for edge cases and error scenarios...
    });


    // --- Test Cases for updateCartItemQuantity ---
    describe('updateCartItemQuantity', () => {
        test('should update quantity of an existing item', async () => {
            const product = { id: 'prod-uuid-1', title: 'Game', price: 59.99, stock_quantity: 10 };
            const existingCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: product.id, quantity: 2, product: product };
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [existingCartItem] };
            const newQuantity = 5;
            const updatedCartItem = { ...existingCartItem, quantity: newQuantity };

            // Mock Prisma calls
            mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
            mockPrisma.product.findUnique.mockResolvedValue(product); // Product exists and in stock for new quantity
            mockPrisma.cartItem.update.mockResolvedValue(updatedCartItem);

            const req = mockRequest({ quantity: newQuantity }, { product_id: product.id });
            const res = mockResponse();
            const next = mockNext;

            await updateCartItemQuantity(req, res, next);

             // Assert Prisma calls
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
            expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
                include: { product: true }
            });
             // Assert Response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedCartItem);
            expect(next).not.toHaveBeenCalled();
        });

        test('should remove item if new quantity is 0', async () => {
            const product = { id: 'prod-uuid-1', title: 'Game', price: 59.99, stock_quantity: 10 };
            const existingCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: product.id, quantity: 2, product: product };
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [existingCartItem] };
            const newQuantity = 0;

            // Mock Prisma calls
            mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
            mockPrisma.cartItem.delete.mockResolvedValue(null); // Delete does not return the deleted item by default

            const req = mockRequest({ quantity: newQuantity }, { product_id: product.id });
            const res = mockResponse();
            const next = mockNext;

            await updateCartItemQuantity(req, res, next);

             // Assert Prisma calls
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
            expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
                where: { id: existingCartItem.id },
            });
             // Assert Response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if quantity is missing or invalid', async () => {
            const req1 = mockRequest({}, { product_id: 'prod-uuid-1' }); // Missing quantity
            const req2 = mockRequest({ quantity: -5 }, { product_id: 'prod-uuid-1' }); // Negative quantity (handled as remove, but validation is for format)

            const res = mockResponse();
            const next = mockNext;

            await updateCartItemQuantity(req1, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            let error = next.mock.calls[0][0];
            expect(error.message).toBe('Valid quantity (0 or greater) is required');
            expect(error.statusCode).toBe(400);

            jest.clearAllMocks(); // Clear next calls for the second test
            await updateCartItemQuantity(req2, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            error = next.mock.calls[0][0];
            expect(error.message).toBe('Valid quantity (0 or greater) is required'); // Validation should catch this before quantity <= 0 logic
            expect(error.statusCode).toBe(400);
        });

        test('should return 404 if item not found in cart', async () => {
             const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [] }; // Cart is empty
             mockPrisma.cart.findUnique.mockResolvedValue(existingCart);

             const req = mockRequest({ quantity: 1 }, { product_id: 'non-existent-item-in-cart' });
             const res = mockResponse();
             const next = mockNext;

             await updateCartItemQuantity(req, res, next);

             expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
             expect(next).toHaveBeenCalled();
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Item not found in cart');
             expect(error.statusCode).toBe(404);
        });

        test('should return 400 if insufficient stock when updating quantity', async () => {
            const product = { id: 'prod-uuid-1', title: 'Limited Stock Game', price: 59.99, stock_quantity: 5 };
            const existingCartItem = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: product.id, quantity: 2, product: product };
            const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [existingCartItem] };
            const newQuantity = 7;

            // Mock Prisma calls
            mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const req = mockRequest({ quantity: newQuantity }, { product_id: product.id });
            const res = mockResponse();
            const next = mockNext;

            await updateCartItemQuantity(req, res, next);

            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: product.id } });
            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain(`Cannot update quantity to ${newQuantity}`);
            expect(error.statusCode).toBe(400);
        });

        // Add more tests for edge cases and error scenarios...
    });

    // --- Test Cases for removeCartItem ---
    describe('removeCartItem', () => {
         test('should remove an item from the cart', async () => {
             const product = { id: 'prod-uuid-1', title: 'Game to Remove', price: 39.99 };
             const itemToRemove = { id: 'item-uuid-1', cart_id: 'cart-uuid', product_id: product.id, quantity: 1, product: product };
             const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [itemToRemove] };

             // Mock Prisma calls
             mockPrisma.cart.findUnique.mockResolvedValue(existingCart);
             mockPrisma.cartItem.delete.mockResolvedValue(itemToRemove); // Mock delete returning the removed item (Prisma might return null/undefined)

             const req = mockRequest({}, { product_id: product.id });
             const res = mockResponse();
             const next = mockNext;

             await removeCartItem(req, res, next);

             // Assert Prisma calls
             expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
             expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
                 where: { id: itemToRemove.id },
             });
             // Assert Response
             expect(res.status).toHaveBeenCalledWith(200);
             expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart' });
             expect(next).not.toHaveBeenCalled();
         });

         test('should return 404 if item not found in cart', async () => {
             const existingCart = { id: 'cart-uuid', user_id: 'test-user-uuid', items: [] }; // Cart is empty
             mockPrisma.cart.findUnique.mockResolvedValue(existingCart);

             const req = mockRequest({}, { product_id: 'non-existent-item-in-cart' });
             const res = mockResponse();
             const next = mockNext;

             await removeCartItem(req, res, next);

             expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: true } });
             expect(next).toHaveBeenCalled();
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Item not found in cart');
             expect(error.statusCode).toBe(404);
         });

        test('should return 400 if product ID is missing in parameters', async () => {
            const req = mockRequest({}, {}); // Missing product_id in params
            const res = mockResponse();
            const next = mockNext;

            await removeCartItem(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toBe('Product ID is required in parameters');
            expect(error.statusCode).toBe(400);
        });

        // Add more tests for error scenarios...
    });
});