# Warehouse Management - Drizzle + Supabase + Storage Integration

## 🚀 Setup Complete!

โปรเจคนี้ได้เชื่อมต่อกับ:

- ✅ **Drizzle ORM** - Type-safe database ORM
- ✅ **Supabase PostgreSQL** - Database
- ✅ **Supabase Storage (S3)** - File storage

## 📁 โครงสร้างไฟล์ที่สำคัญ

```
src/
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Database schema (warehouses table)
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── storage.ts        # Storage utilities (upload, delete, etc.)
└── app/
    └── api/
        ├── warehouses/   # CRUD API สำหรับ warehouses
        │   ├── route.ts
        │   └── [id]/route.ts
        └── upload/       # File upload API
            └── route.ts
```

## 🔧 Environment Variables

```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://xxx.supabase.co"
ANON_KEY="eyJhbGc..."
BUGKETS="image"
```

**หมายเหตุ:** ไม่ต้องใช้ `SUPABASE_S3_ENDPOINT` แล้ว เพราะใช้ Supabase Client โดยตรง

## 📝 Database Schema

```typescript
warehouses {
  id: serial (primary key)
  name: varchar(255)
  location: text
  capacity: varchar(100)
  status: varchar(50) default 'active'
  imageUrl: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

## 🎯 API Endpoints

### Warehouses CRUD

- **GET** `/api/warehouses` - ดึงข้อมูล warehouses ทั้งหมด
- **POST** `/api/warehouses` - สร้าง warehouse ใหม่
- **GET** `/api/warehouses/:id` - ดึงข้อมูล warehouse ตาม id
- **PUT** `/api/warehouses/:id` - อัปเดต warehouse
- **DELETE** `/api/warehouses/:id` - ลบ warehouse

### File Upload

- **POST** `/api/upload` - อัปโหลดไฟล์ (multipart/form-data)
- **DELETE** `/api/upload?path=xxx` - ลบไฟล์

## 💻 การใช้งาน

### 1. Database Commands

```bash
# Push schema ไปยัง database
bun run db:push

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### 2. ตัวอย่างการใช้งาน Database (Drizzle)

```typescript
import { db } from '@/db'
import { warehouses } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Select all
const allWarehouses = await db.select().from(warehouses)

// Insert
const newWarehouse = await db
	.insert(warehouses)
	.values({
		name: 'Warehouse A',
		location: 'Bangkok',
		capacity: '1000 sqm',
	})
	.returning()

// Update
await db.update(warehouses).set({ name: 'Updated Name' }).where(eq(warehouses.id, 1))

// Delete
await db.delete(warehouses).where(eq(warehouses.id, 1))
```

### 3. ตัวอย่างการใช้งาน Storage

```typescript
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/storage'

// Upload file
const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
const url = await uploadFile(file, 'warehouses/image.jpg')

// Get public URL
const publicUrl = getPublicUrl('warehouses/image.jpg')

// Delete file
await deleteFile('warehouses/image.jpg')
```

### 4. ตัวอย่างการใช้งาน Supabase Client

```typescript
import { supabase } from '@/lib/supabase'

// Query data
const { data, error } = await supabase.from('warehouses').select('*').eq('status', 'active')

// Real-time subscription
supabase
	.channel('warehouses')
	.on(
		'postgres_changes',
		{
			event: '*',
			schema: 'public',
			table: 'warehouses',
		},
		(payload) => {
			console.log('Change received!', payload)
		},
	)
	.subscribe()
```

## 🎨 ตัวอย่าง API Usage

### สร้าง Warehouse พร้อม Upload รูป

```typescript
// 1. Upload image first
const formData = new FormData()
formData.append('file', imageFile)

const uploadRes = await fetch('/api/upload', {
	method: 'POST',
	body: formData,
})
const { url: imageUrl } = await uploadRes.json()

// 2. Create warehouse with image URL
const warehouseRes = await fetch('/api/warehouses', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		name: 'New Warehouse',
		location: 'Bangkok',
		capacity: '500 sqm',
		imageUrl,
	}),
})
```

## 🔐 Supabase Storage Setup

ต้องสร้าง bucket ชื่อ "image" ใน Supabase Storage:

1. ไปที่ [Supabase Dashboard](https://app.supabase.com)
2. เลือก Storage
3. สร้าง bucket ใหม่ชื่อ "image"
4. ตั้งค่า public/private ตามต้องการ

## 📦 Packages Installed

- `drizzle-orm` - ORM
- `drizzle-kit` - CLI tools
- `postgres` - PostgreSQL driver
- `@supabase/supabase-js` - Supabase client (รวม Storage API)

## 🚀 Run Development Server

```bash
bun run dev
```

## 📚 Documentation Links

- [Drizzle ORM](https://orm.drizzle.team)
- [Supabase](https://supabase.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
