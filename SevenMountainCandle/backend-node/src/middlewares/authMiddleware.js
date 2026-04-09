import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/environment.js";
import AppError from "../utils/AppError.js";

export function requireAuth(request, _response, next) {
  const authHeader = request.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    next(new AppError("Authentication required.", 401));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    request.auth = {
      userId: payload?.sub,
      email: payload?.email || "",
      name: payload?.name || "",
      role: payload?.role || "customer"
    };

    next();
  } catch (_error) {
    next(new AppError("Invalid or expired token.", 401));
  }
}

export function requireAdmin(request, _response, next) {
  const role = request.auth?.role?.toString().trim().toLowerCase() || "";

  if (role !== "admin") {
    next(new AppError("Admin access required.", 403));
    return;
  }

  next();
}
