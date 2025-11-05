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
		],
	},
}

export default nextConfig
