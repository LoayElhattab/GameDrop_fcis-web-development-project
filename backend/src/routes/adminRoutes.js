
const express = require("express");
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardMetrics

} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only routes
router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.get("/users/:userId", protect, authorize("ADMIN"), getUserById);
router.delete("/users/:userId", protect, authorize("ADMIN"), deleteUser);
router.get("/dashboard/metrics", protect, authorize("ADMIN"), getDashboardMetrics);

module.exports = router;
