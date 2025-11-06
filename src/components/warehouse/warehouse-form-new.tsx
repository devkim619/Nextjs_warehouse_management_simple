'use client'

import { useFormState } from 'react-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { BranchSelect } from '@/components/ui/branch-select'
import { Button } from '@/components/ui/button'
import { CategorySelect } from '@/components/ui/category-select'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { ProvinceSelect } from '@/components/ui/province-select'
import { SubmitButton } from '@/components/ui/submit-button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { FormState } from '@/actions/warehouse-actions'
import { WarehouseItem } from '@/types/warehouse'

interface WarehouseFormProps {
	action: (prevState: FormState | null, formData: FormData) => Promise<FormState>
	defaultValues?: Partial<WarehouseItem>
	onCancel?: () => void
	onSuccess?: () => void
}

export function WarehouseFormNew({
	action,
	defaultValues,
	onCancel,
	onSuccess,
}: WarehouseFormProps) {
	const [state, formAction] = useFormState(action, null)

	// Controlled component states
	const [branchId, setBranchId] = useState(defaultValues?.branchId?.toString() || '')
	const [categoryId, setCategoryId] = useState(defaultValues?.categoryId?.toString() || '')
	const [entryDate, setEntryDate] = useState<Date>(defaultValues?.entryDate || new Date())
	const [deliveryVehicleProvinceId, setDeliveryVehicleProvinceId] = useState(
		defaultValues?.deliveryVehicle?.provinceId?.toString() || '',
	)
	const [exitDate, setExitDate] = useState<Date | undefined>(defaultValues?.exitDate || undefined)
	const [pickupVehicleProvinceId, setPickupVehicleProvinceId] = useState(
		defaultValues?.pickupVehicle?.provinceId?.toString() || '',
	)
	const [status, setStatus] = useState(defaultValues?.status || 'in_stock')

	// Handle success/error feedback
	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || 'บันทึกข้อมูลสำเร็จ')
			onSuccess?.()
		} else if (state?.message) {
			toast.error(state.message)
		}
	}, [state, onSuccess])

	return (
		<form action={formAction} className="space-y-6">
			<FieldGroup>
				{/* สาขา และ หมวดหมู่ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Field data-invalid={!!state?.errors?.branchId}>
						<FieldLabel htmlFor="branchId">สาขา</FieldLabel>
						<input type="hidden" name="branchId" value={branchId} />
						<BranchSelect value={branchId} onChangeAction={setBranchId} />
						{state?.errors?.branchId && (
							<FieldError errors={state.errors.branchId.map((msg) => ({ message: msg }))} />
						)}
					</Field>

					<Field data-invalid={!!state?.errors?.categoryId}>
						<FieldLabel htmlFor="categoryId">หมวดหมู่สินค้า</FieldLabel>
						<input type="hidden" name="categoryId" value={categoryId} />
						<CategorySelect value={categoryId} onChangeAction={setCategoryId} />
						{state?.errors?.categoryId && (
							<FieldError errors={state.errors.categoryId.map((msg) => ({ message: msg }))} />
						)}
					</Field>
				</div>

				{/* ชื่อสินค้า */}
				<Field data-invalid={!!state?.errors?.productName}>
					<FieldLabel htmlFor="productName">ชื่อสินค้า</FieldLabel>
					<Input
						id="productName"
						name="productName"
						placeholder="กรอกชื่อสินค้า"
						defaultValue={defaultValues?.productName}
						required
					/>
					{state?.errors?.productName && (
						<FieldError errors={state.errors.productName.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* ที่จัดเก็บ */}
				<Field data-invalid={!!state?.errors?.storageLocation}>
					<FieldLabel htmlFor="storageLocation">ที่จัดเก็บ</FieldLabel>
					<Input
						id="storageLocation"
						name="storageLocation"
						placeholder="เช่น A-01-01"
						defaultValue={defaultValues?.storageLocation}
						required
					/>
					{state?.errors?.storageLocation && (
						<FieldError errors={state.errors.storageLocation.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* วันที่เข้า */}
				<Field data-invalid={!!state?.errors?.entryDate}>
					<FieldLabel htmlFor="entryDate">วันที่เข้า</FieldLabel>
					<input type="hidden" name="entryDate" value={entryDate.toISOString()} />
					<DateTimePicker
						value={entryDate}
						onChange={(date) => {
							if (date) setEntryDate(date)
						}}
						placeholder="เลือกวันที่และเวลา"
					/>
					{state?.errors?.entryDate && (
						<FieldError errors={state.errors.entryDate.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* ทะเบียนรถส่ง */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Field data-invalid={!!state?.errors?.deliveryVehiclePlateNumber}>
						<FieldLabel htmlFor="deliveryVehiclePlateNumber">ทะเบียนรถส่ง</FieldLabel>
						<Input
							id="deliveryVehiclePlateNumber"
							name="deliveryVehiclePlateNumber"
							placeholder="เช่น กข-1234"
							defaultValue={defaultValues?.deliveryVehicle?.plateNumber || ''}
							required
						/>
						{state?.errors?.deliveryVehiclePlateNumber && (
							<FieldError
								errors={state.errors.deliveryVehiclePlateNumber.map((msg) => ({ message: msg }))}
							/>
						)}
					</Field>

					<Field data-invalid={!!state?.errors?.deliveryVehicleProvinceId}>
						<FieldLabel htmlFor="deliveryVehicleProvinceId">จังหวัด</FieldLabel>
						<input
							type="hidden"
							name="deliveryVehicleProvinceId"
							value={deliveryVehicleProvinceId}
						/>
						<ProvinceSelect
							value={deliveryVehicleProvinceId}
							onChangeAction={setDeliveryVehicleProvinceId}
						/>
						{state?.errors?.deliveryVehicleProvinceId && (
							<FieldError
								errors={state.errors.deliveryVehicleProvinceId.map((msg) => ({ message: msg }))}
							/>
						)}
					</Field>
				</div>

				{/* หมายเลขตู้คอนเทนเนอร์ */}
				<Field data-invalid={!!state?.errors?.containerNumber}>
					<FieldLabel htmlFor="containerNumber">หมายเลขตู้คอนเทนเนอร์</FieldLabel>
					<Input
						id="containerNumber"
						name="containerNumber"
						placeholder="เช่น MSCU8234567"
						defaultValue={defaultValues?.containerNumber}
						required
					/>
					{state?.errors?.containerNumber && (
						<FieldError errors={state.errors.containerNumber.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* รูปสินค้า */}
				<Field data-invalid={!!state?.errors?.productImage}>
					<FieldLabel htmlFor="productImage">รูปสินค้า</FieldLabel>
					<input type="file" name="productImage" id="productImage" accept="image/*" className="hidden" />
					<ImageUpload
						value={defaultValues?.productImage}
						onChange={(file) => {
							const input = document.getElementById('productImage') as HTMLInputElement
							if (input && file) {
								// Create a new FileList with the file
								const dataTransfer = new DataTransfer()
								dataTransfer.items.add(file)
								input.files = dataTransfer.files
							} else if (input) {
								input.value = ''
							}
						}}
						maxSizeMB={2}
					/>
					<FieldDescription>อัปโหลดรูปภาพสินค้า (PNG, JPG, GIF, WEBP สูงสุด 2MB)</FieldDescription>
					{state?.errors?.productImage && (
						<FieldError errors={state.errors.productImage.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* จำนวนพาเลท, แพ็คเกจ, ชิ้น */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Field data-invalid={!!state?.errors?.palletCount}>
						<FieldLabel htmlFor="palletCount">จำนวนพาเลท</FieldLabel>
						<Input
							id="palletCount"
							name="palletCount"
							type="number"
							min="1"
							placeholder="0"
							defaultValue={defaultValues?.palletCount || 1}
							required
						/>
						{state?.errors?.palletCount && (
							<FieldError errors={state.errors.palletCount.map((msg) => ({ message: msg }))} />
						)}
					</Field>

					<Field data-invalid={!!state?.errors?.packageCount}>
						<FieldLabel htmlFor="packageCount">จำนวนแพ็คเกจ</FieldLabel>
						<Input
							id="packageCount"
							name="packageCount"
							type="number"
							min="1"
							placeholder="0"
							defaultValue={defaultValues?.packageCount || 1}
							required
						/>
						{state?.errors?.packageCount && (
							<FieldError errors={state.errors.packageCount.map((msg) => ({ message: msg }))} />
						)}
					</Field>

					<Field data-invalid={!!state?.errors?.itemCount}>
						<FieldLabel htmlFor="itemCount">จำนวนชิ้น</FieldLabel>
						<Input
							id="itemCount"
							name="itemCount"
							type="number"
							min="1"
							placeholder="0"
							defaultValue={defaultValues?.itemCount || 1}
							required
						/>
						{state?.errors?.itemCount && (
							<FieldError errors={state.errors.itemCount.map((msg) => ({ message: msg }))} />
						)}
					</Field>
				</div>

				{/* วันที่ออก */}
				<Field data-invalid={!!state?.errors?.exitDate}>
					<FieldLabel htmlFor="exitDate">วันที่ออก</FieldLabel>
					<input type="hidden" name="exitDate" value={exitDate ? exitDate.toISOString() : ''} />
					<DateTimePicker
						value={exitDate}
						onChange={(date) => {
							setExitDate(date)
						}}
						placeholder="เลือกวันที่และเวลา (ถ้ามี)"
					/>
					<FieldDescription>เลือกวันที่ออกจากคลัง (ถ้ามีการจัดส่ง)</FieldDescription>
					{state?.errors?.exitDate && (
						<FieldError errors={state.errors.exitDate.map((msg) => ({ message: msg }))} />
					)}
				</Field>

				{/* ทะเบียนรถรับ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Field data-invalid={!!state?.errors?.pickupVehiclePlateNumber}>
						<FieldLabel htmlFor="pickupVehiclePlateNumber">ทะเบียนรถรับ (ถ้ามี)</FieldLabel>
						<Input
							id="pickupVehiclePlateNumber"
							name="pickupVehiclePlateNumber"
							placeholder="เช่น คง-5678"
							defaultValue={defaultValues?.pickupVehicle?.plateNumber || ''}
						/>
						<FieldDescription>ระบุทะเบียนรถที่มารับสินค้า</FieldDescription>
						{state?.errors?.pickupVehiclePlateNumber && (
							<FieldError
								errors={state.errors.pickupVehiclePlateNumber.map((msg) => ({ message: msg }))}
							/>
						)}
					</Field>

					<Field data-invalid={!!state?.errors?.pickupVehicleProvinceId}>
						<FieldLabel htmlFor="pickupVehicleProvinceId">จังหวัด (ถ้ามี)</FieldLabel>
						<input
							type="hidden"
							name="pickupVehicleProvinceId"
							value={pickupVehicleProvinceId}
						/>
						<ProvinceSelect
							value={pickupVehicleProvinceId}
							onChangeAction={setPickupVehicleProvinceId}
							placeholder="เลือกจังหวัด (ถ้ามี)"
						/>
						{state?.errors?.pickupVehicleProvinceId && (
							<FieldError
								errors={state.errors.pickupVehicleProvinceId.map((msg) => ({ message: msg }))}
							/>
						)}
					</Field>
				</div>

				{/* สถานะ */}
				<Field data-invalid={!!state?.errors?.status}>
					<FieldLabel htmlFor="status">สถานะ</FieldLabel>
					<input type="hidden" name="status" value={status} />
					<Select
						onValueChange={(value) => setStatus(value as 'in_stock' | 'out_for_delivery' | 'delivered')}
						value={status}
					>
						<SelectTrigger>
							<SelectValue placeholder="เลือกสถานะ" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="in_stock">ในคลัง</SelectItem>
							<SelectItem value="out_for_delivery">กำลังจัดส่ง</SelectItem>
							<SelectItem value="delivered">ส่งแล้ว</SelectItem>
						</SelectContent>
					</Select>
					{state?.errors?.status && (
						<FieldError errors={state.errors.status.map((msg) => ({ message: msg }))} />
					)}
				</Field>
			</FieldGroup>

			<div className="flex justify-end gap-4">
				{onCancel && (
					<Button type="button" variant="outline" size="lg" onClick={onCancel}>
						ยกเลิก
					</Button>
				)}
				<SubmitButton>บันทึก</SubmitButton>
			</div>
		</form>
	)
}
