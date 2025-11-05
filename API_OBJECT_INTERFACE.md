# API Usage - Object Interface

## 📦 ส่งข้อมูลแบบ Object (TypeScript)

### Interface Definition

```typescript
import type { WarehouseStatus } from '@/db/schema'

interface CreateWarehouseItemInput {
	productName: string
	category: string
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date | string
	deliveryVehiclePlate: string
	containerNumber: string
	exitDate?: Date | string | null
	pickupVehiclePlate?: string | null
	status: WarehouseStatus // 'in_stock' | 'out_for_delivery' | 'delivered'
}
```

### ตัวอย่างการใช้งาน

#### 1. สร้าง Warehouse Item พร้อมรูป (Frontend)

```typescript
import { serializeWarehouseItem, type CreateWarehouseItemInput } from '@/types/api'

async function createWarehouseItem(data: CreateWarehouseItemInput, imageFile?: File) {
	const formData = new FormData()

	// แปลง object เป็น FormData
	const serialized = serializeWarehouseItem(data)
	Object.entries(serialized).forEach(([key, value]) => {
		formData.append(key, String(value))
	})

	// เพิ่มรูปถ้ามี
	if (imageFile) {
		formData.append('image', imageFile)
	}

	const response = await fetch('/api/warehouses', {
		method: 'POST',
		body: formData,
	})

	return response.json()
}

// ใช้งาน
const newItem: CreateWarehouseItemInput = {
	productName: 'iPhone 15 Pro',
	category: 'อิเล็กทรอนิกส์',
	storageLocation: 'A-01-01',
	palletCount: 5,
	packageCount: 50,
	itemCount: 500,
	entryDate: new Date(),
	deliveryVehiclePlate: 'กข-1234 กทม',
	containerNumber: 'MSCU1234567',
	status: 'in_stock',
}

const imageFile = document.querySelector('input[type="file"]').files[0]
const result = await createWarehouseItem(newItem, imageFile)

console.log('Created:', result)
console.log('QR Code:', result.qrCodeImage) // Auto-generated!
```

#### 2. สร้างแบบไม่มีรูป

```typescript
const newItem: CreateWarehouseItemInput = {
	productName: 'Samsung Galaxy S24',
	category: 'อิเล็กทรอนิกส์',
	storageLocation: 'A-01-02',
	palletCount: 3,
	packageCount: 30,
	itemCount: 300,
	entryDate: '2025-01-15T10:00:00',
	deliveryVehiclePlate: 'คค-5678 กทม',
	containerNumber: 'MSCU7654321',
	status: 'in_stock',
}

const result = await createWarehouseItem(newItem)
```

#### 3. Update Warehouse Item

```typescript
import type { UpdateWarehouseItemInput } from '@/types/api'

async function updateWarehouseItem(id: number, data: UpdateWarehouseItemInput, imageFile?: File) {
	const formData = new FormData()

	const serialized = serializeWarehouseItem(data as CreateWarehouseItemInput)
	Object.entries(serialized).forEach(([key, value]) => {
		formData.append(key, String(value))
	})

	if (imageFile) {
		formData.append('image', imageFile)
	}

	const response = await fetch(`/api/warehouses/${id}`, {
		method: 'PUT',
		body: formData,
	})

	return response.json()
}

// ใช้งาน - update บางส่วน
const updates: UpdateWarehouseItemInput = {
	status: 'out_for_delivery',
	exitDate: new Date(),
	pickupVehiclePlate: 'งง-9999 กทม',
}

const result = await updateWarehouseItem(1, updates)
```

## 🎯 Response Format

```typescript
{
  "id": 1,
  "productName": "iPhone 15 Pro",
  "category": "อิเล็กทรอนิกส์",
  "productImage": "https://...supabase.co/storage/v1/object/public/Image/warehouse-items/...",
  "storageLocation": "A-01-01",
  "palletCount": 5,
  "packageCount": 50,
  "itemCount": 500,
  "entryDate": "2025-01-15T10:00:00.000Z",
  "deliveryVehiclePlate": "กข-1234 กทม",
  "containerNumber": "MSCU1234567",
  "exitDate": null,
  "pickupVehiclePlate": null,
  "status": "in_stock",
  "qrCodeImage": "https://...supabase.co/storage/v1/object/public/Image/qrcodes/warehouse-item-1-...", // ✨ Auto-generated!
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

## 🔐 QR Code Data Format

QR Code จะเข้ารหัสข้อมูล JSON:

```json
{
	"id": 1,
	"type": "warehouse_item",
	"timestamp": "2025-01-15T10:00:00.000Z",
	"productName": "iPhone 15 Pro",
	"storageLocation": "A-01-01",
	"containerNumber": "MSCU1234567"
}
```

สามารถสแกน QR code เพื่อดึงข้อมูลสินค้าได้ทันที!

## 📱 ตัวอย่าง React Component

```typescript
'use client'

import { useState } from 'react'
import type { CreateWarehouseItemInput } from '@/types/api'

export function CreateWarehouseForm() {
	const [loading, setLoading] = useState(false)
	const [imageFile, setImageFile] = useState<File | null>(null)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)

		const formData = new FormData(e.currentTarget)

		const data: CreateWarehouseItemInput = {
			productName: formData.get('productName') as string,
			category: formData.get('category') as string,
			storageLocation: formData.get('storageLocation') as string,
			palletCount: Number(formData.get('palletCount')),
			packageCount: Number(formData.get('packageCount')),
			itemCount: Number(formData.get('itemCount')),
			entryDate: new Date(formData.get('entryDate') as string),
			deliveryVehiclePlate: formData.get('deliveryVehiclePlate') as string,
			containerNumber: formData.get('containerNumber') as string,
			status: 'in_stock',
		}

		// เตรียม FormData สำหรับส่ง API
		const apiFormData = new FormData()
		Object.entries(data).forEach(([key, value]) => {
			if (value instanceof Date) {
				apiFormData.append(key, value.toISOString())
			} else {
				apiFormData.append(key, String(value))
			}
		})

		if (imageFile) {
			apiFormData.append('image', imageFile)
		}

		try {
			const response = await fetch('/api/warehouses', {
				method: 'POST',
				body: apiFormData,
			})

			const result = await response.json()

			if (response.ok) {
				console.log('Created successfully!')
				console.log('QR Code URL:', result.qrCodeImage)
				// แสดง QR code หรือ redirect
			}
		} catch (error) {
			console.error('Error:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			{/* Form fields */}
			<input
				type='file'
				onChange={(e) => setImageFile(e.target.files?.[0] || null)}
			/>
			<button
				type='submit'
				disabled={loading}
			>
				{loading ? 'กำลังสร้าง...' : 'สร้างสินค้า'}
			</button>
		</form>
	)
}
```

## ✨ Features

1. **Type-safe interfaces** - ใช้ TypeScript interface สำหรับ type checking
2. **Auto QR Code generation** - สร้าง QR code อัตโนมัติหลัง create
3. **Enum status** - ใช้ database enum สำหรับ status
4. **File validation** - ตรวจสอบขนาดและประเภทไฟล์
5. **Serialization helper** - แปลง object เป็น FormData ได้ง่าย
