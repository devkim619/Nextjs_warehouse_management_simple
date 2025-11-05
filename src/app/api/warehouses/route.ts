import { db } from '@/db'
import {
	branches,
	categories,
	provinces,
	vehicles,
	warehouseItems,
	warehouseStatusEnum,
} from '@/db/schema'
import { generateAndUploadQRCode, generateQRCodeData } from '@/lib/qrcode'
import { generateSKU } from '@/lib/sku'
import { uploadFile } from '@/lib/storage'
import { eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Type for warehouse status
type WarehouseStatus = (typeof warehouseStatusEnum.enumValues)[number]

export const GET = async () => {
	try {
		// Fetch all items with category, branch, and vehicle relations
		const rawItems = await db
			.select({
				id: warehouseItems.id,
				stockId: warehouseItems.stockId,
				productName: warehouseItems.productName,
				productImage: warehouseItems.productImage,
				storageLocation: warehouseItems.storageLocation,
				palletCount: warehouseItems.palletCount,
				packageCount: warehouseItems.packageCount,
				itemCount: warehouseItems.itemCount,
				entryDate: warehouseItems.entryDate,
				deliveryVehicleId: warehouseItems.deliveryVehicleId,
				containerNumber: warehouseItems.containerNumber,
				exitDate: warehouseItems.exitDate,
				pickupVehicleId: warehouseItems.pickupVehicleId,
				status: warehouseItems.status,
				qrCodeImage: warehouseItems.qrCodeImage,
				createdAt: warehouseItems.createdAt,
				updatedAt: warehouseItems.updatedAt,
				// Category info
				categoryId: categories.id,
				categoryCode: categories.code,
				categoryNameTh: categories.nameTh,
				categoryNameEn: categories.nameEn,
				// Branch info
				branchId: branches.id,
				branchCode: branches.code,
				branchNameTh: branches.nameTh,
				branchNameEn: branches.nameEn,
				branchLocation: branches.location,
				// Delivery vehicle info
				deliveryVehiclePlateNumber: vehicles.plateNumber,
				deliveryVehicleProvinceId: provinces.id,
				deliveryVehicleProvinceTh: provinces.nameTh,
				deliveryVehicleProvinceEn: provinces.nameEn,
			})
			.from(warehouseItems)
			.leftJoin(categories, eq(warehouseItems.categoryId, categories.id))
			.leftJoin(branches, eq(warehouseItems.branchId, branches.id))
			.leftJoin(vehicles, eq(warehouseItems.deliveryVehicleId, vehicles.id))
			.leftJoin(provinces, eq(vehicles.provinceId, provinces.id))

		// Fetch pickup vehicles separately for items that have them
		const pickupVehicleIds = rawItems
			.filter((item) => item.pickupVehicleId)
			.map((item) => item.pickupVehicleId!)

		const pickupVehiclesData = pickupVehicleIds.length
			? await db
					.select({
						id: vehicles.id,
						plateNumber: vehicles.plateNumber,
						provinceId: provinces.id,
						provinceTh: provinces.nameTh,
						provinceEn: provinces.nameEn,
					})
					.from(vehicles)
					.leftJoin(provinces, eq(vehicles.provinceId, provinces.id))
					.where(inArray(vehicles.id, pickupVehicleIds))
			: []

		// Create a map for quick lookup
		const pickupVehicleMap = new Map(pickupVehiclesData.map((v) => [v.id, v]))

		// Transform to nested structure
		const allItems = rawItems.map((item) => ({
			id: item.id,
			stockId: item.stockId,
			productName: item.productName,
			productImage: item.productImage,
			storageLocation: item.storageLocation,
			palletCount: item.palletCount,
			packageCount: item.packageCount,
			itemCount: item.itemCount,
			entryDate: item.entryDate,
			containerNumber: item.containerNumber,
			exitDate: item.exitDate,
			status: item.status,
			qrCodeImage: item.qrCodeImage,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			category: item.categoryId
				? {
						id: item.categoryId,
						code: item.categoryCode,
						nameTh: item.categoryNameTh,
						nameEn: item.categoryNameEn,
				  }
				: null,
			branch: item.branchId
				? {
						id: item.branchId,
						code: item.branchCode,
						nameTh: item.branchNameTh,
						nameEn: item.branchNameEn,
						location: item.branchLocation,
				  }
				: null,
			deliveryVehicle: item.deliveryVehicleId
				? {
						id: item.deliveryVehicleId,
						plateNumber: item.deliveryVehiclePlateNumber,
						provinceId: item.deliveryVehicleProvinceId,
						provinceTh: item.deliveryVehicleProvinceTh,
						provinceEn: item.deliveryVehicleProvinceEn,
				  }
				: null,
			pickupVehicle: item.pickupVehicleId
				? pickupVehicleMap.get(item.pickupVehicleId) || null
				: null,
		}))

		return NextResponse.json(allItems)
	} catch (error) {
		console.error('Error fetching warehouse items:', error)
		return NextResponse.json({ error: 'Failed to fetch warehouse items' }, { status: 500 })
	}
}

export const POST = async (request: Request) => {
	try {
		const formData = await request.formData()

		// Extract and validate branch and category
		const branchIdStr = formData.get('branchId') as string
		const categoryIdStr = formData.get('categoryId') as string

		if (!branchIdStr || !categoryIdStr) {
			return NextResponse.json({ error: 'กรุณาระบุสาขาและหมวดหมู่สินค้า' }, { status: 400 })
		}

		const branchId = Number.parseInt(branchIdStr, 10)
		const categoryId = Number.parseInt(categoryIdStr, 10)

		if (Number.isNaN(branchId) || Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'รหัสสาขาหรือหมวดหมู่ไม่ถูกต้อง' }, { status: 400 })
		}

		// Extract vehicle data with validation
		const deliveryPlateNumber = formData.get('deliveryVehiclePlateNumber') as string
		const deliveryProvinceIdStr = formData.get('deliveryVehicleProvinceId') as string

		if (!deliveryPlateNumber || !deliveryProvinceIdStr) {
			return NextResponse.json({ error: 'กรุณาระบุทะเบียนรถส่งและจังหวัด' }, { status: 400 })
		}

		const deliveryProvinceId = Number.parseInt(deliveryProvinceIdStr, 10)
		if (Number.isNaN(deliveryProvinceId)) {
			return NextResponse.json({ error: 'รหัสจังหวัดไม่ถูกต้อง' }, { status: 400 })
		}

		const pickupPlateNumber = formData.get('pickupVehiclePlateNumber') as string | null
		const pickupProvinceIdStr = formData.get('pickupVehicleProvinceId') as string | null
		let pickupProvinceId: number | null = null

		// Validate pickup vehicle: ถ้ามีอย่างใดอย่างหนึ่ง ต้องมีทั้งคู่
		if (pickupPlateNumber || pickupProvinceIdStr) {
			if (!pickupPlateNumber || !pickupProvinceIdStr) {
				return NextResponse.json(
					{ error: 'ถ้าระบุรถรับต้องระบุทั้งทะเบียนและจังหวัด' },
					{ status: 400 },
				)
			}

			pickupProvinceId = Number.parseInt(pickupProvinceIdStr, 10)
			if (Number.isNaN(pickupProvinceId)) {
				return NextResponse.json({ error: 'รหัสจังหวัดรถรับไม่ถูกต้อง' }, { status: 400 })
			}
		}

		// Generate SKU
		const stockId = await generateSKU(branchId, categoryId)

		// Create delivery vehicle
		const [deliveryVehicle] = await db
			.insert(vehicles)
			.values({
				plateNumber: deliveryPlateNumber,
				provinceId: deliveryProvinceId,
			})
			.returning()

		// Create pickup vehicle if provided
		let pickupVehicleId: string | null = null
		if (pickupPlateNumber && pickupProvinceId) {
			const [pickupVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: pickupPlateNumber,
					provinceId: pickupProvinceId,
				})
				.returning()
			pickupVehicleId = pickupVehicle.id
		}

		// Extract warehouse item data
		const data = {
			stockId,
			branchId,
			categoryId,
			productName: formData.get('productName') as string,
			storageLocation: formData.get('storageLocation') as string,
			palletCount: Number.parseInt(formData.get('palletCount') as string, 10),
			packageCount: Number.parseInt(formData.get('packageCount') as string, 10),
			itemCount: Number.parseInt(formData.get('itemCount') as string, 10),
			entryDate: new Date(formData.get('entryDate') as string),
			deliveryVehicleId: deliveryVehicle.id,
			containerNumber: formData.get('containerNumber') as string,
			exitDate: formData.get('exitDate') ? new Date(formData.get('exitDate') as string) : null,
			pickupVehicleId,
			status: (formData.get('status') as WarehouseStatus) || 'in_stock',
		}

		// Handle file upload if present
		let productImage: string | null = null
		const file = formData.get('image') as File | null
		if (file && file.size > 0) {
			// Validate file
			if (file.size > 5 * 1024 * 1024) {
				return NextResponse.json({ error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' }, { status: 400 })
			}
			if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
				return NextResponse.json(
					{ error: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น' },
					{ status: 400 },
				)
			}

			const timestamp = Date.now()
			const fileName = `${timestamp}-${file.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(file, path)
		}

		// Create warehouse item in database
		const [newItem] = await db
			.insert(warehouseItems)
			.values({
				...data,
				productImage,
			})
			.returning()

		// Generate QR Code
		let qrCodeImage: string | null = null
		try {
			const qrData = generateQRCodeData(newItem.stockId)
			const qrFilename = `warehouse-item-${newItem.stockId}-${Date.now()}.png`
			qrCodeImage = await generateAndUploadQRCode(qrData, qrFilename)

			// Update item with QR code URL
			const [updatedItem] = await db
				.update(warehouseItems)
				.set({ qrCodeImage })
				.where(eq(warehouseItems.id, newItem.id))
				.returning()

			return NextResponse.json(updatedItem, { status: 201 })
		} catch (qrError) {
			console.error('Error generating QR code:', qrError)
			// ถึงแม้ QR code จะ fail ก็ยังคืน item ที่สร้างสำเร็จ
			return NextResponse.json(newItem, { status: 201 })
		}
	} catch (error) {
		console.error('Error creating warehouse item:', error)
		return NextResponse.json({ error: 'Failed to create warehouse item' }, { status: 500 })
	}
}
