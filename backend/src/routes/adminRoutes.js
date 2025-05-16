
const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardMetrics

} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only routes
router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.get("/users/:userId", protect, authorize("ADMIN"), getUserById);
router.put("/users/:userId/role", protect, authorize("ADMIN"), updateUserRole);
router.delete("/users/:userId", protect, authorize("ADMIN"), deleteUser);
router.get("/dashboard/metrics", protect, authorize("ADMIN"), getDashboardMetrics);

module.exports = router;
