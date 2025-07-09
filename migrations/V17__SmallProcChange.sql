ALTER TABLE orders
DROP COLUMN created_at,
ADD COLUMN created_at INT NOT NULL;

ALTER TABLE consumer_deliveries
DROP COLUMN date_created ,
ADD COLUMN date_created INT NOT NULL;

ALTER TABLE stock
DROP COLUMN updated_at,
ADD COLUMN updated_at INT NOT NULL DEFAULT 0;

ALTER TABLE machines
DROP COLUMN date_acquired,
DROP COLUMN date_retired,
ADD COLUMN date_acquired INT NOT NULL,
ADD COLUMN date_retired INT NOT NULL;

ALTER TABLE machine_deliveries
DROP COLUMN created_at,
ADD COLUMN created_at INT NOT NULL;

ALTER TABLE bulk_deliveries
DROP COLUMN date_created,
ADD COLUMN date_created INT NOT NULL;

ALTER TABLE parts_purchases
DROP COLUMN purchased_at,
ADD COLUMN purchased_at INT NOT NULL;


CREATE OR REPLACE PROCEDURE clear_all_except_status_and_phones()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear dependent tables
  DELETE FROM consumer_deliveries;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM machine_ratios;
  DELETE FROM machines;
  DELETE FROM machine_deliveries;
  DELETE FROM machine_purchases;
  DELETE FROM bulk_deliveries;
  DELETE FROM parts_purchases;
  DELETE FROM system_settings;

  UPDATE phones
  SET price = 2500
  where phone_id = 1;
  
  UPDATE phones
  SET price = 5000
  WHERE phone_id = 2;
  
  UPDATE phones
  SET price = 7500
  where phone_id = 3;
  
  UPDATE stock SET quantity_available = 0, quantity_reserved = 0;
  UPDATE inventory SET quantity_available = 0;
  UPDATE suppliers SET cost = 0;

  RAISE NOTICE 'All tables cleared except status and phones. Phone prices reset to 0.00.';
END;
$$;