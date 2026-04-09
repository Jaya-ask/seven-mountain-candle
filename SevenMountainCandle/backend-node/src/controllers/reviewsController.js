import AppError from "../utils/AppError.js";
import {
  createReviewForProduct,
  getReviewsForProduct
} from "../services/reviewService.js";

export async function getProductReviews(request, response) {
  const productId = request.params.productId?.toString();
  const reviews = await getReviewsForProduct(productId);
  response.json(reviews);
}

export async function getReviewsByQuery(request, response, next) {
  const productId = request.query.productId?.toString();

  if (!productId) {
    next(new AppError("Query param productId is required.", 400));
    return;
  }

  const reviews = await getReviewsForProduct(productId);
  response.json(reviews);
}

export async function createProductReview(request, response) {
  const productId = request.params.productId?.toString();
  const review = await createReviewForProduct(productId, request.body);
  response.status(201).json(review);
}
