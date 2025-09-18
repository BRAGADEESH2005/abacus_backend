const multer = require('multer');
const { uploadMultipleToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Upload multiple images
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Validate file types
    for (const file of req.files) {
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${file.originalname}. Only images are allowed.`
        });
      }
    }

    console.log(`Uploading ${req.files.length} images to Cloudinary...`);

    // Prepare file buffers
    const fileBuffers = req.files.map(file => file.buffer);

    // Upload options
    const uploadOptions = {
      folder: 'estate-listings',
      public_id: req.body.propertyCode ? `${req.body.propertyCode}` : undefined,
      tags: ['estate', 'property', 'listing'],
      context: {
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.body.uploadedBy || 'system'
      }
    };

    // Upload all images to Cloudinary
    const uploadResults = await uploadMultipleToCloudinary(fileBuffers, uploadOptions);

    // Extract URLs and other relevant information
    const imageData = uploadResults.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      originalName: req.files[index].originalname
    }));

    console.log(`Successfully uploaded ${imageData.length} images`);

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${imageData.length} images`,
      data: {
        images: imageData,
        urls: imageData.map(img => img.url), // Just URLs for easy access
        count: imageData.length
      }
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    
    // Handle specific multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB per file.'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// Get upload status/info
const getUploadInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        maxFileSize: '10MB',
        maxFiles: 10,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
        folder: 'estate-listings'
      }
    });
  } catch (error) {
    console.error('Error getting upload info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload information',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadImages,
  deleteImage,
  getUploadInfo
};