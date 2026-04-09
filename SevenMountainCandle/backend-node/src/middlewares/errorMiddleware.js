import AppError from "../utils/AppError.js";

export function notFoundHandler(request, _response, next) {
  next(new AppError(`Route ${request.originalUrl} not found.`, 404));
}

export function globalErrorHandler(error, _request, response, _next) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message: error?.message || "Internal server error."
  });
}
