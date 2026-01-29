import React, { useRef, useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '../utils/cloudinary';

/**
 * CloudinaryUpload Component
 * Handles single or multiple image uploads to Cloudinary
 */
export const CloudinaryUpload = ({
  onUpload,
  multiple = false,
  maxSize = 5242880, // 5MB
  folder = 'books',
  className = '',
  children
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate files
      for (const file of files) {
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image.`);
        }
      }

      let uploadedData;
      if (multiple && files.length > 1) {
        uploadedData = await uploadMultipleImagesToCloudinary(files, { folder });
        setUploadedImages(uploadedData);
      } else {
        const imageData = await uploadImageToCloudinary(files[0], { folder });
        uploadedData = [imageData];
        setUploadedImages([imageData]);
      }

      // Call parent callback
      if (onUpload) {
        onUpload(multiple ? uploadedData : uploadedData[0]);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    if (onUpload) {
      onUpload(multiple ? newImages : undefined);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const files = Array.from(e.dataTransfer.files || []);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        ) : uploadedImages.length > 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
            </p>
            <p className="text-xs text-blue-600 hover:text-blue-700">
              Click to upload more {multiple ? 'images' : 'another image'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {children || `Click to upload ${multiple ? 'images' : 'an image'} or drag and drop`}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
