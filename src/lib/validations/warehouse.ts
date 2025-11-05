import { z } from 'zod'

// Zod schema สำหรับ validation
export const warehouseItemSchema = z.object({
	productName: z
		.string()
		.min(1, { message: 'กรุณากรอกชื่อสินค้า' })
		.max(255, { message: 'ชื่อสินค้ายาวเกินไป' }),

	category: z
		.string()
		.min(1, { message: 'กรุณาเลือกหมวดหมู่' })
		.max(100, { message: 'หมวดหมู่ยาวเกินไป' }),

	productImage: z.string().url({ message: 'URL รูปภาพไม่ถูกต้อง' }).optional().nullable(),

	storageLocation: z
		.string()
		.min(1, { message: 'กรุณากรอกที่จัดเก็บ' })
		.max(100, { message: 'ที่จัดเก็บยาวเกินไป' }),

	palletCount: z
		.number()
		.int({ message: 'จำนวนพาเลทต้องเป็นจำนวนเต็ม' })
		.positive({ message: 'จำนวนพาเลทต้องมากกว่า 0' })
		.or(z.string().transform((val) => Number.parseInt(val, 10)))
		.refine((val) => !Number.isNaN(val) && val > 0, { message: 'จำนวนพาเลทไม่ถูกต้อง' }),

	packageCount: z
		.number()
		.int({ message: 'จำนวนแพ็คเกจต้องเป็นจำนวนเต็ม' })
		.positive({ message: 'จำนวนแพ็คเกจต้องมากกว่า 0' })
		.or(z.string().transform((val) => Number.parseInt(val, 10)))
		.refine((val) => !Number.isNaN(val) && val > 0, { message: 'จำนวนแพ็คเกจไม่ถูกต้อง' }),

	itemCount: z
		.number()
		.int({ message: 'จำนวนชิ้นต้องเป็นจำนวนเต็ม' })
		.positive({ message: 'จำนวนชิ้นต้องมากกว่า 0' })
		.or(z.string().transform((val) => Number.parseInt(val, 10)))
		.refine((val) => !Number.isNaN(val) && val > 0, { message: 'จำนวนชิ้นไม่ถูกต้อง' }),

	entryDate: z
		.date({ message: 'กรุณาเลือกวันที่เข้า' })
		.or(z.string().transform((val) => new Date(val))),

	deliveryVehiclePlate: z
		.string()
		.min(1, { message: 'กรุณากรอกทะเบียนรถส่ง' })
		.max(50, { message: 'ทะเบียนรถส่งยาวเกินไป' }),

	containerNumber: z
		.string()
		.min(1, { message: 'กรุณากรอกหมายเลขตู้คอนเทนเนอร์' })
		.max(50, { message: 'หมายเลขตู้คอนเทนเนอร์ยาวเกินไป' }),

	exitDate: z
		.date()
		.optional()
		.nullable()
		.or(z.string().transform((val) => (val ? new Date(val) : null))),

	pickupVehiclePlate: z
		.string()
		.max(50, { message: 'ทะเบียนรถรับยาวเกินไป' })
		.optional()
		.nullable(),

	status: z.enum(['in_stock', 'out_for_delivery', 'delivered'], {
		message: 'กรุณาเลือกสถานะที่ถูกต้อง',
	}),
})

// สำหรับ FormData validation (รับ File)
export const warehouseItemFormDataSchema = z.object({
	productName: z.string().min(1, { message: 'กรุณากรอกชื่อสินค้า' }),
	category: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' }),
	storageLocation: z.string().min(1, { message: 'กรุณากรอกที่จัดเก็บ' }),
	palletCount: z.string().transform((val) => Number.parseInt(val, 10)),
	packageCount: z.string().transform((val) => Number.parseInt(val, 10)),
	itemCount: z.string().transform((val) => Number.parseInt(val, 10)),
	entryDate: z.string().transform((val) => new Date(val)),
	deliveryVehiclePlate: z.string().min(1, { message: 'กรุณากรอกทะเบียนรถส่ง' }),
	containerNumber: z.string().min(1, { message: 'กรุณากรอกหมายเลขตู้คอนเทนเนอร์' }),
	exitDate: z
		.string()
		.optional()
		.transform((val) => (val ? new Date(val) : null)),
	pickupVehiclePlate: z.string().optional(),
	status: z.enum(['in_stock', 'out_for_delivery', 'delivered']),
	image: z
		.instanceof(File)
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
		})
		.refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type), {
			message: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น',
		})
		.optional()
		.nullable(),
})

// Type inference
export type WarehouseItemInput = z.infer<typeof warehouseItemSchema>
export type WarehouseItemFormData = z.infer<typeof warehouseItemFormDataSchema>

// สำหรับ partial update
export const updateWarehouseItemSchema = warehouseItemSchema.partial()
export type UpdateWarehouseItemInput = z.infer<typeof updateWarehouseItemSchema>
