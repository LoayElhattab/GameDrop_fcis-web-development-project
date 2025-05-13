const prisma = require("../config/db");

async function getAllProducts(req, res, next) {
  try {
    const { platform, genre, search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (platform) where.platform = platform;
    if (genre) where.genre = genre;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await prisma.product.count({ where });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      products,
      total,
      currentPage: parseInt(page),
      totalPages,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }, // UUID as string
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    // Check if req.body exists and is an object
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Object.keys(req.body).length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Request body is missing or empty" });
    }

    const {
      title,
      description,
      platform,
      genre,
      price,
      stock_quantity,
      cover_image_url,
      release_date,
    } = req.body;

    if (
      !title ||
      !description ||
      !platform ||
      !genre ||
      !price ||
      !stock_quantity ||
      !cover_image_url ||
      !release_date
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if a product with the same title already exists
    const existingProduct = await prisma.product.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });

    if (existingProduct) {
      return res
        .status(409)
        .json({ error: "Product with this title already exists" });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        platform,
        genre,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        cover_image_url,
        release_date: new Date(release_date),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      platform,
      genre,
      price,
      stock_quantity,
      cover_image_url,
      release_date,
    } = req.body;

    const product = await prisma.product.update({
      where: { id }, // UUID as string
      data: {
        title,
        description,
        platform,
        genre,
        price: price ? parseFloat(price) : undefined,
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : undefined,
        cover_image_url,
        release_date: release_date ? new Date(release_date) : undefined,
      },
    });

    res.status(200).json(product);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.delete({
      where: { id }, // UUID as string
    });

    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
