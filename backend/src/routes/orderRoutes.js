const express = require("express");
const {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  getSingleOrderAdmin,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createOrder", protect, createOrder); 
router.get("/myOrder", protect, getUserOrders); 
router.get("/myOrder/:orderId", protect, getSingleOrder); 

router.get("/getOrders", protect, authorize("ADMIN"), getAllOrders); 
router.get("/:orderId", protect, authorize("ADMIN"), getSingleOrderAdmin); 
router.patch("/:orderId/status", protect, authorize("ADMIN"), updateOrderStatus); 
    
module.exports = router;
