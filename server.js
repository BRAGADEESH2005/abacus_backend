const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");
const listingsRoutes = require("./routes/listingsRoute");
const imageRoutes = require("./routes/imageRoute");
const leadRoutes = require("./routes/leadRoute"); // Add this line

// Initialize Express app
const app = express();
// Middleware
app.use(
  cors({
    origin: "https://abacus-space.vercel.app",
    credentials: true,
  })
);
// Connect to MongoDB
connectDB();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Trust proxy for IP addresses
app.set("trust proxy", true);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Abacus Spaces");
});

// Secure login route - validates credentials without exposing them
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (username === validUsername && password === validPassword) {
    res.json({
      success: true,
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Estate API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/listings", listingsRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/leads", leadRoutes); // Add this line

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`🏠 Root URL: http://localhost:${PORT}/`);
  console.log(`🔐 Auth Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Listings API: http://localhost:${PORT}/api/listings`);
  console.log(`🖼️  Images API: http://localhost:${PORT}/api/images`);
  console.log(`👥 Leads API: http://localhost:${PORT}/api/leads`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
