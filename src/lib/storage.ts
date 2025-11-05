import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

if (!process.env.SUPABASE_S3_ENDPOINT) {
	throw new Error('SUPABASE_S3_ENDPOINT is not set')
}

if (!process.env.S3_ACCESS_KEY) {
	throw new Error('S3_ACCESS_KEY is not set')
}

if (!process.env.S3_SECRET_KEY) {
	throw new Error('S3_SECRET_KEY is not set')
}

if (!process.env.BUGKETS) {
	throw new Error('BUGKETS is not set')
}

// Supabase Storage configuration
const s3Endpoint = process.env.SUPABASE_S3_ENDPOINT
const bucketName = process.env.BUGKETS
const region = process.env.SUPABASE_REGION || 'ap-southeast-1'

// Configure S3 Client for Supabase Storage
export const s3Client = new S3Client({
	forcePathStyle: true, // Required for Supabase Storage S3 compatibility
	region,
	endpoint: s3Endpoint,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_KEY,
	},
})

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer())
	let uploadBuffer = buffer
	let contentType = file.type

	if (file.type && file.type.startsWith('image/')) {
		try {
			const { default: sharp } = await import('sharp')
			const maxDimension = 1600
			const metadata = await sharp(buffer, { failOnError: false }).metadata()
			let pipeline = sharp(buffer, { failOnError: false }).rotate()

			if (
				(metadata.width && metadata.width > maxDimension) ||
				(metadata.height && metadata.height > maxDimension)
			) {
				pipeline = pipeline.resize({
					width: maxDimension,
					height: maxDimension,
					fit: 'inside',
					withoutEnlargement: true,
				})
			}

			let optimizedContentType = contentType

			if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
				pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true })
				optimizedContentType = 'image/jpeg'
			} else if (file.type === 'image/png') {
				pipeline = pipeline.png({ compressionLevel: 9, palette: true })
				optimizedContentType = 'image/png'
			} else if (file.type === 'image/webp') {
				pipeline = pipeline.webp({ quality: 80 })
				optimizedContentType = 'image/webp'
			}

			const optimizedBuffer = await pipeline.toBuffer()

			if (optimizedBuffer.length > 0 && optimizedBuffer.length < buffer.length) {
				uploadBuffer = optimizedBuffer
				contentType = optimizedContentType
			}
		} catch (error) {
			console.warn('[storage] image optimization skipped', error)
		}
	}

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: path,
		Body: uploadBuffer,
		ContentType: contentType,
		// Note: Supabase Storage typically manages permissions via bucket policy.
		// Avoid relying on ACL here; leave permission control to Supabase settings.
	})

	try {
		const res = await s3Client.send(command)
		const url = getPublicUrl(path)
		// Helpful debug logs to diagnose "Invalid Storage request" issues
		console.debug('[storage] upload successful', { bucket: bucketName, path, url, res })
		return url
	} catch (err) {
		console.error('[storage] upload failed', { bucket: bucketName, path, error: err })
		throw err
	}
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: path,
	})

	await s3Client.send(command)
}

/**
 * Get a signed URL for a private file
 */
export async function getSignedFileUrl(path: string, expiresIn: number = 3600): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: path,
	})

	return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(path: string): string {
	// Supabase public URL format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
	const supabaseUrl =
		process.env.SUPABASE_URL ||
		process.env.SUPABASE_S3_ENDPOINT!.replace('.storage.supabase.co/storage/v1/s3', '.supabase.co')
	return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`
}
