import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WarehouseTableSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>รายการสินค้าในคลัง</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{/* Table Header Skeleton */}
					<div className='flex items-center gap-2 pb-4 border-b'>
						<Skeleton className='h-4 w-4' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 flex-1' />
					</div>

					{/* Table Rows Skeleton */}
					{Array.from({ length: 10 }).map((_, i) => (
						<div key={i} className='flex items-center gap-4 py-3 border-b last:border-0'>
							<Skeleton className='h-4 w-4' />
							<Skeleton className='h-12 w-12 rounded' />
							<div className='flex-1 space-y-2'>
								<Skeleton className='h-4 w-48' />
								<Skeleton className='h-3 w-32' />
							</div>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-20' />
							<Skeleton className='h-6 w-16' />
							<Skeleton className='h-8 w-8' />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
