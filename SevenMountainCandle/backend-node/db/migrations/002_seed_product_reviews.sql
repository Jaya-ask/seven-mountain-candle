BEGIN;

WITH seed_reviews AS (
  SELECT *
  FROM (
    VALUES
      ('SMC0001', 'Aditi', 'Elegant finish', 'Beautiful texture and long burn time. Looks premium on my coffee table.', 5),
      ('SMC0002', 'Rahul', 'Great gift', 'Bought this for a housewarming and it was loved by everyone.', 4),
      ('SMC0005', 'Sneha', 'Festive vibe', 'Perfect candle for festive decor. Fragrance throw is pleasant.', 5),
      ('SMC0013', 'Nikhil', 'Solid pillar', 'Heavy and sturdy piece. Burns evenly and slowly.', 4),
      ('SMC0030', 'Mariam', 'Meaningful design', 'The detailing is clean and the finish quality is excellent.', 5),
      ('SMC0063', 'Vikram', 'Signature piece', 'This stands out in the room. Definitely a conversation starter.', 5),
      ('SMC0070', 'Pooja', 'Party favorite', 'Used for birthday decor and it looked amazing in photos.', 4),
      ('SMC0098', 'Harish', 'Worth it', 'Premium build and very good burn performance for the size.', 5)
  ) AS t(product_sku, customer_name, title, comment, rating)
)
INSERT INTO product_review (
  product_sku,
  customer_name,
  title,
  comment,
  rating
)
SELECT
  sr.product_sku,
  sr.customer_name,
  sr.title,
  sr.comment,
  sr.rating
FROM seed_reviews sr
INNER JOIN product p ON p.sku = sr.product_sku
WHERE NOT EXISTS (
  SELECT 1
  FROM product_review pr
  WHERE pr.product_sku = sr.product_sku
    AND pr.customer_name = sr.customer_name
    AND COALESCE(pr.title, '') = COALESCE(sr.title, '')
);

COMMIT;
