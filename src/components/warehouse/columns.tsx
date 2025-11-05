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
import { warehouseStatusMap } from '@/constants/warehouse-status'
import { WarehouseItem } from '@/types/warehouse'

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
			accessorKey: 'stockId',
			header: ({ column }) => {
				return (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						รหัสสินค้า (SKU)
						<ArrowUpDown className='ml-2 size-4' />
					</Button>
				)
			},
			cell: ({ row }) => {
				const stockId = row.getValue('stockId') as string
				return <span className='font-mono text-[11px]'>{stockId}</span>
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
						<span className='text-xs text-muted-foreground'>{category?.nameTh || 'ไม่ระบุ'}</span>
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
						<span className='text-xs'>{format(date, 'dd/MM/yyyy', { locale: th })}</span>
						<span className='text-xs text-muted-foreground'>
							{format(date, 'HH:mm', { locale: th })}
						</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'deliveryVehicle',
			header: 'ทะเบียนรถส่งสินค้า',
			cell: ({ row }) => {
				const vehicle = row.original.deliveryVehicle
				if (!vehicle) return '-'
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
						<span className='text-xs'>{format(date, 'dd/MM/yyyy', { locale: th })}</span>
						<span className='text-xs text-muted-foreground'>
							{format(date, 'HH:mm', { locale: th })}
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
				const vehicle = row.original.pickupVehicle
				if (!vehicle) return '-'
				return (
					<div className='flex flex-col'>
						<span className='text-sm font-normal'>{vehicle.plateNumber}</span>
						<span className='text-xs text-muted-foreground'>{vehicle.provinceTh}</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'status',
			header: 'สถานะ',
			cell: ({ row }) => {
				const status = row.getValue('status') as WarehouseItem['status']
				const statusInfo = warehouseStatusMap[status]

				return (
					<Badge
						variant={statusInfo.variant}
						className={statusInfo.className}
					>
						{statusInfo.label}
					</Badge>
				)
			},
		},
		{
			accessorKey: 'qrCodeImage',
			header: 'QR Code',
			cell: ({ row }) => {
				const qrCodeUrl = row.getValue('qrCodeImage') as string | null
				const stockId = row.original.stockId

				return (
					<div className='flex items-center justify-center'>
						{qrCodeUrl ? (
							<Image
								src={qrCodeUrl}
								alt={`QR Code ${stockId}`}
								width={60}
								height={60}
								className='rounded'
							/>
						) : (
							<div className='w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center'>
								<span className='text-xs text-muted-foreground text-center'>ไม่มี QR</span>
							</div>
						)}
					</div>
				)
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
