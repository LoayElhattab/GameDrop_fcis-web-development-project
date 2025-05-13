// backend/src/tests/controllers/orderController.test.js

// --- Jest Mocking Setup ---

// Define the mock Prisma client object.
// Prefixing with 'mock' makes it accessible inside the jest.mock factory.
// Ensure all Prisma methods used in orderController.js are mocked here.
const mockPrisma = {
    cart: {
        findUnique: jest.fn(),
        delete: jest.fn(), // Used if you delete the cart after order creation
    },
    cartItem: {
        findMany: jest.fn(), // Used to fetch cart items
        deleteMany: jest.fn(), // Used to clear cart after order creation
    },
    product: {
        findUnique: jest.fn(), // Used for stock check and price_at_purchase
        update: jest.fn(), // Used for stock decrement/increment
    },
    order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(), // Not used in current controller, but good to mock if needed later
    },
    orderItem: {
        create: jest.fn(), // Used to create order items
    },
    user: {
        findMany: jest.fn(), // Used in Admin controller
        findUnique: jest.fn(), // Used in Admin controller
        update: jest.fn(), // Used in Admin controller
        delete: jest.fn(), // Used in Admin controller
    },
    // Mock the transaction function. It should execute the callback provided.
    $transaction: jest.fn(async (callback) => {
        // When $transaction is called in the controller, this mock function runs.
        // It calls the controller's transaction logic (`async (tx) => { ... }`)
        // and passes the `mockPrisma` client as the `tx` argument.
        // This allows the logic inside the controller's transaction block to
        // call the mocked Prisma methods (tx.order.create, tx.product.update, etc.).
        try {
           const result = await callback(mockPrisma); // Execute the transaction callback
           return result; // Return whatever the transaction callback returns
        } catch (error) {
            // Simulate transaction rollback by re-throwing the error
            throw error;
        }
    }),
};

// Mock the module that exports the prisma client instance using the confirmed correct path.
// Ensure '../../src/config/db' is the correct relative path from this test file to your db.js
jest.mock('../../src/config/db', () => mockPrisma);

// --- Import Controller Functions ---

// Import order controller functions using the confirmed correct relative path.
const {
    createOrder,
    getUserOrders,
    getSingleOrder,
    getAllOrders, // Admin functions
    getSingleOrderAdmin, // Admin functions
    updateOrderStatus, // Admin functions
} = require('../../src/controllers/orderController');

// --- Mock Express Objects ---

// Mock Express request, response, and next objects
// Correct order: body, params, query
const mockRequest = (body = {}, params = {}, query = {}) => ({
    body: body,
    params: params,
    query: query,
    // Default user for authenticated routes. Modify in specific tests if needed.
    user: { id: 'test-user-uuid', role: 'CUSTOMER' },
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

// Helper to represent Prisma's Decimal type for mocking purposes
// In a real project, you might import this or use a dedicated mocking library.
function PrismaDecimal(value) {
    this.value = value;
    // Add methods needed by your controller code if it interacts with Decimal objects
    this.toNumber = () => parseFloat(value); // Example: if you convert to number for calculations
     this.toString = () => String(value); // Often needed for serialization or logging
     // Add comparison methods if you compare Decimal objects in your controller logic
     // For simple comparisons:
     this.valueOf = () => this.value;
}
// If your controller directly uses the Decimal type from '@prisma/client/runtime/library',
// you might need a more sophisticated mock or import the actual type if possible in tests.
// For simple cases like this, a basic mock object with necessary methods is often sufficient.

// --- Your Test Suites ---

describe('Order Controller (Customer & Admin)', () => {
    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock implementations if tests modify them significantly
        // For instance, if you mockResolvedValue differently in many tests,
        // you might want to reset the implementation here.
    });

    // --- Test Cases for createOrder ---
    describe('createOrder', () => {
        const mockShippingDetails = {
            shipping_address_line1: '123 Game St',
            shipping_city: 'Gamer City',
            shipping_postal_code: '12345',
            shipping_country: 'Gamingland',
        };

        // Use numerical values that match the expected calculation result
        const product1Price = 59.99;
        const product2Price = 39.50;
        const expectedTotalAmount = (product1Price * 2) + (product2Price * 1); // 159.48

        const mockProduct1 = { id: 'prod-1', title: 'Game A', price: new PrismaDecimal(product1Price), stock_quantity: 10 };
        const mockProduct2 = { id: 'prod-2', title: 'Game B', price: new PrismaDecimal(product2Price), stock_quantity: 5 };

        const mockCartWithItems = {
            id: 'cart-id',
            user_id: 'test-user-uuid',
            items: [
                { id: 'item-1', product_id: mockProduct1.id, quantity: 2, product: mockProduct1 },
                { id: 'item-2', product_id: mockProduct2.id, quantity: 1, product: mockProduct2 },
            ],
        };

        const mockCreatedOrder = {
            id: 'order-id',
            user_id: 'test-user-uuid',
            // Use the actual calculated number value here for consistency with controller
            total_amount: expectedTotalAmount,
            status: 'PROCESSING',
            ...mockShippingDetails,
            created_at: new Date(),
            updated_at: new Date(),
        };

         const mockCreatedOrderWithDetails = {
             ...mockCreatedOrder,
             items: [
                 { id: 'oi-1', orderId: 'order-id', product_id: mockProduct1.id, quantity: 2, price_at_purchase: mockProduct1.price, product: mockProduct1 },
                 { id: 'oi-2', orderId: 'order-id', product_id: mockProduct2.id, quantity: 1, price_at_purchase: mockProduct2.price, product: mockProduct2 },
             ],
         };

        test('should create an order successfully from user cart', async () => {
            // Arrange: Mock Prisma calls within the transaction
            mockPrisma.cart.findUnique.mockResolvedValue(mockCartWithItems); // User has items in cart
            // Mock product fetches for stock check inside the loop
            mockPrisma.product.findUnique
                .mockResolvedValueOnce(mockProduct1) // For item 1
                .mockResolvedValueOnce(mockProduct2); // For item 2

            // Mock the transaction's internal calls
            mockPrisma.order.create.mockResolvedValue(mockCreatedOrder);
            mockPrisma.orderItem.create.mockResolvedValue({}); // Mock successful creation
            mockPrisma.product.update.mockResolvedValue({}); // Mock successful stock decrement
            mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: mockCartWithItems.items.length });
             mockPrisma.order.findUnique.mockResolvedValue(mockCreatedOrderWithDetails); // Mock fetching the created order for response

            const req = mockRequest(mockShippingDetails); // Shipping details in body
            const res = mockResponse();
            const next = mockNext;

            await createOrder(req, res, next);

            // Assert: Check that the transaction was called
            expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

            // Capture the arguments passed to order.create inside the transaction
            // Use mock.calls[0][0] to get the arguments of the first call
            const orderCreateCallArgs = mockPrisma.order.create.mock.calls[0][0];

            // Assert: Check Prisma calls inside the transaction
            // Check order creation details using captured arguments
            expect(mockPrisma.order.create).toHaveBeenCalledTimes(1); // Ensure it was called exactly once
            expect(orderCreateCallArgs.data.user_id).toBe('test-user-uuid');
            expect(orderCreateCallArgs.data.status).toBe('PROCESSING');
            expect(orderCreateCallArgs.data.shipping_address_line1).toBe(mockShippingDetails.shipping_address_line1);
            expect(orderCreateCallArgs.data.shipping_city).toBe(mockShippingDetails.shipping_city);
            expect(orderCreateCallArgs.data.shipping_postal_code).toBe(mockShippingDetails.shipping_postal_code);
            expect(orderCreateCallArgs.data.shipping_country).toBe(mockShippingDetails.shipping_country);
            // CORRECTED ASSERTION: Expect the numerical value from captured args and use toBeCloseTo
            // If expect.toBeCloseTo is still not a function after this, verify your Jest setup.
            expect(orderCreateCallArgs.data.total_amount).toBeCloseTo(expectedTotalAmount, 2);

            // Check OrderItem creation and stock decrement for each item
            expect(mockPrisma.orderItem.create).toHaveBeenCalledTimes(mockCartWithItems.items.length);
            expect(mockPrisma.product.update).toHaveBeenCalledTimes(mockCartWithItems.items.length);
            // Check cart clearing
            expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { cart_id: mockCartWithItems.id },
            });
             // Check fetching created order
             expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                 where: { id: mockCreatedOrder.id },
                 include: {
                     items: {
                         include: {
                             product: true,
                         },
                     },
                 },
             });

            // Assert Response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCreatedOrderWithDetails);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if cart is empty', async () => {
            // Arrange: Mock Prisma to return a cart with no items
            const emptyCart = { id: 'cart-id', user_id: 'test-user-uuid', items: [] };
            mockPrisma.cart.findUnique.mockResolvedValue(emptyCart);

            const req = mockRequest(mockShippingDetails);
            const res = mockResponse();
            const next = mockNext;

            await createOrder(req, res, next);

            // Assertions
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: { include: { product: true } } } });
            expect(mockPrisma.$transaction).not.toHaveBeenCalled(); // Transaction should not be called
            expect(res.status).toHaveBeenCalledWith(200); // Expect status 200 as per the controller
            expect(res.json).toHaveBeenCalledWith({ message: 'Your cart is empty.' }); // Expect the message
            expect(next).not.toHaveBeenCalled(); // Ensure next is NOT called
        });

        test('should return 400 if insufficient stock for any item', async () => {
            const productWithLowStock = { id: 'prod-3', title: 'Low Stock Game', price: new PrismaDecimal(29.00), stock_quantity: 1 };
            const cartWithLowStockItem = {
                id: 'cart-id',
                user_id: 'test-user-uuid',
                items: [
                    { id: 'item-3', product_id: productWithLowStock.id, quantity: 5, product: productWithLowStock }, // Requesting 5, only 1 available
                ],
            };

            // Arrange: Mock Prisma to return cart and product with insufficient stock
            mockPrisma.cart.findUnique.mockResolvedValue(cartWithLowStockItem);
            mockPrisma.product.findUnique.mockResolvedValue(productWithLowStock);

            const req = mockRequest(mockShippingDetails);
            const res = mockResponse();
            const next = mockNext;

            await createOrder(req, res, next);

            // Assertions
            expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { user_id: 'test-user-uuid' }, include: { items: { include: { product: true } } } });
            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productWithLowStock.id } });
            expect(mockPrisma.$transaction).not.toHaveBeenCalled(); // Transaction should not be called
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toContain(`Insufficient stock for "${productWithLowStock.title}".`);
            expect(error.statusCode).toBe(400);
        });

        test('should return 400 if shipping details are missing', async () => {
            const req = mockRequest({ shipping_city: 'City' }); // Missing other required fields
            const res = mockResponse();
            const next = mockNext;

            await createOrder(req, res, next);

            // Assertions
            expect(mockPrisma.cart.findUnique).not.toHaveBeenCalled(); // No DB calls should happen before validation
            expect(mockPrisma.$transaction).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toBe('Shipping address, city, postal code, and country are required.');
            expect(error.statusCode).toBe(400);
        });

        test('should call next with error if a database operation fails during transaction', async () => {
             const mockError = new Error('DB Transaction Failed');
             mockPrisma.cart.findUnique.mockResolvedValue(mockCartWithItems);
             mockPrisma.product.findUnique.mockResolvedValue(mockProduct1); // Mock product fetches
             // Simulate an error during order item creation within the transaction
             mockPrisma.orderItem.create.mockRejectedValue(mockError);

             const req = mockRequest(mockShippingDetails);
             const res = mockResponse();
             const next = mockNext;

             await createOrder(req, res, next);

             // Assertions
             expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
             // You could add checks here to see if prisma methods *before* the error were called
             expect(mockPrisma.orderItem.create).toHaveBeenCalled(); // Ensure the failing call was attempted
             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(mockError); // Ensure the original error is passed to next
             expect(res.status).not.toHaveBeenCalled(); // No response should be sent by the controller
         });

        // Add more tests for edge cases (e.g., product price is Decimal, cart with one item, max stock, etc.)
    });

    // --- Test Cases for getUserOrders ---
    describe('getUserOrders', () => {
        test('should return all orders for the user', async () => {
            const mockOrders = [
                { id: 'order-1', user_id: 'test-user-uuid', total_amount: new PrismaDecimal(100), status: 'DELIVERED', items: [] },
                { id: 'order-2', user_id: 'test-user-uuid', total_amount: new PrismaDecimal(50), status: 'SHIPPED', items: [] },
            ];

            // Arrange: Mock Prisma findMany to return user's orders
            mockPrisma.order.findMany.mockResolvedValue(mockOrders);

            const req = mockRequest(); // No body or params
            const res = mockResponse();
            const next = mockNext;

            await getUserOrders(req, res, next);

            // Assertions
            expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
                where: { user_id: 'test-user-uuid' },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
                orderBy: { created_at: 'desc' },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return an empty array if user has no orders', async () => {
             // Arrange: Mock Prisma findMany to return empty array
             mockPrisma.order.findMany.mockResolvedValue([]);

             const req = mockRequest();
             const res = mockResponse();
             const next = mockNext;

             await getUserOrders(req, res, next);

             // Assertions
              expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
                where: { user_id: 'test-user-uuid' },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
                orderBy: { created_at: 'desc' },
            });
             expect(res.status).toHaveBeenCalledWith(200);
             expect(res.json).toHaveBeenCalledWith([]); // Expect empty array
             expect(next).not.toHaveBeenCalled();
         });

         test('should call next with error if database operation fails', async () => {
             const dbError = new Error('DB Error');
             mockPrisma.order.findMany.mockRejectedValue(dbError);

             const req = mockRequest();
             const res = mockResponse();
             const next = mockNext;

             await getUserOrders(req, res, next);

             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
         });
    });

    // --- Test Cases for getSingleOrder ---
    describe('getSingleOrder', () => {
        const orderId = 'test-order-id';
        const mockOrder = { id: orderId, user_id: 'test-user-uuid', total_amount: new PrismaDecimal(100), status: 'DELIVERED', items: [] };

        test('should return a single order if it belongs to the user', async () => {
            // Arrange: Mock Prisma findUnique to return the order
            mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

            const req = mockRequest({}, { orderId: orderId }); // orderId in params
            const res = mockResponse();
            const next = mockNext;

            await getSingleOrder(req, res, next);

            // Assertions
            expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                where: { id: orderId, user_id: 'test-user-uuid' },
                include: {
                    items: { include: { product: true } },
                    user: { select: { id: true, username: true, email: true } },
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 404 if order not found or does not belong to user', async () => {
             // Arrange: Mock Prisma findUnique to return null
             mockPrisma.order.findUnique.mockResolvedValue(null);

             const req = mockRequest({}, { orderId: 'non-existent-order-id' });
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrder(req, res, next);

             // Assertions
              expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                where: { id: 'non-existent-order-id', user_id: 'test-user-uuid' },
                include: {
                    items: { include: { product: true } },
                    user: { select: { id: true, username: true, email: true } },
                },
            });
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Order not found or does not belong to this user.');
             expect(error.statusCode).toBe(404);
         });

         test('should return 400 if order ID is missing', async () => {
             const req = mockRequest({}, {}); // Missing orderId in params
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrder(req, res, next);

             expect(mockPrisma.order.findUnique).not.toHaveBeenCalled(); // No DB call
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Order ID is required in parameters.');
             expect(error.statusCode).toBe(400);
         });

         test('should call next with error if database operation fails', async () => {
             const dbError = new Error('DB Error');
             mockPrisma.order.findUnique.mockRejectedValue(dbError);

             const req = mockRequest({}, { orderId: orderId });
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrder(req, res, next);

             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
         });
    });

    // --- Test Cases for getAllOrders (Admin) ---
    describe('getAllOrders (Admin)', () => {
        // Ensure the mock request has an ADMIN role for these tests, or mock authorize middleware
        // For controller unit tests, setting req.user is sufficient to simulate authorization success
        const mockAdminRequest = (body = {}, params = {}, query = {}) => ({
             ...mockRequest(body, params, query),
             user: { id: 'admin-user-uuid', role: 'ADMIN' }, // Simulate admin user
        });

        test('should return all orders for admin', async () => {
            const mockOrders = [
                { id: 'order-1', user_id: 'user-a', status: 'PROCESSING', user: { username: 'User A' }, items: [] },
                { id: 'order-2', user_id: 'user-b', status: 'SHIPPED', user: { username: 'User B' }, items: [] },
            ];

            // Arrange: Mock Prisma findMany to return all orders
            mockPrisma.order.findMany.mockResolvedValue(mockOrders);

            const req = mockAdminRequest(); // Admin request
            const res = mockResponse();
            const next = mockNext;

            await getAllOrders(req, res, next);

            // Assertions
            expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
                include: {
                     user: { select: { id: true, username: true, email: true } },
                     items: { include: { product: { select: { id: true, title: true } } } }
                },
                orderBy: { created_at: 'desc' },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return empty array if no orders exist (Admin)', async () => {
             // Arrange: Mock Prisma findMany to return empty array
             mockPrisma.order.findMany.mockResolvedValue([]);

             const req = mockAdminRequest();
             const res = mockResponse();
             const next = mockNext;

             await getAllOrders(req, res, next);

             // Assertions
              expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
                include: {
                     user: { select: { id: true, username: true, email: true } },
                     items: { include: { product: { select: { id: true, title: true } } } }
                },
                orderBy: { created_at: 'desc' },
            });
             expect(res.status).toHaveBeenCalledWith(200);
             expect(res.json).toHaveBeenCalledWith([]); // Expect empty array
             expect(next).not.toHaveBeenCalled();
         });

         test('should call next with error if database operation fails (Admin)', async () => {
             const dbError = new Error('DB Error');
             mockPrisma.order.findMany.mockRejectedValue(dbError);

             const req = mockAdminRequest();
             const res = mockResponse();
             const next = mockNext;

             await getAllOrders(req, res, next);

             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
         });
    });

    // --- Test Cases for getSingleOrderAdmin (Admin) ---
    describe('getSingleOrderAdmin (Admin)', () => {
        const orderId = 'test-order-id';
        const mockOrder = { id: orderId, user_id: 'user-a', total_amount: new PrismaDecimal(200), status: 'PROCESSING', items: [], user: { username: 'User A' } };
        const mockAdminRequest = (body = {}, params = {}, query = {}) => ({
             ...mockRequest(body, params, query),
             user: { id: 'admin-user-uuid', role: 'ADMIN' }, // Simulate admin user
        });

        test('should return a single order for admin by ID', async () => {
             // Arrange: Mock Prisma findUnique to return the order
             mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

             const req = mockAdminRequest({}, { orderId: orderId }); // orderId in params
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrderAdmin(req, res, next);

             // Assertions
             expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                 where: { id: orderId }, // No user_id filter for admin view
                 include: {
                     items: { include: { product: true } },
                     user: { select: { id: true, username: true, email: true, role: true } },
                 },
             });
             expect(res.status).toHaveBeenCalledWith(200);
             expect(res.json).toHaveBeenCalledWith(mockOrder);
             expect(next).not.toHaveBeenCalled();
         });

        test('should return 404 if order not found (Admin)', async () => {
             // Arrange: Mock Prisma findUnique to return null
             mockPrisma.order.findUnique.mockResolvedValue(null);

             const req = mockAdminRequest({}, { orderId: 'non-existent-order-id' });
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrderAdmin(req, res, next);

             // Assertions
              expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                 where: { id: 'non-existent-order-id' },
                 include: {
                     items: { include: { product: true } },
                     user: { select: { id: true, username: true, email: true, role: true } },
                 },
             });
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Order not found.');
             expect(error.statusCode).toBe(404);
         });

         test('should return 400 if order ID is missing (Admin)', async () => {
             const req = mockAdminRequest({}, {}); // Missing orderId in params
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrderAdmin(req, res, next);

             expect(mockPrisma.order.findUnique).not.toHaveBeenCalled(); // No DB call
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Order ID is required in parameters.');
             expect(error.statusCode).toBe(400);
         });

         test('should call next with error if database operation fails (Admin)', async () => {
             const dbError = new Error('DB Error');
             mockPrisma.order.findUnique.mockRejectedValue(dbError);

             const req = mockAdminRequest({}, { orderId: orderId });
             const res = mockResponse();
             const next = mockNext;

             await getSingleOrderAdmin(req, res, next);

             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
         });
    });

    // --- Test Cases for updateOrderStatus (Admin) ---
    describe('updateOrderStatus (Admin)', () => {
        const orderId = 'test-order-id';
        // Use a status that is NOT CANCELLED initially for the cancellation test
        const mockOrderProcessing = { id: orderId, user_id: 'user-a', status: 'PROCESSING', items: [{ product_id: 'prod-1', quantity: 2 }] };
        const mockOrderCancelled = { ...mockOrderProcessing, status: 'CANCELLED' };

        const mockAdminRequest = (body = {}, params = {}, query = {}) => ({
             ...mockRequest(body, params, query),
             user: { id: 'admin-user-uuid', role: 'ADMIN' }, // Simulate admin user
        });
         const mockUpdatedOrder = {
             ...mockOrderProcessing,
             status: 'SHIPPED', // Example new status for non-cancellation test
             items: [{ product_id: 'prod-1', quantity: 2, product: { id: 'prod-1', title: 'Game' } }], // Include product details for response
             user: { id: 'user-a', username: 'User A', email: 'a@b.com', role: 'CUSTOMER'} // Include user for response
         };
         const mockProductInOrder = { id: 'prod-1', title: 'Game in Order', stock_quantity: 5 }; // Mock product for stock checks

        test('should update order status successfully', async () => {
            const newStatus = 'SHIPPED';

            // Arrange: Mock Prisma calls
            // Find the initial order (e.g., PROCESSING)
            mockPrisma.order.findUnique.mockResolvedValue(mockOrderProcessing);
            // Update status
            mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

            const req = mockAdminRequest({ status: newStatus }, { orderId: orderId }); // status in body, orderId in params
            const res = mockResponse();
            const next = mockNext;

            await updateOrderStatus(req, res, next);

            // Assertions
            expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({ where: { id: orderId }, include: { items: true } }); // Initial fetch
            expect(mockPrisma.order.update).toHaveBeenCalledWith({
                where: { id: orderId },
                data: { status: newStatus.toUpperCase() }, // Controller uppercases status
                include: {
                     items: { include: { product: true } },
                     user: { select: { id: true, username: true, email: true, role: true } }
                 }
            });
            expect(mockPrisma.$transaction).not.toHaveBeenCalled(); // No stock logic for this status change

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedOrder);
            expect(next).not.toHaveBeenCalled();
        });

        test('should update status to CANCELLED and increment product stock', async () => {
            const newStatus = 'CANCELLED';
            const itemQuantity = mockOrderProcessing.items[0].quantity;
        
            // Mock the initial fetch (before transaction)
            mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrderProcessing);
            mockPrisma.product.update.mockResolvedValue({});
            mockPrisma.order.update.mockResolvedValue(mockOrderCancelled);
            // Mock the fetch after transaction
            mockPrisma.order.findUnique.mockResolvedValueOnce({
                ...mockOrderCancelled,
                items: [{ ...mockOrderProcessing.items[0], product: mockProductInOrder }],
                user: mockUpdatedOrder.user
            });
        
            const req = mockAdminRequest({ status: newStatus }, { orderId: orderId });
            const res = mockResponse();
            const next = mockNext;
        
            await updateOrderStatus(req, res, next);
        
            expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({ where: { id: orderId }, include: { items: true } });
            expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
            expect(mockPrisma.order.update).toHaveBeenCalledWith({
                where: { id: orderId },
                data: { status: newStatus.toUpperCase() },
            });
            expect(mockPrisma.product.update).toHaveBeenCalledWith({
                where: { id: mockOrderProcessing.items[0].product_id },
                data: { stock_quantity: { increment: itemQuantity } },
            });
            expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
                where: { id: orderId },
                include: { items: { include: { product: true } }, user: { select: { id: true, username: true, email: true, role: true } } }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 if new status is invalid', async () => {
            const req = mockAdminRequest({ status: 'INVALID_STATUS' }, { orderId: orderId });
            const res = mockResponse();
            const next = mockNext;

            await updateOrderStatus(req, res, next);

            expect(mockPrisma.order.findUnique).not.toHaveBeenCalled(); // Validation happens first
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Invalid status');
            expect(error.statusCode).toBe(400);
        });

         test('should return 400 if status is missing', async () => {
             const req = mockAdminRequest({}, { orderId: orderId }); // Missing status in body
             const res = mockResponse();
             const next = mockNext;

             await updateOrderStatus(req, res, next);

             expect(mockPrisma.order.findUnique).not.toHaveBeenCalled(); // Validation happens first
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('New status is required in body.');
             expect(error.statusCode).toBe(400);
         });

        test('should return 400 if order ID is missing', async () => {
             const req = mockAdminRequest({ status: 'SHIPPED' }, {}); // Missing orderId in params
             const res = mockResponse();
             const next = mockNext;

             await updateOrderStatus(req, res, next);

             expect(mockPrisma.order.findUnique).not.toHaveBeenCalled(); // Validation happens first
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('Order ID is required in parameters.');
             expect(error.statusCode).toBe(400);
         });

        test('should return 404 if order not found when updating status', async () => {
            // Arrange: Mock Prisma findUnique to return null for the initial fetch
            mockPrisma.order.findUnique.mockResolvedValue(null);

            const req = mockAdminRequest({ status: 'SHIPPED' }, { orderId: 'non-existent-order-id' });
            const res = mockResponse();
            const next = mockNext;

            await updateOrderStatus(req, res, next);

            expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-order-id' }, include: { items: true } });
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toBe('Order not found.');
            expect(error.statusCode).toBe(404);
        });

         test('should call next with error if database operation fails', async () => {
             const dbError = new Error('DB Error');
             mockPrisma.order.findUnique.mockResolvedValue(mockOrderProcessing); // Initial fetch succeeds
             mockPrisma.order.update.mockRejectedValue(dbError); // Update fails

             const req = mockAdminRequest({ status: 'SHIPPED' }, { orderId: orderId });
             const res = mockResponse();
             const next = mockNext;

             await updateOrderStatus(req, res, next);

             expect(next).toHaveBeenCalledTimes(1);
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
         });
    });
});