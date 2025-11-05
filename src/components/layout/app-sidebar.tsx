'use client'

import { Home, Package } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

const menuItems = [
	{
		title: 'หน้าหลัก',
		icon: Home,
		href: '/',
	},
	{
		title: 'คลังสินค้า',
		icon: Package,
		href: '/warehouse',
	},
	// {
	//   title: "รายงาน",
	//   icon: BarChart3,
	//   href: "/reports",
	// },
	// {
	//   title: "เอกสาร",
	//   icon: FileText,
	//   href: "/documents",
	// },
	// {
	//   title: "ตั้งค่า",
	//   icon: Settings,
	//   href: "/settings",
	// },
]

export function AppSidebar() {
	const pathname = usePathname()

	return (
		<Sidebar>
			<SidebarHeader className='border-b px-6 py-4'>
				<div className='flex items-center gap-2'>
					<div className='bg-foreground px-2 py-2 rounded-lg'>
						<Package className='size-4 text-accent' />
					</div>
					<span className='font-bold text-sm'>Warehouse Management</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
									>
										<Link href={item.href}>
											<item.icon className='size-5' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className='border-t px-6 py-4'>
				<div className='text-xs text-muted-foreground'>© 2025 Wakim</div>
			</SidebarFooter>
		</Sidebar>
	)
}
