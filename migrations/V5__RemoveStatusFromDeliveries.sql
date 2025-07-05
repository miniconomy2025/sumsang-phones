ALTER TABLE bulk_deliveries
DROP COLUMN status
ADD COLUMN units_received INT NOT NULL;

ALTER TABLE consumer_deliveries
DROP COLUMN status
ADD COLUMN units_collected INT NOT NULL;
