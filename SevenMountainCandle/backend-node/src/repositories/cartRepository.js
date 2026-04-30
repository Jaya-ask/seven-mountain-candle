import { dbPool } from "../config/database.js";

export async function getCartItemsByCustomerId(customerId) {
  const result = await dbPool.query(
    `
      SELECT
        product_sku,
        quantity
      FROM customer_cart_item
      WHERE customer_id = $1
      ORDER BY updated_at DESC, id DESC
    `,
    [customerId]
  );

  return result.rows;
}

export async function replaceCartItemsByCustomerId(customerId, items) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        DELETE FROM customer_cart_item
        WHERE customer_id = $1
      `,
      [customerId]
    );

    for (const item of items) {
      await client.query(
        `
          INSERT INTO customer_cart_item (
            customer_id,
            product_sku,
            quantity,
            updated_at
          )
          VALUES ($1, $2, $3, NOW())
        `,
        [customerId, item.productSku, item.quantity]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function clearCartByCustomerId(customerId) {
  await dbPool.query(
    `
      DELETE FROM customer_cart_item
      WHERE customer_id = $1
    `,
    [customerId]
  );
}
