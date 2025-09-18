const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getLocations,
  getTypes,
  getPropertyCodeStatistics
} = require('../controllers/listingsController');

// GET /api/listings - Get all listings with pagination and filters
router.get('/', getListings);

// GET /api/listings/locations - Get available locations
router.get('/locations', getLocations);

// GET /api/listings/types - Get available property types
router.get('/types', getTypes);

// GET /api/listings/stats/property-codes - Get property code statistics
router.get('/stats/property-codes', getPropertyCodeStatistics);

// GET /api/listings/:id - Get single listing by ID
router.get('/:id', getListingById);

// POST /api/listings - Create new listing (property code auto-generated)
router.post('/', createListing);

// PUT /api/listings/:id - Update listing (property code immutable)
router.put('/:id', updateListing);

// DELETE /api/listings/:id - Delete listing
router.delete('/:id', deleteListing);

module.exports = router;