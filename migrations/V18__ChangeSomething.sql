UPDATE phones
SET model = 'Cosmos Z25 Ultra'
WHERE model = 'Cosmos Z25 ultra';

ALTER TABLE machines
DROP COLUMN date_retired,
ADD COLUMN date_retired INT;