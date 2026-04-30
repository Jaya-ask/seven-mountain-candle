import { dbPool } from "../config/database.js";

const ADMIN_PRODUCT_SELECT_SQL = `
  WITH category_agg AS (
    SELECT
      pc.product_sku,
      COALESCE(array_agg(c.id ORDER BY c.name), '{}'::text[]) AS category_ids,
      COALESCE(array_agg(c.name ORDER BY c.name), '{}'::text[]) AS category_names
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
    COALESCE(ca.category_ids, '{}'::text[]) AS category_ids,
    COALESCE(ca.category_names, '{}'::text[]) AS category_names,
    COALESCE(ia.images, '[]'::json) AS images,
    COALESCE(ia.primary_image_url, '') AS image_url
  FROM product p
  LEFT JOIN category_agg ca ON ca.product_sku = p.sku
  LEFT JOIN image_agg ia ON ia.product_sku = p.sku
`;

function normalizeImages(images) {
  const validImages = Array.isArray(images)
    ? images
        .map((entry) => ({
          url: entry?.url?.toString().trim() || "",
          isPrimary: Boolean(entry?.isPrimary),
          sortOrder: Number(entry?.sortOrder) || 0
        }))
        .filter((entry) => entry.url)
    : [];

  if (validImages.length === 0) {
    return [];
  }

  if (!validImages.some((entry) => entry.isPrimary)) {
    validImages[0].isPrimary = true;
  }

  return validImages.map((entry, index) => ({
    ...entry,
    isPrimary: entry.isPrimary && validImages.findIndex((candidate) => candidate.isPrimary) === index,
    sortOrder: Number.isFinite(entry.sortOrder) ? entry.sortOrder : index
  }));
}

async function assertCategoriesExist(client, categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return;
  }

  const result = await client.query(
    `
      SELECT id
      FROM category
      WHERE id = ANY($1::text[])
    `,
    [categoryIds]
  );

  const found = new Set(result.rows.map((row) => row.id));
  const missing = categoryIds.filter((id) => !found.has(id));

  if (missing.length > 0) {
    throw new Error(`Invalid category id(s): ${missing.join(", ")}`);
  }
}

async function replaceProductCategories(client, sku, categoryIds) {
  await client.query(
    `
      DELETE FROM product_category
      WHERE product_sku = $1
    `,
    [sku]
  );

  for (const categoryId of categoryIds) {
    await client.query(
      `
        INSERT INTO product_category (product_sku, category_id)
        VALUES ($1, $2)
      `,
      [sku, categoryId]
    );
  }
}

async function replaceProductImages(client, sku, images) {
  await client.query(
    `
      DELETE FROM product_image
      WHERE product_sku = $1
    `,
    [sku]
  );

  const normalizedImages = normalizeImages(images);

  for (const image of normalizedImages) {
    await client.query(
      `
        INSERT INTO product_image (product_sku, image_url, is_primary, sort_order)
        VALUES ($1, $2, $3, $4)
      `,
      [sku, image.url, image.isPrimary, image.sortOrder]
    );
  }
}

export async function getAdminProductRows() {
  const result = await dbPool.query(
    `
      ${ADMIN_PRODUCT_SELECT_SQL}
      ORDER BY p.sku
    `
  );

  return result.rows;
}

export async function getCategoryRows() {
  const result = await dbPool.query(
    `
      SELECT id, name
      FROM category
      ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function getProductBySku(sku) {
  const result = await dbPool.query(
    `
      ${ADMIN_PRODUCT_SELECT_SQL}
      WHERE upper(p.sku) = upper($1)
      LIMIT 1
    `,
    [sku]
  );

  return result.rows[0] || null;
}

async function getNextSortOrderForProduct(client, sku) {
  const result = await client.query(
    `
      SELECT COALESCE(MAX(sort_order), -1) AS max_sort_order
      FROM product_image
      WHERE upper(product_sku) = upper($1)
    `,
    [sku]
  );

  const maxSortOrder = Number(result.rows[0]?.max_sort_order);
  return Number.isFinite(maxSortOrder) ? maxSortOrder + 1 : 0;
}

export async function addProductImageRow({ sku, imageUrl, isPrimary }) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `
        SELECT sku
        FROM product
        WHERE upper(sku) = upper($1)
        LIMIT 1
      `,
      [sku]
    );

    if (!productResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    const normalizedSku = productResult.rows[0].sku;
    const shouldBePrimary = Boolean(isPrimary);

    if (shouldBePrimary) {
      await client.query(
        `
          UPDATE product_image
          SET is_primary = FALSE
          WHERE upper(product_sku) = upper($1)
        `,
        [normalizedSku]
      );
    }

    const sortOrder = await getNextSortOrderForProduct(client, normalizedSku);

    await client.query(
      `
        INSERT INTO product_image (product_sku, image_url, is_primary, sort_order)
        VALUES ($1, $2, $3, $4)
      `,
      [normalizedSku, imageUrl, shouldBePrimary, sortOrder]
    );

    await client.query("COMMIT");
    return normalizedSku;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeProductImageRow({ sku, imageUrl }) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const deleteResult = await client.query(
      `
        DELETE FROM product_image
        WHERE upper(product_sku) = upper($1)
          AND image_url = $2
        RETURNING is_primary, image_url
      `,
      [sku, imageUrl || ""]
    );

    const deletedImage = deleteResult.rows[0] || null;
    if (!deletedImage) {
      await client.query("ROLLBACK");
      return null;
    }

    if (deletedImage.is_primary) {
      const nextImageResult = await client.query(
        `
          SELECT id
          FROM product_image
          WHERE upper(product_sku) = upper($1)
          ORDER BY sort_order ASC, created_at ASC
          LIMIT 1
        `,
        [sku]
      );

      const nextImageId = nextImageResult.rows[0]?.id;
      if (nextImageId) {
        await client.query(
          `
            UPDATE product_image
            SET is_primary = TRUE
            WHERE id = $1
          `,
          [nextImageId]
        );
      }
    }

    await client.query("COMMIT");

    return {
      deletedImageUrl: deletedImage.image_url || ""
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createAdminProductRow(payload) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const sku = payload.sku.toString().trim();
    const categoryIds = Array.isArray(payload.categoryIds) ? payload.categoryIds : [];
    const images = Array.isArray(payload.images) ? payload.images : [];

    await assertCategoriesExist(client, categoryIds);

    await client.query(
      `
        INSERT INTO product (sku, name, description, tags, uom, material, packing, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        sku,
        payload.name,
        payload.description,
        payload.tags,
        payload.uom,
        payload.material,
        payload.packing,
        payload.price
      ]
    );

    await replaceProductCategories(client, sku, categoryIds);
    await replaceProductImages(client, sku, images);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAdminProductRow({ existingSku, payload }) {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const nextSku = payload.sku.toString().trim();
    const categoryIds = Array.isArray(payload.categoryIds) ? payload.categoryIds : [];
    const images = Array.isArray(payload.images) ? payload.images : [];

    await assertCategoriesExist(client, categoryIds);

    await client.query(
      `
        DELETE FROM product_category
        WHERE upper(product_sku) = upper($1)
      `,
      [existingSku]
    );

    await client.query(
      `
        DELETE FROM product_image
        WHERE upper(product_sku) = upper($1)
      `,
      [existingSku]
    );

    const updateResult = await client.query(
      `
        UPDATE product
        SET
          sku = $1,
          name = $2,
          description = $3,
          tags = $4,
          uom = $5,
          material = $6,
          packing = $7,
          price = $8
        WHERE upper(sku) = upper($9)
        RETURNING sku
      `,
      [
        nextSku,
        payload.name,
        payload.description,
        payload.tags,
        payload.uom,
        payload.material,
        payload.packing,
        payload.price,
        existingSku
      ]
    );

    const updated = updateResult.rows[0] || null;
    if (!updated) {
      await client.query("ROLLBACK");
      return null;
    }

    await replaceProductCategories(client, updated.sku, categoryIds);
    await replaceProductImages(client, updated.sku, images);

    await client.query("COMMIT");
    return updated.sku;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAdminProductRow(sku) {
  const result = await dbPool.query(
    `
      DELETE FROM product
      WHERE upper(sku) = upper($1)
      RETURNING sku
    `,
    [sku]
  );

  return result.rows[0] || null;
}