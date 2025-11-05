-- Migration: Convert warehouse_items and vehicles to UUID primary keys
-- WARNING: This will DROP and RECREATE tables with existing data preserved
-- Make sure to backup your database before running this migration!

BEGIN;

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create temporary backup tables
CREATE TABLE vehicles_backup AS SELECT * FROM vehicles;
CREATE TABLE warehouse_items_backup AS SELECT * FROM warehouse_items;

-- 3. Drop existing tables (cascades to foreign keys)
DROP TABLE IF EXISTS warehouse_items CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- 4. Recreate vehicles table with UUID
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR(20) NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Recreate warehouse_items table with UUID
CREATE TABLE warehouse_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    product_image TEXT,
    storage_location VARCHAR(100) NOT NULL,
    pallet_count INTEGER NOT NULL DEFAULT 1,
    package_count INTEGER NOT NULL DEFAULT 1,
    item_count INTEGER NOT NULL DEFAULT 1,
    entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
    delivery_vehicle_id UUID REFERENCES vehicles(id),
    container_number VARCHAR(50) NOT NULL,
    exit_date TIMESTAMP,
    pickup_vehicle_id UUID REFERENCES vehicles(id),
    status warehouse_status NOT NULL DEFAULT 'in_stock',
    qr_code_image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Migrate vehicles data with new UUIDs
-- Create a mapping table for old ID -> new UUID
CREATE TEMP TABLE vehicle_id_mapping (
    old_id INTEGER,
    new_uuid UUID
);

-- Insert vehicles with new UUIDs and store mapping
INSERT INTO vehicles (id, plate_number, province_id, created_at, updated_at)
SELECT
    gen_random_uuid(),
    plate_number,
    province_id,
    created_at,
    updated_at
FROM vehicles_backup
RETURNING id, (SELECT id FROM vehicles_backup WHERE vehicles_backup.id = (
    -- This is a workaround; better approach below
    SELECT COUNT(*) FROM vehicles_backup vb2 WHERE vb2.id <= vehicles_backup.id
)) AS old_id;

-- Better approach: Use a sequence to map old IDs
DO $$
DECLARE
    rec RECORD;
    new_uuid UUID;
BEGIN
    FOR rec IN SELECT * FROM vehicles_backup ORDER BY id LOOP
        new_uuid := gen_random_uuid();

        INSERT INTO vehicles (id, plate_number, province_id, created_at, updated_at)
        VALUES (new_uuid, rec.plate_number, rec.province_id, rec.created_at, rec.updated_at);

        INSERT INTO vehicle_id_mapping (old_id, new_uuid)
        VALUES (rec.id, new_uuid);
    END LOOP;
END $$;

-- 7. Migrate warehouse_items data
DO $$
DECLARE
    rec RECORD;
    new_delivery_uuid UUID;
    new_pickup_uuid UUID;
BEGIN
    FOR rec IN SELECT * FROM warehouse_items_backup ORDER BY id LOOP
        -- Get new UUIDs for vehicle references
        SELECT new_uuid INTO new_delivery_uuid
        FROM vehicle_id_mapping
        WHERE old_id = rec.delivery_vehicle_id;

        SELECT new_uuid INTO new_pickup_uuid
        FROM vehicle_id_mapping
        WHERE old_id = rec.pickup_vehicle_id;

        INSERT INTO warehouse_items (
            id, product_name, category, product_image, storage_location,
            pallet_count, package_count, item_count, entry_date,
            delivery_vehicle_id, container_number, exit_date, pickup_vehicle_id,
            status, qr_code_image, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            rec.product_name, rec.category, rec.product_image, rec.storage_location,
            rec.pallet_count, rec.package_count, rec.item_count, rec.entry_date,
            new_delivery_uuid, rec.container_number, rec.exit_date, new_pickup_uuid,
            rec.status, rec.qr_code_image, rec.created_at, rec.updated_at
        );
    END LOOP;
END $$;

-- 8. Drop backup tables and mapping table
DROP TABLE IF EXISTS vehicles_backup;
DROP TABLE IF EXISTS warehouse_items_backup;
DROP TABLE IF EXISTS vehicle_id_mapping;

-- 9. Verify migration
SELECT 'Vehicles migrated:' AS info, COUNT(*) AS count FROM vehicles;
SELECT 'Warehouse items migrated:' AS info, COUNT(*) AS count FROM warehouse_items;

COMMIT;

-- If you want to rollback, run: ROLLBACK;
