import { db } from '@/db'
import { provinces, vehicles, warehouseItems, warehouseStatusEnum } from '@/db/schema'
import { generateAndUploadQRCode, generateQRCodeData } from '@/lib/qrcode'
import { uploadFile } from '@/lib/storage'
import { eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Type for warehouse status
type WarehouseStatus = (typeof warehouseStatusEnum.enumValues)[number]

export const GET = async () => {
	try {
		// Fetch all items with delivery vehicle relations
		const rawItems = await db
			.select({
				id: warehouseItems.id,
				productName: warehouseItems.productName,
				category: warehouseItems.category,
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
				// Delivery vehicle info
				deliveryVehiclePlateNumber: vehicles.plateNumber,
				deliveryVehicleProvinceId: provinces.id,
				deliveryVehicleProvinceTh: provinces.nameTh,
				deliveryVehicleProvinceEn: provinces.nameEn,
			})
			.from(warehouseItems)
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
			productName: item.productName,
			category: item.category,
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

		// Extract vehicle data
		const deliveryPlateNumber = formData.get('deliveryVehiclePlateNumber') as string
		const deliveryProvinceId = Number.parseInt(
			formData.get('deliveryVehicleProvinceId') as string,
			10,
		)
		const pickupPlateNumber = formData.get('pickupVehiclePlateNumber') as string | null
		const pickupProvinceId = formData.get('pickupVehicleProvinceId')
			? Number.parseInt(formData.get('pickupVehicleProvinceId') as string, 10)
			: null

		// Create delivery vehicle
		const [deliveryVehicle] = await db
			.insert(vehicles)
			.values({
				plateNumber: deliveryPlateNumber,
				provinceId: deliveryProvinceId,
			})
			.returning()

		// Create pickup vehicle if provided
		let pickupVehicleId: number | null = null
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
			productName: formData.get('productName') as string,
			category: formData.get('category') as string,
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
			const qrData = generateQRCodeData(newItem.id, {
				productName: newItem.productName,
				storageLocation: newItem.storageLocation,
				containerNumber: newItem.containerNumber,
			})
			const qrFilename = `warehouse-item-${newItem.id}-${Date.now()}.png`
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
