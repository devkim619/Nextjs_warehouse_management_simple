import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

// Enum สำหรับสถานะสินค้า
export const warehouseStatusEnum = pgEnum('warehouse_status', [
	'in_stock',
	'out_for_delivery',
	'delivered',
])

// Table สาขา (branches) - รองรับหลายสาขา
export const branches = pgTable('branches', {
	id: integer('id').primaryKey(),
	code: varchar('code', { length: 10 }).notNull().unique(), // BKK, CNX, PKT
	nameTh: varchar('name_th', { length: 150 }).notNull(),
	nameEn: varchar('name_en', { length: 150 }).notNull(),
	location: text('location'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

// Table หมวดหมู่สินค้า (categories)
export const categories = pgTable('categories', {
	id: integer('id').primaryKey(),
	code: varchar('code', { length: 10 }).notNull().unique(), // ELEC, FURN, FOOD
	nameTh: varchar('name_th', { length: 100 }).notNull(),
	nameEn: varchar('name_en', { length: 100 }).notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

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
	id: uuid('id').primaryKey().defaultRandom(),
	plateNumber: varchar('plate_number', { length: 20 }).notNull(), // เลขทะเบียน เช่น "กก 1234"
	provinceId: integer('province_id')
		.notNull()
		.references(() => provinces.id), // จังหวัดที่ออกทะเบียน
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export const warehouseItems = pgTable('warehouse_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	stockId: varchar('stock_id', { length: 50 }).notNull().unique(), // SKU: BKK-ELEC-20250115-0001

	// ความสัมพันธ์
	branchId: integer('branch_id')
		.notNull()
		.references(() => branches.id),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id),

	// ข้อมูลสินค้า
	productName: varchar('product_name', { length: 255 }).notNull(),
	productImage: text('product_image'),

	// การจัดเก็บ
	storageLocation: varchar('storage_location', { length: 100 }).notNull(),
	palletCount: integer('pallet_count').notNull().default(1),
	packageCount: integer('package_count').notNull().default(1),
	itemCount: integer('item_count').notNull().default(1),

	// การเข้าคลัง
	entryDate: timestamp('entry_date').notNull().defaultNow(),
	deliveryVehicleId: uuid('delivery_vehicle_id').references(() => vehicles.id), // FK to vehicles
	containerNumber: varchar('container_number', { length: 50 }).notNull(),

	// การออกจากคลัง
	exitDate: timestamp('exit_date'),
	pickupVehicleId: uuid('pickup_vehicle_id').references(() => vehicles.id), // FK to vehicles

	// สถานะ
	status: warehouseStatusEnum('status').notNull().default('in_stock'),

	// QR Code
	qrCodeImage: text('qr_code_image'),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

export type Branch = typeof branches.$inferSelect
export type NewBranch = typeof branches.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert

export type Vehicle = typeof vehicles.$inferSelect
export type NewVehicle = typeof vehicles.$inferInsert

export type WarehouseItem = typeof warehouseItems.$inferSelect
export type NewWarehouseItem = typeof warehouseItems.$inferInsert

// Status type
export type WarehouseStatus = 'in_stock' | 'out_for_delivery' | 'delivered'
