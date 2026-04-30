import { existsSync } from "fs";
import { resolve } from "path";

import dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV || "development";

const envFilePath = resolve(process.cwd(), `.env.${NODE_ENV}`);

if (existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

export const PORT = Number(process.env.PORT || 5000);
export const JWT_SECRET = process.env.JWT_SECRET || "seven-mountain-dev-secret";

export const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    };

export const DATABASE_NAME = process.env.PGDATABASE || "sevenmountain";

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
export const CLOUDINARY_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "seven-mountain-candle/products";
