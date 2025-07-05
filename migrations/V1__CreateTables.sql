CREATE TABLE status (
    status_id SERIAL PRIMARY KEY,
    description VARCHAR(30) NOT NULL
);

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    account_name VARCHAR(20) NOT NULL,
    account_number VARCHAR(10) NOT NULL
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    price DECIMAL NOT NULL,
    status INT NOT NULL REFERENCES status(status_id),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE phones (
    phone_id SERIAL PRIMARY KEY,
    model VARCHAR(30) NOT NULL,
    price DECIMAL NOT NULL
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    phone_id INT NOT NULL REFERENCES phones(phone_id),
    quantity INT NOT NULL
);

CREATE TABLE stock (
    stock_id SERIAL PRIMARY KEY,
    phone_id INT NOT NULL REFERENCES phones(phone_id),
    quantity_available INT NOT NULL,
    quantity_reserved INT NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE machines (
    machine_id SERIAL PRIMARY KEY,
    phone_id INT NOT NULL REFERENCES phones(phone_id),
    rate_per_day INT NOT NULL
);

CREATE TABLE parts (
    part_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE machine_ratios (
    machine_ratio_id SERIAL PRIMARY KEY,
    machine_id INT NOT NULL REFERENCES machines(machine_id),
    part_id INT NOT NULL REFERENCES parts(part_id),
    quantity INT NOT NULL
);

CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    part_id INT NOT NULL REFERENCES parts(part_id),
    quantity_available INT NOT NULL
);

CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    account_id INT NOT NULL REFERENCES accounts(account_id),
    address VARCHAR(50) NOT NULL
);

CREATE TABLE parts_supplier (
    parts_supplier_id SERIAL PRIMARY KEY,
    part_id INT NOT NULL REFERENCES parts(part_id),
    supplier_id INT NOT NULL REFERENCES suppliers(supplier_id),
    cost DECIMAL NOT NULL
);

CREATE TABLE parts_purchases (
    parts_purchase_id SERIAL PRIMARY KEY,
    reference_number INT NOT NULL,
    cost DECIMAL NOT NULL,
    status INT NOT NULL REFERENCES status(status_id),
    purchased_at TIMESTAMP NOT NULL
);

CREATE TABLE parts_purchases_items (
    parts_purchases_items_id SERIAL PRIMARY KEY,
    part_supplier_id INT NOT NULL REFERENCES parts_supplier(parts_supplier_id),
    parts_purchase_id INT NOT NULL REFERENCES parts_purchases(parts_purchase_id),
    quantity INT NOT NULL
);

CREATE TABLE bulk_deliveries (
    bulk_delivery_id SERIAL PRIMARY KEY,
    parts_purchase_id INT NOT NULL REFERENCES parts_purchases(parts_purchase_id),
    delivery_reference INT NOT NULL UNIQUE,
    cost DECIMAL NOT NULL,
    status INT NOT NULL REFERENCES status(status_id),
    address VARCHAR(50) NOT NULL,
    account_id INT NOT NULL REFERENCES accounts(account_id)
);

CREATE TABLE consumer_deliveries (
    consumer_delivery_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    delivery_reference INT NOT NULL UNIQUE,
    cost DECIMAL NOT NULL,
    status INT NOT NULL REFERENCES status(status_id),
    account_id INT NOT NULL REFERENCES accounts(account_id)
);

CREATE TABLE system_settings (
    system_setting_id SERIAL PRIMARY KEY,
    key VARCHAR(30) NOT NULL,
    value VARCHAR(30) NOT NULL
);
