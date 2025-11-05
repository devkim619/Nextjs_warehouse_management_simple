import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// Enum สำหรับสถานะสินค้า
export const warehouseStatusEnum = pgEnum('warehouse_status', [
	'in_stock',
	'out_for_delivery',
	'delivered',
])

// Table จังหวัด (provinces)
export const provinces = pgTable('provinces', {
	id: integer('id').primaryKey(),
	nameTh: varchar('name_th', { length: 150 }).notNull(),
	nameEn: varchar('name_en', { length: 150 }).notNull(),
	geographyId: integer('geography_id').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at'),
	deletedAt: timestamp('deleted_at'),
})

// Table ยานพาหนะ (vehicles)
export const vehicles = pgTable('vehicles', {
	id: serial('id').primaryKey(),
	plateNumber: varchar('plate_number', { length: 20 }).notNull(), // เลขทะเบียน เช่น "กก 1234"
	provinceId: integer('province_id')
		.notNull()
		.references(() => provinces.id), // จังหวัดที่ออกทะเบียน
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export const warehouseItems = pgTable('warehouse_items', {
	id: serial('id').primaryKey(),

	// ข้อมูลสินค้า
	productName: varchar('product_name', { length: 255 }).notNull(),
	category: varchar('category', { length: 100 }).notNull(),
	productImage: text('product_image'),

	// การจัดเก็บ
	storageLocation: varchar('storage_location', { length: 100 }).notNull(),
	palletCount: integer('pallet_count').notNull().default(1),
	packageCount: integer('package_count').notNull().default(1),
	itemCount: integer('item_count').notNull().default(1),

	// การเข้าคลัง
	entryDate: timestamp('entry_date').notNull().defaultNow(),
	deliveryVehicleId: integer('delivery_vehicle_id').references(() => vehicles.id), // FK to vehicles
	containerNumber: varchar('container_number', { length: 50 }).notNull(),

	// การออกจากคลัง
	exitDate: timestamp('exit_date'),
	pickupVehicleId: integer('pickup_vehicle_id').references(() => vehicles.id), // FK to vehicles

	// สถานะ
	status: warehouseStatusEnum('status').notNull().default('in_stock'),

	// QR Code
	qrCodeImage: text('qr_code_image'),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert

export type Vehicle = typeof vehicles.$inferSelect
export type NewVehicle = typeof vehicles.$inferInsert

export type WarehouseItem = typeof warehouseItems.$inferSelect
export type NewWarehouseItem = typeof warehouseItems.$inferInsert

// Status type
export type WarehouseStatus = 'in_stock' | 'out_for_delivery' | 'delivered'
