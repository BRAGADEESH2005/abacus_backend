const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: {
      values: ['Office', 'Retail', 'Co-Working'],
      message: 'Type must be Office, Retail, or Co-Working'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  propertyCode: {
    type: String,
    required: [true, 'Property code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}-[A-Z]-\d{3}$/, 'Invalid property code format'],
    immutable: true // Property code cannot be changed after creation
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true,
    maxlength: [50, 'Area cannot exceed 50 characters']
  },
  price: {
    type: String,
    required: [true, 'Price is required'],
    trim: true,
    maxlength: [100, 'Price cannot exceed 100 characters']
  },
  priceNumeric: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  features: {
    type: [String],
    required: [true, 'At least one feature is required'],
    validate: {
      validator: function(arr) {
        const validFeatures = arr.filter(feature => 
          feature && typeof feature === 'string' && feature.trim() !== ''
        );
        return validFeatures.length > 0;
      },
      message: 'At least one valid feature is required'
    }
  },
  viewsRange: {
    type: [Number],
    default: [100, 300],
    validate: {
      validator: function(arr) {
        return arr && arr.length === 2 && arr[0] >= 0 && arr[1] >= arr[0];
      },
      message: 'Views range must be an array of two non-negative numbers'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
listingSchema.index({ propertyCode: 1 }, { unique: true });
listingSchema.index({ type: 1, location: 1 });
listingSchema.index({ priceNumeric: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ isActive: 1, featured: -1 });

// Text index for search functionality
listingSchema.index({
  title: 'text',
  location: 'text',
  propertyCode: 'text',
  area: 'text',
  features: 'text'
});

// Pre-save middleware to update timestamps and numeric price
listingSchema.pre('save', function(next) {
  // Extract numeric price if not set
  if (!this.priceNumeric && this.price) {
    const numericString = this.price.replace(/[₹,\s]/g, '').replace(/[^\d.]/g, '');
    const numeric = parseFloat(numericString);
    this.priceNumeric = isNaN(numeric) ? 0 : numeric;
  }
  
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;