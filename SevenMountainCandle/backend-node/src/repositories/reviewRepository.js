import { dbPool } from "../config/database.js";

const PRODUCT_ID_TO_SLUG_SQL = `
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(REPLACE(p.sku, '&', 'and'), '[^a-z0-9]+', '-', 'g'),
      '(^-+|-+$)',
      '',
      'g'
    )
  )
`;

const MATCH_PRODUCT_CTE = `
  WITH matched_product AS (
    SELECT p.sku
    FROM product p
    WHERE LOWER(p.sku) = LOWER($1)
       OR ${PRODUCT_ID_TO_SLUG_SQL} = LOWER($1)
    LIMIT 1
  )
`;

export async function getProductReviewsByIdentifier(productId) {
  const result = await dbPool.query(
    `
      ${MATCH_PRODUCT_CTE}
      SELECT
        pr.id,
        pr.product_sku,
        pr.customer_name,
        pr.title,
        pr.comment,
        pr.rating,
        pr.created_at
      FROM matched_product mp
      INNER JOIN product_review pr ON pr.product_sku = mp.sku
      ORDER BY pr.created_at DESC, pr.id DESC
    `,
    [productId]
  );

  return result.rows;
}

export async function createProductReviewByIdentifier(productId, review) {
  const result = await dbPool.query(
    `
      ${MATCH_PRODUCT_CTE}
      INSERT INTO product_review (
        product_sku,
        customer_name,
        title,
        comment,
        rating
      )
      SELECT
        mp.sku,
        $2,
        $3,
        $4,
        $5
      FROM matched_product mp
      RETURNING
        id,
        product_sku,
        customer_name,
        title,
        comment,
        rating,
        created_at
    `,
    [productId, review.name, review.title, review.comment, review.rating]
  );

  return result.rows[0] || null;
}
