BEGIN;

UPDATE product p
SET tags = COALESCE((
  SELECT ARRAY(
    SELECT DISTINCT cleaned_tag
    FROM (
      SELECT
        NULLIF(
          regexp_replace(
            regexp_replace(
              lower(replace(raw_tag, '&', 'and')),
              '[^a-z0-9]+',
              '-',
              'g'
            ),
            '(^-+|-+$)',
            '',
            'g'
          ),
          ''
        ) AS cleaned_tag
      FROM unnest(COALESCE(p.tags, '{}'::text[])) AS source(raw_tag)
    ) normalized
    WHERE cleaned_tag IS NOT NULL
      AND cleaned_tag <> '-'
  )
), '{}'::text[]);

COMMIT;
