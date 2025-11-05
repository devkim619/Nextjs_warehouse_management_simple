import { AppSidebar } from '@/components/layout/app-sidebar'
import { Navbar } from '@/components/layout/navbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
	variable: '--font-noto-sans-thai',
	subsets: ['thai', 'latin'],
	weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
	title: 'ระบบจัดการคลังสินค้า',
	description: 'ระบบจัดการข้อมูลคลังสินค้า',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='th'>
			<body className={`${notoSansThai.className} antialiased`}>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset className='flex flex-col w-full overflow-x-auto'>
						<Navbar />
						<main className='flex-1 w-full overflow-x-auto'>{children}</main>
					</SidebarInset>
				</SidebarProvider>
				<Toaster richColors />
			</body>
		</html>
	)
}
