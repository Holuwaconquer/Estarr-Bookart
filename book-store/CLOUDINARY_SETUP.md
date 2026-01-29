# Cloudinary Setup Guide for BookStore

This guide will help you set up Cloudinary image uploads for your BookStore application.

## Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Get Your Cloud Name

1. After logging in, go to your **Dashboard**
2. Copy your **Cloud Name** (visible at the top of the dashboard)
3. Save this value - you'll need it in the next steps

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** (gear icon)
2. Navigate to the **Upload** tab
3. Scroll down to "Upload presets" section
4. Click "Create Upload Preset" or "Add"
5. Set the following:
   - **Name**: `storeapp_unsigned` (or your preferred name)
   - **Signing Mode**: **Unsigned** (important for frontend uploads without backend)
   - **Folder**: `storeapp` (optional, for organization)
6. Click "Save"
7. Copy the preset name

## Step 4: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the Cloudinary variables:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=storeapp_unsigned
   ```

3. Save the file

## Step 5: Restart Your Development Server

```bash
npm run dev
```

## How to Use Image Uploads

### For Admin Users:

1. Go to **Admin Dashboard** → **Products**
2. Click **"Add New Book"** or edit an existing book
3. In the modal, scroll to **"Book Images (via Cloudinary)"**
4. **Drag and drop** images or **click to browse**
5. Images are automatically uploaded to Cloudinary
6. The first image is set as the main product image
7. Click **"Create Book"** or **"Update Book"**

### What the System Supports:

- **Multiple Images**: Upload multiple images per product
- **Automatic Optimization**: Images are optimized for web automatically
- **Drag & Drop**: Easy file selection
- **Progress Indicator**: See upload progress
- **Error Handling**: Clear error messages if upload fails
- **File Validation**: Only image files accepted, max 5MB

## Troubleshooting

### Images Not Uploading?

1. **Check Browser Console** (F12):
   - Look for CORS or network errors
   - Verify Cloud Name is correct

2. **Verify Environment Variables**:
   ```bash
   # Check that your .env.local file has:
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

3. **Check Upload Preset Settings**:
   - Go to Cloudinary Settings → Upload tab
   - Verify the preset is set to **"Unsigned"**
   - Verify the preset exists and is active

4. **Clear Browser Cache**:
   - Try uploading in an incognito/private window
   - Restart development server with `npm run dev`

### Images Showing Broken Links?

1. Verify images are showing in Cloudinary dashboard
2. Check the URL format in the response
3. Ensure HTTPS is being used

## Advanced Configuration

### Optional: Backend Image Deletion

To allow image deletion from Cloudinary via backend:

1. In Cloudinary Settings → API Keys section, note your:
   - API Key
   - API Secret (keep secret!)

2. Add to your backend `.env`:
   ```env
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Implement backend endpoint for deletion

### Optional: Image Transformations

The system supports optimized image URLs:

```javascript
import { generateOptimizedImageUrl } from '../utils/cloudinary';

// Generate thumbnail
const thumb = generateOptimizedImageUrl(publicId, {
  width: 200,
  height: 200,
  crop: 'fill',
  quality: 'auto',
  format: 'auto'
});
```

## Security Notes

- **Unsigned Presets**: Safe for frontend use, but consider adding restrictions
- **Upload Limits**: Set max file size and allowed formats in Cloudinary settings
- **Folder Organization**: Images auto-organize in `/storeapp/` folder
- **Never Expose API Secret**: Keep this only on backend

## API Integration

The upload utility is at `src/utils/cloudinary.js`:

```javascript
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '../utils/cloudinary';

// Single image
const result = await uploadImageToCloudinary(file, { folder: 'books' });
console.log(result.url); // Cloudinary URL

// Multiple images
const results = await uploadMultipleImagesToCloudinary(files, { folder: 'books' });
```

## Support

For more information:
- Cloudinary Docs: https://cloudinary.com/documentation
- Upload Widget: https://cloudinary.com/documentation/upload_widget
- Image Transformation: https://cloudinary.com/documentation/image_transformation_reference
