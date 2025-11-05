CREATE TYPE "public"."warehouse_status" AS ENUM('in_stock', 'out_for_delivery', 'delivered');--> statement-breakpoint
CREATE TABLE "provinces" (
	"id" integer PRIMARY KEY NOT NULL,
	"name_th" varchar(150) NOT NULL,
	"name_en" varchar(150) NOT NULL,
	"geography_id" integer NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"plate_number" varchar(20) NOT NULL,
	"province_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "warehouse_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"product_image" text,
	"storage_location" varchar(100) NOT NULL,
	"pallet_count" integer DEFAULT 1 NOT NULL,
	"package_count" integer DEFAULT 1 NOT NULL,
	"item_count" integer DEFAULT 1 NOT NULL,
	"entry_date" timestamp DEFAULT now() NOT NULL,
	"delivery_vehicle_id" integer,
	"container_number" varchar(50) NOT NULL,
	"exit_date" timestamp,
	"pickup_vehicle_id" integer,
	"status" "warehouse_status" DEFAULT 'in_stock' NOT NULL,
	"qr_code_image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_delivery_vehicle_id_vehicles_id_fk" FOREIGN KEY ("delivery_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_pickup_vehicle_id_vehicles_id_fk" FOREIGN KEY ("pickup_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;