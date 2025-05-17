const prisma = require("../config/db");

async function createReview(req, res, next) {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

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

    const existingReview = await prisma.review.findFirst({
      where: { user_id, product_id: product_id },
    });

    if (existingReview) {
      return res
        .status(409)
        .json({ error: "You have already reviewed this product" });
    }

    const review = await prisma.review.create({
      data: {
        user_id,
        product_id: product_id,
        rating,
        comment,
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

    if (reviews.length === 0) {
      return res.status(200).json({ message: "No reviews for this product yet" });
    }

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

module.exports = { createReview, getReviewsForProduct };