'use client'

import { Bell, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Navbar() {
	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background'>
			<div className='flex h-18 items-center gap-4 px-4'>
				<SidebarTrigger />

				<div className='flex-1' />

				<Button
					variant='ghost'
					size='icon'
					className='relative'
				>
					<Bell className='size-5' />
					<span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive' />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							className='relative h-9 w-9 rounded-full'
						>
							<Avatar className='h-9 w-9'>
								<AvatarFallback>
									<User className='h-4 w-4' />
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-56'
						align='end'
						forceMount
					>
						<DropdownMenuLabel className='font-normal'>
							<div className='flex flex-col space-y-1'>
								<p className='text-sm font-medium leading-none'>ผู้ดูแลระบบ</p>
								<p className='text-xs leading-none text-muted-foreground'>admin@example.com</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>โปรไฟล์</DropdownMenuItem>
						<DropdownMenuItem>การตั้งค่า</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>ออกจากระบบ</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	)
}
