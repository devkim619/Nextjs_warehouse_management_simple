import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
	return (
		<>
			{/* Stats Cards Skeleton */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 7 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-4' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-8 w-16 mb-2' />
							<Skeleton className='h-3 w-32' />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Main Content Skeleton */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4'>
					<CardHeader>
						<Skeleton className='h-6 w-32' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
								>
									<div className='flex items-center gap-4'>
										<Skeleton className='h-14 w-14 rounded-md shrink-0' />
										<div className='space-y-2'>
											<Skeleton className='h-4 w-48' />
											<Skeleton className='h-3 w-32' />
											<Skeleton className='h-3 w-40' />
										</div>
									</div>
									<div className='space-y-2'>
										<Skeleton className='h-6 w-20' />
										<Skeleton className='h-3 w-16' />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className='col-span-3'>
					<CardHeader>
						<Skeleton className='h-6 w-32' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Skeleton className='h-8 w-8 rounded-full' />
										<Skeleton className='h-4 w-32' />
									</div>
									<div className='space-y-1 text-right'>
										<Skeleton className='h-5 w-8' />
										<Skeleton className='h-3 w-12' />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
