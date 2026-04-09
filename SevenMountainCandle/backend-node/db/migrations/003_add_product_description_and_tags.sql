BEGIN;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Backfill description for existing rows that do not have one.
UPDATE product p
SET description = CONCAT(p.name, ' candle crafted for everyday decor and gifting.')
WHERE p.description IS NULL OR btrim(p.description) = '';

-- Build category-derived tags to seed existing rows that have empty tags.
WITH category_tags AS (
  SELECT
    pc.product_sku,
    ARRAY_AGG(
      DISTINCT lower(regexp_replace(c.name, '[^a-z0-9]+', '-', 'g'))
    ) AS category_tag_list
  FROM product_category pc
  INNER JOIN category c ON c.id = pc.category_id
  GROUP BY pc.product_sku
)
UPDATE product p
SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT tag
    FROM unnest(
      COALESCE(ct.category_tag_list, '{}'::text[])
      || ARRAY[
        lower(regexp_replace(p.name, '[^a-z0-9]+', '-', 'g')),
        lower(regexp_replace(p.uom, '[^a-z0-9]+', '-', 'g')),
        'candle'
      ]::text[]
    ) AS tag
    WHERE tag IS NOT NULL
      AND tag <> ''
      AND tag <> '-'
  )
)
FROM category_tags ct
WHERE p.sku = ct.product_sku
  AND (p.tags IS NULL OR cardinality(p.tags) = 0);

-- Ensure rows without category links still get baseline tags.
UPDATE product p
SET tags = ARRAY[
  lower(regexp_replace(p.name, '[^a-z0-9]+', '-', 'g')),
  lower(regexp_replace(p.uom, '[^a-z0-9]+', '-', 'g')),
  'candle'
]::text[]
WHERE p.tags IS NULL OR cardinality(p.tags) = 0;

COMMIT;
