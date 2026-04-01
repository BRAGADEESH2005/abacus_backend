const express = require("express");
const router = express.Router();
const {
  createHeatmap,
  getAllHeatmap,
  getRentalHeatmap,
  getDemandSupplyHeatmap,
  getHeatmapById,
  updateHeatmap,
  deleteHeatmap,
  bulkCreateHeatmap,
  getHeatmapByState,
} = require("../controllers/heatmapController");

// Create new heatmap data
router.post("/", createHeatmap);

// Bulk create heatmap data
router.post("/bulk/upload", bulkCreateHeatmap);

// Get all heatmap data with filters
router.get("/", getAllHeatmap);

// Get rental heatmap data
router.get("/type/rental", getRentalHeatmap);

// Get demand and supply heatmap data
router.get("/type/demand-supply", getDemandSupplyHeatmap);

// Get heatmap data by state
router.get("/state/filter", getHeatmapByState);

// Get single heatmap by ID
router.get("/:id", getHeatmapById);

// Update heatmap data
router.put("/:id", updateHeatmap);

// Delete heatmap data
router.delete("/:id", deleteHeatmap);

module.exports = router;
