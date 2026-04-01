const mongoose = require("mongoose");

const heatmapSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["rental", "demand_supply"],
      required: true,
    },
    stateName: {
      type: String,
      required: true,
      trim: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // Rental specific fields
    leastRent: {
      type: Number,
      required: function () {
        return this.type === "rental";
      },
    },
    highestRent: {
      type: Number,
      required: function () {
        return this.type === "rental";
      },
    },
    avgRent: {
      type: Number,
      required: function () {
        return this.type === "rental";
      },
    },
    // Demand and Supply specific fields
    supply: {
      type: Number,
      required: function () {
        return this.type === "demand_supply";
      },
    },
    demand: {
      type: Number,
      required: function () {
        return this.type === "demand_supply";
      },
    },
    phoneNumber: {
      type: String,
      default: "7339544927",
      trim: true,
    },
    email: {
      type: String,
      default: "info@abacuspaces.com",
      trim: true,
      lowercase: true,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Create compound index for efficient queries
heatmapSchema.index({ type: 1, stateName: 1, cityName: 1, area: 1, year: 1 });

module.exports = mongoose.model("Heatmap", heatmapSchema);
