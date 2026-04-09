BEGIN;

CREATE TABLE IF NOT EXISTS customer (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT,
  has_account BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sales_order
  ADD COLUMN IF NOT EXISTS customer_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_order_customer_id_fkey'
  ) THEN
    ALTER TABLE sales_order
      ADD CONSTRAINT sales_order_customer_id_fkey
      FOREIGN KEY (customer_id)
      REFERENCES customer (id);
  END IF;
END $$;

INSERT INTO customer (full_name, email, phone, has_account)
SELECT DISTINCT
  so.customer_name,
  lower(so.customer_email),
  so.customer_phone,
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
  AND lower(so.customer_email) = c.email;

CREATE INDEX IF NOT EXISTS idx_sales_order_customer_id
  ON sales_order (customer_id);

COMMIT;
