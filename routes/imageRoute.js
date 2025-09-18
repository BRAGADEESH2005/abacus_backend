const express = require('express');
const router = express.Router();
const { upload, uploadImages, deleteImage, getUploadInfo } = require('../controllers/imageController');

// Get upload information
router.get('/info', getUploadInfo);

// Upload multiple images
router.post('/upload', upload.array('images', 10), uploadImages);

// Delete image by public ID
router.delete('/:publicId', deleteImage);

module.exports = router;