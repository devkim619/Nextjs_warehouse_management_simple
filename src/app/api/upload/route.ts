import { deleteFile, uploadFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
	try {
		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		// Generate unique filename
		const timestamp = Date.now()
		const fileName = `${timestamp}-${file.name}`
		const path = `warehouses/${fileName}`

		// Upload to Supabase Storage
		const url = await uploadFile(file, path)

		return NextResponse.json({ url, path }, { status: 201 })
	} catch (error) {
		console.error('Error uploading file:', error)
		return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
	}
}

export const DELETE = async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url)
		const path = searchParams.get('path')

		if (!path) {
			return NextResponse.json({ error: 'No path provided' }, { status: 400 })
		}

		await deleteFile(path)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting file:', error)
		return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
	}
}
