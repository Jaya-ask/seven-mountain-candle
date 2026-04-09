BEGIN;

UPDATE product p
SET description = CONCAT(
  p.name,
  ' is a hand-finished candle designed to bring warmth and character to your space. ',
  'Its sculpted form and balanced finish make it ideal for everyday decor, gifting, and festive styling. ',
  'Each ',
  lower(COALESCE(NULLIF(p.uom, ''), 'piece')),
  ' piece is thoughtfully prepared to add a calm, premium touch to your home.'
)
WHERE p.description IS NULL
   OR btrim(p.description) = ''
   OR p.description = CONCAT(p.name, ' candle crafted for everyday decor and gifting.');

COMMIT;
