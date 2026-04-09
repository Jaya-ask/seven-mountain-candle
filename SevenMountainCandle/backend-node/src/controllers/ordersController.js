import {
  placeOrder,
  trackOrdersForAuthenticatedUser,
  trackOrders,
  validateOrderPayload
} from "../services/orderService.js";
import AppError from "../utils/AppError.js";

export async function createOrder(request, response, next) {
  const validation = validateOrderPayload(request.body);
  if (!validation.valid) {
    next(new AppError(validation.message, 400));
    return;
  }

  const order = await placeOrder(request.body);
  response.status(201).json(order);
}

export async function getTrackedOrders(request, response) {
  const trackedOrders = await trackOrders({
    orderNumber: request.query.orderNumber,
    email: request.query.email
  });

  response.json(trackedOrders);
}

export async function getMyOrders(request, response) {
  const authPayload = request.auth || {};

  const trackedOrders = await trackOrdersForAuthenticatedUser({
    userId: authPayload.userId,
    email: authPayload.email
  });

  response.json(trackedOrders);
}
