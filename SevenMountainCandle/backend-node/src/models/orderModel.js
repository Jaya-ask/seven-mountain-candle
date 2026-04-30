export function createOrderItemModel(item) {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity)
  };
}

export function createOrderCustomerModel(customer) {
  const normalizedEmail = customer?.email?.toString().trim().toLowerCase() || "";

  return {
    name: customer?.fullName?.toString().trim() || customer?.name?.toString().trim() || "",
    email: normalizedEmail,
    phone: customer?.phone?.toString().trim() || "",
    address: customer?.address?.toString().trim() || "",
    city: customer?.city?.toString().trim() || ""
  };
}

export function createPersistedOrderItemModel({ productSku, productName, unitPrice, quantity }) {
  const parsedUnitPrice = Number(unitPrice);
  const parsedQuantity = Number(quantity);

  return {
    productSku,
    productName,
    unitPrice: parsedUnitPrice,
    quantity: parsedQuantity,
    lineTotal: Number((parsedUnitPrice * parsedQuantity).toFixed(2))
  };
}

function normalizeOrderStatus(status) {
  const trimmedStatus = status?.toString().trim() || "";

  if (trimmedStatus.toLowerCase() === "packed") {
    return "Shipped";
  }

  return trimmedStatus;
}

export function createOrderResponseModel({
  orderNumber,
  customerId,
  customerAddressId,
  status,
  subtotal,
  shippingCharge,
  total,
  customer,
  paymentMethod,
  shippingLocation,
  items
}) {
  return {
    orderId: orderNumber,
    orderNumber,
    customerId,
    customerAddressId,
    status: normalizeOrderStatus(status),
    subtotal,
    shippingCharge,
    total,
    paymentMethod,
    shippingLocation,
    customer,
    items
  };
}

export function createTrackedOrderModel(orderRow) {
  const rawItems = Array.isArray(orderRow.items) ? orderRow.items : [];
  const createdAt = orderRow.created_at ? new Date(orderRow.created_at).toISOString() : null;
  const expectedDeliveryDate = orderRow.expected_delivery_date
    ? new Date(orderRow.expected_delivery_date).toISOString()
    : null;

  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    customerId: orderRow.customer_id,
    customerAddressId: orderRow.customer_address_id,
    customer: {
      name: orderRow.customer_name,
      email: orderRow.customer_email,
      phone: orderRow.customer_phone || ""
    },
    shipping: {
      address: orderRow.shipping_address,
      city: orderRow.shipping_city,
      location: orderRow.shipping_location || ""
    },
    paymentMethod: orderRow.payment_method,
    currencyCode: orderRow.currency_code,
    subtotal: Number(orderRow.subtotal),
    shippingCharge: Number(orderRow.shipping_charge),
    total: Number(orderRow.total),
    status: normalizeOrderStatus(orderRow.status),
    createdAt,
    expectedDeliveryDate,
    items: rawItems.map((item) => ({
      id: item.id,
      productSku: item.productSku,
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: Number(item.quantity),
      lineTotal: Number(item.lineTotal)
    }))
  };
}
