BEGIN;

ALTER TABLE customer
  ADD COLUMN IF NOT EXISTS role TEXT;

UPDATE customer
SET role = 'customer'
WHERE role IS NULL OR btrim(role) = '';

UPDATE customer
SET role = 'customer'
WHERE lower(role) NOT IN ('customer', 'admin');

ALTER TABLE customer
  ALTER COLUMN role SET DEFAULT 'customer';

ALTER TABLE customer
  ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_role_check'
  ) THEN
    ALTER TABLE customer
      ADD CONSTRAINT customer_role_check
      CHECK (lower(role) IN ('customer', 'admin'));
  END IF;
END $$;

INSERT INTO customer (
  full_name,
  email,
  phone,
  password_hash,
  has_account,
  role
)
VALUES (
  'Seven Mountains Admin',
  'admin@sevenmountains.com',
  '',
  'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
  TRUE,
  'admin'
)
ON CONFLICT (email)
DO UPDATE SET
  has_account = TRUE,
  role = 'admin',
  password_hash = COALESCE(NULLIF(customer.password_hash, ''), EXCLUDED.password_hash),
  updated_at = NOW();

UPDATE customer
SET role = 'customer'
WHERE lower(email) <> 'admin@sevenmountains.com'
  AND lower(role) <> 'customer';

COMMIT;
