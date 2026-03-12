const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      validate: {
        validator: function (email) {
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },

    // Subscription status
    status: {
      type: String,
      enum: ["active", "unsubscribed", "bounced"],
      default: "active",
    },

    // Source tracking - where did the subscription come from
    source: {
      type: String,
      enum: ["footer", "popup", "landing_page", "manual", "api"],
      default: "footer",
    },

    // Subscription preferences (for future use)
    preferences: {
      research_reports: {
        type: Boolean,
        default: true,
      },
      blog_updates: {
        type: Boolean,
        default: true,
      },
      industrial_updates: {
        type: Boolean,
        default: true,
      },
      property_alerts: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: true,
      },
    },

    // User metadata (optional)
    metadata: {
      name: { type: String, default: null },
      company: { type: String, default: null },
      location: { type: String, default: null },
      interests: [{ type: String }],
    },

    // Tracking information
    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    // Engagement tracking
    lastEmailSent: {
      type: Date,
      default: null,
    },

    emailsSent: {
      type: Number,
      default: 0,
    },

    emailsOpened: {
      type: Number,
      default: 0,
    },

    linksClicked: {
      type: Number,
      default: 0,
    },

    // Unsubscribe information
    unsubscribedAt: {
      type: Date,
      default: null,
    },

    unsubscribeReason: {
      type: String,
      default: null,
    },

    // Verification token for email verification (optional)
    verificationToken: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true, // Set to false if you want to implement email verification
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Admin notes
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ createdAt: -1 });
subscriptionSchema.index({ source: 1 });

// Virtual for subscription age
subscriptionSchema.virtual("subscriptionAge").get(function () {
  if (!this.createdAt) return 0;
  const diffTime = Math.abs(new Date() - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to mark as unsubscribed
subscriptionSchema.methods.unsubscribe = function (reason = null) {
  this.status = "unsubscribed";
  this.unsubscribedAt = new Date();
  if (reason) this.unsubscribeReason = reason;
  return this.save();
};

// Method to resubscribe
subscriptionSchema.methods.resubscribe = function () {
  this.status = "active";
  this.unsubscribedAt = null;
  this.unsubscribeReason = null;
  return this.save();
};

// Static method to get active subscribers count
subscriptionSchema.statics.getActiveCount = function () {
  return this.countDocuments({ status: "active" });
};

// Static method to get statistics
subscriptionSchema.statics.getStatistics = async function () {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ status: "active" });
  const unsubscribed = await this.countDocuments({ status: "unsubscribed" });
  const bounced = await this.countDocuments({ status: "bounced" });

  // Get subscribers by source
  const bySource = await this.aggregate([
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);

  // Get recent subscribers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSubscribers = await this.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return {
    total,
    active,
    unsubscribed,
    bounced,
    bySource: bySource.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentSubscribers,
  };
};

module.exports = mongoose.model("Subscription", subscriptionSchema);