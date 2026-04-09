ALTER TABLE sales_order
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMPTZ;

UPDATE sales_order
SET expected_delivery_date = created_at + ((4 + floor(random() * 3))::text || ' days')::interval
WHERE expected_delivery_date IS NULL;

-- If column already exists as TIMESTAMPTZ, convert it to DATE
ALTER TABLE sales_order
ALTER COLUMN expected_delivery_date TYPE DATE
USING expected_delivery_date::date;

