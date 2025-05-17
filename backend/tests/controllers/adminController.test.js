// backend/src/tests/controllers/adminController.test.js

// --- Jest Mocking Setup ---

// Define the mock Prisma client object.
// Ensure all Prisma methods used in adminController.js are mocked here.
const mockPrisma = {
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    // Add other models if adminController.js interacts with them (e.g., Product, Order)
    // Based on the provided adminController.js, it only interacts with 'user'.
    $transaction: jest.fn(async (callback) => {
        // Basic transaction mock
        return await callback(mockPrisma);
    }),
};

// Mock the module that exports the prisma client instance.
// IMPORTANT: The path here ('../../src/config/db') MUST correctly resolve
// to your backend/src/config/db.js file from the location of this test file.
jest.mock('../../src/config/db', () => mockPrisma);


// --- Import Controller Functions ---

// Import the controller functions you want to test
// The path should be correct relative from tests/controllers/ to src/controllers/
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
} = require('../../src/controllers/adminController');


// --- Mock Express Objects ---

// Mock Express request, response, and next objects
// Ensure req.user is mocked with the ADMIN role for these tests
const mockRequest = (body = {}, params = {}, query = {}) => ({
    body: body,
    params: params,
    query: query,
    user: { id: 'test-admin-uuid', role: 'ADMIN' }, // Mock req.user as ADMIN
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();


// --- Mock Data ---
// Define mock data needed for tests (users)
const mockUsers = [
    { id: 'user-1-uuid', username: 'customer1', email: 'cust1@example.com', role: 'CUSTOMER', created_at: new Date(), updated_at: new Date(), _count: { orders: 2, reviews: 1 } },
    { id: 'user-2-uuid', username: 'customer2', email: 'cust2@example.com', role: 'CUSTOMER', created_at: new Date(), updated_at: new Date(), _count: { orders: 0, reviews: 0 } },
    { id: 'test-admin-uuid', username: 'admin', email: 'admin@example.com', role: 'ADMIN', created_at: new Date(), updated_at: new Date(), _count: { orders: 5, reviews: 10 } },
];

const mockSingleUser = {
    id: 'user-1-uuid',
    username: 'customer1',
    email: 'cust1@example.com',
    role: 'CUSTOMER',
    created_at: new Date(),
    updated_at: new Date(),
    orders: [ // Mock recent orders as per controller select
        { id: 'order-a', total_amount: 100, status: 'SHIPPED', created_at: new Date() },
    ],
    reviews: [ // Mock recent reviews as per controller select
        { id: 'review-b', rating: 5, comment: 'Great game!', created_at: new Date(), productId: 'prod-xyz' },
    ]
};

// --- Test Suites ---

describe('Admin Controller (Admin Role Required)', () => {
    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        // Clear all mock calls and reset mock implementations
        jest.clearAllMocks();

        // You might want to reset default resolved values here if they change between tests
        // e.g., mockPrisma.user.findUnique.mockResolvedValue(mockDefaultUser);
    });

    // --- Test Cases for getAllUsers ---
    describe('getAllUsers', () => {
        test('should return all users with specified fields', async () => {
            // Arrange: Mock Prisma to return a list of users
            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const req = mockRequest(); // Assuming admin user is in req.user
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await getAllUsers(req, res, next);

            // Assert: Verify Prisma was called correctly and response is as expected
            expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                select: { // Should match the select fields in the controller
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
                orderBy: { created_at: 'asc' }, // Should match the orderBy in the controller
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUsers);
            expect(next).not.toHaveBeenCalled(); // Should not call next on success
        });

        test('should call next with error if a database operation fails', async () => {
            // Arrange: Simulate a database error
            const dbError = new Error('Database fetch failed');
            mockPrisma.user.findMany.mockRejectedValue(dbError); // Make findMany throw an error

            const req = mockRequest();
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await getAllUsers(req, res, next);

            // Assert: Verify next was called with the error
            expect(next).toHaveBeenCalledWith(dbError);
            expect(res.status).not.toHaveBeenCalled(); // Ensure no response was sent
            expect(res.json).not.toHaveBeenCalled(); // Ensure no response was sent
        });
    });

    // --- Test Cases for getUserById ---
    describe('getUserById', () => {
        test('should return a single user by ID with details', async () => {
            // Arrange: Mock Prisma to return a single user with related data
            mockPrisma.user.findUnique.mockResolvedValue(mockSingleUser);

            const userId = 'user-1-uuid';
            const req = mockRequest({}, { userId }); // User ID in params
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await getUserById(req, res, next);

            // Assert: Verify Prisma was called correctly and response is as expected
            expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: { // Should match the select fields in the controller
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                    orders: expect.any(Object), // Check for include/select object existence
                    reviews: expect.any(Object), // Check for include/select object existence
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockSingleUser);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 404 if user is not found', async () => {
            // Arrange: Mock Prisma to return null (user not found)
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const userId = 'non-existent-uuid';
            const req = mockRequest({}, { userId }); // User ID in params
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await getUserById(req, res, next);

            // Assert: Verify Prisma was called, next was called with error
            expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                 where: { id: userId },
                 select: expect.any(Object), // Still expect the select clause
            });
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toBe('User not found.'); // Match controller error message
            expect(error.statusCode).toBe(404);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should return 400 if user ID is missing in parameters', async () => {
             // Arrange: No userId in req.params
             const req = mockRequest({}, {}); // Missing userId in params
             const res = mockResponse();
             const next = mockNext;

             // Act: Call the controller function
             await getUserById(req, res, next);

             // Assert: Verify next was called with a 400 error
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('User ID is required in parameters.'); // Match controller error
             expect(error.statusCode).toBe(400);
             expect(mockPrisma.user.findUnique).not.toHaveBeenCalled(); // Should not call Prisma if validation fails
             expect(res.status).not.toHaveBeenCalled();
             expect(res.json).not.toHaveBeenCalled();
         });

        test('should call next with error if a database operation fails', async () => {
             // Arrange: Simulate a database error after initial validation
             const dbError = new Error('Database fetch failed');
             mockPrisma.user.findUnique.mockRejectedValue(dbError);

             const userId = 'user-1-uuid';
             const req = mockRequest({}, { userId });
             const res = mockResponse();
             const next = mockNext;

             // Act: Call the controller function
             await getUserById(req, res, next);

             // Assert: Verify next was called with the error
             expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1); // Prisma was called before error
             expect(next).toHaveBeenCalledWith(dbError);
             expect(res.status).not.toHaveBeenCalled();
             expect(res.json).not.toHaveBeenCalled();
         });
    });
    // --- Test Cases for deleteUser ---
    describe('deleteUser', () => {
        test('should delete a user successfully', async () => {
            const userIdToDelete = 'user-1-uuid'; // A non-admin user
            const deletedUserResponse = { id: userIdToDelete, username: 'customer1', email: 'cust1@example.com' }; // Data returned by select

            // Arrange: Mock Prisma to return the deleted user data
            mockPrisma.user.delete.mockResolvedValue(deletedUserResponse);

            const req = mockRequest({}, { userId: userIdToDelete }); // User ID in params
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await deleteUser(req, res, next);

            // Assert: Verify Prisma delete was called and response is as expected
            expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
            expect(mockPrisma.user.delete).toHaveBeenCalledWith({
                where: { id: userIdToDelete },
                select: { id: true, username: true, email: true } // Match controller select
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: `User with ID ${userIdToDelete} deleted successfully.`, user: deletedUserResponse });
            expect(next).not.toHaveBeenCalled();
        });

         test('should return 400 if user ID is missing in parameters', async () => {
             // Arrange: Missing userId in req.params
             const req = mockRequest({}, {}); // Missing userId in params
             const res = mockResponse();
             const next = mockNext;

             // Act: Call the controller function
             await deleteUser(req, res, next);

             // Assert: Verify next was called with a 400 error
             expect(next).toHaveBeenCalledTimes(1);
             const error = next.mock.calls[0][0];
             expect(error.message).toBe('User ID is required in parameters.'); // Match controller error
             expect(error.statusCode).toBe(400);
             expect(mockPrisma.user.delete).not.toHaveBeenCalled(); // Should not call Prisma
             expect(res.status).not.toHaveBeenCalled();
             expect(res.json).not.toHaveBeenCalled();
         });

         test('should return 403 if admin tries to delete their own account', async () => {
              // Arrange: Admin user ID matches the userId in params
              const req = mockRequest({}, { userId: 'test-admin-uuid' }); // Admin deleting own account
              const res = mockResponse();
              const next = mockNext;

              // Act: Call the controller function
              await deleteUser(req, res, next);

              // Assert: Verify next was called with a 403 error
              expect(next).toHaveBeenCalledTimes(1);
              const error = next.mock.calls[0][0];
              expect(error.message).toBe('Cannot delete your own user account via this endpoint.'); // Match controller error
              expect(error.statusCode).toBe(403);
              expect(mockPrisma.user.delete).not.toHaveBeenCalled(); // Should not call Prisma
              expect(res.status).not.toHaveBeenCalled();
              expect(res.json).not.toHaveBeenCalled();
         });

        test('should return 404 if user to delete is not found (Prisma P2025)', async () => {
            // Arrange: Simulate Prisma 'not found' error code
            const prismaError = new Error('An operation failed because it depends on one or more records that were required but not found. Record to delete not found.');
             prismaError.code = 'P2025'; // Prisma error code for 'not found'
            mockPrisma.user.delete.mockRejectedValue(prismaError);

            const userIdToDelete = 'non-existent-uuid';
            const req = mockRequest({}, { userId: userIdToDelete });
            const res = mockResponse();
            const next = mockNext;

            // Act: Call the controller function
            await deleteUser(req, res, next);

            // Assert: Verify Prisma delete was called, next was called with a 404 error
            expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
             expect(mockPrisma.user.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: userIdToDelete } })); // Check where clause
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error.message).toBe(`User with ID ${userIdToDelete} not found.`); // Match controller's wrapped error
            expect(error.statusCode).toBe(404);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

         test('should call next with error for other database errors', async () => {
              // Arrange: Simulate a generic database error
              const dbError = new Error('Database delete failed');
              mockPrisma.user.delete.mockRejectedValue(dbError);

              const userIdToDelete = 'user-1-uuid';
              const req = mockRequest({}, { userId: userIdToDelete });
              const res = mockResponse();
              const next = mockNext;

              // Act: Call the controller function
              await deleteUser(req, res, next);

              // Assert: Verify Prisma delete was called, next was called with the original error
              expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
              expect(next).toHaveBeenCalledWith(dbError);
              expect(res.status).not.toHaveBeenCalled();
              expect(res.json).not.toHaveBeenCalled();
         });
    });
});