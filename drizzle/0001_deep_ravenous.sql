ALTER TABLE "vehicles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "warehouse_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "warehouse_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "warehouse_items" ALTER COLUMN "delivery_vehicle_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "warehouse_items" ALTER COLUMN "pickup_vehicle_id" SET DATA TYPE uuid;