'use client'

import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { createColumns } from '@/components/warehouse/columns'
import { DataTable } from '@/components/warehouse/data-table'
import { DeleteDialog } from '@/components/warehouse/delete-dialog'
import { EditDialog } from '@/components/warehouse/edit-dialog'
import { WarehouseForm } from '@/components/warehouse/warehouse-form'
import { useWarehouse } from '@/contexts/warehouse-context'
import { WarehouseItem } from '@/types/warehouse'

export default function WarehousePage() {
	const { data, addItem, updateItem, deleteItem } = useWarehouse()
	const [open, setOpen] = useState(false)
	const [editItem, setEditItem] = useState<WarehouseItem | null>(null)
	const [deleteItemState, setDeleteItemState] = useState<WarehouseItem | null>(null)

	const handleAdd = (formData: Omit<WarehouseItem, 'id'>) => {
		addItem(formData)
		setOpen(false)
	}

	const handleEdit = (item: WarehouseItem) => {
		setEditItem(item)
	}

	const handleEditSave = (formData: Omit<WarehouseItem, 'id'>) => {
		if (editItem) {
			updateItem(editItem.id, formData)
		}
		setEditItem(null)
	}

	const handleDelete = (item: WarehouseItem) => {
		setDeleteItemState(item)
	}

	const handleDeleteConfirm = () => {
		if (deleteItemState) {
			deleteItem(deleteItemState.id)
		}
		setDeleteItemState(null)
	}

	const columns = useMemo(
		() =>
			createColumns({
				onEdit: handleEdit,
				onDelete: handleDelete,
			}),
		[],
	)

	return (
		<div className='bg-background'>
			<div className='container mx-auto py-6 px-4'>
				<div className='flex flex-col gap-8'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight'>จัดการสินค้าในคลัง</h1>
							<p className='text-muted-foreground mt-2'>เพิ่ม แก้ไข และจัดการข้อมูลสินค้า</p>
						</div>
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
									onSubmit={handleAdd}
									onCancel={() => setOpen(false)}
								/>
							</DialogContent>
						</Dialog>
					</div>

					{/* Data Table */}
					<Card>
						<CardHeader>
							<CardTitle>รายการสินค้าในคลัง</CardTitle>
						</CardHeader>
						<CardContent>
							<DataTable
								columns={columns}
								data={data}
							/>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Edit Dialog */}
			<EditDialog
				item={editItem}
				open={!!editItem}
				onOpenChange={(open) => !open && setEditItem(null)}
				onSave={handleEditSave}
			/>

			{/* Delete Dialog */}
			<DeleteDialog
				item={deleteItemState}
				open={!!deleteItemState}
				onOpenChange={(open) => !open && setDeleteItemState(null)}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	)
}
