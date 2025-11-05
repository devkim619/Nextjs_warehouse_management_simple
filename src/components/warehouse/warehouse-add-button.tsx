'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { createWarehouse, CreateWarehouseInput } from '@/actions/warehouse-actions'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { WarehouseForm } from '@/components/warehouse/warehouse-form'

interface WarehouseAddButtonProps {
	onAdd?: () => void
}

export function WarehouseAddButton({ onAdd }: WarehouseAddButtonProps) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleAdd = async (formData: CreateWarehouseInput) => {
		setLoading(true)
		const result = await createWarehouse(formData)
		setLoading(false)

		if (result.success) {
			toast.success('เพิ่มสินค้าเข้าคลังสำเร็จ')
			setOpen(false)
			onAdd?.()
		} else {
			toast.error(result.error || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า')
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button size='lg'>
					<Plus className='mr-2 h-5 w-5' />
					เพิ่มสินค้าเข้าคลัง
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>เพิ่มสินค้าเข้าคลัง</DialogTitle>
					<DialogDescription>กรอกข้อมูลสินค้าที่ต้องการเพิ่มเข้าคลัง</DialogDescription>
				</DialogHeader>
				<WarehouseForm
					onSubmitAction={handleAdd}
					onCancel={() => setOpen(false)}
					isSubmitting={loading}
				/>
			</DialogContent>
		</Dialog>
	)
}
