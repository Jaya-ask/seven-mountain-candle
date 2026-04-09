import {
  createOrderCustomerModel,
  createOrderItemModel,
  createPersistedOrderItemModel,
  createOrderResponseModel,
  createTrackedOrderModel
} from "../models/orderModel.js";
import {
  getAllSalesOrders,
  getAvailableOrderStatuses,
  createSalesOrder,
  getSalesOrdersByCustomerId,
  getSalesOrderByOrderNumber,
  getSalesOrdersByCustomerEmail,
  updateSalesOrderExpectedDeliveryDateByOrderNumber,
  updateSalesOrderStatusByOrderNumber
} from "../repositories/orderRepository.js";
import { getCatalogData } from "./catalogService.js";
import AppError from "../utils/AppError.js";

function isValidPhoneNumber(phoneValue) {
  const trimmedPhone = phoneValue?.toString().trim() || "";

  if (!/^\+?[0-9\s()-]+$/.test(trimmedPhone)) {
    return false;
  }

  const digitCount = (trimmedPhone.match(/\d/g) || []).length;
  return digitCount >= 8 && digitCount <= 15;
}

export function validateOrderPayload(payload) {
  const { customer, items } = payload || {};
  const normalizedCustomer = createOrderCustomerModel(customer);

  if (!normalizedCustomer.name || !normalizedCustomer.email || !Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: "Customer name, email, and at least one cart item are required."
    };
  }

  if (!normalizedCustomer.address || !normalizedCustomer.city) {
    return {
      valid: false,
      message: "Shipping address and city are required."
    };
  }

  if (!normalizedCustomer.phone || !isValidPhoneNumber(normalizedCustomer.phone)) {
    return {
      valid: false,
      message: "A valid phone number is required."
    };
  }

  return { valid: true };
}

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const suffix = Math.floor(Math.random() * 900 + 100).toString();
  return `SMC-${timestamp.slice(-6)}${suffix}`;
}

function resolveProductByItem(products, item) {
  const identifierCandidates = [
    item.sku,
    item.id,
    item.productSku
  ].filter(Boolean);

  return products.find((product) =>
    identifierCandidates.some((candidate) => {
      const normalized = candidate.toString().toLowerCase();
      return (
        product.sku?.toLowerCase() === normalized ||
        product.id?.toLowerCase() === normalized
      );
    })
  ) || null;
}

function buildPersistedItems({ items, products }) {
  return items.map((itemPayload) => {
    const item = createOrderItemModel(itemPayload);
    const matchedProduct = resolveProductByItem(products, itemPayload);

    if (!matchedProduct) {
      throw new AppError("One or more products in the cart are invalid.", 400);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new AppError("Each order item must have a valid quantity.", 400);
    }

    return createPersistedOrderItemModel({
      productSku: matchedProduct.sku,
      productName: matchedProduct.name,
      unitPrice: matchedProduct.price,
      quantity: item.quantity
    });
  });
}

export async function placeOrder(payload) {
  const {
    customer,
    items,
    shippingCharge = 0,
    shippingLocation = "",
    paymentMethod = "card",
    expectedDeliveryDate = null
  } = payload || {};

  const normalizedExpectedDeliveryDate = expectedDeliveryDate
    ? new Date(expectedDeliveryDate)
    : null;

  if (normalizedExpectedDeliveryDate && Number.isNaN(normalizedExpectedDeliveryDate.getTime())) {
    throw new AppError("Expected delivery date is invalid.", 400);
  }

  try {
    const { products } = await getCatalogData();
    const normalizedCustomer = createOrderCustomerModel(customer);
    const persistedItems = buildPersistedItems({ items, products });

    const subtotal = Number(
      persistedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
    );
    const parsedShippingCharge = Number(shippingCharge) || 0;
    const total = Number((subtotal + parsedShippingCharge).toFixed(2));

    const insertedOrder = await createSalesOrder(
      {
        orderNumber: generateOrderNumber(),
        customerName: normalizedCustomer.name,
        customerEmail: normalizedCustomer.email,
        customerPhone: normalizedCustomer.phone,
        shippingAddress: normalizedCustomer.address,
        shippingCity: normalizedCustomer.city,
        shippingLocation: shippingLocation?.toString().trim() || "",
        paymentMethod: paymentMethod?.toString().trim() || "card",
        currencyCode: "AED",
        subtotal,
        shippingCharge: parsedShippingCharge,
        total,
        status: "Pending",
        expectedDeliveryDate: normalizedExpectedDeliveryDate
          ? normalizedExpectedDeliveryDate.toISOString()
          : null
      },
      persistedItems
    );

    return createOrderResponseModel({
      orderNumber: insertedOrder.order_number,
      customerId: insertedOrder.customer_id,
      customerAddressId: insertedOrder.customer_address_id,
      customerHasAccount: insertedOrder.customer_has_account,
      status: insertedOrder.status,
      subtotal,
      shippingCharge: parsedShippingCharge,
      total,
      customer: normalizedCustomer,
      paymentMethod: paymentMethod?.toString().trim() || "card",
      shippingLocation: shippingLocation?.toString().trim() || "",
      items: persistedItems
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to place order.", 500);
  }
}

export async function trackOrders({ orderNumber, email }) {
  const normalizedOrderNumber = orderNumber?.toString().trim() || "";
  const normalizedEmail = email?.toString().trim().toLowerCase() || "";

  if (!normalizedOrderNumber && !normalizedEmail) {
    throw new AppError("Provide either orderNumber or email to track orders.", 400);
  }

  if (normalizedOrderNumber && normalizedEmail) {
    throw new AppError("Provide only one filter: orderNumber or email.", 400);
  }

  if (normalizedOrderNumber) {
    const order = await getSalesOrderByOrderNumber(normalizedOrderNumber);
    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    return {
      mode: "orderNumber",
      order: createTrackedOrderModel(order)
    };
  }

  const orders = await getSalesOrdersByCustomerEmail(normalizedEmail);

  return {
    mode: "email",
    email: normalizedEmail,
    totalOrders: orders.length,
    orders: orders.map((entry) => createTrackedOrderModel(entry))
  };
}

export async function trackOrdersForAuthenticatedUser({ userId, email }) {
  const normalizedEmail = email?.toString().trim().toLowerCase() || "";

  if (!userId && !normalizedEmail) {
    throw new AppError("Authentication required.", 401);
  }

  let orders = [];

  if (userId) {
    orders = await getSalesOrdersByCustomerId(userId);
  }

  if (orders.length === 0 && normalizedEmail) {
    orders = await getSalesOrdersByCustomerEmail(normalizedEmail);
  }

  return {
    mode: "mine",
    totalOrders: orders.length,
    orders: orders.map((entry) => createTrackedOrderModel(entry))
  };
}

export async function getAllOrdersForAdmin() {
  const [orders, availableStatuses] = await Promise.all([
    getAllSalesOrders(),
    getAvailableOrderStatuses()
  ]);

  return {
    mode: "admin",
    totalOrders: orders.length,
    availableStatuses: availableStatuses.map((entry) => entry.name),
    orders: orders.map((entry) => createTrackedOrderModel(entry))
  };
}

export async function updateOrderStatusForAdmin({ orderNumber, status }) {
  const normalizedOrderNumber = orderNumber?.toString().trim() || "";
  const normalizedStatus = status?.toString().trim() || "";

  if (!normalizedOrderNumber) {
    throw new AppError("Order number is required.", 400);
  }

  if (!normalizedStatus) {
    throw new AppError("Status is required.", 400);
  }

  const updatedOrder = await updateSalesOrderStatusByOrderNumber({
    orderNumber: normalizedOrderNumber,
    statusName: normalizedStatus
  });

  if (!updatedOrder) {
    throw new AppError("Order or status not found.", 404);
  }

  return {
    message: "Order status updated successfully.",
    order: createTrackedOrderModel(updatedOrder)
  };
}

export async function updateExpectedDeliveryDateForAdmin({
  orderNumber,
  expectedDeliveryDate
}) {
  const normalizedOrderNumber = orderNumber?.toString().trim() || "";
  const normalizedExpectedDeliveryDate = expectedDeliveryDate?.toString().trim() || "";

  if (!normalizedOrderNumber) {
    throw new AppError("Order number is required.", 400);
  }

  if (!normalizedExpectedDeliveryDate) {
    throw new AppError("Expected delivery date is required.", 400);
  }

  const parsedDate = new Date(normalizedExpectedDeliveryDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Expected delivery date is invalid.", 400);
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedDateStart = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());

  if (selectedDateStart < todayStart) {
    throw new AppError("Expected delivery date cannot be in the past.", 400);
  }

  const updatedOrder = await updateSalesOrderExpectedDeliveryDateByOrderNumber({
    orderNumber: normalizedOrderNumber,
    expectedDeliveryDate: normalizedExpectedDeliveryDate
  });

  if (!updatedOrder) {
    throw new AppError("Order not found.", 404);
  }

  return {
    message: "Expected delivery date updated successfully.",
    order: createTrackedOrderModel(updatedOrder)
  };
}
