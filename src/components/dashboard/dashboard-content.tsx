import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Package, PackageCheck, TrendingUp, Truck } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { warehouseStatusMap } from '@/constants/warehouse-status'
import { getDashboardData } from '@/actions/dashboard-actions'

export async function DashboardContent() {
	const data = await getDashboardData()

	if (!data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>เกิดข้อผิดพลาด</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-muted-foreground'>ไม่สามารถโหลดข้อมูล Dashboard ได้</p>
				</CardContent>
			</Card>
		)
	}

	const { stats, categoryDistribution, recentActivities } = data
	const topCategories = categoryDistribution.slice(0, 5)

	return (
		<>
			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>สินค้าในคลัง</CardTitle>
						<Package className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.inStockCount.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>
							จากทั้งหมด {stats.totalCount.toLocaleString()} รายการ
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>กำลังจัดส่ง</CardTitle>
						<Truck className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.outForDeliveryCount.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>รายการที่กำลังจัดส่ง</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>ส่งแล้ว</CardTitle>
						<PackageCheck className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.deliveredCount.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>รายการที่ส่งเรียบร้อย</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>รวมชิ้น</CardTitle>
						<TrendingUp className='h-4 w-4 text-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.totalItems.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>จำนวนชิ้นทั้งหมด</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>รวมพาเลท</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.totalPallets.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>จำนวนพาเลททั้งหมด</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>รวมแพ็คเกจ</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.totalPackages.toLocaleString()}</div>
						<p className='text-xs text-muted-foreground'>จำนวนแพ็คเกจทั้งหมด</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>หมวดหมู่</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.uniqueCategories.toLocaleString()}</div>
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
							{recentActivities.map((item) => {
								const statusInfo = warehouseStatusMap[item.status]

								return (
									<div
										key={item.id}
										className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
									>
										<div className='flex items-center gap-4'>
											{item.productImage ? (
												<div className='relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted'>
													<Image
														src={item.productImage}
														alt={item.productName}
														fill
														className='object-cover'
														sizes='56px'
													/>
												</div>
											) : (
												<div className='bg-muted rounded-md p-3 flex items-center justify-center h-14 w-14 shrink-0'>
													<Package className='h-6 w-6 text-muted-foreground' />
												</div>
											)}
											<div>
												<p className='font-medium'>{item.productName}</p>
												<p className='text-sm text-muted-foreground'>
													{item.category?.nameTh || 'ไม่ระบุ'} • {item.storageLocation}
												</p>
												<p className='text-xs font-mono text-muted-foreground'>{item.stockId}</p>
											</div>
										</div>
										<div className='text-right'>
											<Badge variant={statusInfo.variant} className={statusInfo.className}>
												{statusInfo.label}
											</Badge>
											<p className='text-xs text-muted-foreground mt-1'>
												{format(new Date(item.createdAt), 'dd MMM yyyy', { locale: th })}
											</p>
										</div>
									</div>
								)
							})}
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
							{topCategories.length > 0 ? (
								topCategories.map((category, index) => (
									<div
										key={category.categoryId || index}
										className='flex items-center justify-between'
									>
										<div className='flex items-center gap-3'>
											<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
												{index + 1}
											</div>
											<div>
												<span className='font-medium'>{category.categoryName}</span>
												{category.categoryCode && (
													<span className='ml-2 text-xs text-muted-foreground'>
														({category.categoryCode})
													</span>
												)}
											</div>
										</div>
										<div className='text-right'>
											<p className='font-bold'>{category.count.toLocaleString()}</p>
											<p className='text-xs text-muted-foreground'>รายการ</p>
										</div>
									</div>
								))
							) : (
								<p className='text-center text-muted-foreground py-4'>ยังไม่มีข้อมูล</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Summary Stats */}
			<div className='grid gap-4 md:grid-cols-3'></div>
		</>
	)
}
