import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

  // Fallback: Save local relative path when Cloudinary is unconfigured or fails
  const fileName = path.basename(localFilePath);

  // Copy to public/uploads directory for Next.js static asset resolution
  const publicUploadsDir = path.join(__dirname, '../../../public/uploads');
  if (!fs.existsSync(publicUploadsDir)) {
    try {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    } catch (e) {}
  }

  const rootUploadPath = path.join(publicUploadsDir, fileName);
  try {
    if (fs.existsSync(localFilePath) && !fs.existsSync(rootUploadPath)) {
      fs.copyFileSync(localFilePath, rootUploadPath);
    }
  } catch (e) {
    console.error('Local upload copy error:', e);
  }

  return `/uploads/${fileName}`;
};
