const Lead = require("../models/leadModel");
const nodemailer = require("nodemailer");

// Email configuration for Hostinger
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === "true" || true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generate email template for space calculator
const generateSpaceCalculatorEmailTemplate = (lead) => {
  const spaceBreakdown = lead.getSpaceBreakdown();

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
        .space-item { background: #f0f9ff; padding: 10px; margin: 5px 0; border-left: 4px solid #23c6a4; }
        .total-area { font-size: 24px; font-weight: bold; color: #1a2f5c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 New Space Calculator Inquiry</h1>
          <p>A potential client has used the Space Calculator on your website</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <h2>👤 Client Information</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Company:</strong> ${lead.company}</p>
            <p><strong>Designation:</strong> ${lead.designation}</p>
            <p><strong>Phone:</strong> ${lead.phone}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
          </div>
          
          <div class="highlight">
            <h2>📏 Total Space Required</h2>
            <div class="total-area">${lead.formattedTotalArea}</div>
            <p>Approximately ${Math.ceil(lead.totalArea / 1000)} thousand square feet</p>
          </div>
          
          <div class="info-section">
            <h2>🏗️ Space Breakdown</h2>
            ${spaceBreakdown.map((item) => `<div class="space-item">• ${item}</div>`).join("")}
          </div>
          
          <div class="info-section">
            <h2>🕒 Inquiry Details</h2>
            <p><strong>Source:</strong> Space Calculator</p>
            <p><strong>Date & Time:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> New Lead</p>
          </div>
        </div>
        
        <div class="footer">
          <p>💼 <strong>Action Required:</strong> Please follow up with this potential client within 24 hours</p>
          <p>📧 Reply to: ${lead.email} | 📞 Call: ${lead.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate email template for property report requests
const generatePropertyReportEmailTemplate = (lead, propertyDetails) => {
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
        .property-item { background: #f0f9ff; padding: 10px; margin: 5px 0; border-left: 4px solid #23c6a4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 New Property Report Request</h1>
          <p>A potential client has requested a property report from your listings</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <h2>👤 Client Information</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Company:</strong> ${lead.company}</p>
            <p><strong>Designation:</strong> ${lead.designation}</p>
            <p><strong>Phone:</strong> ${lead.phone}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
          </div>
          
          <div class="highlight">
            <h2>🏢 Requested Property</h2>
            <h3>${propertyDetails.title}</h3>
            <p><strong>Property Code:</strong> ${propertyDetails.propertyCode}</p>
          </div>
          
          <div class="info-section">
            <h2>🏗️ Property Details</h2>
            <div class="property-item">📍 <strong>Location:</strong> ${propertyDetails.location}</div>
            <div class="property-item">📐 <strong>Area:</strong> ${propertyDetails.area}</div>
            <div class="property-item">💰 <strong>Price:</strong> ${propertyDetails.price}</div>
            <div class="property-item">🏗️ <strong>Type:</strong> ${propertyDetails.type}</div>
            ${
              propertyDetails.features && propertyDetails.features.length > 0
                ? `
              <div class="property-item">✨ <strong>Features:</strong> ${propertyDetails.features.join(", ")}</div>
            `
                : ""
            }
          </div>
          
          <div class="info-section">
            <h2>🕒 Request Details</h2>
            <p><strong>Source:</strong> Property Report Request</p>
            <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> New Lead</p>
          </div>
        </div>
        
        <div class="footer">
          <p>💼 <strong>Action Required:</strong> Please send the property report and follow up within 24 hours</p>
          <p>📧 Reply to: ${lead.email} | 📞 Call: ${lead.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate email template for user registration
const generateUserRegistrationEmailTemplate = (userInfo) => {
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
        .user-badge { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 New Website Visitor Registration</h1>
          <p>A new visitor has registered on your website</p>
        </div>
        
        <div class="content">
          <div class="user-badge">🎯</div>
          
          <div class="highlight">
            <h2>New Potential Client</h2>
            <p><strong>${userInfo.name}</strong> from <strong>${userInfo.company}</strong></p>
          </div>
          
          <div class="info-section">
            <h2>👤 User Information</h2>
            <p><strong>Name:</strong> ${userInfo.name}</p>
            <p><strong>Company:</strong> ${userInfo.company}</p>
            <p><strong>Designation:</strong> ${userInfo.designation}</p>
            <p><strong>Phone:</strong> ${userInfo.phone}</p>
            <p><strong>Email:</strong> ${userInfo.email}</p>
          </div>
          
          <div class="info-section">
            <h2>🕒 Registration Details</h2>
            <p><strong>Source:</strong> Website Home Page</p>
            <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> New Lead - Website Visitor</p>
          </div>
          
          <div class="info-section">
            <h2>💡 Recommended Actions</h2>
            <ul>
              <li>Send a welcome email with company introduction</li>
              <li>Share available property listings</li>
              <li>Schedule a consultation call</li>
              <li>Add to CRM for regular follow-ups</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>💼 <strong>Priority Action Required:</strong> Welcome this new visitor within 2 hours</p>
          <p>📧 Email: ${userInfo.email} | 📞 Phone: ${userInfo.phone}</p>
          <p><em>First impressions matter - reach out promptly!</em></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const {
      userInfo,
      spaceData,
      totalArea,
      propertyDetails,
      source,
      requestType,
    } = req.body;
    console.log("Received lead creation request:", {
      userInfo,
      spaceData,
      totalArea,
      propertyDetails,
      source,
      requestType,
    });
    // Validate userInfo is present
    if (!userInfo) {
      return res.status(400).json({
        success: false,
        message: "User information is required",
      });
    }

    // Validate userInfo fields
    if (
      !userInfo.name ||
      !userInfo.company ||
      !userInfo.designation ||
      !userInfo.phone ||
      !userInfo.email
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required user information",
      });
    }

    // Get client IP address
    const ipAddress =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "unknown";

    let leadData;
    let emailTemplate;
    let emailSubject;
    let clientEmailSubject;
    let clientEmailContent;

    // Handle different types of requests
    if (requestType === "user_registration") {
      // User registration from home page popup
      leadData = {
        name: userInfo.name,
        company: userInfo.company,
        designation: userInfo.designation,
        phone: userInfo.phone,
        email: userInfo.email,
        spaceRequirements: {
          workstations: { type: "compact", persons: 0, area: 0 },
          cabins: { count: 0, area: 0 },
          reception: { count: 0, area: 0 },
          pantry: { type: "10pax", count: 0, area: 0 },
          conferenceRoom: { type: "7pax", count: 0, area: 0 },
          serverRoom: { count: 0, area: 0 },
        },
        totalArea: 0,
        source: source || "home_login",
        ipAddress: ipAddress,
        status: "new",
      };

      emailSubject = `👋 New Website Visitor - ${userInfo.company} - ${userInfo.name}`;
      clientEmailSubject = `Welcome to Abacus Spaces! 🏢`;
      clientEmailContent = `
        <div class="highlight">
          <h3>Thank You for Registering!</h3>
          <p>We're excited to help you find the perfect commercial space for <strong>${userInfo.company}</strong></p>
        </div>
        <div class="info-section">
          <h3>What's Next?</h3>
          <ul>
            <li>🏢 Browse our premium commercial properties</li>
            <li>📊 Use our Space Calculator to estimate your requirements</li>
            <li>📞 Our team will contact you within 24 hours</li>
            <li>📍 Schedule a site visit at your convenience</li>
          </ul>
        </div>
      `;
    } else if (requestType === "property_report" && propertyDetails) {
      // Property report request
      leadData = {
        name: userInfo.name,
        company: userInfo.company,
        designation: userInfo.designation,
        phone: userInfo.phone,
        email: userInfo.email,
        spaceRequirements: {
          workstations: { type: "compact", persons: 0, area: 0 },
          cabins: { count: 0, area: 0 },
          reception: { count: 0, area: 0 },
          pantry: { type: "10pax", count: 0, area: 0 },
          conferenceRoom: { type: "7pax", count: 0, area: 0 },
          serverRoom: { count: 0, area: 0 },
        },
        totalArea: 0,
        source: source || "propertyreport",
        ipAddress: ipAddress,
        propertyDetails: propertyDetails,
      };

      emailSubject = `📄 Property Report Request - ${propertyDetails.title} - ${userInfo.company}`;
      clientEmailSubject = `Thank you for your property report request - Abacus Spaces`;
      clientEmailContent = `
        <div class="highlight">
          <h3>Requested Property</h3>
          <h4>${propertyDetails.title}</h4>
          <p>${propertyDetails.location} • ${propertyDetails.area} • ${propertyDetails.price}</p>
          <p><strong>Property Code:</strong> ${propertyDetails.propertyCode}</p>
        </div>
      `;
    } else if (spaceData && totalArea !== undefined) {
      // Space calculator request
      leadData = {
        name: userInfo.name,
        company: userInfo.company,
        designation: userInfo.designation,
        phone: userInfo.phone,
        email: userInfo.email,
        spaceRequirements: spaceData,
        totalArea: totalArea,
        source: source || "spacecalculator",
        ipAddress: ipAddress,
      };

      emailSubject = `🏢 New Space Calculator Inquiry - ${userInfo.company}`;
      clientEmailSubject = `Thank you for your space calculation inquiry - Abacus Spaces`;
      clientEmailContent = `
        <div class="highlight">
          <h3>Your Space Calculation</h3>
          <div class="total-area">${totalArea.toLocaleString()} sq.ft</div>
          <p>Total area required for ${userInfo.company}</p>
        </div>
      `;
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request: Missing space data, property details, or request type",
      });
    }

    const newLead = new Lead(leadData);
    const savedLead = await newLead.save();

    console.log(
      `New lead created: ${savedLead._id} for ${userInfo.company} (${savedLead.source})`,
    );

    // Send email notification to admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = createEmailTransporter();

        // Generate appropriate email template
        if (requestType === "user_registration") {
          emailTemplate = generateUserRegistrationEmailTemplate(userInfo);
        } else if (requestType === "property_report") {
          emailTemplate = generatePropertyReportEmailTemplate(
            savedLead,
            propertyDetails,
          );
        } else {
          emailTemplate = generateSpaceCalculatorEmailTemplate(savedLead);
        }

        const mailOptions = {
          from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: emailSubject,
          html: emailTemplate,
        };

        await transporter.sendMail(mailOptions);

        // Update lead to mark email as sent
        savedLead.emailSent = true;
        await savedLead.save();

        console.log(`Admin email notification sent for lead: ${savedLead._id}`);
      } catch (emailError) {
        console.error("Admin email sending failed:", emailError.message);
        // Don't fail the request if email fails
      }

      // Send auto-response to client
      try {
        const transporter = createEmailTransporter();

        const clientMailOptions = {
          from: `"Abacus Spaces" <${process.env.EMAIL_USER}>`,
          to: userInfo.email,
          subject: clientEmailSubject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #23c6a4, #1a2f5c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; }
                .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
                .highlight { background: #23c6a4; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
                .info-section { background: white; margin: 15px 0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .total-area { font-size: 24px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${requestType === "user_registration" ? "🎉 Welcome to Abacus Spaces!" : "🏢 Thank You for Your Inquiry!"}</h1>
                  <p>Abacus Spaces - Spaces That Mean Business</p>
                </div>
                
                <div class="content">
                  <h2>Dear ${userInfo.name},</h2>
                  
                  <p>${
                    requestType === "user_registration"
                      ? "Thank you for registering with us! We're thrilled to have you explore our commercial real estate offerings."
                      : "Thank you for your inquiry! We've received your request and our team is reviewing it."
                  }</p>
                  
                  ${clientEmailContent}
                  
                  <div class="info-section">
                    <p><strong>What happens next?</strong></p>
                    <ul>
                      <li>Our team will review your ${requestType === "user_registration" ? "profile" : "requirements"} within 24 hours</li>
                      <li>We'll contact you to discuss available options</li>
                      <li>Schedule a site visit if needed</li>
                      <li>Provide you with ${requestType === "property_report" ? "detailed property information" : requestType === "user_registration" ? "personalized recommendations" : "customized proposals"}</li>
                    </ul>
                  </div>
                  
                  <p>In the meantime, feel free to browse our available listings or contact us directly:</p>
                  <p>📞 Phone: +91 9876543210<br>
                  📧 Email: info@abacuspaces.com<br>
                  🌐 Website: www.abacuspaces.com</p>
                </div>
                
                <div class="footer">
                  <p>${
                    requestType === "user_registration"
                      ? "🎯 Start exploring premium commercial spaces today!"
                      : "💼 We look forward to helping you find the perfect workspace!"
                  }</p>
                  <p><strong>Abacus Spaces</strong> - Your trusted partner in commercial real estate</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        await transporter.sendMail(clientMailOptions);
        console.log(`Client auto-response sent to: ${userInfo.email}`);
      } catch (emailError) {
        console.error("Client auto-response failed:", emailError.message);
      }
    } else {
      console.warn("Email configuration missing - emails not sent");
    }

    res.status(201).json({
      success: true,
      message:
        requestType === "user_registration"
          ? "Registration successful! Welcome to Abacus Spaces"
          : requestType === "property_report"
            ? "Property report request submitted successfully"
            : "Space calculation saved successfully",
      data: {
        leadId: savedLead._id,
        totalArea: savedLead.totalArea,
        formattedTotalArea:
          savedLead.formattedTotalArea || `${savedLead.totalArea} sq.ft`,
        source: savedLead.source,
        requestType: requestType,
      },
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save request",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get all leads (for admin)
const getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // Add filters
    if (req.query.source) {
      filter.source = req.query.source;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

// Get single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error.message,
    });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes, followUpDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
};
