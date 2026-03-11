const express = require("express");
const router = express.Router();
const {
  createContent,
  getAllContent,
  getContentById,
  getContentBySlug,
  updateContent,
  deleteContent,
  getContentStats,
  getLatestContent,
} = require("../controllers/contentController");

// Public routes
router.get("/", getAllContent);
router.get("/stats/summary", getContentStats);
router.get("/latest/:count", getLatestContent);
router.get("/slug/:slug", getContentBySlug);
router.get("/:id", getContentById);

// Private routes (add authentication middleware if needed)
router.post("/", createContent);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);

module.exports = router;