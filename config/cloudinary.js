const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: 'estate-listings',
        resource_type: 'image',
        format: 'webp', // Convert to WebP for better compression
        quality: 'auto:good',
        fetch_format: 'auto',
        ...options
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

// Function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Function to upload multiple images
const uploadMultipleToCloudinary = async (fileBuffers, options = {}) => {
  try {
    const uploadPromises = fileBuffers.map((buffer, index) => {
      const uploadOptions = {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index + 1}` : undefined
      };
      return uploadToCloudinary(buffer, uploadOptions);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary
};