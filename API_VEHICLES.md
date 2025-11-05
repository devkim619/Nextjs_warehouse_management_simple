# API Documentation - Vehicles & Provinces

## เปลี่ยนแปลงสำคัญ 🚨

**Database Schema:**

- ✅ เพิ่ม table `provinces` (77 จังหวัดไทย)
- ✅ เพิ่ม table `vehicles` (เก็บข้อมูลทะเบียนรถ + จังหวัด)
- ✅ เปลี่ยน `warehouse_items`:
  - ❌ ลบ `delivery_vehicle_plate` (varchar)
  - ❌ ลบ `pickup_vehicle_plate` (varchar)
  - ✅ เพิ่ม `delivery_vehicle_id` (FK → vehicles)
  - ✅ เพิ่ม `pickup_vehicle_id` (FK → vehicles)

---

## 📍 GET /api/provinces

ดึงรายชื่อจังหวัดทั้งหมด (77 จังหวัด)

### Response

```json
[
  {
    "id": 1,
    "nameTh": "กรุงเทพมหานคร",
    "nameEn": "Bangkok",
    "geographyId": 2,
    "createdAt": "2019-08-09T03:33:09.000Z",
    "updatedAt": "2025-09-20T06:31:26.000Z",
    "deletedAt": null
  },
  ...
]
```

---

## 📦 POST /api/warehouses

สร้าง warehouse item ใหม่ (พร้อมสร้าง vehicle records)

### Request (FormData)

| Field                          | Type         | Required | Description                           |
| ------------------------------ | ------------ | -------- | ------------------------------------- |
| productName                    | string       | Yes      | ชื่อสินค้า                            |
| category                       | string       | Yes      | หมวดหมู่                              |
| storageLocation                | string       | Yes      | ที่จัดเก็บ                            |
| palletCount                    | number       | Yes      | จำนวนพาเลท                            |
| packageCount                   | number       | Yes      | จำนวนแพ็คเกจ                          |
| itemCount                      | number       | Yes      | จำนวนชิ้น                             |
| entryDate                      | string (ISO) | Yes      | วันที่เข้า                            |
| **deliveryVehiclePlateNumber** | **string**   | **Yes**  | **เลขทะเบียนรถส่ง (เช่น "กก 1234")**  |
| **deliveryVehicleProvinceId**  | **number**   | **Yes**  | **ID จังหวัด (จาก /api/provinces)**   |
| containerNumber                | string       | Yes      | หมายเลขตู้คอนเทนเนอร์                 |
| exitDate                       | string (ISO) | No       | วันที่ออก                             |
| **pickupVehiclePlateNumber**   | **string**   | **No**   | **เลขทะเบียนรถรับ**                   |
| **pickupVehicleProvinceId**    | **number**   | **No**   | **ID จังหวัดรถรับ**                   |
| status                         | enum         | No       | in_stock, out_for_delivery, delivered |
| image                          | File         | No       | รูปสินค้า (max 5MB)                   |

### Example (curl)

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "productName=สินค้าทดสอบ" \
  -F "category=อิเล็กทรอนิกส์" \
  -F "storageLocation=A-01-01" \
  -F "palletCount=5" \
  -F "packageCount=10" \
  -F "itemCount=100" \
  -F "entryDate=2025-01-01T00:00:00Z" \
  -F "deliveryVehiclePlateNumber=กก 1234" \
  -F "deliveryVehicleProvinceId=1" \
  -F "containerNumber=CONT-001" \
  -F "pickupVehiclePlateNumber=ขข 5678" \
  -F "pickupVehicleProvinceId=2" \
  -F "status=in_stock" \
  -F "image=@/path/to/image.jpg"
```

### Response

```json
{
	"id": 1,
	"productName": "สินค้าทดสอบ",
	"category": "อิเล็กทรอนิกส์",
	"productImage": "https://...supabase.co/storage/v1/object/public/Image/warehouse-items/123.jpg",
	"storageLocation": "A-01-01",
	"palletCount": 5,
	"packageCount": 10,
	"itemCount": 100,
	"entryDate": "2025-01-01T00:00:00.000Z",
	"deliveryVehicleId": 1,
	"containerNumber": "CONT-001",
	"exitDate": null,
	"pickupVehicleId": 2,
	"status": "in_stock",
	"qrCodeImage": "https://...supabase.co/storage/v1/object/public/Image/qrcodes/warehouse-item-1-123.png",
	"createdAt": "2025-11-04T18:00:00.000Z",
	"updatedAt": "2025-11-04T18:00:00.000Z"
}
```

---

## 📋 GET /api/warehouses

ดึงรายการ warehouse items ทั้งหมด (พร้อม join vehicle และ province)

### Response

```json
[
	{
		"id": 1,
		"productName": "สินค้าทดสอบ",
		"category": "อิเล็กทรอนิกส์",
		"productImage": "https://...supabase.co/storage/v1/object/public/Image/warehouse-items/123.jpg",
		"storageLocation": "A-01-01",
		"palletCount": 5,
		"packageCount": 10,
		"itemCount": 100,
		"entryDate": "2025-01-01T00:00:00.000Z",
		"deliveryVehicleId": 1,
		"containerNumber": "CONT-001",
		"exitDate": null,
		"pickupVehicleId": 2,
		"status": "in_stock",
		"qrCodeImage": "https://...supabase.co/storage/v1/object/public/Image/qrcodes/warehouse-item-1-123.png",
		"createdAt": "2025-11-04T18:00:00.000Z",
		"updatedAt": "2025-11-04T18:00:00.000Z",
		"deliveryVehiclePlateNumber": "กก 1234",
		"deliveryVehicleProvinceId": 1,
		"deliveryVehicleProvinceTh": "กรุงเทพมหานคร",
		"deliveryVehicleProvinceEn": "Bangkok"
	}
]
```

---

## 🔍 GET /api/warehouses/:id

ดึงข้อมูล warehouse item เดียว (พร้อม vehicle และ province)

### Response

เหมือน GET /api/warehouses แต่ return object เดียว

---

## ✏️ PATCH /api/warehouses/:id

แก้ไข warehouse item (partial update)

### Request (FormData)

ส่งเฉพาะ field ที่ต้องการแก้ไข

**เปลี่ยนรถส่ง:**

```bash
curl -X PATCH http://localhost:3000/api/warehouses/1 \
  -F "deliveryVehiclePlateNumber=คค 9999" \
  -F "deliveryVehicleProvinceId=38"
```

**เปลี่ยนรถรับ:**

```bash
curl -X PATCH http://localhost:3000/api/warehouses/1 \
  -F "pickupVehiclePlateNumber=งง 8888" \
  -F "pickupVehicleProvinceId=45"
```

---

## 🗑️ DELETE /api/warehouses/:id

ลบ warehouse item (และรูปภาพที่เกี่ยวข้อง)

```bash
curl -X DELETE http://localhost:3000/api/warehouses/1
```

---

## 📝 TypeScript Interfaces

```typescript
// Vehicle input
interface VehicleInput {
	plateNumber: string // "กก 1234"
	provinceId: number // 1 (กรุงเทพ)
}

// Create warehouse item
interface CreateWarehouseItemInput {
	productName: string
	category: string
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date | string
	deliveryVehicle: VehicleInput
	containerNumber: string
	exitDate?: Date | string | null
	pickupVehicle?: VehicleInput | null
	status: 'in_stock' | 'out_for_delivery' | 'delivered'
}
```

---

## 🎯 สรุปการเปลี่ยนแปลง

| เดิม                                        | ใหม่                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `deliveryVehiclePlate: "กก 1234 กรุงเทพ"`   | `deliveryVehiclePlateNumber: "กก 1234"`<br>`deliveryVehicleProvinceId: 1` |
| `pickupVehiclePlate: "ขข 5678 สมุทรปราการ"` | `pickupVehiclePlateNumber: "ขข 5678"`<br>`pickupVehicleProvinceId: 2`     |
| ไม่มี relation                              | ✅ JOIN กับ `vehicles` และ `provinces`                                    |
| ไม่สามารถ query ตามจังหวัด                  | ✅ สามารถ filter/search ตามจังหวัดได้                                     |

---

## 🚀 ตัวอย่างการใช้งาน Frontend

```typescript
// 1. ดึงรายชื่อจังหวัด
const provinces = await fetch('/api/provinces').then((r) => r.json())

// 2. สร้าง warehouse item
const formData = new FormData()
formData.append('productName', 'สินค้าทดสอบ')
formData.append('deliveryVehiclePlateNumber', 'กก 1234')
formData.append('deliveryVehicleProvinceId', '1') // กรุงเทพ
// ... append other fields

const newItem = await fetch('/api/warehouses', {
	method: 'POST',
	body: formData,
}).then((r) => r.json())

// 3. ดึงรายการทั้งหมดพร้อม vehicle info
const items = await fetch('/api/warehouses').then((r) => r.json())
console.log(items[0].deliveryVehiclePlateNumber) // "กก 1234"
console.log(items[0].deliveryVehicleProvinceTh) // "กรุงเทพมหานคร"
```
