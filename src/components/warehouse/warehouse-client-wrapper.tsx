'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { WarehouseAddButton } from '@/components/warehouse/warehouse-add-button'
import { WarehouseTableContent } from '@/components/warehouse/warehouse-table-content'
import { supabaseClient } from '@/lib/supabase-client'
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

	// Supabase Realtime subscription for instant updates
	useEffect(() => {
		// Subscribe to all changes in warehouse_items table
		const channel = supabaseClient
			.channel('warehouse-changes')
			.on(
				'postgres_changes',
				{
					event: '*', // Listen to INSERT, UPDATE, DELETE
					schema: 'public',
					table: 'warehouse_items',
				},
				(payload) => {
					console.log('📡 Real-time update received:', payload)
					// Refresh the page data when any change occurs
					handleDataChange()
				},
			)
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log('✅ Real-time subscription active')
				}
				if (status === 'CHANNEL_ERROR') {
					console.error('❌ Real-time subscription error')
				}
			})

		// Cleanup subscription on unmount
		return () => {
			console.log('🔌 Unsubscribing from real-time updates')
			supabaseClient.removeChannel(channel)
		}
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
