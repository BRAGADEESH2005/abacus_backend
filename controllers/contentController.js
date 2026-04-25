const Content = require("../models/contentModel");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");
const {
  generateCacheKey,
  getCache,
  setCache,
  clearCachePattern,
} = require("../utils/cacheManager");

// @desc    Create new content
// @route   POST /api/content
// @access  Private
// @desc    Create new content
// @route   POST /api/content
// @access  Private
const createContent = async (req, res) => {
  try {
    const {
      type,
      sector,
      title,
      text,
      date,
      imageUrl,
      status,
      author,
      tags,
      views,
    } = req.body;

    // Validate required fields
    if (!type || !sector || !title || !text || !imageUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: type, sector, title, text, and imageUrl",
      });
    }

    // Validate views if provided
    if (views !== undefined && (typeof views !== "number" || views < 0)) {
      return res.status(400).json({
        success: false,
        message: "Views must be a non-negative number",
      });
    }

    console.log("Received content creation request with images:", imageUrl);
    // Parse imageUrl (it's already a Cloudinary URL from /images/upload endpoint)
    const imageData = {
      url: imageUrl[0],
      publicId: imageUrl[0].split("/").slice(-2).join("/").split(".")[0], // Extract public ID from URL
    };

    // Create content
    const content = await Content.create({
      type,
      sector,
      title,
      text,
      date: date || Date.now(),
      image: imageData,
      status: status || "Published",
      author: author || "Abacus Spaces",
      tags: tags || [],
      views: views || 0,
    });

    // Clear content cache when new content is created
    await clearCachePattern("content:*");

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: content,
    });
  } catch (error) {
    console.error("Create content error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create content",
    });
  }
};

// @desc    Get all content with filtering and pagination
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res) => {
  try {
    const {
      type,
      sector,
      status,
      page = 1,
      limit = 10,
      sort = "-date",
      search,
    } = req.query;

    // Generate cache key
    const cacheKey = generateCacheKey("content", {
      type,
      sector,
      status,
      page,
      limit,
      sort,
      search,
    });

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Build query
    const query = {};

    if (type) query.type = type;
    if (sector) query.sector = sector;
    if (status) query.status = status;
    else query.status = "Published"; // Default to published only

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { text: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Content.countDocuments(query);

    // Get content
    const content = await Content.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v");

    const response = {
      success: true,
      count: content.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: content,
    };

    // Cache the response for 1 hour (content changes less frequently)
    await setCache(cacheKey, response, 3600);

    res.status(200).json(response);
  } catch (error) {
    console.error("Get all content error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve content",
    });
  }
};

// @desc    Get single content by ID
// @route   GET /api/content/:id
// @access  Public
const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id).select("-__v");

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Increment views
    content.views += 1;
    await content.save();

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get content by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve content",
    });
  }
};

// @desc    Get single content by slug
// @route   GET /api/content/slug/:slug
// @access  Public
const getContentBySlug = async (req, res) => {
  try {
    const content = await Content.findOne({ slug: req.params.slug }).select(
      "-__v",
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Increment views
    content.views += 1;
    await content.save();

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get content by slug error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve content",
    });
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
const updateContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const {
      type,
      sector,
      title,
      text,
      date,
      imageUrl,
      status,
      author,
      tags,
      views,
    } = req.body;

    // Validate views if provided
    if (views !== undefined && (typeof views !== "number" || views < 0)) {
      return res.status(400).json({
        success: false,
        message: "Views must be a non-negative number",
      });
    }

    // Update fields
    if (type) content.type = type;
    if (sector) content.sector = sector;
    if (title) content.title = title;
    if (text) content.text = text;
    if (date) content.date = date;
    if (status) content.status = status;
    if (author) content.author = author;
    if (tags) content.tags = tags;
    if (views !== undefined) content.views = views; // Add this line

    // Handle image update
    if (imageUrl) {
      // Delete old image from Cloudinary
      if (content.image?.publicId) {
        try {
          await deleteFromCloudinary(content.image.publicId);
        } catch (err) {
          console.error("Failed to delete old image:", err);
          // Continue anyway
        }
      }

      // Set new image
      const imageData = {
        url: imageUrl,
        publicId: imageUrl.split("/").slice(-2).join("/").split(".")[0],
      };
      content.image = imageData;
    }

    // Save updated content
    await content.save();

    // Clear content cache when content is updated
    await clearCachePattern("content:*");

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update content",
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Delete image from Cloudinary
    if (content.image?.publicId) {
      try {
        await deleteFromCloudinary(content.image.publicId);
      } catch (err) {
        console.error("Failed to delete image:", err);
        // Continue with deletion anyway
      }
    }

    // Delete content
    await Content.findByIdAndDelete(req.params.id);

    // Clear content cache when content is deleted
    await clearCachePattern("content:*");

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete content",
    });
  }
};

// @desc    Get content statistics
// @route   GET /api/content/stats/summary
// @access  Public
const getContentStats = async (req, res) => {
  try {
    const stats = await Content.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalContent = await Content.countDocuments();
    const publishedContent = await Content.countDocuments({
      status: "Published",
    });
    const draftContent = await Content.countDocuments({ status: "Draft" });

    res.status(200).json({
      success: true,
      data: {
        totalContent,
        publishedContent,
        draftContent,
        byType: stats,
      },
    });
  } catch (error) {
    console.error("Get content stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve content statistics",
    });
  }
};

// @desc    Get latest content
// @route   GET /api/content/latest/:count
// @access  Public
const getLatestContent = async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;

    const content = await Content.find({ status: "Published" })
      .sort("-date")
      .limit(count)
      .select("title type sector date image slug excerpt");

    res.status(200).json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Get latest content error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve latest content",
    });
  }
};

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  getContentBySlug,
  updateContent,
  deleteContent,
  getContentStats,
  getLatestContent,
};
