const prisma = require("../config/db");

async function createReview(req, res, next) {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!product_id || !rating) {
      return res
        .status(400)
        .json({ error: "Product ID and rating are required" });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5" });
    }

    // Check if the user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { user_id, product_id: product_id },
    });

    if (existingReview) {
      return res
        .status(409)
        .json({ error: "You have already reviewed this product" });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        user_id,
        product_id:product_id,
        rating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

async function getReviewsForProduct(req, res, next) {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { product_id: productId },
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

module.exports = { createReview, getReviewsForProduct };
