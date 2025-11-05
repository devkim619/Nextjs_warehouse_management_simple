import { db } from '@/db'
import {
	branches,
	categories,
	provinces,
	vehicles,
	warehouseItems,
	warehouseStatusEnum,
} from '@/db/schema'
import { deleteFile, uploadFile } from '@/lib/storage'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Type for warehouse status
type WarehouseStatus = (typeof warehouseStatusEnum.enumValues)[number]

// Helper function to extract FormData
function extractFormDataUpdates(formData: FormData) {
	const updates: {
		productName?: string
		category?: string
		productImage?: string | null
		storageLocation?: string
		palletCount?: number
		packageCount?: number
		itemCount?: number
		entryDate?: Date
		deliveryVehicleId?: string
		containerNumber?: string
		exitDate?: Date | null
		pickupVehicleId?: string | null
		status?: WarehouseStatus
	} = {}

	// String fields
	const stringFields = ['productName', 'category', 'storageLocation', 'containerNumber'] as const
	for (const field of stringFields) {
		const value = formData.get(field)
		if (value) updates[field] = value as string
	}

	// Number fields
	const numberFields = ['palletCount', 'packageCount', 'itemCount'] as const
	for (const field of numberFields) {
		const value = formData.get(field)
		if (value) updates[field] = Number.parseInt(value as string, 10)
	}

	// Date fields
	const entryDate = formData.get('entryDate')
	if (entryDate) updates.entryDate = new Date(entryDate as string)

	const exitDate = formData.get('exitDate')
	if (exitDate) updates.exitDate = new Date(exitDate as string)

	// Status enum
	const status = formData.get('status')
	if (status) updates.status = status as WarehouseStatus

	return updates
}

export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params

		// ค้นหาด้วย UUID หรือ stockId (SKU) ก็ได้
		// SKU format: BKK-ELEC-20250115-0001 (มี 3 เครื่องหมาย "-")
		// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (มี 4 เครื่องหมาย "-")
		const dashCount = (id.match(/-/g) || []).length
		const isStockId = dashCount === 3

		const whereCondition = isStockId ? eq(warehouseItems.stockId, id) : eq(warehouseItems.id, id) // Fetch with category, branch, and delivery vehicle
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
			.where(whereCondition)

		if (rawItems.length === 0) {
			return NextResponse.json({ error: 'Warehouse item not found' }, { status: 404 })
		}

		const rawItem = rawItems[0]

		// Fetch pickup vehicle separately if exists
		let pickupVehicle = null
		if (rawItem.pickupVehicleId) {
			const pickupData = await db
				.select({
					id: vehicles.id,
					plateNumber: vehicles.plateNumber,
					provinceId: provinces.id,
					provinceTh: provinces.nameTh,
					provinceEn: provinces.nameEn,
				})
				.from(vehicles)
				.leftJoin(provinces, eq(vehicles.provinceId, provinces.id))
				.where(eq(vehicles.id, rawItem.pickupVehicleId))

			if (pickupData.length > 0) {
				pickupVehicle = pickupData[0]
			}
		}

		// Transform to nested structure
		const item = {
			id: rawItem.id,
			stockId: rawItem.stockId,
			productName: rawItem.productName,
			productImage: rawItem.productImage,
			storageLocation: rawItem.storageLocation,
			palletCount: rawItem.palletCount,
			packageCount: rawItem.packageCount,
			itemCount: rawItem.itemCount,
			entryDate: rawItem.entryDate,
			containerNumber: rawItem.containerNumber,
			exitDate: rawItem.exitDate,
			status: rawItem.status,
			qrCodeImage: rawItem.qrCodeImage,
			createdAt: rawItem.createdAt,
			updatedAt: rawItem.updatedAt,
			category: rawItem.categoryId
				? {
						id: rawItem.categoryId,
						code: rawItem.categoryCode,
						nameTh: rawItem.categoryNameTh,
						nameEn: rawItem.categoryNameEn,
				  }
				: null,
			branch: rawItem.branchId
				? {
						id: rawItem.branchId,
						code: rawItem.branchCode,
						nameTh: rawItem.branchNameTh,
						nameEn: rawItem.branchNameEn,
						location: rawItem.branchLocation,
				  }
				: null,
			deliveryVehicle: rawItem.deliveryVehicleId
				? {
						id: rawItem.deliveryVehicleId,
						plateNumber: rawItem.deliveryVehiclePlateNumber,
						provinceId: rawItem.deliveryVehicleProvinceId,
						provinceTh: rawItem.deliveryVehicleProvinceTh,
						provinceEn: rawItem.deliveryVehicleProvinceEn,
				  }
				: null,
			pickupVehicle,
		}

		return NextResponse.json(item)
	} catch (error) {
		console.error('Error fetching warehouse item:', error)
		return NextResponse.json({ error: 'Failed to fetch warehouse item' }, { status: 500 })
	}
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params

		// Get existing item
		const existing = await db.select().from(warehouseItems).where(eq(warehouseItems.id, id))

		if (existing.length === 0) {
			return NextResponse.json({ error: 'Warehouse item not found' }, { status: 404 })
		}

		const formData = await request.formData()

		// Extract updates from FormData
		const updateData = extractFormDataUpdates(formData)

		// Handle delivery vehicle update
		const deliveryPlateNumber = formData.get('deliveryVehiclePlateNumber')
		const deliveryProvinceId = formData.get('deliveryVehicleProvinceId')
		if (deliveryPlateNumber && deliveryProvinceId) {
			const [deliveryVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: deliveryPlateNumber as string,
					provinceId: Number.parseInt(deliveryProvinceId as string, 10),
				})
				.returning()
			updateData.deliveryVehicleId = deliveryVehicle.id
		}

		// Handle pickup vehicle update
		const pickupPlateNumber = formData.get('pickupVehiclePlateNumber')
		const pickupProvinceId = formData.get('pickupVehicleProvinceId')
		if (pickupPlateNumber && pickupProvinceId) {
			const [pickupVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: pickupPlateNumber as string,
					provinceId: Number.parseInt(pickupProvinceId as string, 10),
				})
				.returning()
			updateData.pickupVehicleId = pickupVehicle.id
		}

		// Handle file upload if present
		let productImage: string | null = existing[0].productImage
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

			// Delete old image if exists
			if (existing[0].productImage) {
				const oldPath = existing[0].productImage.split('/warehouse-items/')[1]
				if (oldPath) {
					try {
						await deleteFile(`warehouse-items/${oldPath}`)
					} catch (err) {
						console.error('Failed to delete old image:', err)
					}
				}
			}

			// Upload new image
			const timestamp = Date.now()
			const fileName = `${timestamp}-${file.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(file, path)
			updateData.productImage = productImage
		}

		const updatedItem = await db
			.update(warehouseItems)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(warehouseItems.id, id))
			.returning()

		// Note: Should fetch full item with relations for complete response
		// For now just return the updated item
		return NextResponse.json(updatedItem[0])
	} catch (error) {
		console.error('Error updating warehouse item:', error)
		return NextResponse.json({ error: 'Failed to update warehouse item' }, { status: 500 })
	}
}

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params

		// Get existing item to delete image
		const existing = await db.select().from(warehouseItems).where(eq(warehouseItems.id, id))

		if (existing.length === 0) {
			return NextResponse.json({ error: 'Warehouse item not found' }, { status: 404 })
		}

		// Delete image if exists
		if (existing[0].productImage) {
			const imagePath = existing[0].productImage.split('/warehouse-items/')[1]
			if (imagePath) {
				try {
					await deleteFile(`warehouse-items/${imagePath}`)
				} catch (err) {
					console.error('Failed to delete image:', err)
				}
			}
		}

		// Delete from database
		await db.delete(warehouseItems).where(eq(warehouseItems.id, id))

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting warehouse item:', error)
		return NextResponse.json({ error: 'Failed to delete warehouse item' }, { status: 500 })
	}
}
