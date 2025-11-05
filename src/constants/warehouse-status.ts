import { WarehouseStatus } from '@/types/warehouse'

interface WarehouseStatusInfo {
	label: string
	variant: 'default' | 'secondary' | 'destructive' | 'outline'
	className: string
}

export const warehouseStatusMap: Record<WarehouseStatus, WarehouseStatusInfo> = {
	in_stock: {
		label: 'ในคลัง',
		variant: 'outline',
		className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
	},
	out_for_delivery: {
		label: 'กำลังจัดส่ง',
		variant: 'outline',
		className: 'border-amber-200 bg-amber-100 text-amber-700',
	},
	delivered: {
		label: 'ส่งแล้ว',
		variant: 'outline',
		className: 'border-sky-200 bg-sky-100 text-sky-700',
	},
}

export type WarehouseStatusKey = keyof typeof warehouseStatusMap
