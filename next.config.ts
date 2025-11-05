// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				// ถ้าจะเผื่อ path ทั้งหมด ก็กางได้เลย
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.supabase.co', // หรือ '**.supabase.co' ก็ได้ใน Next รุ่นใหม่
				pathname: '/storage/v1/object/public/**',
			},
		],
	},
}

export default nextConfig
