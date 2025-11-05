-- Drop old vehicle plate columns from warehouse_items table
ALTER TABLE warehouse_items DROP COLUMN IF EXISTS delivery_vehicle_plate;
ALTER TABLE warehouse_items DROP COLUMN IF EXISTS pickup_vehicle_plate;
