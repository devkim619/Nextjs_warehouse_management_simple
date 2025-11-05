import { Suspense } from 'react'

import { getWarehouses } from '@/actions/warehouse-actions'
import { WarehouseClientWrapper } from '@/components/warehouse/warehouse-client-wrapper'
import { WarehouseTableSkeleton } from '@/components/warehouse/warehouse-table-skeleton'
import { WarehouseItem } from '@/types/warehouse'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function WarehouseData() {
	const data = await getWarehouses()

	return <WarehouseClientWrapper initialData={data as unknown as WarehouseItem[]} />
}

export default function WarehousePage() {
	return (
		<Suspense fallback={<WarehousePageSkeleton />}>
			<WarehouseData />
		</Suspense>
	)
}

function WarehousePageSkeleton() {
	return (
		<div className='bg-background min-h-screen'>
			<div className='w-full py-6 px-4'>
				<div className='flex flex-col gap-8'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight'>จัดการสินค้าในคลัง</h1>
							<p className='text-muted-foreground mt-2'>เพิ่ม แก้ไข และจัดการข้อมูลสินค้า</p>
						</div>
					</div>

					{/* Data Table Skeleton */}
					<WarehouseTableSkeleton />
				</div>
			</div>
		</div>
	)
}
