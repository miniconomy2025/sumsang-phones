CREATE TABLE machine_purchases (
    machine_purchases_id SERIAL PRIMARY KEY,
    phone_id INT NOT NULL REFERENCES phones(phone_id),
    machines_purchased INT NOT NULL,
    total_cost DECIMAL NOT NULL,
    weight_per_machine INT NOT NULL,
    rate_per_day INT NOT NULL
);


ALTER TABLE machine_deliveries
ADD COLUMN units_received INT NOT NULL;

ALTER TABLE machine_deliveries
DROP COLUMN machine_id;

ALTER TABLE machine_deliveries
ADD COLUMN machine_purchases_id INT;

ALTER TABLE machine_deliveries
ADD CONSTRAINT fk_machine_deliveries_machine_purchases
FOREIGN KEY (machine_purchases_id) REFERENCES machine_purchases(machine_purchases_id);
