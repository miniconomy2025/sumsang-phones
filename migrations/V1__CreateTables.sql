Table orders {
  order_id int [pk, not null, increment]

  price decimal [not null]
  status int [not null, ref: > status.status_id]
  created_at datetime [not null]
}

Table consumer_deliveries {
  consumer_delivery_id int [pk, not null, increment]
  order_id int [not null, ref: > orders.order_id]
  delivery_reference int [not null, unique]
  cost decimal [not null]
  status int [not null, ref: > status.status_id]
  account_id int [not null, ref: > accounts.account_id]
}

Table order_items {
  order_item_id int [pk, not null, increment]
  order_id int [not null, ref: > orders.order_id]
  phone_id int [not null, ref: > phones.phone_id]
  quantity int [not null]
}

Table phones {
  phone_id int [pk, not null, increment]
  model varchar(30) [not null]
  price decimal [not null]
}

Table stock {
  stock_id int [pk, not null, increment]
  phone_id int [not null, ref: > phones.phone_id]
  quantity_available int [not null]
  quantity_reserved int [not null]
  updated_at datetime [not null]
}

Table machines {
  machine_id int [pk, not null, increment]
  phone_id int [not null, ref: > phones.phone_id]
  rate_per_day int [not null]
}

Table machine_ratios {
  machine_ratio_id int [pk, not null, increment]
  machine_id int [not null, ref: > machines.machine_id]
  part_id int [not null, ref: > parts.part_id]
  quantity int [not null]
}

Table parts {
  part_id int [pk, not null, increment]
  name varchar(30) [not null]
}

Table inventory {
  inventory_id int [pk, not null, increment]
  part_id int [not null, ref: > parts.part_id]
  quantity_available int [not null]
}

Table suppliers {
  supplier_id int [pk, not null, increment]
  name varchar(30) [not null]
  account_id int [not null, ref: > accounts.account_id]
  address varchar(50) [not null]
}

Table parts_supplier {
  parts_supplier_id int [pk, not null, increment]
  part_id int [not null, ref: > parts.part_id]
  supplier_id int [not null, ref: > suppliers.supplier_id]
  cost decimal [not null]
}

Table parts_purchases {
  parts_purchase_id int [pk, not null, increment]
  reference_number int [not null]
  cost decimal [not null]
  status int [not null, ref: > status.status_id]
  purchased_at datetime [not null]
}

Table parts_purchases_items {
  parts_purchases_items_id int [pk, not null, increment]
  part_supplier_id int [not null, ref: > parts_supplier.parts_supplier_id]
  parts_purchase_id int [not null, ref: > parts_purchases.parts_purchase_id]
  quantity int [not null]
}

Table bulk_deliveries {
  bulk_delivery_id int [pk, not null, increment]
  parts_purchase_id int [not null, ref: > parts_purchases.parts_purchase_id]
  delivery_reference int [not null, unique]
  cost decimal [not null]
  status int [not null, ref: > status.status_id]
  address varchar(50) [not null]
  account_id int [not null, ref: > accounts.account_id]
}

Table status {
  status_id int [pk, not null, increment]
  description varchar(30) [not null]
}

Table system_settings {
  system_setting_id int [pk, not null, increment]
  key varchar(30) [not null]
  value varchar(30) [not null]
}

Table accounts {
  account_id int [pk, not null, increment]
  account_name varchar(20) [not null]
  account_number varchar(10) [not null]
}