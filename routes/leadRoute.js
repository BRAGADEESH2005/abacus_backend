const express = require("express");
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus
} = require("../controllers/leadController");

const router = express.Router();

// Public routes
router.post("/", createLead);

// Admin routes (you can add authentication middleware here)
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLeadStatus);

module.exports = router;