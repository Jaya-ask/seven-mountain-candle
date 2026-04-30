BEGIN;

CREATE TABLE IF NOT EXISTS customer_cart_item (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer (id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL REFERENCES product (sku) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, product_sku)
);

CREATE INDEX IF NOT EXISTS idx_customer_cart_item_customer_id
  ON customer_cart_item (customer_id);

COMMIT;