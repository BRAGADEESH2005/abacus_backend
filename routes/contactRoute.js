const express = require("express");
const { submitContactForm } = require("../controllers/contactController");

const router = express.Router();

// Public route for contact form submission
router.post("/submit", submitContactForm);

module.exports = router;