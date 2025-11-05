'use client'

import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useState } from 'react'

export function ImageUpload({
	onUploadSuccess,
}: {
	onUploadSuccess?: (url: string, path: string) => void
}) {
	const [uploading, setUploading] = useState(false)
	const [preview, setPreview] = useState<string | null>(null)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Show preview
		const reader = new FileReader()
		reader.onloadend = () => {
			setPreview(reader.result as string)
		}
		reader.readAsDataURL(file)

		// Upload to storage
		setUploading(true)
		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				throw new Error('Upload failed')
			}

			const { url, path } = await response.json()
			onUploadSuccess?.(url, path)
		} catch (error) {
			console.error('Upload error:', error)
			alert('Failed to upload image')
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className='space-y-4'>
			<Input
				type='file'
				accept='image/*'
				onChange={handleFileChange}
				disabled={uploading}
			/>
			{preview && (
				<div className='relative w-full h-48'>
					<Image
						src={preview}
						alt='Preview'
						fill
						className='object-cover rounded-md'
					/>
				</div>
			)}
			{uploading && <p className='text-sm text-muted-foreground'>Uploading...</p>}
		</div>
	)
}
