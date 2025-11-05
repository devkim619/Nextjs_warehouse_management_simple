// Test script for new production API
// Run with: bun run test-api.ts

const BASE_URL = 'http://localhost:3000'

// Test 1: Fetch all categories
async function testGetCategories() {
	console.log('\n📦 Testing GET /api/categories...')
	try {
		const response = await fetch(`${BASE_URL}/api/categories`)
		const data = await response.json()
		console.log('✅ Success:', data.data.length, 'categories found')
		console.log('Sample:', data.data[0])
		return data.data
	} catch (error) {
		console.error('❌ Failed:', error)
		return []
	}
}

// Test 2: Fetch all branches
async function testGetBranches() {
	console.log('\n🏢 Testing GET /api/branches...')
	try {
		const response = await fetch(`${BASE_URL}/api/branches`)
		const data = await response.json()
		console.log('✅ Success:', data.data.length, 'branches found')
		console.log('Sample:', data.data[0])
		return data.data
	} catch (error) {
		console.error('❌ Failed:', error)
		return []
	}
}

// Test 3: Create a new warehouse item
async function testCreateWarehouseItem(branchId: number, categoryId: number) {
	console.log(
		`\n📦 Testing POST /api/warehouses (branchId=${branchId}, categoryId=${categoryId})...`,
	)
	try {
		const formData = new FormData()
		formData.append('branchId', branchId.toString())
		formData.append('categoryId', categoryId.toString())
		formData.append('productName', 'Test Product - ' + new Date().toISOString())
		formData.append('storageLocation', 'A-01-TEST')
		formData.append('palletCount', '1')
		formData.append('packageCount', '5')
		formData.append('itemCount', '10')
		formData.append('entryDate', new Date().toISOString())
		formData.append('containerNumber', 'CONT-TEST-' + Date.now())
		formData.append('deliveryVehiclePlateNumber', 'TEST-' + Math.floor(Math.random() * 9999))
		formData.append('deliveryVehicleProvinceId', '1')
		formData.append('status', 'in_stock')

		const response = await fetch(`${BASE_URL}/api/warehouses`, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			const error = await response.json()
			console.error('❌ Failed:', error)
			return null
		}

		const data = await response.json()
		console.log('✅ Success! Created item with SKU:', data.stockId)
		console.log('Full response:', data)
		return data
	} catch (error) {
		console.error('❌ Failed:', error)
		return null
	}
}

// Test 4: Get all warehouse items
async function testGetWarehouseItems() {
	console.log('\n📋 Testing GET /api/warehouses...')
	try {
		const response = await fetch(`${BASE_URL}/api/warehouses`)
		const data = await response.json()
		console.log('✅ Success:', data.length, 'items found')
		if (data.length > 0) {
			const item = data[0]
			console.log('Sample item:')
			console.log('  - ID:', item.id)
			console.log('  - SKU:', item.stockId)
			console.log('  - Product:', item.productName)
			console.log('  - Category:', item.category?.nameTh, `(${item.category?.code})`)
			console.log('  - Branch:', item.branch?.nameTh, `(${item.branch?.code})`)
		}
		return data
	} catch (error) {
		console.error('❌ Failed:', error)
		return []
	}
}

// Run all tests
async function runTests() {
	console.log('🚀 Starting API Tests...')
	console.log('='.repeat(50))

	// Test master data endpoints
	const categories = await testGetCategories()
	const branches = await testGetBranches()

	if (categories.length === 0 || branches.length === 0) {
		console.error(
			'\n❌ Cannot proceed: Categories or branches not found. Make sure database is seeded.',
		)
		return
	}

	// Test creating items with different branches and categories
	console.log('\n📦 Testing SKU generation with different combinations...')
	await testCreateWarehouseItem(branches[0].id, categories[0].id) // BKK + ELEC
	await testCreateWarehouseItem(branches[0].id, categories[2].id) // BKK + TECH
	await testCreateWarehouseItem(branches[1].id, categories[0].id) // CNX + ELEC

	// Test fetching all items
	await testGetWarehouseItems()

	console.log('\n' + '='.repeat(50))
	console.log('✨ Tests completed!')
}

// Run tests
runTests()
