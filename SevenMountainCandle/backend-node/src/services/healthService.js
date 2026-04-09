import { dbPool } from "../config/database.js";
import AppError from "../utils/AppError.js";

export async function checkDatabaseHealth() {
  try {
    await dbPool.query("SELECT 1");
  } catch (error) {
    throw new AppError("Database unavailable.", 503);
  }
}
