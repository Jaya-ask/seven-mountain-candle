import { createCategoryModel } from "../models/categoryModel.js";
import { createProductModelFromRow } from "../models/productModel.js";
import {
  createAdminProductRow,
  deleteAdminProductRow,
  getAdminProductRows,
  getCategoryRows,
  updateAdminProductRow
} from "../repositories/adminProductRepository.js";
import AppError from "../utils/AppError.js";

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => tag?.toString().trim() || "")
        .filter(Boolean)
    )
  );
}

function normalizeCategoryIds(categoryIds) {
  if (!Array.isArray(categoryIds)) {
    return [];
  }

  return Array.from(
    new Set(
      categoryIds
        .map((entry) => entry?.toString().trim() || "")
        .filter(Boolean)
    )
  );
}

function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  const normalized = images
    .map((entry, index) => ({
      url: entry?.url?.toString().trim() || "",
      isPrimary: Boolean(entry?.isPrimary),
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
    }))
    .filter((entry) => entry.url);

  if (normalized.length === 0) {
    return [];
  }

  if (!normalized.some((entry) => entry.isPrimary)) {
    normalized[0].isPrimary = true;
  }

  const firstPrimaryIndex = normalized.findIndex((entry) => entry.isPrimary);
  return normalized.map((entry, index) => ({
    ...entry,
    isPrimary: firstPrimaryIndex === index,
    sortOrder: Number(entry.sortOrder)
  }));
}

function normalizeProductPayload(payload) {
  const sku = payload?.sku?.toString().trim() || "";
  const name = payload?.name?.toString().trim() || "";
  const description = payload?.description?.toString().trim() || "";
  const uom = payload?.uom?.toString().trim() || "";
  const material = Number(payload?.material);
  const packing = Number(payload?.packing);
  const price = Number(payload?.price);
  const tags = normalizeTags(payload?.tags);
  const categoryIds = normalizeCategoryIds(payload?.categoryIds);
  const images = normalizeImages(payload?.images);

  if (!sku) {
    throw new AppError("Product SKU is required.", 400);
  }

  if (!name) {
    throw new AppError("Product name is required.", 400);
  }

  if (!description) {
    throw new AppError("Product description is required.", 400);
  }

  if (!uom) {
    throw new AppError("Product unit of measure is required.", 400);
  }

  if (!Number.isFinite(material) || material < 0) {
    throw new AppError("Material cost must be a valid non-negative number.", 400);
  }

  if (!Number.isFinite(packing) || packing < 0) {
    throw new AppError("Packing cost must be a valid non-negative number.", 400);
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new AppError("Price must be a valid non-negative number.", 400);
  }

  if (categoryIds.length === 0) {
    throw new AppError("At least one category is required.", 400);
  }

  return {
    sku,
    name,
    description,
    uom,
    material,
    packing,
    price,
    tags,
    categoryIds,
    images
  };
}

async function getProductBySkuOrThrow(sku) {
  const rows = await getAdminProductRows();
  const matched = rows.find((row) => row.sku?.toLowerCase() === sku.toLowerCase()) || null;

  if (!matched) {
    throw new AppError("Product not found.", 404);
  }

  return createProductModelFromRow(matched, 0);
}

export async function getAdminProductsPayload() {
  const [productRows, categoryRows] = await Promise.all([
    getAdminProductRows(),
    getCategoryRows()
  ]);

  return {
    products: productRows.map((row, index) => createProductModelFromRow(row, index)),
    categories: categoryRows.map((row) => createCategoryModel(row))
  };
}

export async function createAdminProduct(payload) {
  const normalized = normalizeProductPayload(payload);

  try {
    await createAdminProductRow(normalized);
  } catch (error) {
    if (error?.code === "23505") {
      throw new AppError("Product with the same SKU already exists.", 409);
    }

    if (error?.message?.startsWith("Invalid category id")) {
      throw new AppError(error.message, 400);
    }

    throw error;
  }

  const product = await getProductBySkuOrThrow(normalized.sku);

  return {
    message: "Product created successfully.",
    product
  };
}

export async function updateAdminProduct({ existingSku, payload }) {
  const normalizedExistingSku = existingSku?.toString().trim() || "";

  if (!normalizedExistingSku) {
    throw new AppError("Product SKU is required.", 400);
  }

  const normalized = normalizeProductPayload(payload);

  let updatedSku = null;

  try {
    updatedSku = await updateAdminProductRow({
      existingSku: normalizedExistingSku,
      payload: normalized
    });
  } catch (error) {
    if (error?.code === "23505") {
      throw new AppError("Product with the same SKU already exists.", 409);
    }

    if (error?.message?.startsWith("Invalid category id")) {
      throw new AppError(error.message, 400);
    }

    throw error;
  }

  if (!updatedSku) {
    throw new AppError("Product not found.", 404);
  }

  const product = await getProductBySkuOrThrow(updatedSku);

  return {
    message: "Product updated successfully.",
    product
  };
}

export async function deleteAdminProduct(sku) {
  const normalizedSku = sku?.toString().trim() || "";

  if (!normalizedSku) {
    throw new AppError("Product SKU is required.", 400);
  }

  try {
    const deleted = await deleteAdminProductRow(normalizedSku);

    if (!deleted) {
      throw new AppError("Product not found.", 404);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.code === "23503") {
      throw new AppError("Cannot delete product because it is linked to existing orders.", 409);
    }

    throw error;
  }

  return {
    message: "Product deleted successfully."
  };
}