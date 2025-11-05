export interface VehicleInfo {
	id: string
	plateNumber: string | null
	provinceId: number | null
	provinceTh: string | null
	provinceEn: string | null
}

export interface Category {
	id: number
	code: string
	nameTh: string
	nameEn: string
	description?: string | null
	createdAt?: Date
	updatedAt?: Date
}

export interface Branch {
	id: number
	code: string
	nameTh: string
	nameEn: string
	location?: string | null
	isActive?: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type WarehouseStatus = 'in_stock' | 'out_for_delivery' | 'delivered'

export interface WarehouseItem {
	id: string
	stockId: string
	branchId: number
	categoryId: number
	productName: string
	productImage: string | null
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date
	containerNumber: string
	exitDate: Date | null
	status: WarehouseStatus
	qrCodeImage: string | null
	createdAt: Date
	updatedAt: Date
	category: Category | null
	branch: Branch | null
	deliveryVehicle: VehicleInfo | null
	pickupVehicle: VehicleInfo | null
}

// หมวดหมู่สินค้า
export const PRODUCT_CATEGORIES = [
	'เครื่องใช้ไฟฟ้า',
	'เสื้อผ้าและสิ่งทอ',
	'อิเล็กทรอนิกส์',
	'เฟอร์นิเจอร์',
	'รองเท้าและกระเป๋า',
	'อาหารและเครื่องดื่ม',
	'อุปกรณ์กีฬา',
	'เครื่องเขียน',
	'ของเล่น',
	'อื่นๆ',
] as const
