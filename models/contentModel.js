const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Content type is required"],
      enum: {
        values: ["Blog", "Research Report", "Industrial Update", "News"],
        message: "Type must be Blog, Research Report, Industrial Update, or News",
      },
      trim: true,
    },
    sector: {
      type: String,
      required: [true, "Sector is required"],
      enum: {
        values: [
          "Retail",
          "Office Space",
          "BTS",
          "Managed Office Setup",
          "Hospitality",
          "Healthcare",
          "General",
        ],
        message: "Invalid sector",
      },
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    text: {
      type: String,
      required: [true, "Content text is required"],
      trim: true,
      maxlength: [50000, "Content cannot exceed 50000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      publicId: {
        type: String,
        required: [true, "Image public ID is required"],
      },
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
    },
    author: {
      type: String,
      default: "Abacus Spaces",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from title before saving
contentSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Add timestamp to ensure uniqueness
    this.slug = `${this.slug}-${Date.now()}`;
  }
  next();
});

// Index for better query performance
contentSchema.index({ type: 1, sector: 1, status: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ slug: 1 });
contentSchema.index({ date: -1 });

// Virtual for formatted date
contentSchema.virtual("formattedDate").get(function () {
  return this.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for short text preview
contentSchema.virtual("excerpt").get(function () {
  return this.text.length > 200
    ? this.text.substring(0, 200) + "..."
    : this.text;
});

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;