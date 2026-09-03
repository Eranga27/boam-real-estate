import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath: string, resourceType: "auto" | "image" | "video" = "auto") => {
  try {
    if (!localFilePath) return null;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    // If valid Cloudinary credentials exist, upload to Cloudinary CDN
    if (cloudName && apiKey && cloudName !== 'your-cloud-name' && apiKey !== 'your-api-key') {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType
      });
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return response.secure_url || response.url;
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
  }

  // Fallback for production (Vercel/Render): Convert image to compressed Base64 Data URI
  // This ensures images render reliably across domains without needing separate cloud storage
  try {
    if (fs.existsSync(localFilePath)) {
      if (resourceType === 'image' || resourceType === 'auto') {
        const compressedBuffer = await sharp(localFilePath)
          .resize({ width: 1200, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        fs.unlinkSync(localFilePath);
        return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
      } else {
        // For video files or fallback
        const fileBuffer = fs.readFileSync(localFilePath);
        fs.unlinkSync(localFilePath);
        const fileName = path.basename(localFilePath);
        return `/uploads/${fileName}`;
      }
    }
  } catch (err) {
    console.error('Base64 image conversion error:', err);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }

  return null;
};
