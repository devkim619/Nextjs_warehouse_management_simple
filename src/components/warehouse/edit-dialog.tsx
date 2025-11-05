'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { WarehouseItem } from '@/types/warehouse'
import { WarehouseForm } from './warehouse-form'

interface EditDialogProps {
	item: WarehouseItem | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (data: Omit<WarehouseItem, 'id'>) => void
}

export function EditDialog({ item, open, onOpenChange, onSave }: EditDialogProps) {
	const handleSubmit = (data: Omit<WarehouseItem, 'id'>) => {
		onSave(data)
		onOpenChange(false)
	}

	if (!item) return null

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>แก้ไขข้อมูลสินค้า</DialogTitle>
					<DialogDescription>แก้ไขข้อมูลสินค้าในคลัง</DialogDescription>
				</DialogHeader>
				<WarehouseForm
					defaultValues={item}
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
