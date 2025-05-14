const express = require("express");
const {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);


router.get("/", getCart); 
router.post("/items", addItemToCart); 
router.put("/items/:productId", updateCartItemQuantity); 
router.delete("/items/:productId", removeCartItem); 

module.exports = router;
