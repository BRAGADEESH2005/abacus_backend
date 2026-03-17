const nodemailer = require("nodemailer");

// Email configuration
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

// Generate email template for contact form
const generateContactEmailTemplate = (formData) => {
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
        .label { font-weight: bold; color: #1a2f5c; }
        .message-box { background: #f0f9ff; padding: 15px; border-left: 4px solid #23c6a4; border-radius: 5px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Contact Form Submission</h1>
          <p>A new message has been received from your contact page</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <h2>👤 Sender Information</h2>
            <p><span class="label">Name:</span> ${formData.name}</p>
            <p><span class="label">Email:</span> ${formData.email}</p>
            <p><span class="label">Phone:</span> ${formData.phone || "Not provided"}</p>
          </div>
          
          <div class="info-section">
            <h2>📌 Subject</h2>
            <p>${formData.subject}</p>
          </div>
          
          <div class="info-section">
            <h2>💬 Message</h2>
            <div class="message-box">${formData.message}</div>
          </div>
          
          <div class="info-section">
            <h2>🕒 Submission Details</h2>
            <p><span class="label">Date & Time:</span> ${new Date().toLocaleString()}</p>
            <p><span class="label">Type:</span> ${formData.type || "General Inquiry"}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>💼 <strong>Action Required:</strong> Please follow up with this inquiry within 24 hours</p>
          <p>📧 Reply to: ${formData.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate auto-reply template for customer
const generateAutoReplyTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #23c6a4, #1a2f5c); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .info-section { background: white; margin: 15px 0; padding: 15px; border-radius: 5px; }
        .highlight { background: #23c6a4; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting Us!</h1>
          <p>We've received your message</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p>Hi <strong>${formData.name}</strong>,</p>
            <p>Thank you for reaching out to us. We have received your inquiry regarding:</p>
            <p><strong>${formData.subject}</strong></p>
            <p>We appreciate your interest and will review your message carefully. Our team will get back to you as soon as possible, typically within 24-48 hours.</p>
          </div>
          
          <div class="highlight">
            <p>📍 <strong>Reference ID:</strong> ${Date.now()}</p>
          </div>
          
          <div class="info-section">
            <h3>Your Contact Details</h3>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
          </div>
          
          <div class="info-section">
            <h3>Need Immediate Assistance?</h3>
            <p>📞 Call us: +91 7339544927</p>
            <p>📧 Email: info@abacuspaces.com</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,</p>
          <p><strong>Abacus Spaces Team</strong></p>
          <p>&copy; 2024 Abacus Spaces. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, subject, message)",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const transporter = createEmailTransporter();

    // Send email to admin
    const adminEmailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "info@abacuspaces.com",
      subject: `New Contact Form: ${subject}`,
      html: generateContactEmailTemplate({ name, email, phone, subject, message, type }),
      replyTo: email,
    };

    // Send auto-reply to customer
    const customerEmailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We've received your message - Abacus Spaces",
      html: generateAutoReplyTemplate({ name, email, phone, subject }),
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminEmailOptions),
      transporter.sendMail(customerEmailOptions),
    ]);

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};