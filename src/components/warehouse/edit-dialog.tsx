'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getWarehouseItemById } from '@/actions/warehouse-actions'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseItem } from '@/types/warehouse'
import { WarehouseForm } from './warehouse-form'

// Type สำหรับข้อมูลที่ได้จาก getWarehouseItemById
type WarehouseItemDetail = NonNullable<Awaited<ReturnType<typeof getWarehouseItemById>>>

// Type สำหรับ form data
interface WarehouseFormData {
	branchId: string
	categoryId: string
	productName: string
	storageLocation: string
	entryDate: Date
	deliveryVehiclePlateNumber: string
	deliveryVehicleProvinceId: string
	containerNumber: string
	productImage?: string | File
	productImageFile?: File | null
	palletCount: number
	packageCount: number
	itemCount: number
	exitDate?: Date
	pickupVehiclePlateNumber?: string
	pickupVehicleProvinceId?: string
	status: 'in_stock' | 'out_for_delivery' | 'delivered'
}

interface EditDialogProps {
	itemId: string | null
	open: boolean
	onOpenChangeAction: (open: boolean) => void
	onSaveAction: (data: WarehouseFormData) => void | Promise<void>
	isSubmitting?: boolean
}

export function EditDialog({
	itemId,
	open,
	onOpenChangeAction,
	onSaveAction,
	isSubmitting = false,
}: EditDialogProps) {
	const [item, setItem] = useState<WarehouseItemDetail | null>(null)
	const [loading, setLoading] = useState(false)

	// โหลดข้อมูลเต็มเมื่อเปิด dialog
	useEffect(() => {
		async function loadItem() {
			if (!itemId || !open) {
				console.log('❌ Skip loading:', { itemId, open })
				return
			}

			console.log('🔄 Loading item:', itemId)
			setLoading(true)
			try {
				const data = await getWarehouseItemById(itemId)
				console.log('✅ Loaded item:', data)
				if (!data) {
					toast.error('ไม่พบข้อมูลสินค้า')
				}
				setItem(data)
			} catch (error) {
				console.error('❌ Error loading warehouse item:', error)
				toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง')
			} finally {
				setLoading(false)
			}
		}

		loadItem()
	}, [itemId, open])

	const handleSubmit = async (data: WarehouseFormData) => {
		await onSaveAction(data)
		onOpenChangeAction(false)
	}

	console.log('🎨 Render state:', { loading, hasItem: !!item, itemId })

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChangeAction}
		>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>แก้ไขข้อมูลสินค้า</DialogTitle>
					<DialogDescription>แก้ไขข้อมูลสินค้าในคลัง</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className='space-y-4'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
				) : item ? (
					<WarehouseForm
						defaultValues={item as unknown as Partial<WarehouseItem>}
						onSubmitAction={handleSubmit}
						onCancel={() => onOpenChangeAction(false)}
						isSubmitting={isSubmitting}
					/>
				) : (
					<div className='py-8 text-center text-muted-foreground'>ไม่พบข้อมูลสินค้า</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
