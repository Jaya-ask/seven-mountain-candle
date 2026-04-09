import AppError from "../utils/AppError.js";
import {
  addAddressForUser,
  getAuthenticatedUserProfile,
  loginUser,
  registerUser
} from "../services/authService.js";

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function ensureNonEmptyString(value, fieldLabel) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldLabel} is required.`, 400);
  }
}

export async function register(request, response) {
  const {
    name,
    email,
    phone,
    address,
    city,
    password,
    confirmPassword
  } = request.body || {};

  ensureNonEmptyString(name, "Name");
  ensureNonEmptyString(email, "Email");
  ensureNonEmptyString(phone, "Phone number");
  ensureNonEmptyString(address, "Address");
  ensureNonEmptyString(city, "City");
  ensureNonEmptyString(password, "Password");
  ensureNonEmptyString(confirmPassword, "Confirm password");

  if (!isValidEmail(email)) {
    throw new AppError("Enter a valid email address.", 400);
  }

  if (password !== confirmPassword) {
    throw new AppError("Password and confirm password must match.", 400);
  }

  if (password.trim().length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400);
  }

  const user = await registerUser({
    name,
    email,
    phone,
    address,
    city,
    password
  });

  response.status(201).json({
    message: "Registration successful.",
    user
  });
}

export async function login(request, response) {
  const { email, password } = request.body || {};

  ensureNonEmptyString(email, "Email");
  ensureNonEmptyString(password, "Password");

  if (!isValidEmail(email)) {
    throw new AppError("Enter a valid email address.", 400);
  }

  const authPayload = await loginUser({ email, password });

  response.status(200).json({
    message: "Login successful.",
    ...authPayload
  });
}

export async function getAuthProfile(request, response) {
  const authPayload = request.auth || {};

  if (!authPayload.userId && !authPayload.email) {
    throw new AppError("Authentication required.", 401);
  }

  const profile = await getAuthenticatedUserProfile({
    userId: authPayload.userId,
    email: authPayload.email
  });

  response.status(200).json(profile);
}

export async function addAuthAddress(request, response) {
  const authPayload = request.auth || {};

  if (!authPayload.userId) {
    throw new AppError("Authentication required.", 401);
  }

  const { address, city, tag } = request.body || {};

  const addressEntry = await addAddressForUser({
    userId: authPayload.userId,
    address,
    city,
    tag
  });

  response.status(201).json({
    message: "Address saved successfully.",
    address: addressEntry
  });
}
