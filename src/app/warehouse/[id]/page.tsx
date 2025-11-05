'use client'

import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ArrowLeft, Calendar, Container, Layers, MapPin, Package, Truck } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getWarehouseItemById } from '@/actions/warehouse-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { warehouseStatusMap } from '@/constants/warehouse-status'
import { VehicleInfo, WarehouseStatus } from '@/types/warehouse'

interface WarehouseItemDetail {
	id: string
	stockId: string
	productName: string
	category: {
		id: number
		code: string | null
		nameTh: string | null
		nameEn: string | null
	} | null
	branch: {
		id: number
		code: string | null
		nameTh: string | null
		nameEn: string | null
		location: string | null
	} | null
	productImage?: string | null
	storageLocation: string
	palletCount: number
	packageCount: number
	itemCount: number
	entryDate: Date | string | null
	deliveryVehicle: VehicleInfo | null
	containerNumber: string
	exitDate?: Date | string | null
	pickupVehicle?: VehicleInfo | null
	status: WarehouseStatus
	qrCodeImage?: string | null
	createdAt: Date | string | null
	updatedAt: Date | string | null
}

export default function WarehouseItemDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [item, setItem] = useState<WarehouseItemDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchItem = async () => {
			try {
				setLoading(true)
				const data = await getWarehouseItemById(params.id as string)

				if (!data) {
					throw new Error('ไม่พบข้อมูลสินค้า')
				}

				setItem(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
			} finally {
				setLoading(false)
			}
		}

		if (params.id) {
			fetchItem()
		}
	}, [params.id])

	if (loading) {
		return (
			<div className='container mx-auto p-6 space-y-6'>
				<Skeleton className='h-10 w-48' />
				<Skeleton className='h-[400px] w-full' />
				<Skeleton className='h-[200px] w-full' />
			</div>
		)
	}

	if (error || !item) {
		return (
			<div className='container mx-auto p-6'>
				<Card>
					<CardHeader>
						<CardTitle>ไม่พบข้อมูล</CardTitle>
						<CardDescription>{error || 'ไม่พบรายการสินค้าที่ต้องการ'}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => router.push('/warehouse')}
							variant='outline'
						>
							<ArrowLeft className='mr-2 h-4 w-4' />
							กลับไปหน้ารายการ
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	const statusInfo = warehouseStatusMap[item.status]

	return (
		<div className='container mx-auto p-6 space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						onClick={() => router.push('/warehouse')}
						variant='outline'
						size='icon'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>{item.productName}</h1>
						<div className='flex items-center gap-2 text-muted-foreground'>
							<span>{item.category?.nameTh || 'ไม่ระบุหมวดหมู่'}</span>
							{item.branch && (
								<>
									<span>•</span>
									<span>{item.branch.nameTh}</span>
								</>
							)}
						</div>
						<p className='text-sm font-mono text-muted-foreground mt-1'>SKU: {item.stockId}</p>
					</div>
				</div>

				<div className='flex items-center gap-2 text-right'>
					<span className='text-lg text-muted-foreground'>สถานะ:</span>
					<Badge
						variant={statusInfo.variant}
						className={`text-lg px-4 py-2 ${statusInfo.className}`}
					>
						{statusInfo.label}
					</Badge>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* รูปภาพสินค้า */}
				<Card>
					<CardHeader>
						<CardTitle>รูปสินค้า</CardTitle>
					</CardHeader>
					<CardContent className='flex justify-center'>
						{item.productImage ? (
							<Image
								src={item.productImage}
								alt={item.productName}
								width={400}
								height={400}
								className='rounded-lg object-cover'
							/>
						) : (
							<div className='w-[400px] h-[400px] bg-muted rounded-lg flex items-center justify-center'>
								<Package className='h-20 w-20 text-muted-foreground' />
							</div>
						)}
					</CardContent>
				</Card>

				{/* QR Code */}
				{item.qrCodeImage && (
					<Card>
						<CardHeader>
							<CardTitle>QR Code</CardTitle>
						</CardHeader>
						<CardContent className='flex justify-center'>
							<Image
								src={item.qrCodeImage}
								alt='QR Code'
								width={400}
								height={400}
								className='rounded-lg'
							/>
						</CardContent>
					</Card>
				)}
			</div>

			{/* ข้อมูลการจัดเก็บ */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<MapPin className='h-5 w-5' />
						ข้อมูลการจัดเก็บ
					</CardTitle>
				</CardHeader>
				<CardContent className='grid gap-4 md:grid-cols-2'>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>ที่จัดเก็บ</p>
						<p className='text-lg font-semibold'>{item.storageLocation}</p>
					</div>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>จำนวนพาเลท</p>
						<p className='text-lg font-semibold'>{item.palletCount.toLocaleString()} พาเลท</p>
					</div>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>จำนวนแพ็คเกจ</p>
						<p className='text-lg font-semibold'>{item.packageCount.toLocaleString()} แพ็คเกจ</p>
					</div>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>จำนวนชิ้น</p>
						<p className='text-lg font-semibold'>{item.itemCount.toLocaleString()} ชิ้น</p>
					</div>
				</CardContent>
			</Card>

			{/* ข้อมูลการขนส่ง */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Truck className='h-5 w-5' />
						ข้อมูลการขนส่ง
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{/* วันที่เข้า */}
					{item.entryDate && (
						<div>
							<div className='flex items-center gap-2 mb-2'>
								<Calendar className='h-4 w-4 text-muted-foreground' />
								<p className='text-sm font-medium text-muted-foreground'>วันที่เข้า</p>
							</div>
							<p className='text-lg'>
								{format(new Date(item.entryDate), 'dd/MM/yyyy HH:mm', { locale: th })}
							</p>
						</div>
					)}

					<Separator />

					{/* รถส่ง */}
					{item.deliveryVehicle && (
						<div>
							<p className='text-sm font-medium text-muted-foreground mb-2'>รถมาส่งสินค้า</p>
							<div className='flex items-center gap-2'>
								<Truck className='h-5 w-5' />
								<div>
									<p className='font-semibold'>{item.deliveryVehicle.plateNumber}</p>
									<p className='text-sm text-muted-foreground'>{item.deliveryVehicle.provinceTh}</p>
								</div>
							</div>
						</div>
					)}

					<Separator />

					{/* เลขตู้ */}
					<div>
						<div className='flex items-center gap-2 mb-2'>
							<Container className='h-4 w-4 text-muted-foreground' />
							<p className='text-sm font-medium text-muted-foreground'>หมายเลขตู้คอนเทนเนอร์</p>
						</div>
						<p className='text-lg font-mono'>{item.containerNumber}</p>
					</div>

					{item.exitDate && (
						<>
							<Separator />
							{/* วันที่ออก */}
							<div>
								<div className='flex items-center gap-2 mb-2'>
									<Calendar className='h-4 w-4 text-muted-foreground' />
									<p className='text-sm font-medium text-muted-foreground'>วันที่ออก</p>
								</div>
								<p className='text-lg'>
									{format(new Date(item.exitDate), 'dd/MM/yyyy HH:mm', { locale: th })}
								</p>
							</div>
						</>
					)}

					{item.pickupVehicle && (
						<>
							<Separator />
							{/* รถรับ */}
							<div>
								<p className='text-sm font-medium text-muted-foreground mb-2'>รถมารับสินค้า</p>
								<div className='flex items-center gap-2'>
									<Truck className='h-5 w-5' />
									<div>
										<p className='font-semibold'>{item.pickupVehicle.plateNumber}</p>
										<p className='text-sm text-muted-foreground'>{item.pickupVehicle.provinceTh}</p>
									</div>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* ข้อมูลระบบ */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Layers className='h-5 w-5' />
						ข้อมูลระบบ
					</CardTitle>
				</CardHeader>
				<CardContent className='grid gap-4 md:grid-cols-2'>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>SKU (Stock Keeping Unit)</p>
						<p className='text-lg font-mono font-semibold'>{item.stockId}</p>
					</div>
					<div>
						<p className='text-sm font-medium text-muted-foreground'>รหัสสินค้า (UUID)</p>
						<p className='text-sm font-mono text-muted-foreground'>{item.id}</p>
					</div>
					{item.branch && (
						<div>
							<p className='text-sm font-medium text-muted-foreground'>สาขา</p>
							<p className='text-lg'>
								{item.branch.nameTh} ({item.branch.code})
							</p>
							{item.branch.location && (
								<p className='text-sm text-muted-foreground'>{item.branch.location}</p>
							)}
						</div>
					)}
					{item.category && (
						<div>
							<p className='text-sm font-medium text-muted-foreground'>หมวดหมู่</p>
							<p className='text-lg'>
								{item.category.nameTh} ({item.category.code})
							</p>
						</div>
					)}
					{item.createdAt && (
						<div>
							<p className='text-sm font-medium text-muted-foreground'>สร้างเมื่อ</p>
							<p className='text-lg'>
								{format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
							</p>
						</div>
					)}
					{item.updatedAt && (
						<div>
							<p className='text-sm font-medium text-muted-foreground'>อัปเดตล่าสุด</p>
							<p className='text-lg'>
								{format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm', { locale: th })}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
