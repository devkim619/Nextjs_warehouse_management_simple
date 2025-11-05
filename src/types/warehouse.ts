export interface VehicleInfo {
	id: number
	plateNumber: string
	provinceId: number
	provinceTh: string
	provinceEn: string
}

export interface WarehouseItem {
	id: string
	// วันที่และเวลาเข้า
	entryDate: Date
	// ข้อมูลรถมาส่ง
	deliveryVehicle: VehicleInfo
	// หมายเลขตู้คอนเทนเนอร์
	containerNumber: string
	// รูปสินค้า (URL)
	productImage?: string
	// ชื่อสินค้า
	productName: string
	// หมวดหมู่สินค้า
	category: string
	// ที่จัดเก็บ
	storageLocation: string
	// จำนวนพาเลท
	palletCount: number
	// จำนวนแพ็คเกจ
	packageCount: number
	// จำนวนชิ้น
	itemCount: number
	// วันที่และเวลาออก
	exitDate?: Date
	// ข้อมูลรถมารับ
	pickupVehicle?: VehicleInfo
	// สถานะ
	status: 'in_stock' | 'out_for_delivery' | 'delivered'
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
