import { ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { Button } from '@/components/ui/button'

export default function Home() {
	return (
		<div className='bg-background'>
			<div className='container mx-auto py-6 px-4'>
				<div className='flex flex-col gap-8'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight'>ภาพรวมระบบคลังสินค้า</h1>
							<p className='text-muted-foreground mt-2'>สรุปข้อมูลและสถานะคลังสินค้าโดยรวม</p>
						</div>
						<Link href='/warehouse'>
							<Button size='lg'>
								<Package className='mr-2 h-5 w-5' />
								จัดการสินค้า
								<ArrowRight className='ml-2 h-5 w-5' />
							</Button>
						</Link>
					</div>

					<Suspense fallback={<DashboardSkeleton />}>
						<DashboardContent />
					</Suspense>
				</div>
			</div>
		</div>
	)
}
