import { Router } from "express";

import {
  addAuthAddress,
  getAuthProfile,
  login,
  register
} from "../controllers/authController.js";
import {
  getAdminOrders,
  updateAdminExpectedDeliveryDate,
  updateAdminOrderStatus
} from "../controllers/adminController.js";
import { getCatalog } from "../controllers/catalogController.js";
import { getHealth } from "../controllers/healthController.js";
import {
  createOrder,
  getMyOrders,
  getTrackedOrders
} from "../controllers/ordersController.js";
import { requireAdmin, requireAuth } from "../middlewares/authMiddleware.js";
import {
  getFeaturedProductsList,
  getProducts
} from "../controllers/productsController.js";
import {
  createProductReview,
  getProductReviews,
  getReviewsByQuery
} from "../controllers/reviewsController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const apiRoutes = Router();

apiRoutes.post("/auth/register", asyncHandler(register));
apiRoutes.post("/auth/login", asyncHandler(login));
apiRoutes.get("/auth/me", requireAuth, asyncHandler(getAuthProfile));
apiRoutes.post("/auth/addresses", requireAuth, asyncHandler(addAuthAddress));
apiRoutes.get("/health", asyncHandler(getHealth));
apiRoutes.get("/catalog", asyncHandler(getCatalog));
apiRoutes.get("/products", asyncHandler(getProducts));
apiRoutes.get("/products/featured", asyncHandler(getFeaturedProductsList));
apiRoutes.get("/products/:productId/reviews", asyncHandler(getProductReviews));
apiRoutes.post("/products/:productId/reviews", asyncHandler(createProductReview));
apiRoutes.get("/reviews", asyncHandler(getReviewsByQuery));
apiRoutes.post("/orders", asyncHandler(createOrder));
apiRoutes.get("/orders/track", asyncHandler(getTrackedOrders));
apiRoutes.get("/orders/mine", requireAuth, asyncHandler(getMyOrders));
apiRoutes.get("/admin/orders", requireAuth, requireAdmin, asyncHandler(getAdminOrders));
apiRoutes.patch("/admin/orders/:orderNumber/status", requireAuth, requireAdmin, asyncHandler(updateAdminOrderStatus));
apiRoutes.patch("/admin/orders/:orderNumber/expected-delivery-date", requireAuth, requireAdmin, asyncHandler(updateAdminExpectedDeliveryDate));

export default apiRoutes;
