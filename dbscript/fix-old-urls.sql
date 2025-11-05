-- Fix old storage URLs in database
-- Replace .storage.supabase.co with .supabase.co in all image URLs

UPDATE warehouse_items
SET product_image = REPLACE(
    product_image,
    'https://ozxbbckvlfguftszirgz.storage.supabase.co/object/public/Image/',
    'https://ozxbbckvlfguftszirgz.supabase.co/storage/v1/object/public/Image/'
)
WHERE product_image LIKE 'https://ozxbbckvlfguftszirgz.storage.supabase.co/%';

UPDATE warehouse_items
SET qr_code_image = REPLACE(
    qr_code_image,
    'https://ozxbbckvlfguftszirgz.storage.supabase.co/object/public/Image/',
    'https://ozxbbckvlfguftszirgz.supabase.co/storage/v1/object/public/Image/'
)
WHERE qr_code_image LIKE 'https://ozxbbckvlfguftszirgz.storage.supabase.co/%';

-- Verify the changes
SELECT id, product_name, product_image, qr_code_image
FROM warehouse_items
ORDER BY id DESC
LIMIT 5;
