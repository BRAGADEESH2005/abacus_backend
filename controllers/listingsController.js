const Listing = require("../models/listingsModel");
const {
  generatePropertyCode,
  getPropertyCodeStats,
} = require("../utils/propertyCodeGenerator");

// Helper function to validate property code format
const validatePropertyCodeFormat = (propertyCode) => {
  // Format: XXX-X-XXX (e.g., BLR-O-001)
  const codePattern = /^[A-Z]{3}-[ORC]-\d{3}$/;
  return codePattern.test(propertyCode);
};

// Helper function to check if property code should be auto-generated
const shouldAutoGeneratePropertyCode = (propertyCode) => {
  return (
    !propertyCode ||
    propertyCode.trim() === "" ||
    propertyCode.includes("XXX") ||
    propertyCode.includes("XXXX")
  );
};

// Get all listings with pagination and filters
const getListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      location,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (type && type !== "all") {
      filter.type = type;
    }

    if (location && location !== "all") {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { propertyCode: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.priceNumeric = {};
      if (minPrice) filter.priceNumeric.$gte = parseInt(minPrice);
      if (maxPrice) filter.priceNumeric.$lte = parseInt(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const listings = await Listing.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filter: {
        type,
        location,
        search,
        minPrice,
        maxPrice,
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
};

// Get single listing by ID
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
      error: error.message,
    });
  }
};

// Create new listing - PROPERTY CODE CAN BE PROVIDED OR AUTO-GENERATED
const createListing = async (req, res) => {
  try {
    const {
      title,
      type,
      location,
      area,
      price,
      images = [],
      features = [],
      viewsRange = [100, 300],
      propertyCode: providedPropertyCode, // Can be provided by admin
    } = req.body;
    console.log("Received create listing request with data:", req.body);

    // Validate required fields
    if (!title || !type || !location || !area || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, type, location, area, price",
      });
    }

    // Validate features
    const validFeatures = features.filter(
      (feature) =>
        feature && typeof feature === "string" && feature.trim() !== "",
    );

    if (validFeatures.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one feature is required",
      });
    }

    // Validate images
    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Handle property code: use provided value if valid, otherwise auto-generate
    let propertyCode;

    if (shouldAutoGeneratePropertyCode(providedPropertyCode)) {
      // Auto-generate property code
      try {
        propertyCode = await generatePropertyCode(location, type);
        console.log(`✅ Auto-generated property code: ${propertyCode}`);
      } catch (error) {
        console.error("Error generating property code:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to generate property code",
          error: error.message,
        });
      }
    } else {
      // Use provided property code after validation
      const trimmedCode = providedPropertyCode.trim();

      if (!validatePropertyCodeFormat(trimmedCode)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid property code format. Expected format: XXX-X-XXX (e.g., BLR-O-001)",
        });
      }

      // Check if property code already exists
      const existingListing = await Listing.findOne({
        propertyCode: trimmedCode,
      });
      if (existingListing) {
        return res.status(400).json({
          success: false,
          message: `Property code ${trimmedCode} already exists`,
        });
      }

      propertyCode = trimmedCode;
      console.log(`✅ Using admin-provided property code: ${propertyCode}`);
    }

    // Extract numeric value from price for filtering
    const priceNumeric = extractNumericPrice(price);

    // Create listing object
    const listingData = {
      title: title.trim(),
      type,
      location: location.trim(),
      propertyCode,
      area: area.trim(),
      price: price.trim(),
      priceNumeric,
      images,
      features: validFeatures.map((f) => f.trim()),
      viewsRange: [
        parseInt(viewsRange[0]) || 100,
        parseInt(viewsRange[1]) || 300,
      ],
    };

    // Create new listing
    const listing = new Listing(listingData);
    const savedListing = await listing.save();

    console.log(`✅ Created listing with property code: ${propertyCode}`);

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: savedListing,
    });
  } catch (error) {
    console.error("Error creating listing:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create listing",
      error: error.message,
    });
  }
};

// Update listing - PROPERTY CODE CAN BE UPDATED
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received update listing request for ID:", id, "with data:", req.body);
    const updateData = { ...req.body };

    // Check if listing exists
    const existingListing = await Listing.findById(id);
    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Handle property code updates
    if (updateData.propertyCode !== undefined) {
      const newPropertyCode = updateData.propertyCode.trim();

      // Validate format if changing property code
      if (newPropertyCode && newPropertyCode !== existingListing.propertyCode) {
        if (!validatePropertyCodeFormat(newPropertyCode)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid property code format. Expected format: XXX-X-XXX (e.g., BLR-O-001)",
          });
        }

        // Check if new property code already exists
        const duplicateListing = await Listing.findOne({
          propertyCode: newPropertyCode,
          _id: { $ne: id },
        });

        if (duplicateListing) {
          return res.status(400).json({
            success: false,
            message: `Property code ${newPropertyCode} already exists`,
          });
        }

        updateData.propertyCode = newPropertyCode;
        console.log(
          `✅ Updating property code from ${existingListing.propertyCode} to ${newPropertyCode}`,
        );
      }
    }

    // Validate features if provided
    if (updateData.features) {
      const validFeatures = updateData.features.filter(
        (feature) =>
          feature && typeof feature === "string" && feature.trim() !== "",
      );

      if (validFeatures.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one feature is required",
        });
      }
      updateData.features = validFeatures.map((f) => f.trim());
    }

    // Validate images if provided
    if (updateData.images !== undefined) {
      if (!updateData.images || updateData.images.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one image is required",
        });
      }
    }

    // Update numeric price if price is updated
    if (updateData.price) {
      updateData.priceNumeric = extractNumericPrice(updateData.price);
    }

    // Trim string fields
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.location) updateData.location = updateData.location.trim();
    if (updateData.area) updateData.area = updateData.area.trim();
    if (updateData.price) updateData.price = updateData.price.trim();
    console.log("Updating listing with data:", updateData);
    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    console.log(`✅ Updated listing: ${updatedListing.propertyCode}`);

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (error) {
    console.error("Error updating listing:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update listing",
      error: error.message,
    });
  }
};

// Delete listing
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    console.log(`🗑️ Deleted listing: ${deletedListing.propertyCode}`);

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      data: deletedListing,
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete listing",
      error: error.message,
    });
  }
};

// Get available locations
const getLocations = async (req, res) => {
  try {
    const locations = await Listing.distinct("location");

    res.status(200).json({
      success: true,
      data: locations.sort(),
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
      error: error.message,
    });
  }
};

// Get available property types
const getTypes = async (req, res) => {
  try {
    const types = await Listing.distinct("type");

    res.status(200).json({
      success: true,
      data: types.sort(),
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch types",
      error: error.message,
    });
  }
};

// Get property code statistics
const getPropertyCodeStatistics = async (req, res) => {
  try {
    const stats = await getPropertyCodeStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching property code statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property code statistics",
      error: error.message,
    });
  }
};

// Utility function to extract numeric value from price string
const extractNumericPrice = (priceString) => {
  if (!priceString) return 0;

  // Remove currency symbols, commas, and non-numeric characters except dots
  const numericString = priceString
    .replace(/[₹,\s]/g, "")
    .replace(/[^\d.]/g, "");
  const numeric = parseFloat(numericString);

  return isNaN(numeric) ? 0 : numeric;
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getLocations,
  getTypes,
  getPropertyCodeStatistics,
};
