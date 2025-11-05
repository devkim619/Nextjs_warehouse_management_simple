'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { WarehouseItem } from '@/types/warehouse'

interface DeleteDialogProps {
	item: WarehouseItem | null
	open: boolean
	onOpenChangeAction: (open: boolean) => void
	onConfirmAction: () => void
}

export function DeleteDialog({
	item,
	open,
	onOpenChangeAction,
	onConfirmAction,
}: DeleteDialogProps) {
	const handleConfirm = () => {
		onConfirmAction()
		onOpenChangeAction(false)
	}

	if (!item) return null

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChangeAction}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
					<AlertDialogDescription>
						คุณต้องการลบสินค้า <strong>{item.productName}</strong> ออกจากระบบใช่หรือไม่?
						<br />
						การดำเนินการนี้ไม่สามารถย้อนกลับได้
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>ยกเลิก</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className=''
					>
						ลบสินค้า
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
