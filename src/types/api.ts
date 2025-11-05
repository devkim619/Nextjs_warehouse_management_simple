import type { WarehouseStatus } from '@/db/schema'

// Interface สำหรับสร้าง/แก้ไข vehicle
export interface VehicleInput {
	plateNumber: string // เลขทะเบียน เช่น "กก 1234"
	provinceId: number // ID จังหวัด
}

// Interface สำหรับสร้าง warehouse item (ส่งเป็น object)
export interface CreateWarehouseItemInput {
	productName: string
	category: string
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date | string
	deliveryVehicle: VehicleInput // ข้อมูลรถส่ง
	containerNumber: string
	exitDate?: Date | string | null
	pickupVehicle?: VehicleInput | null // ข้อมูลรถรับ (optional)
	status: WarehouseStatus
	// image จะส่งแยกเป็น File หรือ base64
}

// Interface สำหรับ update warehouse item
export type UpdateWarehouseItemInput = Partial<CreateWarehouseItemInput>

// Interface สำหรับ response จาก API
export interface WarehouseItemResponse {
	id: string
	productName: string
	category: string
	productImage: string | null
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date
	deliveryVehicleId: string | null
	containerNumber: string
	exitDate: Date | null
	pickupVehicleId: string | null
	status: WarehouseStatus
	qrCodeImage: string | null
	createdAt: Date | null
	updatedAt: Date | null
}

// Interface สำหรับ response พร้อม vehicle และ province relations
export interface WarehouseItemWithRelations extends WarehouseItemResponse {
	deliveryVehicle?: {
		id: string
		plateNumber: string
		province: {
			id: number
			nameTh: string
			nameEn: string
		}
	} | null
	pickupVehicle?: {
		id: string
		plateNumber: string
		province: {
			id: number
			nameTh: string
			nameEn: string
		}
	} | null
}

// Helper สำหรับแปลง Date เป็น ISO string
export function serializeWarehouseItem(
	item: CreateWarehouseItemInput,
): Record<string, string | number> {
	return {
		productName: item.productName,
		category: item.category,
		storageLocation: item.storageLocation,
		palletCount: item.palletCount,
		packageCount: item.packageCount,
		itemCount: item.itemCount,
		entryDate: item.entryDate instanceof Date ? item.entryDate.toISOString() : item.entryDate,
		deliveryVehiclePlateNumber: item.deliveryVehicle.plateNumber,
		deliveryVehicleProvinceId: item.deliveryVehicle.provinceId,
		containerNumber: item.containerNumber,
		...(item.exitDate && {
			exitDate: item.exitDate instanceof Date ? item.exitDate.toISOString() : item.exitDate,
		}),
		...(item.pickupVehicle && {
			pickupVehiclePlateNumber: item.pickupVehicle.plateNumber,
			pickupVehicleProvinceId: item.pickupVehicle.provinceId,
		}),
		status: item.status,
	}
}
