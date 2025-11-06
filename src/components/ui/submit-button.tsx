'use client'

import { LoaderCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'

interface SubmitButtonProps {
	children: React.ReactNode
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
}

export function SubmitButton({
	children,
	variant = 'default',
	size = 'lg',
	className,
}: SubmitButtonProps) {
	const { pending } = useFormStatus()

	return (
		<Button
			type="submit"
			disabled={pending}
			variant={variant}
			size={size}
			className={className}
		>
			{pending ? (
				<div className="flex items-center gap-2">
					<LoaderCircle className="size-4 animate-spin" />
					<span>กำลังบันทึก...</span>
				</div>
			) : (
				children
			)}
		</Button>
	)
}
