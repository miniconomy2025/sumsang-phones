ALTER TABLE consumer_deliveries DROP CONSTRAINT consumer_deliveries_delivery_reference_key;
ALTER TABLE consumer_deliveries ALTER COLUMN delivery_reference TYPE UUID USING (uuid_generate_v4());
ALTER TABLE consumer_deliveries ADD CONSTRAINT uq_consumer_deliveries_delivery_reference UNIQUE (delivery_reference);