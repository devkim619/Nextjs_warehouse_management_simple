'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { deleteWarehouse, updateWarehouse } from '@/actions/warehouse-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createColumns } from '@/components/warehouse/columns'
import { DataTable } from '@/components/warehouse/data-table'
import { DeleteDialog } from '@/components/warehouse/delete-dialog'
import { EditDialog } from '@/components/warehouse/edit-dialog'
import { WarehouseItem } from '@/types/warehouse'

// Type สำหรับ form data ที่ส่งมาจาก EditDialog
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

interface WarehouseTableContentProps {
	data: WarehouseItem[]
	onDataChange?: () => void
}

export function WarehouseTableContent({ data, onDataChange }: WarehouseTableContentProps) {
	const [editItemId, setEditItemId] = useState<string | null>(null)
	const [deleteItemState, setDeleteItemState] = useState<WarehouseItem | null>(null)
	const [isEditSubmitting, setIsEditSubmitting] = useState(false)

	const handleEdit = (item: WarehouseItem) => {
		setEditItemId(item.id) // เก็บแค่ id
	}

	const handleEditSave = async (formData: WarehouseFormData) => {
		if (editItemId) {
			setIsEditSubmitting(true)
			const result = await updateWarehouse(editItemId, formData)
			setIsEditSubmitting(false)

			if (result.success) {
				toast.success('แก้ไขข้อมูลสินค้าสำเร็จ')
				setEditItemId(null)
				onDataChange?.()
			} else {
				toast.error(result.error || 'เกิดข้อผิดพลาดในการแก้ไขสินค้า')
			}
		}
	}

	const handleDelete = (item: WarehouseItem) => {
		setDeleteItemState(item)
	}

	const handleDeleteConfirm = async () => {
		if (deleteItemState) {
			const result = await deleteWarehouse(deleteItemState.id)
			if (result.success) {
				setDeleteItemState(null)
				onDataChange?.()
			}
		}
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
		<>
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
			{/* Edit Dialog */}
			<EditDialog
				itemId={editItemId}
				open={!!editItemId}
				onOpenChangeAction={(open) => !open && setEditItemId(null)}
				onSaveAction={handleEditSave}
				isSubmitting={isEditSubmitting}
			/>{' '}
			{/* Delete Dialog */}
			<DeleteDialog
				item={deleteItemState}
				open={!!deleteItemState}
				onOpenChangeAction={(open: boolean) => !open && setDeleteItemState(null)}
				onConfirmAction={handleDeleteConfirm}
			/>
		</>
	)
}
