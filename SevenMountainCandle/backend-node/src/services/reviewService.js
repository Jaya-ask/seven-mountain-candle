import AppError from "../utils/AppError.js";
import { NODE_ENV } from "../config/environment.js";
import { createReviewModel } from "../models/reviewModel.js";
import {
  createProductReviewByIdentifier,
  getProductReviewsByIdentifier
} from "../repositories/reviewRepository.js";

function createReviewDbError(defaultMessage, error) {
  if (NODE_ENV === "development") {
    const debugCode = error?.code ? `[${error.code}] ` : "";
    const debugMessage = error?.message ? error.message : "Unknown database error";
    return new AppError(`${defaultMessage} ${debugCode}${debugMessage}`.trim(), 500);
  }

  return new AppError(defaultMessage, 500);
}

export async function getReviewsForProduct(productId) {
  if (!productId) {
    throw new AppError("Product id is required.", 400);
  }

  try {
    const reviewRows = await getProductReviewsByIdentifier(productId);
    return reviewRows.map((row) => createReviewModel(row));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createReviewDbError("Failed to load product reviews.", error);
  }
}

function validateReviewPayload(payload) {
  const name = payload?.name?.toString().trim();
  const title = payload?.title?.toString().trim() || "";
  const comment = payload?.comment?.toString().trim();
  const rating = Number(payload?.rating);

  if (!name) {
    throw new AppError("Reviewer name is required.", 400);
  }

  if (!comment) {
    throw new AppError("Review comment is required.", 400);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5.", 400);
  }

  return {
    name,
    title,
    comment,
    rating
  };
}

export async function createReviewForProduct(productId, payload) {
  if (!productId) {
    throw new AppError("Product id is required.", 400);
  }

  const validatedReview = validateReviewPayload(payload);

  try {
    const insertedRow = await createProductReviewByIdentifier(productId, validatedReview);
    if (!insertedRow) {
      throw new AppError("Product not found.", 404);
    }

    return createReviewModel(insertedRow);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.code === "42P01") {
      throw new AppError(
        "Review table not found. Run migration 001_create_product_review_table.sql.",
        500
      );
    }

    if (error?.code === "42703") {
      throw new AppError(
        "Review table columns are missing. Re-run the review table migration.",
        500
      );
    }

    throw createReviewDbError("Failed to create product review.", error);
  }
}
