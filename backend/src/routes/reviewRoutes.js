const express = require("express");
const {
  createReview,
  getReviewsForProduct,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createReview", protect, createReview);
router.get("/product/:productId", getReviewsForProduct);

module.exports = router;
