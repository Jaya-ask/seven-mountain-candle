import { v2 as cloudinary } from "cloudinary";

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_FOLDER
} from "../config/environment.js";
import AppError from "../utils/AppError.js";

function ensureCloudinaryConfigured() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary configuration is missing in server environment.", 500);
  }
}

function ensureConfigured() {
  ensureCloudinaryConfigured();

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function uploadImageToCloudinary({ fileBuffer, mimeType, sku }) {
  ensureConfigured();

  if (!fileBuffer || !mimeType) {
    throw new AppError("Image file is required.", 400);
  }

  const encoded = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${encoded}`;
  const timestampSuffix = Date.now();

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: `${CLOUDINARY_UPLOAD_FOLDER}/${sku}`,
    resource_type: "image",
    public_id: `${sku}-${timestampSuffix}`,
    overwrite: false
  });

  return {
    url: uploadResult.secure_url
  };
}

function extractPublicIdFromCloudinaryUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const uploadSplit = parsedUrl.pathname.split("/upload/");
    if (uploadSplit.length < 2) {
      return "";
    }

    const rightPath = uploadSplit[1];
    const segments = rightPath.split("/").filter(Boolean);
    if (segments.length === 0) {
      return "";
    }

    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = versionIndex >= 0
      ? segments.slice(versionIndex + 1)
      : segments;

    if (publicIdSegments.length === 0) {
      return "";
    }

    const lastSegment = publicIdSegments[publicIdSegments.length - 1];
    const normalizedLastSegment = lastSegment.replace(/\.[^/.]+$/, "");

    return [...publicIdSegments.slice(0, -1), normalizedLastSegment].join("/");
  } catch {
    return "";
  }
}

export async function deleteImageFromCloudinary(imageUrl) {
  ensureConfigured();

  const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);

  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true
  });
}
