# API Testing with cURL

## 🧪 Warehouses API (ใช้ FormData ทั้งหมด)

### 1. Get All Warehouses

```bash
curl -X GET http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json"
```

### 2. Create Warehouse (ไม่มีรูป)

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=Warehouse Bangkok Central" \
  -F "location=Bangkok, Thailand" \
  -F "capacity=1000 sqm" \
  -F "status=active"
```

### 3. Create Warehouse (มีรูป)

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=Warehouse with Image" \
  -F "location=Bangkok, Thailand" \
  -F "capacity=1000 sqm" \
  -F "status=active" \
  -F "image=@/path/to/your/image.jpg"
```

**ตัวอย่างการใช้งานจริง:**

```bash
# สร้างไฟล์ทดสอบ
echo "test image content" > warehouse-photo.jpg

# สร้าง warehouse พร้อมรูปในคำสั่งเดียว
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=My Warehouse" \
  -F "location=Bangkok" \
  -F "capacity=2000 sqm" \
  -F "status=active" \
  -F "image=@warehouse-photo.jpg"
```

```bash
curl -X GET http://localhost:3000/api/warehouses/1 \
  -H "Content-Type: application/json"
```

### 4. Update Warehouse

```bash
curl -X PUT http://localhost:3000/api/warehouses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Warehouse Bangkok Central - Updated",
    "location": "Bangkok, Thailand",
    "capacity": "1500 sqm",
    "status": "active"
  }'
```

### 5. Delete Warehouse

```bash
curl -X DELETE http://localhost:3000/api/warehouses/1 \
  -H "Content-Type: application/json"
```

---

## 🎯 Complete Workflow Example

### สร้าง Warehouse พร้อมรูปภาพ

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=Central Distribution Center" \
  -F "location=123 Sukhumvit Rd, Bangkok 10110" \
  -F "capacity=5000 sqm" \
  -F "status=active" \
  -F "image=@warehouse-photo.jpg"
```

### อัปเดต Warehouse และเปลี่ยนรูปใหม่

```bash
curl -X PUT http://localhost:3000/api/warehouses/1 \
  -F "name=Central Distribution Center - Expanded" \
  -F "location=123 Sukhumvit Rd, Bangkok 10110" \
  -F "capacity=8000 sqm" \
  -F "status=active" \
  -F "image=@new-warehouse-photo.jpg"
```

---

## 📤 File Upload API (Optional - ใช้ถ้าต้องการ upload แยก)

### 1. Upload an Image

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your/image.jpg"
```

**ตัวอย่างการใช้งานจริง:**

```bash
# macOS/Linux - สร้างไฟล์ทดสอบ
echo "test image content" > test-image.jpg

# Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg"
```

### 2. Delete an Image

```bash
curl -X DELETE "http://localhost:3000/api/upload?path=warehouses/1234567890-image.jpg" \
  -H "Content-Type: application/json"
```

---

## 🎯 Complete Workflow Example

### สร้าง Warehouse พร้อมรูปภาพ

#### Step 1: Upload Image First

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@warehouse-photo.jpg" \
  -o upload-response.json
```

#### Step 2: Extract URL from Response (macOS)

```bash
IMAGE_URL=$(cat upload-response.json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "Image URL: $IMAGE_URL"
```

#### Step 3: Create Warehouse with Image

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Warehouse with Image\",
    \"location\": \"Bangkok\",
    \"capacity\": \"2000 sqm\",
    \"status\": \"active\",
    \"imageUrl\": \"$IMAGE_URL\"
  }"
```

---

## 🔄 Complete CRUD Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Warehouse API..."

# Create test image
echo "Creating test image..."
echo "test content" > test-warehouse.jpg

# 1. Create Warehouse with Image
echo -e "\n1️⃣ Creating warehouse with image..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/warehouses \
  -F "name=Test Warehouse" \
  -F "location=Bangkok" \
  -F "capacity=500 sqm" \
  -F "status=active" \
  -F "image=@test-warehouse.jpg")
echo "Response: $CREATE_RESPONSE"

# Extract ID (requires jq - install with: brew install jq)
WAREHOUSE_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
echo "Created Warehouse ID: $WAREHOUSE_ID"

# 2. Create Warehouse without Image
echo -e "\n2️⃣ Creating warehouse without image..."
curl -s -X POST $BASE_URL/warehouses \
  -F "name=Test Warehouse 2" \
  -F "location=Chiang Mai" \
  -F "capacity=300 sqm" \
  -F "status=active" | jq

# 3. Get All Warehouses
echo -e "\n3️⃣ Getting all warehouses..."
curl -s -X GET $BASE_URL/warehouses | jq

# 4. Get Single Warehouse
echo -e "\n4️⃣ Getting warehouse by ID..."
curl -s -X GET $BASE_URL/warehouses/$WAREHOUSE_ID | jq

# 5. Update Warehouse with new image
echo -e "\n5️⃣ Updating warehouse with new image..."
echo "updated content" > updated-warehouse.jpg
curl -s -X PUT $BASE_URL/warehouses/$WAREHOUSE_ID \
  -F "name=Test Warehouse - Updated" \
  -F "location=Bangkok" \
  -F "capacity=800 sqm" \
  -F "status=active" \
  -F "image=@updated-warehouse.jpg" | jq

# 6. Update Warehouse without changing image
echo -e "\n6️⃣ Updating warehouse without changing image..."
curl -s -X PUT $BASE_URL/warehouses/$WAREHOUSE_ID \
  -F "name=Test Warehouse - Final Update" \
  -F "location=Bangkok" \
  -F "capacity=1000 sqm" \
  -F "status=active" | jq

# 7. Delete Warehouse
echo -e "\n7️⃣ Deleting warehouse..."
curl -s -X DELETE $BASE_URL/warehouses/$WAREHOUSE_ID | jq

# Cleanup
rm -f test-warehouse.jpg updated-warehouse.jpg

echo -e "\n✅ All tests completed!"
```

**บันทึกเป็นไฟล์และรัน:**

```bash
# Save as test-api.sh
chmod +x test-api.sh
./test-api.sh
```

---

## 📊 Pretty JSON Output

### ใช้ jq สำหรับ format JSON (ติดตั้งก่อน)

```bash
# Install jq (macOS)
brew install jq

# ใช้งาน
curl -s http://localhost:3000/api/warehouses | jq '.'
```

### ใช้ python สำหรับ format JSON (ถ้าไม่มี jq)

```bash
curl -s http://localhost:3000/api/warehouses | python -m json.tool
```

---

## 🐛 Debug & Verbose Mode

### ดู Headers และ Response Details

```bash
curl -v http://localhost:3000/api/warehouses
```

### ดูเฉพาะ Response Headers

```bash
curl -I http://localhost:3000/api/warehouses
```

### Save Response to File

```bash
curl -X GET http://localhost:3000/api/warehouses -o warehouses.json
```

---

## 🔐 Testing with Authentication (ถ้ามี)

```bash
# With Bearer Token
curl -X GET http://localhost:3000/api/warehouses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# With API Key
curl -X GET http://localhost:3000/api/warehouses \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json"
```

---

## 📝 ตัวอย่างข้อมูลที่ครบถ้วน

### Create Warehouse with All Fields

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Distribution Center",
    "location": "123 Sukhumvit Rd, Bangkok 10110",
    "capacity": "5000 sqm",
    "status": "active",
    "imageUrl": "https://ozxbbckvlfguftszirgz.storage.supabase.co/storage/v1/s3/image/warehouses/example.jpg"
  }'
```

### Bulk Create (ต้องสร้าง endpoint เพิ่ม)

```bash
curl -X POST http://localhost:3000/api/warehouses/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Warehouse A",
      "location": "Bangkok",
      "capacity": "1000 sqm"
    },
    {
      "name": "Warehouse B",
      "location": "Chiang Mai",
      "capacity": "800 sqm"
    }
  ]'
```

---

## ⚡ Quick Test Commands

```bash
# Test if API is running
curl http://localhost:3000/api/warehouses

# Count total warehouses (with jq)
curl -s http://localhost:3000/api/warehouses | jq 'length'

# Get only names (with jq)
curl -s http://localhost:3000/api/warehouses | jq '.[].name'

# Filter by status (with jq)
curl -s http://localhost:3000/api/warehouses | jq '.[] | select(.status=="active")'
```

---

## 🚀 การใช้งานจริง

### 1. เริ่ม Development Server

```bash
bun run dev
```

### 2. Test API (Terminal ใหม่)

**สร้างพร้อมรูป:**

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=My Warehouse" \
  -F "location=Bangkok" \
  -F "capacity=1000 sqm" \
  -F "status=active" \
  -F "image=@photo.jpg"
```

**สร้างแบบไม่มีรูป:**

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -F "name=My Warehouse" \
  -F "location=Bangkok" \
  -F "capacity=1000 sqm" \
  -F "status=active"
```

**ดูทั้งหมด:**

```bash
curl http://localhost:3000/api/warehouses
```

---

## 💡 Tips

- ใช้ `-s` เพื่อซ่อน progress bar: `curl -s`
- ใช้ `-v` เพื่อดู verbose output: `curl -v`
- ใช้ `-o filename` เพื่อบันทึก response: `curl -o response.json`
- ใช้ `jq` เพื่อ format JSON: `curl http://... | jq`
- ใช้ `\` เพื่อขึ้นบรรทัดใหม่ในคำสั่งยาวๆ
