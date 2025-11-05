# Quick Start - Warehouse API

## 🚀 ใช้งาน API แบบง่าย (ใช้ FormData ทั้งหมด)

### สร้าง Warehouse Item พร้อมรูป

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "productName=iPhone 15 Pro" \
  -F "category=อิเล็กทรอนิกส์" \
  -F "storageLocation=A-01-01" \
  -F "palletCount=5" \
  -F "packageCount=50" \
  -F "itemCount=500" \
  -F "entryDate=2025-01-15T10:00:00" \
  -F "deliveryVehiclePlate=กข-1234 กทม" \
  -F "containerNumber=MSCU1234567" \
  -F "status=in_stock" \
  -F "image=@photo.jpg"
```

### สร้าง Warehouse Item แบบไม่มีรูป

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "productName=Samsung Galaxy S24" \
  -F "category=อิเล็กทรอนิกส์" \
  -F "storageLocation=A-01-02" \
  -F "palletCount=3" \
  -F "packageCount=30" \
  -F "itemCount=300" \
  -F "entryDate=2025-01-15T10:00:00" \
  -F "deliveryVehiclePlate=คค-5678 กทม" \
  -F "containerNumber=MSCU7654321" \
  -F "status=in_stock"
```

### อัปเดต Warehouse Item และเปลี่ยนรูป

```bash
curl -X PUT http://localhost:3000/api/warehouses/1 \
  -F "productName=iPhone 15 Pro - Updated" \
  -F "category=อิเล็กทรอนิกส์" \
  -F "storageLocation=A-01-01" \
  -F "palletCount=6" \
  -F "packageCount=60" \
  -F "itemCount=600" \
  -F "entryDate=2025-01-15T10:00:00" \
  -F "deliveryVehiclePlate=กข-1234 กทม" \
  -F "containerNumber=MSCU1234567" \
  -F "exitDate=2025-01-20T15:00:00" \
  -F "pickupVehiclePlate=งง-9999 กทม" \
  -F "status=out_for_delivery" \
  -F "image=@new-photo.jpg"
```

### อัปเดตแบบไม่เปลี่ยนรูป

```bash
curl -X PUT http://localhost:3000/api/warehouses/1 \
  -F "productName=iPhone 15 Pro Max" \
  -F "category=อิเล็กทรอนิกส์" \
  -F "storageLocation=A-01-01" \
  -F "palletCount=10" \
  -F "packageCount=100" \
  -F "itemCount=1000" \
  -F "entryDate=2025-01-15T10:00:00" \
  -F "deliveryVehiclePlate=กข-1234 กทม" \
  -F "containerNumber=MSCU1234567" \
  -F "status=in_stock"
```

### ดูทั้งหมด

```bash
curl http://localhost:3000/api/warehouses
```

### ลบ

```bash
curl -X DELETE http://localhost:3000/api/warehouses/1
```

---

## ✨ จุดเด่น

- ✅ **ใช้ FormData อย่างเดียว** - ง่ายและชัดเจน
- ✅ **ไม่มีรูปก็ส่งได้** - ไม่ต้องส่ง field `image` ก็ได้ จะเป็น null อัตโนมัติ
- ✅ **Auto QR Code Generation** - สร้าง QR code อัตโนมัติหลัง create ✨
- ✅ **Auto delete รูปเก่า** - ตอน update รูปใหม่จะลบรูปเก่าอัตโนมัติ
- ✅ **Database Enum สำหรับ status** - ใช้ enum ที่ database level
- ✅ **Type-safe** - ใช้ Drizzle ORM + TypeScript interfaces
- ✅ **Supabase Storage** - เก็บไฟล์บน S3

---

## 📝 การส่งข้อมูล

| Field                | Required | Type         | Default    | Note                                  |
| -------------------- | -------- | ------------ | ---------- | ------------------------------------- |
| productName          | Yes      | string       | -          | ชื่อสินค้า                            |
| category             | Yes      | string       | -          | หมวดหมู่                              |
| storageLocation      | Yes      | string       | -          | ที่จัดเก็บ (เช่น A-01-01)             |
| palletCount          | Yes      | number       | 1          | จำนวนพาเลท                            |
| packageCount         | Yes      | number       | 1          | จำนวนแพ็คเกจ                          |
| itemCount            | Yes      | number       | 1          | จำนวนชิ้น                             |
| entryDate            | Yes      | string (ISO) | -          | วันที่เข้า                            |
| deliveryVehiclePlate | Yes      | string       | -          | ทะเบียนรถส่ง                          |
| containerNumber      | Yes      | string       | -          | หมายเลขตู้คอนเทนเนอร์                 |
| status               | No       | enum         | 'in_stock' | in_stock, out_for_delivery, delivered |
| image                | No       | File         | null       | รูปสินค้า (max 5MB)                   |
| exitDate             | No       | string (ISO) | null       | วันที่ออก                             |
| pickupVehiclePlate   | No       | string       | null       | ทะเบียนรถรับ                          |

**QR Code**: จะถูก generate อัตโนมัติและเก็บใน `qrCodeImage` field

---

## 🎯 ใช้งานแบบ TypeScript Object

ดู [API_OBJECT_INTERFACE.md](./API_OBJECT_INTERFACE.md) สำหรับตัวอย่างการใช้งานแบบ TypeScript interfaces

---

## ✨ จุดเด่น

- ✅ **ใช้ FormData อย่างเดียว** - ง่ายและชัดเจน
- ✅ **ไม่มีรูปก็ส่งได้** - ไม่ต้องส่ง field `image` ก็ได้ จะเป็น null อัตโนมัติ
- ✅ **Auto delete รูปเก่า** - ตอน update รูปใหม่จะลบรูปเก่าอัตโนมัติ
- ✅ **Type-safe** - ใช้ Drizzle ORM
- ✅ **Supabase Storage** - เก็บไฟล์บน S3

---

## 📝 การส่งข้อมูล

| Field    | Required | Type   | Default  |
| -------- | -------- | ------ | -------- |
| name     | Yes      | string | -        |
| location | Yes      | string | -        |
| capacity | Yes      | string | -        |
| status   | No       | string | 'active' |
| image    | No       | File   | null     |

---

ดูรายละเอียดเพิ่มเติมใน `API_TESTING.md`
