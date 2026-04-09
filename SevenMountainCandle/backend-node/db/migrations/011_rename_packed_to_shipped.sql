BEGIN;

-- Normalize status name in order_status while keeping unique constraint safe.
DO $$
DECLARE
  packed_id BIGINT;
  shipped_id BIGINT;
BEGIN
  SELECT id INTO packed_id
  FROM order_status
  WHERE name = 'Packed'
  LIMIT 1;

  SELECT id INTO shipped_id
  FROM order_status
  WHERE name = 'Shipped'
  LIMIT 1;

  IF packed_id IS NOT NULL AND shipped_id IS NULL THEN
    UPDATE order_status
    SET name = 'Shipped',
        updated_at = NOW()
    WHERE id = packed_id;
  ELSIF packed_id IS NOT NULL AND shipped_id IS NOT NULL THEN
    UPDATE sales_order
    SET status_id = shipped_id
    WHERE status_id = packed_id;

    DELETE FROM order_status
    WHERE id = packed_id;
  END IF;
END $$;

-- Backward-compatibility: if any legacy text status column still exists, normalize it too.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'sales_order'
      AND column_name = 'status'
  ) THEN
    UPDATE sales_order
    SET status = 'Shipped'
    WHERE lower(btrim(COALESCE(status, ''))) = 'packed';
  END IF;
END $$;

COMMIT;
