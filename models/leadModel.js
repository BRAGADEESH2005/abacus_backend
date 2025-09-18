const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  // User Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  designation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  
  // Space Requirements
  spaceRequirements: {
    workstations: {
      type: { type: String, enum: ['compact', 'standard', 'spacious'], default: 'compact' },
      persons: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    },
    cabins: {
      count: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    },
    reception: {
      count: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    },
    pantry: {
      type: { type: String, enum: ['10pax', '30pax'], default: '10pax' },
      count: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    },
    conferenceRoom: {
      type: { type: String, enum: ['7pax', '12pax'], default: '7pax' },
      count: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    },
    serverRoom: {
      count: { type: Number, default: 0 },
      area: { type: Number, default: 0 }
    }
  },
  
  // Calculated Results
  totalArea: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Source tracking
  source: {
    type: String,
    required: true,
    enum: ['spacecalculator', 'contactform', 'inquiry', 'direct'],
    default: 'spacecalculator'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'closed_won', 'closed_lost'],
    default: 'new'
  },
  
  // Admin notes
  notes: {
    type: String,
    default: ''
  },
  
  // Follow-up tracking
  followUpDate: {
    type: Date,
    default: null
  },
  
  // Email sent tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  
  // IP address for tracking
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ email: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for formatted total area
leadSchema.virtual('formattedTotalArea').get(function() {
  return `${this.totalArea.toLocaleString()} sq.ft`;
});

// Method to get space breakdown summary
leadSchema.methods.getSpaceBreakdown = function() {
  const breakdown = [];
  const { spaceRequirements } = this;
  
  if (spaceRequirements.workstations.persons > 0) {
    breakdown.push(`${spaceRequirements.workstations.persons} Workstations (${spaceRequirements.workstations.type})`);
  }
  
  if (spaceRequirements.cabins.count > 0) {
    breakdown.push(`${spaceRequirements.cabins.count} Cabin(s)`);
  }
  
  if (spaceRequirements.reception.count > 0) {
    breakdown.push(`${spaceRequirements.reception.count} Reception(s)`);
  }
  
  if (spaceRequirements.pantry.count > 0) {
    breakdown.push(`${spaceRequirements.pantry.count} Pantry(s) (${spaceRequirements.pantry.type})`);
  }
  
  if (spaceRequirements.conferenceRoom.count > 0) {
    breakdown.push(`${spaceRequirements.conferenceRoom.count} Conference Room(s) (${spaceRequirements.conferenceRoom.type})`);
  }
  
  if (spaceRequirements.serverRoom.count > 0) {
    breakdown.push(`${spaceRequirements.serverRoom.count} Server Room(s)`);
  }
  
  return breakdown;
};

module.exports = mongoose.model("Lead", leadSchema);