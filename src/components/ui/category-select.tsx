'use client'

import { useEffect, useState } from 'react'

import { getCategories } from '@/actions/warehouse-actions'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface Category {
	id: number
	code: string
	nameTh: string
	nameEn: string
	description?: string | null
	createdAt?: Date | null
	updatedAt?: Date | null
}

interface CategorySelectProps {
	value?: string
	onChangeAction: (value: string) => void
	onBlur?: () => void
	disabled?: boolean
	placeholder?: string
}

export function CategorySelect({
	value,
	onChangeAction,
	onBlur,
	disabled = false,
	placeholder = 'เลือกหมวดหมู่',
}: CategorySelectProps) {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchCategories = async () => {
			setLoading(true)
			const data = await getCategories()
			setCategories(data)
			setLoading(false)
		}

		fetchCategories()
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
				{categories.map((category) => (
					<SelectItem
						key={category.id}
						value={category.id.toString()}
					>
						{category.nameTh}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
