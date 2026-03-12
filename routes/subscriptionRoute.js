const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  getStatistics,
  updateSubscription,
  deleteSubscription,
  exportSubscriptions,
} = require("../controllers/subscriptionController");

// Public routes
// POST /api/subscriptions - Subscribe to newsletter
router.post("/", subscribe);

// POST /api/subscriptions/unsubscribe - Unsubscribe from newsletter
router.post("/unsubscribe", unsubscribe);

// Admin routes (you may want to add authentication middleware)
// GET /api/subscriptions/list - Get all subscriptions (with pagination)
router.get("/list", getSubscriptions);

// GET /api/subscriptions/statistics - Get subscription statistics
router.get("/statistics", getStatistics);

// GET /api/subscriptions/export - Export subscriptions to CSV
router.get("/export", exportSubscriptions);

// PUT /api/subscriptions/:id - Update subscription
router.put("/:id", updateSubscription);

// DELETE /api/subscriptions/:id - Delete subscription
router.delete("/:id", deleteSubscription);

module.exports = router;