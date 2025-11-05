'use client'

import { useEffect, useState } from 'react'

import { getProvinces } from '@/actions/warehouse-actions'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface Province {
	id: number
	nameTh: string
	nameEn: string
	geographyId: number
	createdAt?: Date | null
	updatedAt?: Date | null
	deletedAt?: Date | null
}

interface ProvinceSelectProps {
	value?: string
	onChangeAction: (value: string) => void
	onBlur?: () => void
	disabled?: boolean
	placeholder?: string
}

export function ProvinceSelect({
	value,
	onChangeAction,
	onBlur,
	disabled = false,
	placeholder = 'เลือกจังหวัด',
}: ProvinceSelectProps) {
	const [provinces, setProvinces] = useState<Province[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchProvinces = async () => {
			setLoading(true)
			const data = await getProvinces()
			setProvinces(data)
			setLoading(false)
		}

		fetchProvinces()
	}, [])

	return (
		<Select
			value={value}
			onValueChange={onChangeAction}
			disabled={disabled || loading}
		>
			<SelectTrigger onBlur={onBlur}>
				<SelectValue placeholder={loading ? 'กำลังโหลด...' : placeholder} />
			</SelectTrigger>
			<SelectContent>
				{provinces.map((province) => (
					<SelectItem
						key={province.id}
						value={province.id.toString()}
					>
						{province.nameTh}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
