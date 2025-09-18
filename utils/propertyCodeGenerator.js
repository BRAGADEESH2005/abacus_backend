const Counter = require('../models/counterModel');

// Location mapping
const locationCodes = {
  'Bangalore': 'BLR',
  'Mumbai': 'MUM',
  'Delhi': 'DEL',
  'Hyderabad': 'HYD',
  'Chennai': 'CHN',
  'Pune': 'PUN',
  'Gurgaon': 'GUR',
  'Noida': 'NOI',
  'Kolkata': 'KOL',
  'Ahmedabad': 'AMD',
  'Kochi': 'KOC',
  'Coimbatore': 'COI',
  'Indore': 'IND',
  'Jaipur': 'JAI',
  'Lucknow': 'LCK',
  'Nagpur': 'NAG',
  'Surat': 'SUR',
  'Vadodara': 'VAD',
  'Visakhapatnam': 'VIZ',
  'Bhubaneswar': 'BBR'
};

// Property type mapping
const typeCodes = {
  'Office': 'O',
  'Retail': 'R',
  'Co-Working': 'C'
};

/**
 * Get location code from location name
 */
const getLocationCode = (location) => {
  // First try exact match
  if (locationCodes[location]) {
    return locationCodes[location];
  }

  // Try case-insensitive match
  const locationKey = Object.keys(locationCodes).find(
    key => key.toLowerCase() === location.toLowerCase()
  );
  
  if (locationKey) {
    return locationCodes[locationKey];
  }

  // If no match found, generate code from first 3 letters
  const generatedCode = location.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  console.warn(`Location code not found for "${location}". Generated: ${generatedCode}`);
  return generatedCode;
};

/**
 * Get property type code from type name
 */
const getTypeCode = (type) => {
  if (typeCodes[type]) {
    return typeCodes[type];
  }

  // Fallback: use first letter
  const generatedCode = type.charAt(0).toUpperCase();
  console.warn(`Type code not found for "${type}". Generated: ${generatedCode}`);
  return generatedCode;
};

/**
 * Generate next sequence number for a given prefix
 */
const getNextSequence = async (prefix) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      prefix,
      { $inc: { sequence: 1 } },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    return counter.sequence;
  } catch (error) {
    console.error('Error getting next sequence:', error);
    throw new Error('Failed to generate sequence number');
  }
};

/**
 * Generate property code - ALWAYS AUTO-GENERATED
 */
const generatePropertyCode = async (location, type) => {
  try {
    // Validate inputs
    if (!location || !type) {
      throw new Error('Location and type are required for property code generation');
    }

    // Get codes
    const locationCode = getLocationCode(location.trim());
    const typeCode = getTypeCode(type.trim());

    // Create prefix
    const prefix = `${locationCode}-${typeCode}`;

    // Get next sequence number
    const sequence = await getNextSequence(prefix);

    // Format sequence with leading zeros (3 digits)
    const formattedSequence = sequence.toString().padStart(3, '0');

    // Create final property code
    const propertyCode = `${prefix}-${formattedSequence}`;

    console.log(`Generated property code: ${propertyCode} for ${location}, ${type}`);
    return propertyCode;

  } catch (error) {
    console.error('Error generating property code:', error);
    throw error;
  }
};

/**
 * Get statistics about property codes
 */
const getPropertyCodeStats = async () => {
  try {
    const counters = await Counter.find({}).sort({ _id: 1 });
    const Listing = require('../models/listingsModel');
    
    const stats = {
      totalCounters: counters.length,
      counters: counters.map(counter => ({
        prefix: counter._id,
        count: counter.sequence,
        lastUpdated: counter.updatedAt
      })),
      totalListings: await Listing.countDocuments({})
    };

    return stats;
  } catch (error) {
    console.error('Error getting property code stats:', error);
    throw error;
  }
};

module.exports = {
  generatePropertyCode,
  getPropertyCodeStats,
  locationCodes,
  typeCodes
};