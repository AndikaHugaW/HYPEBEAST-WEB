-- Demo Products Data for HYPEBEAST
-- Run this SQL in your Supabase SQL Editor after running schema.sql
-- This will insert 20 demo products with various categories

-- Clear existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM products WHERE brand IN ('Supreme', 'Stone Island', 'Chrome Hearts', 'Nike', 'Adidas', 'Off-White', 'Bape', 'Stussy');

-- Insert 20 Demo Products
INSERT INTO products (brand, name, slug, description, original_price, sale_price, discount_percentage, category, designer, color, size, images, stock_status, is_new_arrival, is_featured, is_on_sale) VALUES

-- NEW ARRIVALS (Apparel)
('Supreme', 'Supreme X Fox Racing® Sweatshirt - White', 'supreme-x-fox-racing-sweatshirt-white', 'Limited edition collaboration sweatshirt featuring Fox Racing branding. Made from premium cotton blend with embroidered logos.', 3210.00, 2087.00, 35, 'apparel', 'Supreme', 'White', ARRAY['S', 'M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'], 'in_stock', true, true, true),

('Stone Island', 'Loose-fit Mock-Neck Jumper', 'stone-island-loose-fit-mock-neck-jumper', 'Premium Italian-made jumper with signature compass badge. Loose fit design for maximum comfort.', 2850.00, 1995.00, 30, 'apparel', 'Stone Island', 'Black', ARRAY['M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], 'in_stock', true, false, true),

('Chrome Hearts', 'Vertical-Logo Zip-Up Hoodie - White', 'chrome-hearts-vertical-logo-zip-hoodie-white', 'Luxury hoodie featuring Chrome Hearts signature vertical logo. Premium materials and craftsmanship.', 3200.00, 2080.00, 35, 'apparel', 'Chrome Hearts', 'White', ARRAY['S', 'M', 'L'], ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'], 'in_stock', true, true, true),

('Off-White', 'Off-White White Hoodie With Pocket', 'off-white-hoodie-with-pocket', 'Iconic Off-White hoodie with signature diagonal stripes and front pocket. Streetwear essential.', 2950.00, 2065.00, 30, 'apparel', 'Off-White', 'White', ARRAY['S', 'M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'], 'in_stock', true, false, true),

-- APPAREL (Regular)
('Bape', 'Bape Shark Full Zip Hoodie', 'bape-shark-full-zip-hoodie', 'Classic Bape shark hoodie with full zip design. Limited edition colorway.', 2800.00, 2800.00, 0, 'apparel', 'Bape', 'Black', ARRAY['M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'], 'in_stock', false, false, false),

('Stussy', 'World Tour T-Shirt', 'stussy-world-tour-t-shirt', 'Vintage-inspired world tour graphic tee. Classic streetwear design.', 850.00, 595.00, 30, 'apparel', 'Stussy', 'White', ARRAY['S', 'M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'], 'in_stock', false, false, true),

('Palace', 'Tri-Ferg Logo Hoodie', 'palace-tri-ferg-logo-hoodie', 'Palace signature Tri-Ferg logo hoodie. Made in Portugal with premium materials.', 2200.00, 1540.00, 30, 'apparel', 'Palace', 'Navy', ARRAY['M', 'L', 'XL'], ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], 'in_stock', false, false, true),

('Kith', 'Kith Box Logo Hoodie', 'kith-box-logo-hoodie', 'Kith classic box logo hoodie. Premium French terry construction.', 1950.00, 1950.00, 0, 'apparel', 'Kith', 'Gray', ARRAY['S', 'M', 'L'], ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'], 'in_stock', false, false, false),

-- FOOTWEAR
('Nike', 'Nike Dunk Low Panda', 'nike-dunk-low-panda', 'Classic Nike Dunk Low in black and white colorway. Iconic basketball silhouette.', 1200.00, 1200.00, 0, 'footwear', 'Nike', 'Black/White', ARRAY['US 8', 'US 9', 'US 10', 'US 11'], ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], 'in_stock', false, true, false),

('Adidas', 'Adidas Yeezy Boost 350 V2 Zebra', 'adidas-yeezy-boost-350-v2-zebra', 'Yeezy Boost 350 V2 in iconic Zebra colorway. Primeknit upper with Boost midsole.', 3500.00, 2800.00, 20, 'footwear', 'Adidas', 'White/Black', ARRAY['US 8', 'US 9', 'US 10', 'US 11', 'US 12'], ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], 'in_stock', false, true, true),

('Jordan', 'Air Jordan 1 Retro High OG Chicago', 'air-jordan-1-retro-high-og-chicago', 'The iconic Chicago colorway returns. Premium leather construction with classic design.', 4500.00, 3600.00, 20, 'footwear', 'Jordan', 'Red/Black/White', ARRAY['US 8', 'US 9', 'US 10', 'US 11'], ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], 'in_stock', false, true, true),

('New Balance', 'New Balance 550 White Grey', 'new-balance-550-white-grey', 'Retro basketball sneaker in clean white and grey colorway. Premium suede and leather construction.', 980.00, 686.00, 30, 'footwear', 'New Balance', 'White/Grey', ARRAY['US 8', 'US 9', 'US 10', 'US 11'], ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], 'in_stock', false, false, true),

('Converse', 'Converse Chuck 70 High Top', 'converse-chuck-70-high-top', 'Premium version of the classic Chuck Taylor. Enhanced comfort and durability.', 650.00, 455.00, 30, 'footwear', 'Converse', 'Black', ARRAY['US 8', 'US 9', 'US 10', 'US 11'], ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], 'in_stock', false, false, true),

-- ACCESSORIES
('Supreme', 'Supreme Box Logo Beanie', 'supreme-box-logo-beanie', 'Classic Supreme box logo beanie. Made from premium acrylic blend.', 450.00, 315.00, 30, 'accessories', 'Supreme', 'Black', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80'], 'in_stock', false, false, true),

('Chrome Hearts', 'Chrome Hearts Cross Pendant Necklace', 'chrome-hearts-cross-pendant-necklace', '925 silver cross pendant necklace. Handcrafted with Chrome Hearts signature details.', 2800.00, 2800.00, 0, 'accessories', 'Chrome Hearts', 'Silver', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], 'in_stock', false, true, false),

('Off-White', 'Off-White Industrial Belt', 'off-white-industrial-belt', 'Iconic Off-White industrial belt with signature text. Adjustable length.', 650.00, 455.00, 30, 'accessories', 'Off-White', 'Yellow', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&q=80'], 'in_stock', false, false, true),

('Bape', 'Bape Shark Face Mask', 'bape-shark-face-mask', 'Bape signature shark face mask. Reusable and washable design.', 180.00, 126.00, 30, 'accessories', 'Bape', 'Black', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80'], 'in_stock', false, false, true),

-- LIFESTYLE
('Supreme', 'Supreme Box Logo Backpack', 'supreme-box-logo-backpack', 'Classic Supreme box logo backpack. Durable construction with multiple compartments.', 1200.00, 840.00, 30, 'lifestyle', 'Supreme', 'Black', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], 'in_stock', false, false, true),

('Nike', 'Nike Tech Pack Backpack', 'nike-tech-pack-backpack', 'Modern tech backpack with laptop compartment. Water-resistant materials.', 850.00, 595.00, 30, 'lifestyle', 'Nike', 'Black', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], 'in_stock', false, false, true),

('Adidas', 'Adidas Originals Trefoil Cap', 'adidas-originals-trefoil-cap', 'Classic Adidas Originals cap with trefoil logo. Adjustable strap.', 350.00, 245.00, 30, 'lifestyle', 'Adidas', 'Black', ARRAY['One Size'], ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'], 'in_stock', false, false, true);

-- Verify the insert
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category;
SELECT is_new_arrival, COUNT(*) as count FROM products GROUP BY is_new_arrival;
SELECT is_on_sale, COUNT(*) as count FROM products GROUP BY is_on_sale;

