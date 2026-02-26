import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate a Cloudinary signed upload URL for direct browser upload
// @route   POST /api/upload
// @access  Private — Vendor, Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getUploadSignature = asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder    = `finalproject/products/${req.user._id}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET },
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    success:    true,
    signature,
    timestamp,
    folder,
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:     process.env.CLOUDINARY_API_KEY,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});
