'use client'

import { ArrowRight, Package, PackageCheck, TrendingUp, Truck } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWarehouse } from '@/contexts/warehouse-context'

export default function Home() {
	const { data } = useWarehouse()

	const totalPallets = data.reduce((sum, item) => sum + item.palletCount, 0)
	const totalPackages = data.reduce((sum, item) => sum + item.packageCount, 0)
	const totalItems = data.reduce((sum, item) => sum + item.itemCount, 0)
	const inStockCount = data.filter((item) => item.status === 'in_stock').length
	const outForDeliveryCount = data.filter((item) => item.status === 'out_for_delivery').length
	const deliveredCount = data.filter((item) => item.status === 'delivered').length

	// Recent activities (last 5 items sorted by entry date)
	const recentActivities = [...data]
		.sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime())
		.slice(0, 5)

	// Category distribution
	const categoryStats = data.reduce((acc, item) => {
		acc[item.category] = (acc[item.category] || 0) + 1
		return acc
	}, {} as Record<string, number>)

	const topCategories = Object.entries(categoryStats)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)

	return (
		<div className='bg-background'>
			<div className='container mx-auto py-6 px-4'>
				<div className='flex flex-col gap-8'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-4xl font-bold tracking-tight'>ภาพรวมระบบคลังสินค้า</h1>
							<p className='text-muted-foreground mt-2'>สรุปข้อมูลและสถานะคลังสินค้าโดยรวม</p>
						</div>
						<Link href='/warehouse'>
							<Button size='lg'>
								<Package className='mr-2 h-5 w-5' />
								จัดการสินค้า
								<ArrowRight className='ml-2 h-5 w-5' />
							</Button>
						</Link>
					</div>

					{/* Stats Cards */}
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>สินค้าในคลัง</CardTitle>
								<Package className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{inStockCount.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>
									จากทั้งหมด {data.length.toLocaleString()} รายการ
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>กำลังจัดส่ง</CardTitle>
								<Truck className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{outForDeliveryCount.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>รายการที่กำลังจัดส่ง</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>ส่งแล้ว</CardTitle>
								<PackageCheck className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{deliveredCount.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>รายการที่ส่งเรียบร้อย</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>รวมชิ้น</CardTitle>
								<TrendingUp className='h-4 w-4 text-green-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{totalItems.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>จำนวนชิ้นทั้งหมด</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>รวมพาเลท</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{totalPallets.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>จำนวนพาเลททั้งหมด</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>รวมแพ็คเกจ</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{totalPackages.toLocaleString()}</div>
								<p className='text-xs text-muted-foreground'>จำนวนแพ็คเกจทั้งหมด</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>หมวดหมู่</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{Object.keys(categoryStats).length}</div>
								<p className='text-xs text-muted-foreground'>หมวดหมู่สินค้าทั้งหมด</p>
							</CardContent>
						</Card>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
						{/* Recent Activities */}
						<Card className='col-span-4'>
							<CardHeader>
								<CardTitle>กิจกรรมล่าสุด</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{recentActivities.map((item) => (
										<div
											key={item.id}
											className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
										>
											<div className='flex items-center gap-4'>
												<div className='bg-muted rounded-md p-2'>
													<Package className='h-5 w-5' />
												</div>
												<div>
													<p className='font-medium'>{item.productName}</p>
													<p className='text-sm text-muted-foreground'>
														{item.category} • {item.storageLocation}
													</p>
												</div>
											</div>
											<div className='text-right'>
												<Badge
													variant={
														item.status === 'in_stock'
															? 'default'
															: item.status === 'out_for_delivery'
															? 'secondary'
															: 'outline'
													}
												>
													{item.status === 'in_stock'
														? 'ในคลัง'
														: item.status === 'out_for_delivery'
														? 'กำลังจัดส่ง'
														: 'ส่งแล้ว'}
												</Badge>
												<p className='text-xs text-muted-foreground mt-1'>
													{item.entryDate.toLocaleDateString('th-TH')}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Top Categories */}
						<Card className='col-span-3'>
							<CardHeader>
								<CardTitle>หมวดหมู่ยอดนิยม</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{topCategories.map(([category, count], index) => (
										<div
											key={category}
											className='flex items-center justify-between'
										>
											<div className='flex items-center gap-3'>
												<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
													{index + 1}
												</div>
												<span className='font-medium'>{category}</span>
											</div>
											<div className='text-right'>
												<p className='font-bold'>{count}</p>
												<p className='text-xs text-muted-foreground'>รายการ</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Summary Stats */}
					<div className='grid gap-4 md:grid-cols-3'></div>
				</div>
			</div>
		</div>
	)
}
