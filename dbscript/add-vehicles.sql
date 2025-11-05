-- Create vehicles table
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"plate_number" varchar(20) NOT NULL,
	"province_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key to provinces
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_province_id_provinces_id_fk"
FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;

-- Alter warehouse_items to add vehicle foreign keys
ALTER TABLE "warehouse_items" ADD COLUMN IF NOT EXISTS "delivery_vehicle_id" integer;
ALTER TABLE "warehouse_items" ADD COLUMN IF NOT EXISTS "pickup_vehicle_id" integer;

-- Add foreign keys
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_delivery_vehicle_id_vehicles_id_fk"
FOREIGN KEY ("delivery_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_pickup_vehicle_id_vehicles_id_fk"
FOREIGN KEY ("pickup_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;

-- Drop old columns (optional - uncomment if you want to remove)
-- ALTER TABLE "warehouse_items" DROP COLUMN IF EXISTS "delivery_vehicle_plate";
-- ALTER TABLE "warehouse_items" DROP COLUMN IF EXISTS "pickup_vehicle_plate";
