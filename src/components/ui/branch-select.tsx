'use client'

import { useEffect, useState } from 'react'

import { getBranches } from '@/actions/warehouse-actions'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface Branch {
	id: number
	code: string
	nameTh: string
	nameEn: string
	location?: string | null
	isActive?: boolean
	createdAt?: Date | null
	updatedAt?: Date | null
}

interface BranchSelectProps {
	value?: string
	onChangeAction: (value: string) => void
	onBlur?: () => void
	disabled?: boolean
	placeholder?: string
}

export function BranchSelect({
	value,
	onChangeAction,
	onBlur,
	disabled = false,
	placeholder = 'เลือกสาขา',
}: BranchSelectProps) {
	const [branches, setBranches] = useState<Branch[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchBranches = async () => {
			setLoading(true)
			const data = await getBranches()
			setBranches(data)
			setLoading(false)
		}

		fetchBranches()
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
				{branches.map((branch) => (
					<SelectItem
						key={branch.id}
						value={branch.id.toString()}
					>
						{branch.nameTh} ({branch.code})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
