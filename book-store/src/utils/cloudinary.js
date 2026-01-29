/**
 * Cloudinary Image Upload Utility
 * Handles single and multiple image uploads to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Add optional tags for organization
    if (options.tags) {
      formData.append('tags', options.tags);
    }

    // Add optional folder
    if (options.folder) {
      formData.append('folder', `storeapp/${options.folder}`);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      alt: file.name
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} - Array of uploaded image data
 */
export const uploadMultipleImagesToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file =>
      uploadImageToCloudinary(file, options)
    );
    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * Note: This requires backend support as it needs the API key
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Get Cloudinary upload widget
 * Returns a configuration object for Cloudinary widget
 * @param {Function} onSuccess - Callback when upload succeeds
 * @param {Function} onError - Callback when upload fails
 * @returns {Object} - Widget configuration
 */
export const getCloudinaryWidgetConfig = (onSuccess, onError) => {
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    onSuccess: (result) => {
      onSuccess({
        url: result.info.secure_url,
        publicId: result.info.public_id,
        alt: result.info.original_filename
      });
    },
    onError: (error) => {
      onError(error);
    }
  };
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const generateOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 400,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteImageFromCloudinary,
  getCloudinaryWidgetConfig,
  generateOptimizedImageUrl
};
