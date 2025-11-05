# Production Warehouse API - Usage Guide

## Overview

Your warehouse management system now supports:

- ✅ **Multi-branch operations** (5 branches seeded)
- ✅ **Auto-generated SKU** (Stock Keeping Unit) format: `BKK-ELEC-20250115-0001`
- ✅ **Normalized categories** (10 categories seeded)
- ✅ **UUID primary keys** for security
- ✅ **10 database indexes** for optimal performance

## New API Endpoints

### 1. Get Dashboard Statistics (NEW) ⭐

```
GET /api/dashboard
```

**Description:** Get comprehensive dashboard statistics including counts, totals, category distribution, and recent activities.

**Response:**

```json
{
	"success": true,
	"data": {
		"stats": {
			"inStockCount": 45,
			"outForDeliveryCount": 12,
			"deliveredCount": 8,
			"totalCount": 65,
			"totalPallets": 120,
			"totalPackages": 450,
			"totalItems": 1850,
			"uniqueCategories": 8
		},
		"categoryDistribution": [
			{
				"categoryId": 1,
				"categoryCode": "ELEC",
				"categoryName": "เครื่องใช้ไฟฟ้า",
				"count": 15
			},
			{
				"categoryId": 3,
				"categoryCode": "TECH",
				"categoryName": "อิเล็กทรอนิกส์",
				"count": 12
			}
		],
		"recentActivities": [
			{
				"id": "uuid-here",
				"stockId": "BKK-ELEC-20250115-0001",
				"productName": "ตู้เย็น Samsung",
				"storageLocation": "A-01-05",
				"status": "in_stock",
				"entryDate": "2025-01-15T10:30:00.000Z",
				"category": {
					"id": 1,
					"code": "ELEC",
					"nameTh": "เครื่องใช้ไฟฟ้า",
					"nameEn": "Electronics"
				}
			}
		]
	}
}
```

**Use Case:**

- Homepage/Dashboard display
- Real-time statistics
- Business intelligence reports
- Quick overview of warehouse status

### 2. Get All Categories

```
GET /api/categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ELEC",
      "nameTh": "เครื่องใช้ไฟฟ้า",
      "nameEn": "Electronics",
      "description": "เครื่องใช้ไฟฟ้าในครัวเรือน",
      "createdAt": "2025-01-15T...",
      "updatedAt": "2025-01-15T..."
    },
    ...
  ]
}
```

### 2. Get All Active Branches

```
GET /api/branches
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "BKK",
      "nameTh": "สาขากรุงเทพฯ",
      "nameEn": "Bangkok Branch",
      "location": "123 ถนนสุขุมวิท กรุงเทพฯ",
      "isActive": true,
      "createdAt": "2025-01-15T...",
      "updatedAt": "2025-01-15T..."
    },
    ...
  ]
}
```

## Updated Endpoints

### 3. Create Warehouse Item (POST /api/warehouses)

**New Required Fields:**

- `branchId`: Branch ID (integer)
- `categoryId`: Category ID (integer)

**Removed Field:**

- ~~`category`~~ (string) - now replaced with `categoryId`

**Example Request (FormData):**

```javascript
const formData = new FormData()

// NEW: Required for SKU generation
formData.append('branchId', '1') // BKK
formData.append('categoryId', '3') // TECH

// Existing fields
formData.append('productName', 'Laptop Dell XPS 13')
formData.append('storageLocation', 'A-01-05')
formData.append('palletCount', '2')
formData.append('packageCount', '10')
formData.append('itemCount', '20')
formData.append('entryDate', '2025-01-15T10:30:00')
formData.append('containerNumber', 'CONT-2025-001')
formData.append('deliveryVehiclePlateNumber', 'กข-1234')
formData.append('deliveryVehicleProvinceId', '1')
formData.append('status', 'in_stock')

// Optional
formData.append('image', file)
formData.append('exitDate', '2025-01-20T14:00:00')
formData.append('pickupVehiclePlateNumber', 'คฆ-5678')
formData.append('pickupVehicleProvinceId', '1')

fetch('/api/warehouses', {
	method: 'POST',
	body: formData,
})
```

**Response:**

```json
{
  "id": "uuid-here",
  "stockId": "BKK-TECH-20250115-0001", // ✨ Auto-generated SKU
  "branchId": 1,
  "categoryId": 3,
  "productName": "Laptop Dell XPS 13",
  "storageLocation": "A-01-05",
  ...
}
```

### 4. Get All Warehouse Items (GET /api/warehouses)

**New Response Structure:**

```json
[
  {
    "id": "uuid-here",
    "stockId": "BKK-TECH-20250115-0001", // ✨ SKU
    "branchId": 1,
    "categoryId": 3,
    "productName": "Laptop Dell XPS 13",
    "storageLocation": "A-01-05",
    "palletCount": 2,
    "packageCount": 10,
    "itemCount": 20,
    "entryDate": "2025-01-15T10:30:00.000Z",
    "containerNumber": "CONT-2025-001",
    "status": "in_stock",
    "qrCodeImage": "https://...",
    "createdAt": "2025-01-15T10:31:00.000Z",
    "updatedAt": "2025-01-15T10:31:00.000Z",

    // ✨ NEW: Nested category object
    "category": {
      "id": 3,
      "code": "TECH",
      "nameTh": "อิเล็กทรอนิกส์",
      "nameEn": "Technology"
    },

    // ✨ NEW: Nested branch object
    "branch": {
      "id": 1,
      "code": "BKK",
      "nameTh": "สาขากรุงเทพฯ",
      "nameEn": "Bangkok Branch",
      "location": "123 ถนนสุขุมวิท กรุงเทพฯ"
    },

    // Existing vehicle relations
    "deliveryVehicle": { ... },
    "pickupVehicle": { ... }
  }
]
```

## SKU Format

### Structure

```
{BRANCH_CODE}-{CATEGORY_CODE}-{YYYYMMDD}-{SEQUENCE}
```

### Examples

- `BKK-ELEC-20250115-0001` - 1st electronics item in Bangkok on 2025-01-15
- `BKK-ELEC-20250115-0002` - 2nd electronics item in Bangkok on 2025-01-15
- `CNX-FURN-20250116-0001` - 1st furniture item in Chiang Mai on 2025-01-16
- `PKT-FOOD-20250117-0015` - 15th food item in Phuket on 2025-01-17

### Unique Features

- ✅ **Auto-incremented** per branch/category/day
- ✅ **Human-readable** - contains business logic
- ✅ **Unique constraint** in database
- ✅ **Scales** across multiple branches

## Seeded Data

### Branches (5)

| ID  | Code | Name (TH)     | Name (EN)         | Location                      |
| --- | ---- | ------------- | ----------------- | ----------------------------- |
| 1   | BKK  | สาขากรุงเทพฯ  | Bangkok Branch    | 123 ถนนสุขุมวิท กรุงเทพฯ      |
| 2   | CNX  | สาขาเชียงใหม่ | Chiang Mai Branch | 456 ถนนห้วยแก้ว เชียงใหม่     |
| 3   | PKT  | สาขาภูเก็ต    | Phuket Branch     | 789 ถนนภูเก็ต ภูเก็ต          |
| 4   | HDY  | สาขาหาดใหญ่   | Hat Yai Branch    | 321 ถนนนิพัทธ์อุทิศ 1 หาดใหญ่ |
| 5   | KKC  | สาขาขอนแก่น   | Khon Kaen Branch  | 654 ถนนศรีจันทร์ ขอนแก่น      |

### Categories (10)

| ID  | Code | Name (TH)           | Name (EN)           |
| --- | ---- | ------------------- | ------------------- |
| 1   | ELEC | เครื่องใช้ไฟฟ้า     | Electronics         |
| 2   | CLTH | เสื้อผ้าและสิ่งทอ   | Clothing & Textiles |
| 3   | TECH | อิเล็กทรอนิกส์      | Technology          |
| 4   | FURN | เฟอร์นิเจอร์        | Furniture           |
| 5   | FOOT | รองเท้าและกระเป๋า   | Footwear & Bags     |
| 6   | FOOD | อาหารและเครื่องดื่ม | Food & Beverage     |
| 7   | SPRT | อุปกรณ์กีฬา         | Sports Equipment    |
| 8   | STAT | เครื่องเขียน        | Stationery          |
| 9   | TOYS | ของเล่น             | Toys                |
| 10  | OTHR | อื่นๆ               | Others              |

## Migration Summary

### What Changed

1. **Database Schema:**

   - Added `branches` table
   - Added `categories` table
   - Updated `warehouse_items`: added `stockId`, `branchId`, `categoryId`
   - Removed standalone `category` varchar column
   - Created 10 indexes for performance

2. **API Routes:**

   - `POST /api/warehouses`: Now requires `branchId` and `categoryId`
   - `GET /api/warehouses`: Returns nested `category` and `branch` objects
   - **NEW** `GET /api/categories`: Get all categories
   - **NEW** `GET /api/branches`: Get active branches

3. **TypeScript Types:**
   - Added `Category` interface
   - Added `Branch` interface
   - Updated `WarehouseItem` interface with new fields

## Next Steps

To update your UI:

1. **Update forms** to use dropdowns for branch and category selection
2. **Display SKU** (`stockId`) prominently in item cards/tables
3. **Show category name** (`category.nameTh`) instead of category string
4. **Show branch info** (`branch.nameTh` + `branch.location`)
5. **Update mock data** if using mocks for development

## Testing

Test creating a new item:

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F 'branchId=1' \
  -F 'categoryId=3' \
  -F 'productName=Test Item' \
  -F 'storageLocation=A-01-01' \
  -F 'palletCount=1' \
  -F 'packageCount=5' \
  -F 'itemCount=10' \
  -F 'entryDate=2025-01-15T10:00:00' \
  -F 'containerNumber=CONT-TEST-001' \
  -F 'deliveryVehiclePlateNumber=TEST-001' \
  -F 'deliveryVehicleProvinceId=1' \
  -F 'status=in_stock'
```

Expected response should include:

```json
{
  "stockId": "BKK-TECH-20250115-0001",
  ...
}
```
