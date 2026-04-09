import { dbPool } from "../config/database.js";

export async function getCategories() {
  const result = await dbPool.query(`
    SELECT id, name
    FROM category
    ORDER BY name
  `);

  return result.rows;
}

export async function getCatalogProducts() {
  const result = await dbPool.query(`
    WITH category_agg AS (
      SELECT
        pc.product_sku,
        COALESCE(array_agg(c.id), '{}'::text[]) AS category_ids,
        COALESCE(array_agg(c.name), '{}'::text[]) AS category_names
      FROM product_category pc
      INNER JOIN category c ON c.id = pc.category_id
      GROUP BY pc.product_sku
    ),
    image_agg AS (
      SELECT
        pi.product_sku,
        COALESCE(
          json_agg(
            json_build_object(
              'url', pi.image_url,
              'isPrimary', pi.is_primary,
              'sortOrder', pi.sort_order
            )
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
          ),
          '[]'::json
        ) AS images,
        (ARRAY_AGG(pi.image_url ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC))[1] AS primary_image_url
      FROM product_image pi
      GROUP BY pi.product_sku
    ),
    review_agg AS (
      SELECT
        pr.product_sku,
        ROUND(AVG(pr.rating)::numeric, 1) AS avg_rating,
        COUNT(*)::int AS review_count
      FROM product_review pr
      GROUP BY pr.product_sku
    )
    SELECT
      p.sku,
      p.name,
      p.description,
      COALESCE(p.tags, '{}'::text[]) AS tags,
      p.uom,
      p.material,
      p.packing,
      p.price,
      ra.avg_rating AS avg_rating,
      COALESCE(ra.review_count, 0) AS review_count,
      COALESCE(ca.category_ids, '{}'::text[]) AS category_ids,
      COALESCE(ca.category_names, '{}'::text[]) AS category_names,
      COALESCE(ia.images, '[]'::json) AS images,
      COALESCE(ia.primary_image_url, '') AS image_url
    FROM product p
    LEFT JOIN category_agg ca ON ca.product_sku = p.sku
    LEFT JOIN image_agg ia ON ia.product_sku = p.sku
    LEFT JOIN review_agg ra ON ra.product_sku = p.sku
    ORDER BY p.sku
  `);

  return result.rows;
}
