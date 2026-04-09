BEGIN;

CREATE TABLE IF NOT EXISTS order_status (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO order_status (name)
VALUES
  ('Pending'),
  ('Confirmed'),
  ('Processing'),
  ('Shipped'),
  ('Out for Delivery'),
  ('Delivered'),
  ('Cancelled')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE sales_order
  ADD COLUMN IF NOT EXISTS status_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_order_status_id_fkey'
  ) THEN
    ALTER TABLE sales_order
      ADD CONSTRAINT sales_order_status_id_fkey
      FOREIGN KEY (status_id)
      REFERENCES order_status (id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'sales_order'
      AND column_name = 'status'
  ) THEN
    UPDATE sales_order so
    SET status_id = os.id
    FROM order_status os
    WHERE so.status_id IS NULL
      AND (
        lower(btrim(COALESCE(so.status, ''))) = lower(os.name)
        OR (
          lower(btrim(COALESCE(so.status, ''))) = 'received'
          AND os.name = 'Pending'
        )
      );
  END IF;
END $$;

UPDATE sales_order so
SET status_id = os.id
FROM order_status os
WHERE so.status_id IS NULL
  AND os.name = 'Pending';

ALTER TABLE sales_order
  ALTER COLUMN status_id SET NOT NULL;

ALTER TABLE sales_order
  DROP COLUMN IF EXISTS status;

CREATE INDEX IF NOT EXISTS idx_sales_order_status_id
  ON sales_order (status_id);

COMMIT;
