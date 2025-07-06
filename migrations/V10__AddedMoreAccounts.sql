ALTER TABLE bulk_deliveries
ADD COLUMN account_number varchar(12) NOT NULL;

ALTER TABLE consumer_deliveries
ADD COLUMN account_number varchar(12) NOT NULL;

ALTER TABLE machines
ADD COLUMN date_acquired TIMESTAMP;

ALTER TABLE machines 
ADD COLUMN date_retired TIMESTAMP;

CREATE TABLE machine_deliveries (
    machine_deliveries_id SERIAL PRIMARY KEY,
    machine_id INT NOT NULL REFERENCES machines(machine_id),
    delivery_reference INT NOT NULL,
    cost DECIMAL NOT NULL,
    address varchar(50) not null,
    account_number varchar(12) not null,
    created_at TIMESTAMP NOT NULL
);

INSERT INTO status (description) VALUES
  ('Cancelled');

DROP TABLE parts_purchases_items;

DROP TABLE parts_supplier;

ALTER TABLE parts_purchases
ADD COLUMN part_id INT NOT NULL REFERENCES parts(part_id),
ADD COLUMN quantity INT NOT NULL;

ALTER TABLE suppliers
ADD COLUMN part_id INT NOT NULL REFERENCES parts(part_id),
ADD COLUMN cost DECIMAL NOT NULL;

INSERT INTO status (description) VALUES
  ('PendingDeliveryDropOff');