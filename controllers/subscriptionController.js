const Subscription = require("../models/subscriptionModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email configuration for Hostinger
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === "true" || true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generate welcome email template for subscriber
const generateSubscriberWelcomeEmail = (email) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #23c6a4, #1a2f5c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        .welcome-badge { font-size: 64px; text-align: center; margin: 20px 0; }
        .info-section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .benefit-item { background: #f0f9ff; padding: 15px; margin: 10px 0; border-left: 4px solid #23c6a4; border-radius: 4px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #23c6a4, #1a2f5c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
        .social-links { text-align: center; margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #23c6a4; text-decoration: none; font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="welcome-badge">🎉</div>
          <h1>Welcome to Abacus Spaces!</h1>
          <p>Thank you for subscribing to our newsletter</p>
        </div>
        
        <div class="content">
          <h2>Hello Subscriber,</h2>
          
          <p>We're thrilled to have you join the Abacus Spaces community! You've successfully subscribed to receive the latest updates, insights, and opportunities in commercial real estate.</p>
          
          <div class="info-section">
            <h3>📧 What You'll Receive:</h3>
            
            <div class="benefit-item">
              <strong>📊 Research Reports</strong><br>
              In-depth market analysis and trends in commercial real estate
            </div>
            
            <div class="benefit-item">
              <strong>📝 Blog Updates</strong><br>
              Expert insights, tips, and best practices for your business space needs
            </div>
            
            <div class="benefit-item">
              <strong>🏢 Industrial Updates</strong><br>
              Latest developments and opportunities in the commercial property sector
            </div>
            
            <div class="benefit-item">
              <strong>🔔 Property Alerts</strong><br>
              Exclusive first look at new premium listings and opportunities
            </div>
            
            <div class="benefit-item">
              <strong>📰 Monthly Newsletter</strong><br>
              Curated content and updates delivered straight to your inbox
            </div>
          </div>
          
          <div class="info-section" style="text-align: center;">
            <h3>Explore Our Offerings</h3>
            <p>Discover premium commercial spaces perfect for your business</p>
            <a href="https://www.abacuspaces.com/listings" class="cta-button">Browse Properties</a>
          </div>
          
          <div class="info-section">
            <h3>Stay Connected</h3>
            <p>Follow us on social media for daily updates and insights:</p>
            <div class="social-links">
              <a href="https://linkedin.com/company/abacus-spaces" title="LinkedIn">💼</a>
              <a href="https://www.instagram.com/abacus_spaces" title="Instagram">📸</a>
              <a href="https://twitter.com/abacus_spaces" title="Twitter">🐦</a>
            </div>
          </div>
          
          <p style="margin-top: 30px;">
            <strong>Need assistance?</strong><br>
            Our team is here to help you find the perfect commercial space.<br>
            📞 Phone: +91 7339544927<br>
            📧 Email: info@abacuspaces.com<br>
            🌐 Website: www.abacuspaces.com
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Abacus Spaces</strong> - Spaces That Mean Business</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            You're receiving this email because you subscribed to Abacus Spaces updates.<br>
            Don't want to receive these emails? <a href="https://www.abacuspaces.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #23c6a4;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate admin notification email
const generateAdminSubscriptionNotification = (subscription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #23c6a4, #1a2f5c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .info-section { background: white; margin: 15px 0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .highlight { background: #23c6a4; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .badge { display: inline-block; background: #f0f9ff; color: #1a2f5c; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Newsletter Subscription!</h1>
          <p>Someone just subscribed to your mailing list</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <h2>New Subscriber</h2>
            <h3 style="margin: 10px 0;">${subscription.email}</h3>
          </div>
          
          <div class="info-section">
            <h3>📊 Subscription Details</h3>
            <p><strong>Email:</strong> ${subscription.email}</p>
            <p><strong>Source:</strong> <span class="badge">${subscription.source}</span></p>
            <p><strong>Status:</strong> <span class="badge" style="background: #d4edda; color: #155724;">Active</span></p>
            <p><strong>Subscribed On:</strong> ${new Date(subscription.createdAt).toLocaleString()}</p>
            ${subscription.metadata?.name ? `<p><strong>Name:</strong> ${subscription.metadata.name}</p>` : ""}
            ${subscription.metadata?.company ? `<p><strong>Company:</strong> ${subscription.metadata.company}</p>` : ""}
            ${subscription.metadata?.location ? `<p><strong>Location:</strong> ${subscription.metadata.location}</p>` : ""}
          </div>
          
          <div class="info-section">
            <h3>✅ Subscription Preferences</h3>
            <p>
              ${subscription.preferences.research_reports ? "✓ Research Reports<br>" : ""}
              ${subscription.preferences.blog_updates ? "✓ Blog Updates<br>" : ""}
              ${subscription.preferences.industrial_updates ? "✓ Industrial Updates<br>" : ""}
              ${subscription.preferences.property_alerts ? "✓ Property Alerts<br>" : ""}
              ${subscription.preferences.newsletter ? "✓ Newsletter<br>" : ""}
            </p>
          </div>
          
          <div class="info-section">
            <h3>🌐 Technical Details</h3>
            <p><strong>IP Address:</strong> ${subscription.ipAddress || "N/A"}</p>
            <p><strong>User Agent:</strong> ${subscription.userAgent ? subscription.userAgent.substring(0, 80) + "..." : "N/A"}</p>
            <p><strong>Subscription ID:</strong> ${subscription._id}</p>
          </div>
          
          <div class="info-section">
            <h3>💡 Next Steps</h3>
            <ul>
              <li>Welcome email has been sent automatically to the subscriber</li>
              <li>Add this subscriber to your email marketing campaigns</li>
              <li>Consider sending personalized property recommendations</li>
              <li>Monitor engagement metrics in the admin dashboard</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>📊 <strong>Subscription Management System</strong></p>
          <p>View all subscriptions in your admin dashboard</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Subscribe - Create new subscription
const subscribe = async (req, res) => {
  try {
    const {
      email,
      source = "footer",
      metadata = {},
      preferences = {},
    } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email already exists
    const existingSubscription = await Subscription.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingSubscription) {
      // If previously unsubscribed, reactivate
      if (existingSubscription.status === "unsubscribed") {
        await existingSubscription.resubscribe();

        // Send welcome back email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          try {
            const transporter = createEmailTransporter();
            const welcomeEmail = generateSubscriberWelcomeEmail(
              existingSubscription.email,
            );

            await transporter.sendMail({
              from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
              to: existingSubscription.email,
              subject: "🎉 Welcome Back to Abacus Spaces!",
              html: welcomeEmail,
            });

            console.log(
              `Welcome back email sent to: ${existingSubscription.email}`,
            );
          } catch (emailError) {
            console.error("Welcome back email failed:", emailError.message);
          }
        }

        return res.status(200).json({
          success: true,
          message: "Welcome back! You've been resubscribed successfully.",
          data: existingSubscription,
        });
      }

      // If already active
      if (existingSubscription.status === "active") {
        return res.status(200).json({
          success: true,
          message: "You're already subscribed to our updates!",
          data: existingSubscription,
        });
      }
    }

    // Get IP address
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Get user agent
    const userAgent = req.headers["user-agent"];

    // Create new subscription
    const subscription = new Subscription({
      email: email.toLowerCase().trim(),
      source,
      metadata,
      preferences: {
        research_reports: true,
        blog_updates: true,
        industrial_updates: true,
        property_alerts: true,
        newsletter: true,
        ...preferences,
      },
      ipAddress,
      userAgent,
      verifiedAt: new Date(),
    });

    await subscription.save();

    console.log(
      `New subscription created: ${subscription._id} - ${subscription.email}`,
    );

    // Send emails
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Send welcome email to subscriber
      try {
        const transporter = createEmailTransporter();
        const welcomeEmail = generateSubscriberWelcomeEmail(subscription.email);

        await transporter.sendMail({
          from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
          to: subscription.email,
          subject: "🎉 Welcome to Abacus Spaces Newsletter!",
          html: welcomeEmail,
        });

        console.log(`Welcome email sent to: ${subscription.email}`);
      } catch (emailError) {
        console.error("Welcome email failed:", emailError.message);
        // Don't fail the request if email fails
      }

      // Send notification to admin
      try {
        const transporter = createEmailTransporter();
        const adminNotification =
          generateAdminSubscriptionNotification(subscription);

        await transporter.sendMail({
          from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `📧 New Newsletter Subscription - ${subscription.email}`,
          html: adminNotification,
        });

        console.log(
          `Admin notification sent for subscription: ${subscription._id}`,
        );
      } catch (emailError) {
        console.error("Admin notification failed:", emailError.message);
      }
    } else {
      console.warn("Email configuration missing - emails not sent");
    }

    res.status(201).json({
      success: true,
      message:
        "Thank you for subscribing! You'll receive our latest updates soon.",
      data: {
        email: subscription.email,
        status: subscription.status,
        createdAt: subscription.createdAt,
      },
    });
  } catch (error) {
    console.error("Error subscribing:", error);

    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
      error: error.message,
    });
  }
};

// Unsubscribe
const unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email && !token) {
      return res.status(400).json({
        success: false,
        message: "Email or unsubscribe token is required",
      });
    }

    // Find subscription by email or token
    let subscription;
    if (token) {
      subscription = await Subscription.findOne({ verificationToken: token });
    } else {
      subscription = await Subscription.findOne({
        email: email.toLowerCase().trim(),
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.status === "unsubscribed") {
      return res.status(200).json({
        success: true,
        message: "You're already unsubscribed",
      });
    }

    await subscription.unsubscribe(req.body.reason);

    console.log(`Subscription unsubscribed: ${subscription.email}`);

    // Send confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = createEmailTransporter();

        await transporter.sendMail({
          from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
          to: subscription.email,
          subject: "Unsubscribe Confirmation - Abacus Spaces",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #333; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>👋 Unsubscribe Confirmation</h1>
                </div>
                <div class="content">
                  <p>You've been successfully unsubscribed from Abacus Spaces newsletter.</p>
                  <p>We're sorry to see you go! You will no longer receive marketing emails from us.</p>
                  <p>If you change your mind, you can always resubscribe by visiting our website.</p>
                  <p style="margin-top: 30px;">Thank you for your time with Abacus Spaces!</p>
                </div>
                <div class="footer">
                  <p><strong>Abacus Spaces</strong></p>
                  <p>🌐 www.abacuspaces.com</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Unsubscribe confirmation sent to: ${subscription.email}`);
      } catch (emailError) {
        console.error(
          "Unsubscribe confirmation email failed:",
          emailError.message,
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "You've been unsubscribed successfully. We're sorry to see you go!",
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
      error: error.message,
    });
  }
};

// Get all subscriptions (Admin)
const getSubscriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      source,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { "metadata.name": { $regex: search, $options: "i" } },
        { "metadata.company": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const subscriptions = await Subscription.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-verificationToken -__v")
      .exec();

    // Get total count
    const total = await Subscription.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

// Get subscription statistics (Admin)
const getStatistics = async (req, res) => {
  try {
    const stats = await Subscription.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Update subscription (Admin)
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates._id;

    const subscription = await Subscription.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subscription",
      error: error.message,
    });
  }
};

// Delete subscription (Admin)
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subscription",
      error: error.message,
    });
  }
};

// Export subscriptions to CSV (Admin)
const exportSubscriptions = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    const subscriptions = await Subscription.find({ status })
      .select("email createdAt source metadata.name metadata.company")
      .sort({ createdAt: -1 });

    // Create CSV content
    let csv = "Email,Name,Company,Source,Subscribed Date\n";
    subscriptions.forEach((sub) => {
      csv += `${sub.email},${sub.metadata?.name || ""},${sub.metadata?.company || ""},${sub.source},${sub.createdAt.toISOString().split("T")[0]}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=subscriptions-${Date.now()}.csv`,
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export subscriptions",
      error: error.message,
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscriptions,
  getStatistics,
  updateSubscription,
  deleteSubscription,
  exportSubscriptions,
};
