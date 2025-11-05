'use client'

import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
	value?: string | File | null
	onChange: (value: File | null) => void
	onBlur?: () => void
	disabled?: boolean
	accept?: string
	maxSizeMB?: number
}

export function ImageUpload({
	value,
	onChange,
	onBlur,
	disabled = false,
	accept = 'image/*',
	maxSizeMB = 2,
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
		// Initialize preview URL from value
		if (typeof value === 'string') {
			return value
		}
		return null
	})

	const handleFileChange = useCallback(
		(file: File | null) => {
			setError(null)

			if (!file) {
				onChange(null)
				setPreviewUrl(null)
				return
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				const errorMsg = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
				setError(errorMsg)
				toast.error(errorMsg)
				return
			}

			// Validate file size
			const maxSize = maxSizeMB * 1024 * 1024
			if (file.size > maxSize) {
				const errorMsg = `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB} MB`
				setError(errorMsg)
				toast.error(errorMsg)
				return
			} // Create preview URL
			const objectUrl = URL.createObjectURL(file)
			setPreviewUrl(objectUrl)

			// Return File object instead of base64
			onChange(file)
		},
		[onChange, maxSizeMB],
	)

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault()
			setIsDragging(false)

			if (disabled) return

			const file = e.dataTransfer.files[0]
			if (file) {
				handleFileChange(file)
			}
		},
		[disabled, handleFileChange],
	)

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}, [])

	const handleClick = useCallback(() => {
		if (disabled) return
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = accept
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (file) {
				handleFileChange(file)
			}
		}
		input.click()
	}, [disabled, accept, handleFileChange])

	const handleRemove = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onChange(null)
			setPreviewUrl(null)
			setError(null)
		},
		[onChange],
	)

	// Get display URL (either preview URL or existing URL string)
	const displayUrl = previewUrl || (typeof value === 'string' ? value : null)

	return (
		<div className='space-y-2'>
			<div
				className={cn(
					'relative rounded-lg border-2 border-dashed transition-colors',
					isDragging && 'border-primary bg-primary/5',
					!isDragging && !displayUrl && 'border-border hover:border-primary/50',
					disabled && 'cursor-not-allowed opacity-50',
					!disabled && 'cursor-pointer',
					error && 'border-destructive',
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={handleClick}
				onBlur={onBlur}
			>
				{displayUrl ? (
					<div className='relative aspect-video w-full overflow-hidden rounded-md'>
						<Image
							src={displayUrl}
							alt='Preview'
							fill
							className='object-cover'
							sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						/>
						{!disabled && (
							<Button
								type='button'
								variant='destructive'
								size='icon'
								className='absolute top-2 right-2 h-8 w-8 rounded-full'
								onClick={handleRemove}
							>
								<X className='h-4 w-4' />
							</Button>
						)}
					</div>
				) : (
					<div className='flex flex-col items-center justify-center py-10 px-4'>
						<Upload className='h-10 w-10 text-muted-foreground mb-3' />
						<p className='text-sm font-medium text-foreground mb-1'>
							คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่
						</p>
						<p className='text-xs text-muted-foreground'>
							PNG, JPG, GIF, WEBP (สูงสุด {maxSizeMB}MB)
						</p>
					</div>
				)}
			</div>

			{error && <p className='text-sm text-destructive'>{error}</p>}
		</div>
	)
}
