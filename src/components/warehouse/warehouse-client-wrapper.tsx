'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { WarehouseAddButton } from '@/components/warehouse/warehouse-add-button'
import { WarehouseTableContent } from '@/components/warehouse/warehouse-table-content'
import { WarehouseItem } from '@/types/warehouse'

interface WarehouseClientWrapperProps {
	initialData: WarehouseItem[]
}

export function WarehouseClientWrapper({ initialData }: WarehouseClientWrapperProps) {
	const router = useRouter()
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleDataChange = () => {
		setIsRefreshing(true)
		router.refresh()
		setTimeout(() => setIsRefreshing(false), 500)
	}

	// Optional: Auto-refresh every 30 seconds for real-time updates
	useEffect(() => {
		const interval = setInterval(() => {
			router.refresh()
		}, 30000) // 30 seconds

		return () => clearInterval(interval)
	}, [router])

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
						<WarehouseAddButton onAdd={handleDataChange} />
					</div>

					{/* Data Table */}
					<div className={isRefreshing ? 'opacity-50 transition-opacity' : ''}>
						<WarehouseTableContent
							data={initialData}
							onDataChange={handleDataChange}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
