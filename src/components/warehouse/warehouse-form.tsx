'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { BranchSelect } from '@/components/ui/branch-select'
import { Button } from '@/components/ui/button'
import { CategorySelect } from '@/components/ui/category-select'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { ProvinceSelect } from '@/components/ui/province-select'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { WarehouseItem } from '@/types/warehouse'

const warehouseFormSchema = z.object({
	branchId: z.string().min(1, { message: 'กรุณาเลือกสาขา' }),
	categoryId: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' }),
	productName: z.string().min(1, { message: 'กรุณากรอกชื่อสินค้า' }),
	storageLocation: z.string().min(1, { message: 'กรุณากรอกที่จัดเก็บ' }),
	entryDate: z.date(),
	deliveryVehiclePlateNumber: z.string().min(1, { message: 'กรุณากรอกทะเบียนรถส่ง' }),
	deliveryVehicleProvinceId: z.string().min(1, { message: 'กรุณาเลือกจังหวัด' }),
	containerNumber: z.string().min(1, { message: 'กรุณากรอกหมายเลขตู้คอนเทนเนอร์' }),
	productImage: z.union([z.string(), z.instanceof(File)]).optional(),
	productImageFile: z.instanceof(File).optional().nullable(),
	palletCount: z.coerce.number().min(1, { message: 'จำนวนพาเลทต้องมากกว่า 0' }),
	packageCount: z.coerce.number().min(1, { message: 'จำนวนแพ็คเกจต้องมากกว่า 0' }),
	itemCount: z.coerce.number().min(1, { message: 'จำนวนชิ้นต้องมากกว่า 0' }),
	exitDate: z.date().optional(),
	pickupVehiclePlateNumber: z.string().optional(),
	pickupVehicleProvinceId: z.string().optional(),
	status: z.enum(['in_stock', 'out_for_delivery', 'delivered']),
})

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>

interface WarehouseFormProps {
	defaultValues?: Partial<WarehouseItem>
	onSubmitAction: (data: WarehouseFormValues) => void | Promise<void>
	onCancel?: () => void
	isSubmitting?: boolean
}

export function WarehouseForm({
	defaultValues,
	onSubmitAction,
	onCancel,
	isSubmitting = false,
}: WarehouseFormProps) {
	const form = useForm<WarehouseFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(warehouseFormSchema) as any,
		defaultValues: {
			branchId: defaultValues?.branchId?.toString() || '',
			categoryId: defaultValues?.categoryId?.toString() || '',
			productName: defaultValues?.productName || '',
			storageLocation: defaultValues?.storageLocation || '',
			entryDate: defaultValues?.entryDate || new Date(),
			deliveryVehiclePlateNumber: defaultValues?.deliveryVehicle?.plateNumber || '',
			deliveryVehicleProvinceId: defaultValues?.deliveryVehicle?.provinceId?.toString() || '',
			containerNumber: defaultValues?.containerNumber || '',
			productImage: defaultValues?.productImage || '',
			productImageFile: null,
			palletCount: defaultValues?.palletCount || 1,
			packageCount: defaultValues?.packageCount || 1,
			itemCount: defaultValues?.itemCount || 1,
			exitDate: defaultValues?.exitDate || undefined,
			pickupVehiclePlateNumber: defaultValues?.pickupVehicle?.plateNumber || '',
			pickupVehicleProvinceId: defaultValues?.pickupVehicle?.provinceId?.toString() || '',
			status: defaultValues?.status || 'in_stock',
		},
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleSubmit = (data: any) => {
		onSubmitAction(data)
	}

	return (
		<form
			onSubmit={form.handleSubmit(handleSubmit)}
			className='space-y-6'
		>
			<FieldGroup>
				{/* สาขา และ หมวดหมู่ */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Controller
						control={form.control}
						name='branchId'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>สาขา</FieldLabel>
								<BranchSelect
									value={field.value}
									onChangeAction={field.onChange}
									onBlur={field.onBlur}
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name='categoryId'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>หมวดหมู่สินค้า</FieldLabel>
								<CategorySelect
									value={field.value}
									onChangeAction={field.onChange}
									onBlur={field.onBlur}
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>
				</div>

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
							<DateTimePicker
								value={field.value}
								onChange={field.onChange}
								placeholder='เลือกวันที่และเวลา'
							/>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* ทะเบียนรถส่ง */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Controller
						control={form.control}
						name='deliveryVehiclePlateNumber'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>ทะเบียนรถส่ง</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder='เช่น กข-1234'
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name='deliveryVehicleProvinceId'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>จังหวัด</FieldLabel>
								<ProvinceSelect
									value={field.value}
									onChangeAction={field.onChange}
									onBlur={field.onBlur}
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>
				</div>

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

				{/* รูปสินค้า */}
				<Controller
					control={form.control}
					name='productImage'
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>รูปสินค้า</FieldLabel>
							<ImageUpload
								value={field.value}
								onChange={(file) => {
									// Store File object in productImageFile field
									form.setValue('productImageFile', file)
									// Keep productImage for existing URL display
									if (file) {
										field.onChange(file)
									} else {
										field.onChange(null)
									}
								}}
								onBlur={field.onBlur}
								maxSizeMB={2}
							/>
							<FieldDescription>
								อัปโหลดรูปภาพสินค้า (PNG, JPG, GIF, WEBP สูงสุด 2MB)
							</FieldDescription>
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
							<DateTimePicker
								value={field.value}
								onChange={field.onChange}
								placeholder='เลือกวันที่และเวลา (ถ้ามี)'
							/>
							<FieldDescription>เลือกวันที่ออกจากคลัง (ถ้ามีการจัดส่ง)</FieldDescription>
							<FieldError errors={fieldState.error ? [fieldState.error] : []} />
						</Field>
					)}
				/>

				{/* ทะเบียนรถรับ */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Controller
						control={form.control}
						name='pickupVehiclePlateNumber'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>ทะเบียนรถรับ (ถ้ามี)</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder='เช่น คง-5678'
								/>
								<FieldDescription>ระบุทะเบียนรถที่มารับสินค้า</FieldDescription>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name='pickupVehicleProvinceId'
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>จังหวัด (ถ้ามี)</FieldLabel>
								<ProvinceSelect
									value={field.value}
									onChangeAction={field.onChange}
									onBlur={field.onBlur}
									placeholder='เลือกจังหวัด (ถ้ามี)'
								/>
								<FieldError errors={fieldState.error ? [fieldState.error] : []} />
							</Field>
						)}
					/>
				</div>

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
						size={'lg'}
						onClick={onCancel}
						disabled={isSubmitting}
					>
						ยกเลิก
					</Button>
				)}
				<Button
					type='submit'
					disabled={isSubmitting}
					size={'lg'}
					variant={'default'}
				>
					{isSubmitting ? (
						<div className='flex items-center gap-2'>
							<LoaderCircle className='size-4 animate-spin' />
						</div>
					) : (
						'บันทึก'
					)}
				</Button>
			</div>
		</form>
	)
}
