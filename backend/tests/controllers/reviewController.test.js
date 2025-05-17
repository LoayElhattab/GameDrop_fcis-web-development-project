const {
  createReview,
  getReviewsForProduct,
} = require("../../src/controllers/reviewController");
const prisma = require("../../src/config/db");

// Mock Prisma client
jest.mock("../../src/config/db", () => ({
  review: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock authMiddleware (to simulate req.user)
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: jest.fn(),
}));

describe("Review Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: "user123" } }; // Mock user from protect middleware
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // === createReview ===
  describe("createReview", () => {
    it("should create a new review and return it", async () => {
      const mockReview = {
        id: 1,
        user_id: "user123",
        product_id: 1,
        rating: 4,
        comment: "Great game, highly recommended!",
        created_at: new Date(),
         user: {
    id: "user123",
    username: "testuser",
    email: "test@example.com",
  },
      };
      prisma.review.findFirst.mockResolvedValue(null); // No existing review
      prisma.review.create.mockResolvedValue(mockReview);

      req.body = {
        product_id: 1,
        rating: 4,
        comment: "Great game, highly recommended!",
      };

      await createReview(req, res, next);

      expect(prisma.review.findFirst).toHaveBeenCalledWith({
        where: { user_id: "user123", product_id: 1 },
      });
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          user_id: "user123",
          product_id: 1,
          rating: 4,
          comment: "Great game, highly recommended!",
        },
         include: {
    user: {
      select: {
        id: true,
        username: true,
        email: true,
      },
    },
  },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(mockReview),
      );
    });

    it("should return 400 if product_id or rating is missing", async () => {
      req.body = {
        product_id: 1, // Missing rating
      };

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Product ID and rating are required",
      });
    });

    it("should return 400 if rating is invalid", async () => {
      req.body = {
        product_id: 1,
        rating: 6, // Out of range
        comment: "Invalid rating",
      };

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating must be an integer between 1 and 5",
      });
    });

    it("should return 409 if user already reviewed the product", async () => {
      prisma.review.findFirst.mockResolvedValue({
        id: 1,
        user_id: "user123",
        product_id: 1,
      });

      req.body = {
        product_id: 1,
        rating: 4,
        comment: "Great game",
      };

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "You have already reviewed this product",
      });
    });

    it("should handle database errors", async () => {
      prisma.review.findFirst.mockRejectedValue(new Error("Database error"));

      req.body = {
        product_id: 1,
        rating: 4,
        comment: "Great game",
      };

      await createReview(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // === getReviewsForProduct ===
  describe("getReviewsForProduct", () => {
    it("should return reviews for a product", async () => {
      const mockReviews = [
        {
          id: 1,
          user_id: "user123",
          product_id: 1,
          rating: 4,
          comment: "Great game!",
          created_at: new Date(),
           user: {
      id: "user123",
      username: "testuser",
      email: "test@example.com",
    },
        },
      ];
      prisma.review.findMany.mockResolvedValue(mockReviews);

      req.params = { productId: "1" };

      await getReviewsForProduct(req, res, next);

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { product_id: "1" },
        include: {
    user: {
      select: {
        id: true,
        username: true,
        email: true,
      },
    },
  },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining(mockReviews),
      );
    });

   it("should return empty array if no reviews exist", async () => {
      prisma.review.findMany.mockResolvedValue([]);

      req.params = { productId: "1" };

      await getReviewsForProduct(req, res, next);

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { product_id: "1" },
         include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "No reviews for this product yet",
      });
    });

    it("should handle database errors", async () => {
      prisma.review.findMany.mockRejectedValue(new Error("Database error"));

      req.params = { productId: "1" };

      await getReviewsForProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});