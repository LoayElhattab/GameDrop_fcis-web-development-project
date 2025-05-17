const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../src/controllers/productController");
const prisma = require("../../src/config/db");

// Mock Prisma client
jest.mock("../../src/config/db", () => ({
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock middleware (not used directly but imported in productController)
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: jest.fn(),
  authorize: jest.fn(),
}));

describe("Product Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // === getAllProducts ===
  describe("getAllProducts", () => {
    it("should return a list of products with pagination and filters", async () => {
  const req = {
    query: {
      platform: "PS5",
      genre: "Action",
      search: "Game",
      page: "1",
      limit: "10",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
    const next = jest.fn();
const mockProducts = [{ id: "1", title: "Game 1" }];
  prisma.product.findMany = jest.fn().mockResolvedValue(mockProducts);
  prisma.product.count = jest.fn().mockResolvedValue(1);
      await getAllProducts(req, res, next);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          platform: "PS5",
          genre: "Action",
          OR: [
            { title: { contains: "Game", mode: "insensitive" } },
            { description: { contains: "Game", mode: "insensitive" } },
          ],
        },
        take: 10,
        skip: 0,
      });
      expect(prisma.product.count).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          platform: "PS5",
          genre: "Action",
          OR: [
            { title: { contains: "Game", mode: "insensitive" } },
            { description: { contains: "Game", mode: "insensitive" } },
          ],
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          products: mockProducts,
          total: 1,
          currentPage: 1,
          totalPages: 1,
        }),
      );
    });

    it("should handle database errors", async () => {
      prisma.product.findMany.mockRejectedValue(new Error("Database error"));

      await getAllProducts(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // === getProductById ===
  describe("getProductById", () => {
    it("should return a product by ID", async () => {
      const mockProduct = { id: "1", title: "Game 1", price: 59.99 };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      req.params = { id: "1" };

      await getProductById(req, res, next);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(mockProduct),
      );
    });

    it("should return 404 if product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      req.params = { id: "1" };

      await getProductById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("should handle database errors", async () => {
      prisma.product.findUnique.mockRejectedValue(new Error("Database error"));

      req.params = { id: "1" };

      await getProductById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // === createProduct ===
  describe("createProduct", () => {
    it("should create a new product and return it", async () => {
      const mockProduct = {
        id: "1",
        title: "New Game",
        description: "A fun game",
        platform: "PS5",
        genre: "Action",
        price: 59.99,
        stock_quantity: 100,
        cover_image_url: "http://example.com/image.jpg",
        release_date: new Date("2023-01-01"),
      };
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(mockProduct);

      req.body = {
        title: "New Game",
        description: "A fun game",
        platform: "PS5",
        genre: "Action",
        price: 59.99,
        stock_quantity: 100,
        cover_image_url: "http://example.com/image.jpg",
        release_date: "2023-01-01",
      };

      await createProduct(req, res, next);

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: "New Game", mode: "insensitive" } },
      });
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          title: "New Game",
          description: "A fun game",
          platform: "PS5",
          genre: "Action",
          price: 59.99,
          stock_quantity: 100,
          cover_image_url: "http://example.com/image.jpg",
          release_date: expect.any(Date),
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(mockProduct),
      );
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = {};

      await createProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Request body is missing or empty",
      });
    });

    it("should return 409 if product title already exists", async () => {
      prisma.product.findFirst.mockResolvedValue({
        id: "1",
        title: "New Game",
      });

      req.body = {
        title: "New Game",
        description: "A fun game",
        platform: "PS5",
        genre: "Action",
        price: 59.99,
        stock_quantity: 100,
        cover_image_url: "http://example.com/image.jpg",
        release_date: "2023-01-01",
      };

      await createProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Product with this title already exists",
      });
    });

    it("should handle database errors", async () => {
      prisma.product.findFirst.mockRejectedValue(new Error("Database error"));

      req.body = {
        title: "New Game",
        description: "A fun game",
        platform: "PS5",
        genre: "Action",
        price: 59.99,
        stock_quantity: 100,
        cover_image_url: "http://example.com/image.jpg",
        release_date: "2023-01-01",
      };

      await createProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // === updateProduct ===
  describe("updateProduct", () => {
    it("should update a product and return it", async () => {
      const mockProduct = {
        id: "1",
        title: "Updated Game",
        description: "Updated description",
        platform: "PS5",
        genre: "Action",
        price: 69.99,
        stock_quantity: 50,
        cover_image_url: "http://example.com/updated.jpg",
        release_date: new Date("2023-02-01"),
      };
      prisma.product.update.mockResolvedValue(mockProduct);

      req.params = { id: "1" };
      req.body = {
        title: "Updated Game",
        description: "Updated description",
        platform: "PS5",
        genre: "Action",
        price: 69.99,
        stock_quantity: 50,
        cover_image_url: "http://example.com/updated.jpg",
        release_date: "2023-02-01",
      };

      await updateProduct(req, res, next);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          title: "Updated Game",
          description: "Updated description",
          platform: "PS5",
          genre: "Action",
          price: 69.99,
          stock_quantity: 50,
          cover_image_url: "http://example.com/updated.jpg",
          release_date: expect.any(Date),
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(mockProduct),
      );
    });

    it("should return 404 if product not found", async () => {
      prisma.product.update.mockRejectedValue({ code: "P2025" });

      req.params = { id: "1" };
      req.body = {
        title: "Updated Game",
        description: "Updated description",
        platform: "PS5",
        genre: "Action",
        price: 69.99,
        stock_quantity: 50,
        cover_image_url: "http://example.com/updated.jpg",
        release_date: "2023-02-01",
      };

      await updateProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("should handle database errors", async () => {
      prisma.product.update.mockRejectedValue(new Error("Database error"));

      req.params = { id: "1" };
      req.body = {
        title: "Updated Game",
        description: "Updated description",
        platform: "PS5",
        genre: "Action",
        price: 69.99,
        stock_quantity: 50,
        cover_image_url: "http://example.com/updated.jpg",
        release_date: "2023-02-01",
      };

      await updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // === deleteProduct ===
describe("deleteProduct", () => {
  it("should delete a product and return it", async () => {
    req.params = { id: "1" };
    const mockProduct = { id: "1", stock_quantity: 10 };
    
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.product.update.mockResolvedValue({ ...mockProduct, is_deleted: true });

    await deleteProduct(req, res, next);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { is_deleted: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Product deactivated successfully" });
  });

  it("should return 404 if product not found", async () => {
    req.params = { id: "1" };
    prisma.product.findUnique.mockResolvedValue(null);

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
  });

  it("should handle database errors", async () => {
    req.params = { id: "1" };
    prisma.product.findUnique.mockResolvedValue({ id: "1" }); // Return a dummy product so it proceeds to update
    prisma.product.update.mockRejectedValue(new Error("Database error"));

    await deleteProduct(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
});