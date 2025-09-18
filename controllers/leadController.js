const Lead = require("../models/leadModel");
const nodemailer = require("nodemailer");

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({  // Fixed: createTransport instead of createTransporter
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
  });
};

// Generate email template
const generateEmailTemplate = (lead) => {
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
            ${spaceBreakdown.map(item => `<div class="space-item">• ${item}</div>`).join('')}
          </div>
          
          <div class="info-section">
            <h2>📊 Detailed Requirements</h2>
            ${lead.spaceRequirements.workstations.persons > 0 ? `
              <p><strong>Workstations:</strong> ${lead.spaceRequirements.workstations.persons} persons (${lead.spaceRequirements.workstations.type}) - ${lead.spaceRequirements.workstations.area} sq.ft</p>
            ` : ''}
            ${lead.spaceRequirements.cabins.count > 0 ? `
              <p><strong>Cabins:</strong> ${lead.spaceRequirements.cabins.count} cabin(s) - ${lead.spaceRequirements.cabins.area} sq.ft</p>
            ` : ''}
            ${lead.spaceRequirements.reception.count > 0 ? `
              <p><strong>Reception:</strong> ${lead.spaceRequirements.reception.count} reception(s) - ${lead.spaceRequirements.reception.area} sq.ft</p>
            ` : ''}
            ${lead.spaceRequirements.pantry.count > 0 ? `
              <p><strong>Pantry:</strong> ${lead.spaceRequirements.pantry.count} pantry(s) (${lead.spaceRequirements.pantry.type}) - ${lead.spaceRequirements.pantry.area} sq.ft</p>
            ` : ''}
            ${lead.spaceRequirements.conferenceRoom.count > 0 ? `
              <p><strong>Conference Room:</strong> ${lead.spaceRequirements.conferenceRoom.count} room(s) (${lead.spaceRequirements.conferenceRoom.type}) - ${lead.spaceRequirements.conferenceRoom.area} sq.ft</p>
            ` : ''}
            ${lead.spaceRequirements.serverRoom.count > 0 ? `
              <p><strong>Server Room:</strong> ${lead.spaceRequirements.serverRoom.count} room(s) - ${lead.spaceRequirements.serverRoom.area} sq.ft</p>
            ` : ''}
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

// Create new lead
const createLead = async (req, res) => {
  try {
    const { userInfo, spaceData, totalArea } = req.body;
    
    // Validate required fields
    if (!userInfo || !spaceData || !totalArea) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Validate userInfo fields
    if (!userInfo.name || !userInfo.company || !userInfo.designation || 
        !userInfo.phone || !userInfo.email) {
      return res.status(400).json({
        success: false,
        message: "Missing required user information"
      });
    }
    
    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    // Create new lead
    const leadData = {
      name: userInfo.name,
      company: userInfo.company,
      designation: userInfo.designation,
      phone: userInfo.phone,
      email: userInfo.email,
      spaceRequirements: spaceData,
      totalArea: totalArea,
      source: 'spacecalculator',
      ipAddress: ipAddress
    };
    
    const newLead = new Lead(leadData);
    const savedLead = await newLead.save();
    
    console.log(`New lead created: ${savedLead._id} for ${userInfo.company}`);
    
    // Send email notification to admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = createEmailTransporter();
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `🏢 New Space Calculator Inquiry - ${userInfo.company}`,
          html: generateEmailTemplate(savedLead)
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
          from: process.env.EMAIL_USER,
          to: userInfo.email,
          subject: `Thank you for your space calculation inquiry - Abacus Spaces`,
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
                .total-area { font-size: 24px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏢 Thank You for Your Inquiry!</h1>
                  <p>Abacus Spaces - Spaces That Mean Business</p>
                </div>
                
                <div class="content">
                  <h2>Dear ${userInfo.name},</h2>
                  
                  <p>Thank you for using our Space Calculator! We've received your inquiry for office space requirements.</p>
                  
                  <div class="highlight">
                    <h3>Your Space Calculation</h3>
                    <div class="total-area">${savedLead.formattedTotalArea}</div>
                    <p>Total area required for ${userInfo.company}</p>
                  </div>
                  
                  <p><strong>What happens next?</strong></p>
                  <ul>
                    <li>Our team will review your requirements within 24 hours</li>
                    <li>We'll contact you to discuss available options</li>
                    <li>Schedule a site visit if needed</li>
                    <li>Provide you with customized proposals</li>
                  </ul>
                  
                  <p>In the meantime, feel free to browse our available listings or contact us directly:</p>
                  <p>📞 Phone: +91 9876543210<br>
                  📧 Email: info@abacuspaces.com</p>
                </div>
                
                <div class="footer">
                  <p>We look forward to helping you find the perfect workspace!</p>
                  <p><strong>Abacus Spaces</strong> - Your trusted partner in commercial real estate</p>
                </div>
              </div>
            </body>
            </html>
          `
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
      message: "Space calculation saved successfully",
      data: {
        leadId: savedLead._id,
        totalArea: savedLead.totalArea,
        formattedTotalArea: savedLead.formattedTotalArea
      }
    });
    
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save space calculation",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
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
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message
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
        message: "Lead not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error.message
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
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead
    });
    
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus
};