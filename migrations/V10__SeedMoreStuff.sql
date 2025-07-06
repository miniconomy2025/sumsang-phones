INSERT INTO parts (name) VALUES
  ('Cases'),
  ('Screens'),
  ('Electronics');

INSERT INTO suppliers (part_id, cost, name, address) VALUES
  (1, 0, 'case-supplier', 'case-supplier'),
  (2, 0, 'screen-supplier', 'screen-supplier'),
  (3, 0, 'electronics-supplier', 'electronics-supplier'),

INSERT INTO inventory (part_id, quantity_available) VALUES
  (1, 0),
  (2, 0),
  (3, 0);

INSERT INTO stock (phone_id, quantity_available, quantity_reserved, updated_at) VALUES
  (1, 0, 0, now),
  (2, 0, 0, now),
  (3, 0, 0, now);