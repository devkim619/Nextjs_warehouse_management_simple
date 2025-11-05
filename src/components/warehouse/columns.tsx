'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WarehouseItem } from '@/types/warehouse'

const statusMap = {
	in_stock: { label: 'ในคลัง', variant: 'default' as const },
	out_for_delivery: { label: 'กำลังจัดส่ง', variant: 'secondary' as const },
	delivered: { label: 'ส่งแล้ว', variant: 'outline' as const },
}

interface ColumnsConfig {
	onEdit?: (item: WarehouseItem) => void
	onDelete?: (item: WarehouseItem) => void
}

export function createColumns(config?: ColumnsConfig): ColumnDef<WarehouseItem>[] {
	const { onEdit, onDelete } = config || {}

	return [
		{
			accessorKey: 'productImage',
			header: 'รูปสินค้า',
			cell: ({ row }) => {
				const imageUrl = row.getValue('productImage') as string
				const productName = row.getValue('productName') as string

				return (
					<div className='flex items-center justify-center'>
						{imageUrl ? (
							<Image
								src={imageUrl}
								alt={productName}
								width={50}
								height={50}
								className='rounded object-cover'
							/>
						) : (
							<div className='w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center'>
								<span className='text-xs text-muted-foreground'>ไม่มีรูป</span>
							</div>
						)}
					</div>
				)
			},
		},
		{
			accessorKey: 'productName',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						ชื่อสินค้า
						<ArrowUpDown className='ml-2 size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const productName = row.getValue('productName') as string
				const category = row.original.category
				return (
					<div className='flex flex-col'>
						<span>{productName}</span>
						<span className='text-xs text-muted-foreground'>{category}</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'storageLocation',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						โซนจัดเก็บสินค้า
						<ArrowUpDown className='ml-2 size-4' />
					</Button>
				)
			},
		},
		{
			accessorKey: 'entryDate',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						วันที่เข้า
						<ArrowUpDown className='ml-2 size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const date = row.getValue('entryDate') as Date
				return (
					<div className='flex flex-col'>
						<span className='text-sm'>{format(date, 'dd/MM/yyyy', { locale: th })}</span>
						<span className='text-xs text-muted-foreground'>
							{format(date, 'hh:mm', { locale: th })}
						</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'deliveryVehicle',
			header: 'ทะเบียนรถส่งสินค้า',
			cell: ({ row }) => {
				const vehicle = row.getValue('deliveryVehicle') as {
					plateNumber: string
					provinceTh: string
				}
				return (
					<div className='flex flex-col'>
						<span>{vehicle.plateNumber}</span>
						<span className='text-xs text-muted-foreground'>{vehicle.provinceTh}</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'containerNumber',
			header: 'เลขตู้คอนเทนเนอร์',
			cell: ({ row }) => {
				const containerNumber = row.getValue('containerNumber') as string
				return <span className='text-xs text-center'>{containerNumber}</span>
			},
		},
		{
			accessorKey: 'palletCount',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						พาเลท
						<ArrowUpDown className='size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const count = row.getValue('palletCount') as number
				return <p className='text-center '>{count.toLocaleString()}</p>
			},
		},
		{
			accessorKey: 'packageCount',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						แพ็คเกจ
						<ArrowUpDown className='size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const count = row.getValue('packageCount') as number
				return <p className='text-center'>{count.toLocaleString()}</p>
			},
		},
		{
			accessorKey: 'itemCount',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						จำนวนชิ้น
						<ArrowUpDown className='size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const count = row.getValue('itemCount') as number
				return <p className='text-center'>{count.toLocaleString()}</p>
			},
		},
		{
			accessorKey: 'exitDate',
			header: 'วันที่ออก',
			cell: ({ row }) => {
				const date = row.getValue('exitDate') as Date | undefined
				return date ? (
					<div className='flex flex-col'>
						<span className='text-sm'>{format(date, 'dd/MM/yyyy', { locale: th })}</span>
						<span className='text-xs text-muted-foreground'>
							{format(date, 'hh:mm', { locale: th })}
						</span>
					</div>
				) : (
					'-'
				)
			},
		},
		{
			accessorKey: 'pickupVehicle',
			header: 'ทะเบียนรถรับสินค้า',
			cell: ({ row }) => {
				const vehicle = row.getValue('pickupVehicle') as
					| { plateNumber: string; provinceTh: string }
					| undefined
				return vehicle ? (
					<div className='flex flex-col'>
						<span className='text-sm font-medium'>{vehicle.plateNumber}</span>
						<span className='text-xs text-muted-foreground'>{vehicle.provinceTh}</span>
					</div>
				) : (
					'-'
				)
			},
		},
		{
			accessorKey: 'status',
			header: 'สถานะ',
			cell: ({ row }) => {
				const status = row.getValue('status') as keyof typeof statusMap
				const statusInfo = statusMap[status]

				return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
			},
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const item = row.original

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								className='h-8 w-8 p-0'
							>
								<span className='sr-only'>เปิดเมนู</span>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>

							<DropdownMenuSeparator />
							{onEdit && (
								<DropdownMenuItem onClick={() => onEdit(item)}>
									<Pencil className='mr-2 size-4' />
									แก้ไข
								</DropdownMenuItem>
							)}
							{onDelete && (
								<DropdownMenuItem
									onClick={() => onDelete(item)}
									className='text-destructive focus:text-destructive'
								>
									<Trash className='mr-2 size-4 text-destructive' />
									ลบ
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]
}

// For backward compatibility
export const columns = createColumns()
