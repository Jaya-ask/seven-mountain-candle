import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/environment.js";
import AppError from "../utils/AppError.js";

function parseBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

function buildAuthPayload(payload) {
  return {
    userId: payload?.sub,
    email: payload?.email || "",
    name: payload?.name || "",
    role: payload?.role || "customer"
  };
}

export function requireAuth(request, _response, next) {
  const authHeader = request.headers.authorization || "";
  const token = parseBearerToken(authHeader);

  if (!token) {
    next(new AppError("Authentication required.", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    request.auth = buildAuthPayload(payload);

    next();
  } catch (_error) {
    next(new AppError("Invalid or expired token.", 401));
  }
}

export function optionalAuth(request, _response, next) {
  const authHeader = request.headers.authorization || "";

  if (!authHeader) {
    request.auth = null;
    next();
    return;
  }

  const token = parseBearerToken(authHeader);

  if (!token) {
    next(new AppError("Invalid authorization header format.", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    request.auth = buildAuthPayload(payload);
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
