import QRCode from 'qrcode'
import { uploadFile } from './storage'

/**
 * Generate QR code image และ upload ไปยัง storage
 * @param data ข้อมูลที่จะเข้ารหัสใน QR code (เช่น ID หรือ JSON)
 * @param filename ชื่อไฟล์ QR code
 * @returns URL ของ QR code image
 */
export async function generateAndUploadQRCode(data: string, filename: string): Promise<string> {
	try {
		// Generate QR code เป็น buffer
		const qrBuffer = await QRCode.toBuffer(data, {
			type: 'png',
			width: 512,
			margin: 2,
			errorCorrectionLevel: 'H',
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		})

		// สร้าง File object จาก buffer
		const uint8Array = new Uint8Array(qrBuffer)
		const blob = new Blob([uint8Array], { type: 'image/png' })
		const file = new File([blob], filename, { type: 'image/png' })

		// Upload ไปยัง storage
		const path = `qrcodes/${filename}`
		const url = await uploadFile(file, path)

		return url
	} catch (error) {
		console.error('Error generating QR code:', error)
		throw new Error('Failed to generate QR code')
	}
}

/**
 * Generate QR code data สำหรับ warehouse item
 * @param stockId SKU ของสินค้า (เช่น BKK-ELEC-20250115-0001)
 * @returns URL สำหรับเข้าถึงหน้ารายละเอียดสินค้า (ใช้ stockId แทน UUID)
 */
export function generateQRCodeData(stockId: string): string {
	// สร้าง URL สำหรับเข้าถึงหน้ารายละเอียดด้วย SKU
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	const itemUrl = `${baseUrl}/warehouse/${stockId}`

	return itemUrl
}
