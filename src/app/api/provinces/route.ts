// REST API - Commented out in favor of Server Actions
// Use getProvinces() from @/actions/warehouse-actions instead

// import { db } from '@/db'
// import { provinces } from '@/db/schema'
// import { NextResponse } from 'next/server'

// export const GET = async () => {
// 	try {
// 		const allProvinces = await db.select().from(provinces).orderBy(provinces.nameTh)
// 		return NextResponse.json(allProvinces)
// 	} catch (error) {
// 		console.error('Error fetching provinces:', error)
// 		return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 })
// 	}
// }
