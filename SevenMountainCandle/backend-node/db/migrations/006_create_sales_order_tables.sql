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

CREATE TABLE IF NOT EXISTS customer_address (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer (id) ON DELETE CASCADE,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  location_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS sales_order (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id BIGINT REFERENCES customer (id),
  customer_address_id BIGINT REFERENCES customer_address (id),
  status_id BIGINT NOT NULL REFERENCES order_status (id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_location TEXT,
  payment_method TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'AED',
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_item (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES sales_order (id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL REFERENCES product (sku),
  product_name TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_order_created_at
  ON sales_order (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_order_customer_id
  ON sales_order (customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_address_customer_id
  ON customer_address (customer_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_customer_address_id
  ON sales_order (customer_address_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_status_id
  ON sales_order (status_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_item_order_id
  ON sales_order_item (order_id);

COMMIT;
