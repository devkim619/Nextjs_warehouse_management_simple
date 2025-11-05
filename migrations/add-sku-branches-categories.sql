-- Migration: Add branches and categories tables, update warehouse_items
-- This will add SKU support and normalize category data

BEGIN;

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name_th VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create sequences for auto-increment
CREATE SEQUENCE IF NOT EXISTS branches_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq START 1;

-- 4. Drop warehouse_items and recreate with new structure
DROP TABLE IF EXISTS warehouse_items CASCADE;

CREATE TABLE warehouse_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id VARCHAR(50) NOT NULL UNIQUE,

    -- Relations
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),

    -- Product info
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,

    -- Storage
    storage_location VARCHAR(100) NOT NULL,
    pallet_count INTEGER NOT NULL DEFAULT 1,
    package_count INTEGER NOT NULL DEFAULT 1,
    item_count INTEGER NOT NULL DEFAULT 1,

    -- Inbound
    entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
    delivery_vehicle_id UUID REFERENCES vehicles(id),
    container_number VARCHAR(50) NOT NULL,

    -- Outbound
    exit_date TIMESTAMP,
    pickup_vehicle_id UUID REFERENCES vehicles(id),

    -- Status
    status warehouse_status NOT NULL DEFAULT 'in_stock',

    -- QR Code
    qr_code_image TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_warehouse_items_stock_id ON warehouse_items(stock_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_branch ON warehouse_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_category ON warehouse_items(category_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_status ON warehouse_items(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_entry_date ON warehouse_items(entry_date);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_delivery_vehicle ON warehouse_items(delivery_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_items_pickup_vehicle ON warehouse_items(pickup_vehicle_id);

CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

COMMIT;

-- Verify
SELECT 'Migration complete - branches and categories tables created' AS status;
SELECT COUNT(*) AS branches_count FROM branches;
SELECT COUNT(*) AS categories_count FROM categories;
SELECT COUNT(*) AS warehouse_items_count FROM warehouse_items;
