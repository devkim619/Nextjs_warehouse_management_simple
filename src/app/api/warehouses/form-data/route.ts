import { db } from '@/db'
import { branches, categories, provinces } from '@/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		// Fetch all categories
		const categoriesData = await db.select().from(categories).orderBy(categories.nameTh)

		// Fetch all branches
		const branchesData = await db.select().from(branches).orderBy(branches.nameTh)

		// Fetch all provinces
		const provincesData = await db.select().from(provinces).orderBy(provinces.nameTh)

		return NextResponse.json({
			success: true,
			data: {
				categories: categoriesData,
				branches: branchesData,
				provinces: provincesData,
			},
		})
	} catch (error) {
		console.error('Error fetching form data:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch form data',
			},
			{ status: 500 },
		)
	}
}
