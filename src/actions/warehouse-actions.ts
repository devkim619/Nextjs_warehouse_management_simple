'use server'

import { db } from '@/db'
import { branches, categories, provinces, vehicles, warehouseItems } from '@/db/schema'
import { generateAndUploadQRCode, generateQRCodeData } from '@/lib/qrcode'
import { generateSKU } from '@/lib/sku'
import { deleteFile, uploadFile } from '@/lib/storage'
import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ======= Types for Form Actions =======

export type FormState = {
	success: boolean
	message?: string
	errors?: Record<string, string[]>
	data?: unknown
}

export interface CreateWarehouseInput {
	branchId: string
	categoryId: string
	productName: string
	storageLocation: string
	entryDate: Date
	deliveryVehiclePlateNumber: string
	deliveryVehicleProvinceId: string
	containerNumber: string
	productImage?: string | File | null
	productImageFile?: File | null // เพิ่ม support สำหรับไฟล์รูปภาพ
	palletCount: number
	packageCount: number
	itemCount: number
	exitDate?: Date
	pickupVehiclePlateNumber?: string
	pickupVehicleProvinceId?: string
	status: 'in_stock' | 'out_for_delivery' | 'delivered'
}

/**
 * Extract file path from S3/Supabase Storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/bucket/warehouse-items/123.png
 * Returns: warehouse-items/123.png
 */
function extractFilePathFromUrl(url: string): string | null {
	try {
		const urlObj = new URL(url)
		// Match pattern: /storage/v1/object/public/{bucket}/{path}
		const match = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
		return match ? match[1] : null
	} catch {
		return null
	}
}

export async function createWarehouse(input: CreateWarehouseInput) {
	try {
		// Generate SKU (stockId)
		const stockId = await generateSKU(Number(input.branchId), Number(input.categoryId))

		// Create or get delivery vehicle
		const [deliveryVehicle] = await db
			.insert(vehicles)
			.values({
				plateNumber: input.deliveryVehiclePlateNumber,
				provinceId: Number(input.deliveryVehicleProvinceId),
			})
			.onConflictDoNothing()
			.returning()

		// Get the vehicle ID (either newly created or existing)
		let deliveryVehicleId: string | null | undefined = deliveryVehicle?.id

		if (!deliveryVehicleId) {
			// If onConflict didn't return anything, query for the existing vehicle
			const existing = await db.query.vehicles.findFirst({
				where: (vehicles, { and, eq }) =>
					and(
						eq(vehicles.plateNumber, input.deliveryVehiclePlateNumber),
						eq(vehicles.provinceId, Number(input.deliveryVehicleProvinceId)),
					),
			})
			deliveryVehicleId = existing?.id
		}

		// Create pickup vehicle if provided
		let pickupVehicleId = null
		if (input.pickupVehiclePlateNumber && input.pickupVehicleProvinceId) {
			const [pickupVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: input.pickupVehiclePlateNumber,
					provinceId: Number(input.pickupVehicleProvinceId),
				})
				.onConflictDoNothing()
				.returning()

			pickupVehicleId = pickupVehicle?.id

			if (!pickupVehicleId) {
				const existing = await db.query.vehicles.findFirst({
					where: (vehicles, { and, eq }) =>
						and(
							eq(vehicles.plateNumber, input.pickupVehiclePlateNumber!),
							eq(vehicles.provinceId, Number(input.pickupVehicleProvinceId!)),
						),
				})
				pickupVehicleId = existing?.id || null
			}
		}

		// Handle product image upload if file is provided
		let productImage: string | null = null
		if (input.productImageFile && input.productImageFile.size > 0) {
			// Validate file
			if (input.productImageFile.size > 2 * 1024 * 1024) {
				return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }
			}
			if (
				!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(
					input.productImageFile.type,
				)
			) {
				return { success: false, error: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น' }
			}

			const timestamp = Date.now()
			const fileName = `${timestamp}-${input.productImageFile.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(input.productImageFile, path)
		} else if (input.productImage && typeof input.productImage === 'string') {
			// ถ้าส่งมาเป็น URL string ใช้ได้เลย
			productImage = input.productImage
		} else if (input.productImage instanceof File) {
			// ถ้าส่งมาเป็น File object ใน productImage (กรณี fallback)
			if (input.productImage.size > 2 * 1024 * 1024) {
				return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }
			}
			const timestamp = Date.now()
			const fileName = `${timestamp}-${input.productImage.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(input.productImage, path)
		}

		// Insert warehouse item
		const [newItem] = await db
			.insert(warehouseItems)
			.values({
				stockId,
				branchId: Number(input.branchId),
				categoryId: Number(input.categoryId),
				productName: input.productName,
				storageLocation: input.storageLocation,
				entryDate: input.entryDate,
				deliveryVehicleId,
				containerNumber: input.containerNumber,
				productImage,
				palletCount: input.palletCount,
				packageCount: input.packageCount,
				itemCount: input.itemCount,
				exitDate: input.exitDate || null,
				pickupVehicleId,
				status: input.status,
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

			// Revalidate the warehouse page to show new data
			revalidatePath('/warehouse')
			revalidatePath('/')

			return { success: true, data: updatedItem }
		} catch (qrError) {
			console.error('Error generating QR code:', qrError)
			// ถึงแม้ QR code จะ fail ก็ยังคืน item ที่สร้างสำเร็จ
			revalidatePath('/warehouse')
			revalidatePath('/')

			return { success: true, data: newItem }
		}
	} catch (error) {
		console.error('Error creating warehouse:', error)
		return { success: false, error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' }
	}
}

export async function getWarehouseItemById(id: string) {
	try {
		// ค้นหาด้วย UUID หรือ stockId (SKU) ก็ได้
		// SKU format: BKK-ELEC-20250115-0001 (มี 3 เครื่องหมาย "-")
		// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (มี 4 เครื่องหมาย "-")
		const dashCount = (id.match(/-/g) || []).length
		const isStockId = dashCount === 3

		const whereCondition = isStockId ? eq(warehouseItems.stockId, id) : eq(warehouseItems.id, id)

		// Retry logic for database connection issues
		let retries = 3
		let lastError: Error | null = null

		while (retries > 0) {
			try {
				// Fetch with category, branch, and delivery vehicle
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
						categoryId: warehouseItems.categoryId,
						branchId: warehouseItems.branchId,
						// Category info
						categoryCode: categories.code,
						categoryNameTh: categories.nameTh,
						categoryNameEn: categories.nameEn,
						// Branch info
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
					return null
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
				return {
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
					categoryId: rawItem.categoryId,
					branchId: rawItem.branchId,
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
			} catch (dbError) {
				lastError = dbError as Error
				retries--

				// Check if it's a connection error
				if (
					dbError &&
					typeof dbError === 'object' &&
					'code' in dbError &&
					(dbError.code === 'ECONNRESET' ||
						dbError.code === 'ETIMEDOUT' ||
						dbError.code === 'ECONNREFUSED')
				) {
					if (retries > 0) {
						console.log(`Database connection error, retrying... (${retries} attempts left)`)
						// Wait before retrying (exponential backoff)
						await new Promise((resolve) => setTimeout(resolve, (3 - retries) * 1000))
						continue
					}
				}
				// If it's not a connection error or no retries left, throw
				throw dbError
			}
		}

		// If we exhausted all retries, throw the last error
		if (lastError) {
			throw lastError
		}

		return null
	} catch (error) {
		console.error('Error fetching warehouse item:', error)
		return null
	}
}

// ======= Form Data Actions =======

/**
 * Get all provinces ordered by Thai name
 */
export async function getProvinces() {
	try {
		const allProvinces = await db.select().from(provinces).orderBy(asc(provinces.nameTh))
		return allProvinces
	} catch (error) {
		console.error('Error fetching provinces:', error)
		return []
	}
}

/**
 * Get all categories ordered by Thai name
 */
export async function getCategories() {
	try {
		const allCategories = await db.select().from(categories).orderBy(asc(categories.nameTh))
		return allCategories
	} catch (error) {
		console.error('Error fetching categories:', error)
		return []
	}
}

/**
 * Get all active branches ordered by Thai name
 */
export async function getBranches() {
	try {
		const allBranches = await db
			.select()
			.from(branches)
			.where(eq(branches.isActive, true))
			.orderBy(asc(branches.nameTh))
		return allBranches
	} catch (error) {
		console.error('Error fetching branches:', error)
		return []
	}
}

/**
 * Get all warehouse items with relations
 */
export async function getWarehouses() {
	try {
		const { inArray } = await import('drizzle-orm')

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
			branchId: item.branchId,
			categoryId: item.categoryId,
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

		return allItems
	} catch (error) {
		console.error('Error fetching warehouse items:', error)
		return []
	}
}

/**
 * Update warehouse item by ID
 */
export async function updateWarehouse(id: string, data: Partial<CreateWarehouseInput>) {
	try {
		// Get existing item to check for old image
		const existingItem = await db.query.warehouseItems.findFirst({
			where: eq(warehouseItems.id, id),
		})

		if (!existingItem) {
			return { success: false, error: 'ไม่พบข้อมูลสินค้า' }
		}

		// Handle product image upload if file is provided
		let productImage: string | null | undefined = undefined

		if (data.productImageFile && data.productImageFile.size > 0) {
			// Validate file
			if (data.productImageFile.size > 2 * 1024 * 1024) {
				return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }
			}
			if (
				!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(data.productImageFile.type)
			) {
				return { success: false, error: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น' }
			}

			// Delete old image if exists
			if (existingItem.productImage) {
				const oldImagePath = extractFilePathFromUrl(existingItem.productImage)
				if (oldImagePath) {
					try {
						await deleteFile(oldImagePath)
						console.log('✅ Deleted old product image:', oldImagePath)
					} catch (error) {
						console.error('⚠️ Failed to delete old product image:', error)
						// Continue anyway - don't fail the update if delete fails
					}
				}
			}

			// Upload new image
			const timestamp = Date.now()
			const fileName = `${timestamp}-${data.productImageFile.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(data.productImageFile, path)
		} else if (data.productImage && typeof data.productImage === 'string') {
			// ถ้าส่งมาเป็น URL string ใช้ได้เลย (ไม่ได้เปลี่ยนรูป)
			productImage = data.productImage
		} else if (data.productImage instanceof File) {
			// ถ้าส่งมาเป็น File object ใน productImage (กรณี fallback)
			if (data.productImage.size > 2 * 1024 * 1024) {
				return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }
			}

			// Delete old image if exists
			if (existingItem.productImage) {
				const oldImagePath = extractFilePathFromUrl(existingItem.productImage)
				if (oldImagePath) {
					try {
						await deleteFile(oldImagePath)
						console.log('✅ Deleted old product image:', oldImagePath)
					} catch (error) {
						console.error('⚠️ Failed to delete old product image:', error)
					}
				}
			}

			// Upload new image
			const timestamp = Date.now()
			const fileName = `${timestamp}-${data.productImage.name}`
			const path = `warehouse-items/${fileName}`
			productImage = await uploadFile(data.productImage, path)
		}

		// Handle vehicle updates if needed
		let deliveryVehicleId: string | null | undefined = undefined
		if (data.deliveryVehiclePlateNumber && data.deliveryVehicleProvinceId) {
			const [deliveryVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: data.deliveryVehiclePlateNumber,
					provinceId: Number(data.deliveryVehicleProvinceId),
				})
				.onConflictDoNothing()
				.returning()

			deliveryVehicleId = deliveryVehicle?.id

			if (!deliveryVehicleId) {
				const existing = await db.query.vehicles.findFirst({
					where: (vehicles, { and, eq }) =>
						and(
							eq(vehicles.plateNumber, data.deliveryVehiclePlateNumber!),
							eq(vehicles.provinceId, Number(data.deliveryVehicleProvinceId!)),
						),
				})
				deliveryVehicleId = existing?.id
			}
		}

		let pickupVehicleId: string | null | undefined = undefined
		if (data.pickupVehiclePlateNumber && data.pickupVehicleProvinceId) {
			const [pickupVehicle] = await db
				.insert(vehicles)
				.values({
					plateNumber: data.pickupVehiclePlateNumber,
					provinceId: Number(data.pickupVehicleProvinceId),
				})
				.onConflictDoNothing()
				.returning()

			pickupVehicleId = pickupVehicle?.id

			if (!pickupVehicleId) {
				const existing = await db.query.vehicles.findFirst({
					where: (vehicles, { and, eq }) =>
						and(
							eq(vehicles.plateNumber, data.pickupVehiclePlateNumber!),
							eq(vehicles.provinceId, Number(data.pickupVehicleProvinceId!)),
						),
				})
				pickupVehicleId = existing?.id || null
			}
		}

		// Update item in database
		const updateData: Record<string, unknown> = {
			...data,
			branchId: data.branchId ? Number(data.branchId) : undefined,
			categoryId: data.categoryId ? Number(data.categoryId) : undefined,
			productImage,
			deliveryVehicleId,
			pickupVehicleId,
			updatedAt: new Date(),
		}

		// Remove fields that shouldn't be in the update
		delete updateData.productImageFile
		delete updateData.deliveryVehiclePlateNumber
		delete updateData.deliveryVehicleProvinceId
		delete updateData.pickupVehiclePlateNumber
		delete updateData.pickupVehicleProvinceId

		const [updated] = await db
			.update(warehouseItems)
			.set(updateData)
			.where(eq(warehouseItems.id, id))
			.returning()

		revalidatePath('/warehouse')
		return { success: true, data: updated }
	} catch (error) {
		console.error('Error updating warehouse:', error)
		return { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า' }
	}
}

/**
 * Delete warehouse item by ID
 */
export async function deleteWarehouse(id: string) {
	try {
		await db.delete(warehouseItems).where(eq(warehouseItems.id, id))

		revalidatePath('/warehouse')
		return { success: true }
	} catch (error) {
		console.error('Error deleting warehouse:', error)
		return { success: false, error: 'เกิดข้อผิดพลาดในการลบสินค้า' }
	}
}

// ======= Form Actions for useFormState =======

/**
 * Create warehouse action for use with useFormState
 */
export async function createWarehouseAction(
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	try {
		// Extract and validate form data
		const branchId = formData.get('branchId') as string
		const categoryId = formData.get('categoryId') as string
		const productName = formData.get('productName') as string
		const storageLocation = formData.get('storageLocation') as string
		const entryDate = formData.get('entryDate') as string
		const deliveryVehiclePlateNumber = formData.get('deliveryVehiclePlateNumber') as string
		const deliveryVehicleProvinceId = formData.get('deliveryVehicleProvinceId') as string
		const containerNumber = formData.get('containerNumber') as string
		const palletCount = Number(formData.get('palletCount'))
		const packageCount = Number(formData.get('packageCount'))
		const itemCount = Number(formData.get('itemCount'))
		const status = (formData.get('status') as string) || 'in_stock'
		const exitDate = formData.get('exitDate') as string | null
		const pickupVehiclePlateNumber = formData.get('pickupVehiclePlateNumber') as string | null
		const pickupVehicleProvinceId = formData.get('pickupVehicleProvinceId') as string | null
		const productImageFile = formData.get('productImage') as File | null

		// Validation
		const errors: Record<string, string[]> = {}

		if (!branchId) errors.branchId = ['กรุณาเลือกสาขา']
		if (!categoryId) errors.categoryId = ['กรุณาเลือกหมวดหมู่']
		if (!productName) errors.productName = ['กรุณากรอกชื่อสินค้า']
		if (!storageLocation) errors.storageLocation = ['กรุณากรอกที่จัดเก็บ']
		if (!entryDate) errors.entryDate = ['กรุณาเลือกวันที่เข้า']
		if (!deliveryVehiclePlateNumber) errors.deliveryVehiclePlateNumber = ['กรุณากรอกทะเบียนรถส่ง']
		if (!deliveryVehicleProvinceId) errors.deliveryVehicleProvinceId = ['กรุณาเลือกจังหวัด']
		if (!containerNumber) errors.containerNumber = ['กรุณากรอกหมายเลขตู้คอนเทนเนอร์']
		if (!palletCount || palletCount < 1) errors.palletCount = ['จำนวนพาเลทต้องมากกว่า 0']
		if (!packageCount || packageCount < 1) errors.packageCount = ['จำนวนแพ็คเกจต้องมากกว่า 0']
		if (!itemCount || itemCount < 1) errors.itemCount = ['จำนวนชิ้นต้องมากกว่า 0']

		if (Object.keys(errors).length > 0) {
			return { success: false, errors, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
		}

		// Call existing createWarehouse function
		const input: CreateWarehouseInput = {
			branchId,
			categoryId,
			productName,
			storageLocation,
			entryDate: new Date(entryDate),
			deliveryVehiclePlateNumber,
			deliveryVehicleProvinceId,
			containerNumber,
			productImageFile: productImageFile && productImageFile.size > 0 ? productImageFile : null,
			palletCount,
			packageCount,
			itemCount,
			status: status as 'in_stock' | 'out_for_delivery' | 'delivered',
			exitDate: exitDate ? new Date(exitDate) : undefined,
			pickupVehiclePlateNumber: pickupVehiclePlateNumber || undefined,
			pickupVehicleProvinceId: pickupVehicleProvinceId || undefined,
		}

		const result = await createWarehouse(input)

		if (result.success) {
			return {
				success: true,
				message: 'เพิ่มสินค้าเรียบร้อยแล้ว',
				data: result.data,
			}
		}

		return {
			success: false,
			message: result.error || 'เกิดข้อผิดพลาด',
		}
	} catch (error) {
		console.error('Error in createWarehouseAction:', error)
		return {
			success: false,
			message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
		}
	}
}

/**
 * Update warehouse action for use with useFormState
 */
export async function updateWarehouseAction(
	id: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	try {
		// Extract form data
		const branchId = formData.get('branchId') as string | null
		const categoryId = formData.get('categoryId') as string | null
		const productName = formData.get('productName') as string | null
		const storageLocation = formData.get('storageLocation') as string | null
		const entryDate = formData.get('entryDate') as string | null
		const deliveryVehiclePlateNumber = formData.get('deliveryVehiclePlateNumber') as string | null
		const deliveryVehicleProvinceId = formData.get('deliveryVehicleProvinceId') as string | null
		const containerNumber = formData.get('containerNumber') as string | null
		const palletCount = formData.get('palletCount') ? Number(formData.get('palletCount')) : null
		const packageCount = formData.get('packageCount') ? Number(formData.get('packageCount')) : null
		const itemCount = formData.get('itemCount') ? Number(formData.get('itemCount')) : null
		const status = formData.get('status') as string | null
		const exitDate = formData.get('exitDate') as string | null
		const pickupVehiclePlateNumber = formData.get('pickupVehiclePlateNumber') as string | null
		const pickupVehicleProvinceId = formData.get('pickupVehicleProvinceId') as string | null
		const productImageFile = formData.get('productImage') as File | null

		// Build update data (only include fields that were provided)
		const updateData: Partial<CreateWarehouseInput> = {}

		if (branchId) updateData.branchId = branchId
		if (categoryId) updateData.categoryId = categoryId
		if (productName) updateData.productName = productName
		if (storageLocation) updateData.storageLocation = storageLocation
		if (entryDate) updateData.entryDate = new Date(entryDate)
		if (deliveryVehiclePlateNumber) updateData.deliveryVehiclePlateNumber = deliveryVehiclePlateNumber
		if (deliveryVehicleProvinceId) updateData.deliveryVehicleProvinceId = deliveryVehicleProvinceId
		if (containerNumber) updateData.containerNumber = containerNumber
		if (palletCount !== null) updateData.palletCount = palletCount
		if (packageCount !== null) updateData.packageCount = packageCount
		if (itemCount !== null) updateData.itemCount = itemCount
		if (status) updateData.status = status as 'in_stock' | 'out_for_delivery' | 'delivered'
		if (exitDate) updateData.exitDate = new Date(exitDate)
		if (pickupVehiclePlateNumber) updateData.pickupVehiclePlateNumber = pickupVehiclePlateNumber
		if (pickupVehicleProvinceId) updateData.pickupVehicleProvinceId = pickupVehicleProvinceId
		if (productImageFile && productImageFile.size > 0) {
			updateData.productImageFile = productImageFile
		}

		const result = await updateWarehouse(id, updateData)

		if (result.success) {
			return {
				success: true,
				message: 'อัปเดตสินค้าเรียบร้อยแล้ว',
				data: result.data,
			}
		}

		return {
			success: false,
			message: result.error || 'เกิดข้อผิดพลาด',
		}
	} catch (error) {
		console.error('Error in updateWarehouseAction:', error)
		return {
			success: false,
			message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า',
		}
	}
}
