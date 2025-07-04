INSERT INTO status (description) VALUES
  ('PendingPayment'),
  ('PendingStock'),
  ('PendingDeliveryCollection'),
  ('Shipped');

INSERT INTO phones (model, price) VALUES
  ('Cosmos Z25', 0.0),
  ('Cosmos Z25 ultra', 0.0),
  ('Cosmos Z25 FE', 0.0);


INSERT INTO status (description) VALUES
  ('Paid'),
  ('AwaitingShipment'),
  ('Delivered'),
  ('AwaitingPickup'),
  ('InTransit'),
  ('Received'),
  ('Cancelled');

INSERT INTO system_settings (key, value) VALUES
('bulk_logistics_cost_per_unit', '1.50'),
('consumer_logistics_cost_per_unit', '5.00')
ON CONFLICT (key) DO NOTHING;
