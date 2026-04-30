import AppError from "../utils/AppError.js";
import {
  clearCartByCustomerId,
  getCartItemsByCustomerId,
  replaceCartItemsByCustomerId
} from "../repositories/cartRepository.js";
import { getCatalogData } from "./catalogService.js";

function normalizeCartItems(payloadItems) {
  if (!Array.isArray(payloadItems)) {
    throw new AppError("Cart items must be an array.", 400);
  }

  const normalizedItems = payloadItems.map((item) => {
    const rawIdentifier = item?.sku || item?.productSku || item?.id;
    const identifier = rawIdentifier?.toString().trim() || "";
    const quantity = Number(item?.quantity);

    if (!identifier) {
      throw new AppError("Each cart item must include a product identifier.", 400);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError("Each cart item must include a valid quantity.", 400);
    }

    return {
      identifier,
      quantity
    };
  });

  const mergedByIdentifier = new Map();

  for (const item of normalizedItems) {
    const normalizedIdentifier = item.identifier.toLowerCase();
    const existingQuantity = mergedByIdentifier.get(normalizedIdentifier) || 0;
    mergedByIdentifier.set(normalizedIdentifier, existingQuantity + item.quantity);
  }

  return Array.from(mergedByIdentifier.entries()).map(([identifier, quantity]) => ({
    identifier,
    quantity
  }));
}

function resolveProductByIdentifier(products, identifier) {
  const normalizedIdentifier = identifier.toLowerCase();

  return products.find(
    (product) =>
      product.sku?.toLowerCase() === normalizedIdentifier ||
      product.id?.toLowerCase() === normalizedIdentifier
  ) || null;
}

function createCartItemResponse(product, quantity) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: Number(product.price),
    imageUrl: product.imageUrl || "",
    quantity: Number(quantity)
  };
}

export async function getAuthenticatedCart({ userId }) {
  if (!userId) {
    throw new AppError("Authentication required.", 401);
  }

  const [cartRows, catalog] = await Promise.all([
    getCartItemsByCustomerId(userId),
    getCatalogData()
  ]);

  const items = cartRows
    .map((row) => {
      const product = catalog.products.find(
        (entry) => entry.sku?.toLowerCase() === row.product_sku?.toLowerCase()
      );

      if (!product) {
        return null;
      }

      return createCartItemResponse(product, row.quantity);
    })
    .filter(Boolean);

  return { items };
}

export async function saveAuthenticatedCart({ userId, items }) {
  if (!userId) {
    throw new AppError("Authentication required.", 401);
  }

  const normalizedItems = normalizeCartItems(items);

  if (normalizedItems.length === 0) {
    await clearCartByCustomerId(userId);
    return { items: [] };
  }

  const { products } = await getCatalogData();

  const persistedItems = normalizedItems.map((item) => {
    const matchedProduct = resolveProductByIdentifier(products, item.identifier);

    if (!matchedProduct) {
      throw new AppError("One or more cart products are invalid.", 400);
    }

    return {
      productSku: matchedProduct.sku,
      quantity: item.quantity
    };
  });

  await replaceCartItemsByCustomerId(userId, persistedItems);

  const responseItems = persistedItems.map((item) => {
    const product = products.find((entry) => entry.sku === item.productSku);
    return createCartItemResponse(product, item.quantity);
  });

  return {
    items: responseItems
  };
}

export async function clearAuthenticatedCart({ userId }) {
  if (!userId) {
    throw new AppError("Authentication required.", 401);
  }

  await clearCartByCustomerId(userId);

  return {
    message: "Cart cleared successfully.",
    items: []
  };
}
