import { dbPool } from "../config/database.js";

const ORDER_SELECT_WITH_ITEMS_SQL = `
  SELECT
    so.id,
    so.order_number,
    so.customer_id,
    so.customer_address_id,
    so.customer_name,
    so.customer_email,
    so.customer_phone,
    so.shipping_address,
    so.shipping_city,
    so.shipping_location,
    so.payment_method,
    so.currency_code,
    so.subtotal,
    so.shipping_charge,
    so.total,
    so.expected_delivery_date,
    os.name AS status,
    so.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', soi.id,
          'productSku', soi.product_sku,
          'productName', soi.product_name,
          'unitPrice', soi.unit_price,
          'quantity', soi.quantity,
          'lineTotal', soi.line_total
        )
        ORDER BY soi.id
      ) FILTER (WHERE soi.id IS NOT NULL),
      '[]'::json
    ) AS items
  FROM sales_order so
  LEFT JOIN order_status os ON os.id = so.status_id
  LEFT JOIN sales_order_item soi ON soi.order_id = so.id
`;

async function resolveOrderStatus(client, statusName) {
  const normalizedStatusName = statusName?.toString().trim() || "Pending";

  const statusResult = await client.query(
    `
      SELECT id, name
      FROM order_status
      WHERE lower(name) = lower($1)
      LIMIT 1
    `,
    [normalizedStatusName]
  );

  if (statusResult.rows[0]) {
    return statusResult.rows[0];
  }

  const fallbackResult = await client.query(
    `
      SELECT id, name
      FROM order_status
      WHERE name = 'Pending'
      LIMIT 1
    `
  );

  return fallbackResult.rows[0] || { id: null, name: "Pending" };
}

export async function createSalesOrder(order, items, { authenticatedUserId = null } = {}) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    let customer = null;
    const normalizedShippingLocation = order.shippingLocation?.toString().trim() || null;
    const status = await resolveOrderStatus(client, order.status);
    let customerAddressId = null;

    if (authenticatedUserId) {
      const customerResult = await client.query(
        `
          SELECT id
          FROM customer
          WHERE id = $1
          LIMIT 1
        `,
        [authenticatedUserId]
      );

      customer = customerResult.rows[0] || null;

      if (!customer) {
        throw new Error("Authenticated customer not found.");
      }

      const existingCustomerAddressResult = await client.query(
        `
          SELECT id
          FROM customer_address
          WHERE customer_id = $1
            AND address_line = $2
            AND city = $3
            AND COALESCE(location_label, '') = COALESCE($4, '')
          LIMIT 1
        `,
        [
          customer.id,
          order.shippingAddress,
          order.shippingCity,
          normalizedShippingLocation
        ]
      );

      customerAddressId = existingCustomerAddressResult.rows[0]?.id || null;

      if (!customerAddressId) {
        const customerAddressInsertResult = await client.query(
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
          [
            customer.id,
            order.shippingAddress,
            order.shippingCity,
            normalizedShippingLocation
          ]
        );

        customerAddressId = customerAddressInsertResult.rows[0].id;
      }
    }

    const orderInsertResult = await client.query(
      `
        INSERT INTO sales_order (
          order_number,
          customer_id,
          customer_address_id,
          status_id,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_city,
          shipping_location,
          payment_method,
          currency_code,
          subtotal,
          shipping_charge,
          total,
          expected_delivery_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, COALESCE($16::date, CURRENT_DATE + 4))
        RETURNING id, order_number, customer_id, customer_address_id, subtotal, shipping_charge, total, expected_delivery_date, created_at
      `,
      [
        order.orderNumber,
        customer?.id || null,
        customerAddressId,
        status.id,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.shippingAddress,
        order.shippingCity,
        normalizedShippingLocation,
        order.paymentMethod,
        order.currencyCode,
        order.subtotal,
        order.shippingCharge,
        order.total,
        order.expectedDeliveryDate || null
      ]
    );

    const insertedOrder = {
      ...orderInsertResult.rows[0],
      status: status.name
    };

    for (const item of items) {
      await client.query(
        `
          INSERT INTO sales_order_item (
            order_id,
            product_sku,
            product_name,
            unit_price,
            quantity,
            line_total
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          insertedOrder.id,
          item.productSku,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.lineTotal
        ]
      );
    }

    await client.query("COMMIT");
    return insertedOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getSalesOrderByOrderNumber(orderNumber) {
  const result = await dbPool.query(
    `
      ${ORDER_SELECT_WITH_ITEMS_SQL}
      WHERE UPPER(so.order_number) = UPPER($1)
      GROUP BY so.id, os.name
      LIMIT 1
    `,
    [orderNumber]
  );

  return result.rows[0] || null;
}

export async function getSalesOrdersByCustomerEmail(customerEmail) {
  const result = await dbPool.query(
    `
      ${ORDER_SELECT_WITH_ITEMS_SQL}
      WHERE lower(so.customer_email) = lower($1)
      GROUP BY so.id, os.name
      ORDER BY so.created_at DESC
    `,
    [customerEmail]
  );

  return result.rows;
}

export async function getGuestSalesOrdersByCustomerEmail(customerEmail) {
  const result = await dbPool.query(
    `
      ${ORDER_SELECT_WITH_ITEMS_SQL}
      WHERE lower(so.customer_email) = lower($1)
        AND so.customer_id IS NULL
      GROUP BY so.id, os.name
      ORDER BY so.created_at DESC
    `,
    [customerEmail]
  );

  return result.rows;
}

export async function getSalesOrdersByCustomerId(customerId) {
  const result = await dbPool.query(
    `
      ${ORDER_SELECT_WITH_ITEMS_SQL}
      WHERE so.customer_id = $1
      GROUP BY so.id, os.name
      ORDER BY so.created_at DESC
    `,
    [customerId]
  );

  return result.rows;
}

export async function getAllSalesOrders() {
  const result = await dbPool.query(
    `
      ${ORDER_SELECT_WITH_ITEMS_SQL}
      GROUP BY so.id, os.name
      ORDER BY so.created_at DESC
    `
  );

  return result.rows;
}

export async function getAvailableOrderStatuses() {
  const result = await dbPool.query(
    `
      SELECT id, name
      FROM order_status
      ORDER BY id ASC
    `
  );

  return result.rows;
}

export async function updateSalesOrderStatusByOrderNumber({ orderNumber, statusName }) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const statusResult = await client.query(
      `
        SELECT id, name
        FROM order_status
        WHERE lower(name) = lower($1)
        LIMIT 1
      `,
      [statusName]
    );

    const status = statusResult.rows[0] || null;

    if (!status) {
      await client.query("ROLLBACK");
      return null;
    }

    const orderUpdateResult = await client.query(
      `
        UPDATE sales_order
        SET status_id = $1,
            updated_at = NOW()
        WHERE upper(order_number) = upper($2)
        RETURNING id
      `,
      [status.id, orderNumber]
    );

    if (!orderUpdateResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getSalesOrderByOrderNumber(orderNumber);
}

export async function updateSalesOrderExpectedDeliveryDateByOrderNumber({
  orderNumber,
  expectedDeliveryDate
}) {
  const result = await dbPool.query(
    `
      UPDATE sales_order
      SET expected_delivery_date = $1,
          updated_at = NOW()
      WHERE upper(order_number) = upper($2)
      RETURNING id
    `,
    [expectedDeliveryDate, orderNumber]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getSalesOrderByOrderNumber(orderNumber);
}
