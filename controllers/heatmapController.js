const Heatmap = require("../models/heatmapModel");

// Add new heatmap data
exports.createHeatmap = async (req, res) => {
  try {
    const {
      type,
      stateName,
      cityName,
      area,
      year,
      leastRent,
      highestRent,
      avgRent,
      supply,
      demand,
      phoneNumber,
      email,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!type || !stateName || !cityName || !area || !year) {
      return res.status(400).json({
        success: false,
        message: "Type, State Name, City Name, Area, and Year are required",
      });
    }

    // Validate type
    if (!["rental", "demand_supply"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'rental' or 'demand_supply'",
      });
    }

    // Validate type-specific fields
    if (type === "rental") {
      if (
        typeof leastRent !== "number" ||
        typeof highestRent !== "number" ||
        typeof avgRent !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "For rental type: leastRent, highestRent, and avgRent are required numbers",
        });
      }
    }

    if (type === "demand_supply") {
      if (typeof supply !== "number" || typeof demand !== "number") {
        return res.status(400).json({
          success: false,
          message:
            "For demand_supply type: supply and demand are required numbers",
        });
      }
    }

    const heatmapData = new Heatmap({
      type,
      stateName,
      cityName,
      area,
      year,
      ...(type === "rental" && { leastRent, highestRent, avgRent }),
      ...(type === "demand_supply" && { supply, demand }),
      phoneNumber: phoneNumber || "7339544927",
      email: email || "info@abacuspaces.com",
      latitude,
      longitude,
    });

    const savedHeatmap = await heatmapData.save();

    res.status(201).json({
      success: true,
      message: "Heatmap data created successfully",
      data: savedHeatmap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all heatmap data with optional filtering
exports.getAllHeatmap = async (req, res) => {
  try {
    const { type, stateName, cityName, area, year } = req.query;

    const filter = {};

    if (type) {
      if (!["rental", "demand_supply"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be either 'rental' or 'demand_supply'",
        });
      }
      filter.type = type;
    }

    if (stateName) filter.stateName = { $regex: stateName, $options: "i" };
    if (cityName) filter.cityName = { $regex: cityName, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (year) filter.year = parseInt(year);

    filter.isActive = true;

    const heatmapData = await Heatmap.find(filter).sort({
      year: -1,
      stateName: 1,
    });

    res.status(200).json({
      success: true,
      count: heatmapData.length,
      data: heatmapData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get rental heatmap data
exports.getRentalHeatmap = async (req, res) => {
  try {
    const { stateName, cityName, area, year } = req.query;

    const filter = { type: "rental", isActive: true };

    if (stateName) filter.stateName = { $regex: stateName, $options: "i" };
    if (cityName) filter.cityName = { $regex: cityName, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (year) filter.year = parseInt(year);

    const heatmapData = await Heatmap.find(filter).sort({
      year: -1,
      stateName: 1,
    });

    res.status(200).json({
      success: true,
      count: heatmapData.length,
      data: heatmapData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get demand and supply heatmap data
exports.getDemandSupplyHeatmap = async (req, res) => {
  try {
    const { stateName, cityName, area, year } = req.query;

    const filter = { type: "demand_supply", isActive: true };

    if (stateName) filter.stateName = { $regex: stateName, $options: "i" };
    if (cityName) filter.cityName = { $regex: cityName, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (year) filter.year = parseInt(year);

    const heatmapData = await Heatmap.find(filter).sort({
      year: -1,
      stateName: 1,
    });

    res.status(200).json({
      success: true,
      count: heatmapData.length,
      data: heatmapData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single heatmap data by ID
exports.getHeatmapById = async (req, res) => {
  try {
    const { id } = req.params;

    const heatmap = await Heatmap.findById(id);

    if (!heatmap) {
      return res.status(404).json({
        success: false,
        message: "Heatmap data not found",
      });
    }

    res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update heatmap data
exports.updateHeatmap = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent type changes
    if (updateData.type) {
      const existingHeatmap = await Heatmap.findById(id);
      if (existingHeatmap && existingHeatmap.type !== updateData.type) {
        return res.status(400).json({
          success: false,
          message: "Cannot change the type of existing heatmap data",
        });
      }
    }

    const updatedHeatmap = await Heatmap.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHeatmap) {
      return res.status(404).json({
        success: false,
        message: "Heatmap data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Heatmap data updated successfully",
      data: updatedHeatmap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete heatmap data (soft delete)
exports.deleteHeatmap = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedHeatmap = await Heatmap.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!deletedHeatmap) {
      return res.status(404).json({
        success: false,
        message: "Heatmap data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Heatmap data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk create heatmap data
exports.bulkCreateHeatmap = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data must be a non-empty array",
      });
    }

    // Add default values for phoneNumber and email if not provided
    const processedData = data.map((item) => ({
      ...item,
      phoneNumber: item.phoneNumber || "7339544927",
      email: item.email || "info@abacuspaces.com",
    }));

    const createdHeatmaps = await Heatmap.insertMany(processedData);

    res.status(201).json({
      success: true,
      message: `${createdHeatmaps.length} heatmap records created successfully`,
      count: createdHeatmaps.length,
      data: createdHeatmaps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get heatmap data by state
exports.getHeatmapByState = async (req, res) => {
  try {
    const { stateName, type } = req.query;

    if (!stateName) {
      return res.status(400).json({
        success: false,
        message: "State name is required",
      });
    }

    const filter = {
      stateName: { $regex: stateName, $options: "i" },
      isActive: true,
    };

    if (type) {
      if (!["rental", "demand_supply"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be either 'rental' or 'demand_supply'",
        });
      }
      filter.type = type;
    }

    const heatmapData = await Heatmap.find(filter).sort({
      year: -1,
      cityName: 1,
    });

    res.status(200).json({
      success: true,
      count: heatmapData.length,
      data: heatmapData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
