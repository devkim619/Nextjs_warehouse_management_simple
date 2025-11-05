import { db } from '@/db'
import { branches, categories, warehouseItems } from '@/db/schema'
import { and, eq, gte, lt, sql } from 'drizzle-orm'

/**
 * Generate SKU (Stock Keeping Unit) สำหรับ warehouse item
 * Format: {BRANCH_CODE}-{CATEGORY_CODE}-{YYYYMMDD}-{SEQUENCE}
 * Example: BKK-ELEC-20250115-0001
 *
 * @param branchId ID ของสาขา
 * @param categoryId ID ของหมวดหมู่
 * @returns SKU string
 */
export async function generateSKU(branchId: number, categoryId: number): Promise<string> {
	// 1. ดึงรหัสสาขา
	const [branch] = await db
		.select({ code: branches.code })
		.from(branches)
		.where(eq(branches.id, branchId))
		.limit(1)

	if (!branch) {
		throw new Error(`Branch with ID ${branchId} not found`)
	}

	// 2. ดึงรหัสหมวดหมู่
	const [category] = await db
		.select({ code: categories.code })
		.from(categories)
		.where(eq(categories.id, categoryId))
		.limit(1)

	if (!category) {
		throw new Error(`Category with ID ${categoryId} not found`)
	}

	// 3. สร้าง date part (YYYYMMDD)
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const datePart = `${year}${month}${day}`

	// 4. หา sequence number สำหรับวันนี้
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

	// Count items created today with same branch and category
	const [result] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(warehouseItems)
		.where(
			and(
				eq(warehouseItems.branchId, branchId),
				eq(warehouseItems.categoryId, categoryId),
				gte(warehouseItems.createdAt, startOfDay),
				lt(warehouseItems.createdAt, endOfDay),
			),
		)

	const sequence = (result?.count || 0) + 1
	const sequencePart = String(sequence).padStart(4, '0')

	// 5. รวม SKU
	const sku = `${branch.code}-${category.code}-${datePart}-${sequencePart}`

	return sku
}

/**
 * ตรวจสอบว่า SKU ซ้ำหรือไม่
 * @param sku SKU ที่ต้องการตรวจสอบ
 * @returns true ถ้าซ้ำ, false ถ้าไม่ซ้ำ
 */
export async function isSKUDuplicate(sku: string): Promise<boolean> {
	const [existing] = await db
		.select({ id: warehouseItems.id })
		.from(warehouseItems)
		.where(eq(warehouseItems.stockId, sku))
		.limit(1)

	return !!existing
}

/**
 * Parse SKU เพื่อดึงข้อมูลออกมา
 * @param sku SKU string
 * @returns Parsed SKU data หรือ null ถ้า format ไม่ถูกต้อง
 */
export function parseSKU(sku: string): {
	branchCode: string
	categoryCode: string
	date: string
	sequence: string
} | null {
	const parts = sku.split('-')
	if (parts.length !== 4) {
		return null
	}

	const [branchCode, categoryCode, date, sequence] = parts

	// Validate format
	if (!branchCode || !categoryCode || date.length !== 8 || sequence.length !== 4) {
		return null
	}

	return {
		branchCode,
		categoryCode,
		date,
		sequence,
	}
}
