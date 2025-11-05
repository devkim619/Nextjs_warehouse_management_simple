'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PRODUCT_CATEGORIES, WarehouseItem } from '@/types/warehouse'

const warehouseFormSchema = z.object({
	productName: z.string().min(1, { message: 'กรุณากรอกชื่อสินค้า' }),
	category: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' }),
	storageLocation: z.string().min(1, { message: 'กรุณากรอกที่จัดเก็บ' }),
	entryDate: z.date({ required_error: 'กรุณาเลือกวันที่เข้า' }),
	deliveryVehiclePlate: z.string().min(1, { message: 'กรุณากรอกทะเบียนรถส่ง' }),
	containerNumber: z.string().min(1, { message: 'กรุณากรอกหมายเลขตู้คอนเทนเนอร์' }),
	productImage: z.string().optional(),
	palletCount: z.coerce.number().min(1, { message: 'จำนวนพาเลทต้องมากกว่า 0' }),
	packageCount: z.coerce.number().min(1, { message: 'จำนวนแพ็คเกจต้องมากกว่า 0' }),
	itemCount: z.coerce.number().min(1, { message: 'จำนวนชิ้นต้องมากกว่า 0' }),
	exitDate: z.date().optional(),
	pickupVehiclePlate: z.string().optional(),
	status: z.enum(['in_stock', 'out_for_delivery', 'delivered']),
})

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>

interface WarehouseFormProps {
	defaultValues?: Partial<WarehouseItem>
	onSubmit: (data: WarehouseFormValues) => void
	onCancel?: () => void
}

export function WarehouseForm({ defaultValues, onSubmit, onCancel }: WarehouseFormProps) {
	const form = useForm<WarehouseFormValues>({
		resolver: zodResolver(warehouseFormSchema),
		defaultValues: {
			productName: defaultValues?.productName || '',
			category: defaultValues?.category || '',
			storageLocation: defaultValues?.storageLocation || '',
			entryDate: defaultValues?.entryDate || new Date(),
			deliveryVehiclePlate: defaultValues?.deliveryVehiclePlate || '',
			containerNumber: defaultValues?.containerNumber || '',
			productImage: defaultValues?.productImage || '',
			palletCount: defaultValues?.palletCount || 1,
			packageCount: defaultValues?.packageCount || 1,
			itemCount: defaultValues?.itemCount || 1,
			exitDate: defaultValues?.exitDate,
			pickupVehiclePlate: defaultValues?.pickupVehiclePlate || '',
			status: defaultValues?.status || 'in_stock',
		},
	})

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className='space-y-6'
		>
			<FieldGroup>
				{/* ชื่อสินค้า */}
				<Controller
					control={form.control}
					name='productName'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>ชื่อสินค้า</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='กรอกชื่อสินค้า'
							/>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* หมวดหมู่ */}
				<Controller
					control={form.control}
					name='category'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>หมวดหมู่สินค้า</FieldLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<SelectTrigger>
									<SelectValue placeholder='เลือกหมวดหมู่' />
								</SelectTrigger>
								<SelectContent>
									{PRODUCT_CATEGORIES.map((cat) => (
										<SelectItem
											key={cat}
											value={cat}
										>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* ที่จัดเก็บ */}
				<Controller
					control={form.control}
					name='storageLocation'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>ที่จัดเก็บ</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='เช่น A-01-01'
							/>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* วันที่เข้า */}
				<Controller
					control={form.control}
					name='entryDate'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>วันที่เข้า</FieldLabel>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!field.value && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{field.value ? format(field.value, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0'>
									<Calendar
										mode='single'
										selected={field.value}
										onSelect={field.onChange}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* ทะเบียนรถส่ง */}
				<Controller
					control={form.control}
					name='deliveryVehiclePlate'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>ทะเบียนรถส่ง</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='เช่น กข-1234 กทม'
							/>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* หมายเลขตู้คอนเทนเนอร์ */}
				<Controller
					control={form.control}
					name='containerNumber'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>หมายเลขตู้คอนเทนเนอร์</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='เช่น MSCU8234567'
							/>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* URL รูปสินค้า */}
				<Controller
					control={form.control}
					name='productImage'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>URL รูปสินค้า</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='https://example.com/image.jpg'
							/>
							<FieldDescription>ใส่ URL ของรูปสินค้า หรือเว้นว่างไว้</FieldDescription>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* จำนวนพาเลท, แพ็คเกจ, ชิ้น */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<Controller
						control={form.control}
						name='palletCount'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>จำนวนพาเลท</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type='number'
									min='1'
									placeholder='0'
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name='packageCount'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>จำนวนแพ็คเกจ</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type='number'
									min='1'
									placeholder='0'
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name='itemCount'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>จำนวนชิ้น</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type='number'
									min='1'
									placeholder='0'
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>
				</div>

				{/* วันที่ออก */}
				<Controller
					control={form.control}
					name='exitDate'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>วันที่ออก</FieldLabel>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!field.value && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{field.value ? (
											format(field.value, 'dd/MM/yyyy')
										) : (
											<span>เลือกวันที่ (ถ้ามี)</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0'>
									<Calendar
										mode='single'
										selected={field.value}
										onSelect={field.onChange}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FieldDescription>เลือกวันที่ออกจากคลัง (ถ้ามีการจัดส่ง)</FieldDescription>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* ทะเบียนรถรับ */}
				<Controller
					control={form.control}
					name='pickupVehiclePlate'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>ทะเบียนรถรับ</FieldLabel>
							<Input
								{...field}
								id={field.name}
								placeholder='เช่น คง-5678 กทม (ถ้ามี)'
							/>
							<FieldDescription>ระบุทะเบียนรถที่มารับสินค้า (ถ้ามีการจัดส่ง)</FieldDescription>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* สถานะ */}
				<Controller
					control={form.control}
					name='status'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>สถานะ</FieldLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<SelectTrigger>
									<SelectValue placeholder='เลือกสถานะ' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='in_stock'>ในคลัง</SelectItem>
									<SelectItem value='out_for_delivery'>กำลังจัดส่ง</SelectItem>
									<SelectItem value='delivered'>ส่งแล้ว</SelectItem>
								</SelectContent>
							</Select>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>
			</FieldGroup>

			<div className='flex justify-end gap-4'>
				{onCancel && (
					<Button
						type='button'
						variant='outline'
						onClick={onCancel}
					>
						ยกเลิก
					</Button>
				)}
				<Button type='submit'>บันทึก</Button>
			</div>
		</form>
	)
}
