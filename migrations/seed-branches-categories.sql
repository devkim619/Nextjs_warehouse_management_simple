-- Seed data for branches and categories

BEGIN;

-- 1. Insert branches (เริ่มจาก 1 สาขา - กรุงเทพ)
INSERT INTO branches (id, code, name_th, name_en, location, is_active) VALUES
(1, 'BKK', 'สาขากรุงเทพฯ', 'Bangkok Branch', 'กรุงเทพมหานคร', true),
(2, 'CNX', 'สาขาเชียงใหม่', 'Chiang Mai Branch', 'เชียงใหม่', true),
(3, 'PKT', 'สาขาภูเก็ต', 'Phuket Branch', 'ภูเก็ต', true),
(4, 'HDY', 'สาขาหาดใหญ่', 'Hat Yai Branch', 'สงขลา', true),
(5, 'KKC', 'สาขาขอนแก่น', 'Khon Kaen Branch', 'ขอนแก่น', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert categories (หมวดหมู่สินค้า)
INSERT INTO categories (id, code, name_th, name_en, description) VALUES
(1, 'ELEC', 'เครื่องใช้ไฟฟ้า', 'Electronics', 'เครื่องใช้ไฟฟ้าและอุปกรณ์อิเล็กทรอนิกส์'),
(2, 'CLTH', 'เสื้อผ้าและสิ่งทอ', 'Clothing & Textiles', 'เสื้อผ้า ผ้า และสิ่งทอต่างๆ'),
(3, 'TECH', 'อิเล็กทรอนิกส์', 'Technology', 'อุปกรณ์อิเล็กทรอนิกส์ และเทคโนโลยี'),
(4, 'FURN', 'เฟอร์นิเจอร์', 'Furniture', 'เฟอร์นิเจอร์และของตักแต่งบ้าน'),
(5, 'FOOT', 'รองเท้าและกระเป๋า', 'Footwear & Bags', 'รองเท้า กระเป๋า และเครื่องประดับ'),
(6, 'FOOD', 'อาหารและเครื่องดื่ม', 'Food & Beverage', 'อาหาร เครื่องดื่ม และผลิตภัณฑ์บริโภค'),
(7, 'SPRT', 'อุปกรณ์กีฬา', 'Sports Equipment', 'อุปกรณ์กีฬาและออกกำลังกาย'),
(8, 'STAT', 'เครื่องเขียน', 'Stationery', 'เครื่องเขียนและอุปกรณ์สำนักงาน'),
(9, 'TOYS', 'ของเล่น', 'Toys', 'ของเล่นและเกมส์'),
(10, 'OTHR', 'อื่นๆ', 'Others', 'สินค้าอื่นๆ ที่ไม่อยู่ในหมวดหมู่ข้างต้น')
ON CONFLICT (id) DO NOTHING;

-- 3. Update sequences
SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches), true);
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories), true);

COMMIT;

-- Verify
SELECT 'Branches seeded:' AS info, COUNT(*) AS count FROM branches;
SELECT 'Categories seeded:' AS info, COUNT(*) AS count FROM categories;
