BEGIN;

CREATE TABLE IF NOT EXISTS product_review (
  id BIGSERIAL PRIMARY KEY,
  product_sku TEXT NOT NULL REFERENCES product (sku) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_review_product_sku_created_at
  ON product_review (product_sku, created_at DESC);

COMMIT;
