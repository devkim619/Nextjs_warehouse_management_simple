# Database Schema Changes

## 📊 สรุปการเปลี่ยนแปลง

### เดิม: `warehouses` table

```typescript
{
	id: serial
	name: varchar(255)
	location: text
	capacity: varchar(100)
	status: varchar(50)
	imageUrl: text
	createdAt: timestamp
	updatedAt: timestamp
}
```

### ใหม่: `warehouse_items` table

```typescript
{
	id: serial

	// ข้อมูลสินค้า
	productName: varchar(255) // ชื่อสินค้า
	category: varchar(100) // หมวดหมู่
	productImage: text // URL รูปสินค้า

	// การจัดเก็บ
	storageLocation: varchar(100) // ที่จัดเก็บ (เช่น A-01-01)
	palletCount: integer // จำนวนพาเลท
	packageCount: integer // จำนวนแพ็คเกจ
	itemCount: integer // จำนวนชิ้น

	// การเข้าคลัง
	entryDate: timestamp // วันที่เข้า
	deliveryVehiclePlate: varchar(50) // ทะเบียนรถส่ง
	containerNumber: varchar(50) // หมายเลขตู้คอนเทนเนอร์

	// การออกจากคลัง
	exitDate: timestamp(nullable) // วันที่ออก
	pickupVehiclePlate: varchar(50) // ทะเบียนรถรับ

	// สถานะ
	status: varchar(20) // in_stock, out_for_delivery, delivered

	// Timestamps
	createdAt: timestamp
	updatedAt: timestamp
}
```

## ✅ Features

### 1. Zod Validation

- สร้างไฟล์ `/src/lib/validations/warehouse.ts`
- มี schema สำหรับ:
  - `warehouseItemSchema` - สำหรับ JSON validation
  - `warehouseItemFormDataSchema` - สำหรับ FormData + File upload
  - `updateWarehouseItemSchema` - สำหรับ partial update

### 2. File Upload Validation

- ขนาดไฟล์สูงสุด: 5MB
- รองรับไฟล์: JPG, PNG, WEBP
- อัปโหลดไปที่ `warehouse-items/` folder ใน Supabase Storage

### 3. API Changes

- เปลี่ยน field names ทั้งหมดให้ตรงกับ UI
- เพิ่ม validation สำหรับ file upload
- Auto delete รูปเก่าตอน update หรือ delete

## 📝 FormData Fields

### Required Fields:

- `productName` - ชื่อสินค้า
- `category` - หมวดหมู่
- `storageLocation` - ที่จัดเก็บ
- `palletCount` - จำนวนพาเลท (number)
- `packageCount` - จำนวนแพ็คเกจ (number)
- `itemCount` - จำนวนชิ้น (number)
- `entryDate` - วันที่เข้า (ISO string)
- `deliveryVehiclePlate` - ทะเบียนรถส่ง
- `containerNumber` - หมายเลขตู้คอนเทนเนอร์
- `status` - สถานะ (in_stock | out_for_delivery | delivered)

### Optional Fields:

- `image` - รูปสินค้า (File, max 5MB)
- `exitDate` - วันที่ออก (ISO string)
- `pickupVehiclePlate` - ทะเบียนรถรับ

## 🎯 หมวดหมู่สินค้า

```typescript
;[
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
]
```

## 🔄 Migration

Database schema ถูก push แล้วด้วยคำสั่ง:

```bash
bun run db:push
```

⚠️ **Warning**: table เก่า `warehouses` ถูกลบและสร้าง table ใหม่ `warehouse_items`

## 📚 Files Changed

1. `/src/db/schema.ts` - Database schema
2. `/src/lib/validations/warehouse.ts` - Zod validation (NEW)
3. `/src/app/api/warehouses/route.ts` - GET, POST endpoints
4. `/src/app/api/warehouses/[id]/route.ts` - GET, PUT, DELETE endpoints
5. `/QUICKSTART.md` - Updated examples

## 🚀 Next Steps

ตอนนี้ UI components (`WarehouseForm`, `columns`, etc.) พร้อมใช้งานกับ API แล้ว!

แค่ต้องแน่ใจว่า:

1. Context/hooks ส่ง FormData ที่ถูกต้อง
2. รูปภาพถูก upload ผ่าน `image` field ใน FormData
3. วันที่ถูกแปลงเป็น ISO string ก่อนส่ง
