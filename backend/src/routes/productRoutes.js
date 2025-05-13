const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getProducts", getAllProducts);
router.get("/:id", getProductById);
router.post("/createProduct", protect, authorize("ADMIN"), createProduct);
router.put("/:id", protect, authorize("ADMIN"), updateProduct);
router.delete("/:id", protect, authorize("ADMIN"), deleteProduct);

module.exports = router;
