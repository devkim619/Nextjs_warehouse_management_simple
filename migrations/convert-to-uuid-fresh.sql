-- Migration: Convert warehouse_items and vehicles to UUID (FRESH START - NO DATA MIGRATION)
-- This will DROP existing tables and create new ones with UUID
-- All existing data will be LOST - only use if starting fresh or backed up

BEGIN;

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables (cascades to FKs)
DROP TABLE IF EXISTS warehouse_items CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- 3. Create vehicles table with UUID
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR(20) NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create warehouse_items table with UUID
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

-- 5. Create indexes for performance
CREATE INDEX idx_vehicles_province ON vehicles(province_id);
CREATE INDEX idx_warehouse_items_delivery_vehicle ON warehouse_items(delivery_vehicle_id);
CREATE INDEX idx_warehouse_items_pickup_vehicle ON warehouse_items(pickup_vehicle_id);
CREATE INDEX idx_warehouse_items_status ON warehouse_items(status);
CREATE INDEX idx_warehouse_items_entry_date ON warehouse_items(entry_date);

COMMIT;

-- Verify
SELECT 'Migration complete - tables recreated with UUID' AS status;
SELECT COUNT(*) AS vehicles_count FROM vehicles;
SELECT COUNT(*) AS warehouse_items_count FROM warehouse_items;
