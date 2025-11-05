'use client'

import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
	value?: Date
	onChange: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = 'เลือกวันที่และเวลา',
	disabled = false,
	className,
}: DateTimePickerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [time, setTime] = useState(value ? format(value, 'HH:mm') : format(new Date(), 'HH:mm'))

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (!selectedDate) {
			onChange(undefined)
			return
		}

		// Get the local date components to avoid timezone issues
		const year = selectedDate.getFullYear()
		const month = selectedDate.getMonth()
		const day = selectedDate.getDate()

		// Parse time and create new date with local timezone
		const [hours, minutes] = time.split(':')
		const newDate = new Date(year, month, day, parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

		onChange(newDate)
	}

	const handleTimeChange = (newTime: string) => {
		setTime(newTime)

		if (value) {
			// Get the local date components
			const year = value.getFullYear()
			const month = value.getMonth()
			const day = value.getDate()

			// Parse new time and create date with local timezone
			const [hours, minutes] = newTime.split(':')
			const newDate = new Date(year, month, day, parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

			onChange(newDate)
		}
	}

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					disabled={disabled}
					className={cn(
						'w-full justify-start text-left font-normal',
						!value && 'text-muted-foreground',
						className,
					)}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{value ? format(value, 'dd/MM/yyyy HH:mm', { locale: th }) : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={value}
					onSelect={handleDateSelect}
					initialFocus
				/>
				<div className='border-t p-3'>
					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium'>เวลา:</span>
						<Input
							type='time'
							value={time}
							onChange={(e) => handleTimeChange(e.target.value)}
							className='w-auto'
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}
