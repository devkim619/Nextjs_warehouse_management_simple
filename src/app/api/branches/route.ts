// REST API - Commented out in favor of Server Actions
// Use getBranches() from @/actions/warehouse-actions instead

// import { NextResponse } from "next/server"
// import { db } from "@/db"
// import { branches } from "@/db/schema"
// import { asc, eq } from "drizzle-orm"

// export async function GET() {
//   try {
//     const allBranches = await db
//       .select()
//       .from(branches)
//       .where(eq(branches.isActive, true))
//       .orderBy(asc(branches.nameTh))

//     return NextResponse.json({
//       success: true,
//       data: allBranches,
//     })
//   } catch (error) {
//     console.error("Error fetching branches:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch branches",
//       },
//       { status: 500 }
//     )
//   }
// }
