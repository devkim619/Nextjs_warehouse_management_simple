'use server'

import { db } from '@/db'
import { categories, warehouseItems } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export interface DashboardStats {
	inStockCount: number
	outForDeliveryCount: number
	deliveredCount: number
	totalCount: number
	totalPallets: number
	totalPackages: number
	totalItems: number
	uniqueCategories: number
}

export interface CategoryStat {
	categoryId: number | null
	categoryCode: string | null
	categoryName: string
	count: number
}

export interface RecentActivity {
	id: string
	stockId: string
	productName: string
	productImage: string | null
	storageLocation: string
	status: 'in_stock' | 'out_for_delivery' | 'delivered'
	createdAt: string
	category: {
		id: number
		code: string | null
		nameTh: string | null
		nameEn: string | null
	} | null
}

export interface DashboardData {
	stats: DashboardStats
	categoryDistribution: CategoryStat[]
	recentActivities: RecentActivity[]
}

export async function getDashboardData(): Promise<DashboardData | null> {
	try {
		// 1. Get basic counts by status
		const statusCounts = await db
			.select({
				status: warehouseItems.status,
				count: sql<number>`count(*)::int`,
			})
			.from(warehouseItems)
			.groupBy(warehouseItems.status)

		// 2. Get total counts (pallets, packages, items)
		const totals = await db
			.select({
				totalPallets: sql<number>`coalesce(sum(${warehouseItems.palletCount}), 0)::int`,
				totalPackages: sql<number>`coalesce(sum(${warehouseItems.packageCount}), 0)::int`,
				totalItems: sql<number>`coalesce(sum(${warehouseItems.itemCount}), 0)::int`,
				totalCount: sql<number>`count(*)::int`,
			})
			.from(warehouseItems)

		// 3. Get category distribution with category names
		const categoryDistribution = await db
			.select({
				categoryId: warehouseItems.categoryId,
				categoryCode: categories.code,
				categoryNameTh: categories.nameTh,
				categoryNameEn: categories.nameEn,
				count: sql<number>`count(*)::int`,
			})
			.from(warehouseItems)
			.leftJoin(categories, eq(warehouseItems.categoryId, categories.id))
			.groupBy(warehouseItems.categoryId, categories.code, categories.nameTh, categories.nameEn)
			.orderBy(desc(sql`count(*)`))

		// 4. Get recent activities (last 10 items)
		const recentActivities = await db
			.select({
				id: warehouseItems.id,
				stockId: warehouseItems.stockId,
				productName: warehouseItems.productName,
				productImage: warehouseItems.productImage,
				storageLocation: warehouseItems.storageLocation,
				status: warehouseItems.status,
				createdAt: warehouseItems.createdAt,
				categoryId: categories.id,
				categoryCode: categories.code,
				categoryNameTh: categories.nameTh,
				categoryNameEn: categories.nameEn,
			})
			.from(warehouseItems)
			.leftJoin(categories, eq(warehouseItems.categoryId, categories.id))
			.orderBy(desc(warehouseItems.createdAt))
			.limit(10)

		// Transform status counts to object
		const statusStats = {
			in_stock: 0,
			out_for_delivery: 0,
			delivered: 0,
		}
		statusCounts.forEach((item) => {
			if (item.status) {
				statusStats[item.status] = item.count
			}
		})

		// Get unique category count
		const uniqueCategories = categoryDistribution.filter((cat) => cat.categoryId !== null).length

		// Prepare response
		const dashboardData: DashboardData = {
			stats: {
				// Status counts
				inStockCount: statusStats.in_stock,
				outForDeliveryCount: statusStats.out_for_delivery,
				deliveredCount: statusStats.delivered,
				totalCount: totals[0]?.totalCount || 0,

				// Quantity totals
				totalPallets: totals[0]?.totalPallets || 0,
				totalPackages: totals[0]?.totalPackages || 0,
				totalItems: totals[0]?.totalItems || 0,

				// Categories
				uniqueCategories,
			},
			categoryDistribution: categoryDistribution.map((cat) => ({
				categoryId: cat.categoryId,
				categoryCode: cat.categoryCode,
				categoryName: cat.categoryNameTh || 'ไม่ระบุ',
				count: cat.count,
			})),
			recentActivities: recentActivities.map((item) => ({
				id: item.id,
				stockId: item.stockId,
				productName: item.productName,
				productImage: item.productImage,
				storageLocation: item.storageLocation,
				status: item.status,
				createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
				category: item.categoryId
					? {
							id: item.categoryId,
							code: item.categoryCode,
							nameTh: item.categoryNameTh,
							nameEn: item.categoryNameEn,
					  }
					: null,
			})),
		}

		return dashboardData
	} catch (error) {
		console.error('Error fetching dashboard data:', error)
		return null
	}
}
