CREATE OR REPLACE PROCEDURE clear_all_except_status_and_phones()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear dependent tables
  DELETE FROM parts_purchases_items;
  DELETE FROM bulk_deliveries;
  DELETE FROM parts_supplier;
  DELETE FROM parts_purchases;
  DELETE FROM suppliers;
  DELETE FROM inventory;
  DELETE FROM machine_ratios;
  DELETE FROM machines;
  DELETE FROM stock;
  DELETE FROM order_items;
  DELETE FROM consumer_deliveries;
  DELETE FROM orders;
  DELETE FROM parts;
  DELETE FROM accounts;
  DELETE FROM system_settings;

  -- Reset all phone prices to 0.00
  UPDATE phones SET price = 0.00;

  RAISE NOTICE 'All tables cleared except status and phones. Phone prices reset to 0.00.';
END;
$$;
