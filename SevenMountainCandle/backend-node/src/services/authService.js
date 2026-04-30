import { createHash } from "crypto";
import jwt from "jsonwebtoken";

import AppError from "../utils/AppError.js";
import { dbPool } from "../config/database.js";
import { JWT_SECRET } from "../config/environment.js";

function normalizeEmail(email) {
  return email?.toString().trim().toLowerCase() || "";
}

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "customer"
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function registerUser(payload) {
  const email = normalizeEmail(payload.email);
  const userName = payload.name.trim();
  const phone = payload.phone.trim();
  const address = payload.address.trim();
  const city = payload.city.trim();
  const passwordHash = hashPassword(payload.password);

  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const existingCustomerResult = await client.query(
      `
        SELECT id, password_hash
        FROM customer
        WHERE lower(email) = lower($1)
        LIMIT 1
      `,
      [email]
    );

    if (existingCustomerResult.rows[0]?.password_hash) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const customerUpsertResult = await client.query(
      `
        INSERT INTO customer (
          full_name,
          email,
          phone,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          password_hash = EXCLUDED.password_hash,
          role = 'customer',
          updated_at = NOW()
        RETURNING id
      `,
      [userName, email, phone, passwordHash, "customer"]
    );

    const customerId = customerUpsertResult.rows[0]?.id;

    if (!customerId) {
      throw new AppError("Failed to create account.", 500);
    }

    const existingAddressResult = await client.query(
      `
        SELECT id
        FROM customer_address
        WHERE customer_id = $1
          AND address_line = $2
          AND city = $3
        LIMIT 1
      `,
      [customerId, address, city]
    );

    if (!existingAddressResult.rows[0]) {
      await client.query(
        `
          INSERT INTO customer_address (
            customer_id,
            address_line,
            city,
            location_label
          )
          VALUES ($1, $2, $3, $4)
        `,
        [customerId, address, city, "Home"]
      );
    }

    await client.query("COMMIT");

    return {
      id: customerId,
      name: userName,
      email,
      phone,
      role: "customer",
      address,
      city
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Unable to register user.", 500);
  } finally {
    client.release();
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const customerResult = await dbPool.query(
    `
      SELECT
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.password_hash,
        c.role
      FROM customer c
      WHERE lower(c.email) = lower($1)
      LIMIT 1
    `,
    [normalizedEmail]
  );

  const user = customerResult.rows[0] || null;

  if (!user || !user.password_hash || user.password_hash !== hashPassword(password)) {
    throw new AppError("Invalid email or password.", 401);
  }

  const addressResult = await dbPool.query(
    `
      SELECT
        ca.address_line,
        ca.city
      FROM customer_address ca
      WHERE ca.customer_id = $1
      ORDER BY ca.updated_at DESC, ca.id DESC
      LIMIT 1
    `,
    [user.id]
  );

  const primaryAddress = addressResult.rows[0] || null;

  const authUser = {
    id: user.id,
    name: user.full_name,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "customer",
    address: primaryAddress?.address_line || "",
    city: primaryAddress?.city || ""
  };

  return {
    token: createToken(authUser),
    user: authUser
  };
}

export async function getAuthenticatedUserProfile({ userId, email }) {
  const customerResult = await dbPool.query(
    `
      SELECT
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.role
      FROM customer c
      WHERE c.id = $1
         OR lower(c.email) = lower($2)
      LIMIT 1
    `,
    [userId, email || ""]
  );

  const customer = customerResult.rows[0] || null;

  if (!customer) {
    throw new AppError("User not found.", 404);
  }

  const addressResult = await dbPool.query(
    `
      SELECT
        ca.id,
        ca.address_line,
        ca.city,
        COALESCE(ca.location_label, 'Address') AS tag
      FROM customer_address ca
      WHERE ca.customer_id = $1
      ORDER BY ca.updated_at DESC, ca.id DESC
    `,
    [customer.id]
  );

  const addresses = addressResult.rows.map((row, index) => ({
    id: row.id,
    address: row.address_line,
    city: row.city,
    tag: row.tag,
    isRecent: index === 0
  }));

  const recentAddress = addresses[0] || null;

  return {
    user: {
      id: customer.id,
      name: customer.full_name,
      email: customer.email,
      phone: customer.phone || "",
      role: customer.role || "customer",
      address: recentAddress?.address || "",
      city: recentAddress?.city || ""
    },
    addresses,
    recentAddress
  };
}

export async function addAddressForUser({ userId, address, city, tag }) {
  const trimmedAddress = address?.toString().trim() || "";
  const trimmedCity = city?.toString().trim() || "";
  const trimmedTag = tag?.toString().trim() || "Address";

  if (!trimmedAddress || !trimmedCity) {
    throw new AppError("Address and city are required.", 400);
  }

  const existingAddressResult = await dbPool.query(
    `
      SELECT id
      FROM customer_address
      WHERE customer_id = $1
        AND address_line = $2
        AND city = $3
        AND COALESCE(location_label, '') = COALESCE($4, '')
      LIMIT 1
    `,
    [userId, trimmedAddress, trimmedCity, trimmedTag]
  );

  if (existingAddressResult.rows[0]) {
    await dbPool.query(
      `
        UPDATE customer_address
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [existingAddressResult.rows[0].id]
    );

    return {
      id: existingAddressResult.rows[0].id,
      address: trimmedAddress,
      city: trimmedCity,
      tag: trimmedTag,
      isRecent: true
    };
  }

  const insertResult = await dbPool.query(
    `
      INSERT INTO customer_address (
        customer_id,
        address_line,
        city,
        location_label
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [userId, trimmedAddress, trimmedCity, trimmedTag]
  );

  return {
    id: insertResult.rows[0].id,
    address: trimmedAddress,
    city: trimmedCity,
    tag: trimmedTag,
    isRecent: true
  };
}
