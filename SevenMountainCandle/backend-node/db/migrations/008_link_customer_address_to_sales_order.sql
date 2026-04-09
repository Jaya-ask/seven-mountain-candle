BEGIN;

CREATE TABLE IF NOT EXISTS customer_address (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer (id) ON DELETE CASCADE,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  location_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sales_order
  ADD COLUMN IF NOT EXISTS customer_address_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_order_customer_address_id_fkey'
  ) THEN
    ALTER TABLE sales_order
      ADD CONSTRAINT sales_order_customer_address_id_fkey
      FOREIGN KEY (customer_address_id)
      REFERENCES customer_address (id);
  END IF;
END $$;

INSERT INTO customer (full_name, email, phone, password_hash, has_account)
SELECT DISTINCT
  COALESCE(NULLIF(btrim(so.customer_name), ''), 'Guest Customer'),
  lower(so.customer_email),
  so.customer_phone,
  '',
  FALSE
FROM sales_order so
WHERE so.customer_email IS NOT NULL
  AND btrim(so.customer_email) <> ''
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, customer.phone);

UPDATE sales_order so
SET customer_id = c.id
FROM customer c
WHERE so.customer_id IS NULL
  AND so.customer_email IS NOT NULL
  AND btrim(so.customer_email) <> ''
  AND lower(so.customer_email) = c.email;

INSERT INTO customer_address (customer_id, address_line, city, location_label)
SELECT DISTINCT
  so.customer_id,
  so.shipping_address,
  so.shipping_city,
  NULLIF(btrim(so.shipping_location), '')
FROM sales_order so
WHERE so.customer_id IS NOT NULL
  AND so.shipping_address IS NOT NULL
  AND btrim(so.shipping_address) <> ''
  AND so.shipping_city IS NOT NULL
  AND btrim(so.shipping_city) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM customer_address ca
    WHERE ca.customer_id = so.customer_id
      AND ca.address_line = so.shipping_address
      AND ca.city = so.shipping_city
      AND COALESCE(ca.location_label, '') = COALESCE(NULLIF(btrim(so.shipping_location), ''), '')
  );

UPDATE sales_order so
SET customer_address_id = ca.id
FROM customer_address ca
WHERE so.customer_address_id IS NULL
  AND so.customer_id = ca.customer_id
  AND so.shipping_address = ca.address_line
  AND so.shipping_city = ca.city
  AND COALESCE(NULLIF(btrim(so.shipping_location), ''), '') = COALESCE(ca.location_label, '');

CREATE INDEX IF NOT EXISTS idx_customer_address_customer_id
  ON customer_address (customer_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_customer_address_id
  ON sales_order (customer_address_id);

COMMIT;
