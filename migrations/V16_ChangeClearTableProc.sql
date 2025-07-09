UPDATE phones
SET price = 2500
where phone_id = 1;

UPDATE phones
SET price = 5000;
WHERE phone_id = 2;

UPDATE phones
SET price = 7500;
where phone_id = 3;

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

  UPDATE phones
  SET price = 2500
  where phone_id = 1;
  
  UPDATE phones
  SET price = 5000;
  WHERE phone_id = 2;
  
  UPDATE phones
  SET price = 7500;
  where phone_id = 3;
  
  UPDATE stock SET quantity_available = 0, quantity_reserved = 0;
  UPDATE inventory SET quantity_available = 0;
  UPDATE suppliers SET cost = 0;

  RAISE NOTICE 'All tables cleared except status and phones. Phone prices reset to 0.00.';
END;
$$;
