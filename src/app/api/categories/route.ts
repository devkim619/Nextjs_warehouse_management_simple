// REST API - Commented out in favor of Server Actions
// Use getCategories() from @/actions/warehouse-actions instead

// import { db } from '@/db'
// import { categories } from '@/db/schema'
// import { asc } from 'drizzle-orm'
// import { NextResponse } from 'next/server'

// export async function GET() {
// 	try {
// 		const allCategories = await db.select().from(categories).orderBy(asc(categories.nameTh))

// 		return NextResponse.json({
// 			success: true,
// 			data: allCategories,
// 		})
// 	} catch (error) {
// 		console.error('Error fetching categories:', error)
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				error: 'Failed to fetch categories',
// 			},
// 			{ status: 500 },
// 		)
// 	}
// }
