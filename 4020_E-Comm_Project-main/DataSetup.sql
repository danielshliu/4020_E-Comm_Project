-- USERS
INSERT INTO users (username, password_hash, email) VALUES
('alice_seller', '$2b$10$abcdefghijklmnopqrstuv', 'alice@example.com'),
('bob_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'bob@example.com'),
('charlie_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'charlie@example.com'),
('diane_seller', '$2b$10$abcdefghijklmnopqrstuv', 'diane@example.com'),
('emma_seller', '$2b$10$abcdefghijklmnopqrstuv', 'emma@example.com'),
('frank_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'frank@example.com');

-- ITEMS
INSERT INTO items (seller_id, title, description, image_url) VALUES
(1, 'Vintage Clock', 'Antique wooden clock from 1920s', 'https://example.com/clock.jpg'),
(4, 'Art Painting', 'Modern abstract canvas painting', 'https://example.com/painting.jpg'),
(1, 'Laptop', 'Lightly used MacBook Air 2020', 'https://example.com/laptop.jpg'),
(5, 'Designer Watch', 'Luxury Swiss watch, brand new', 'https://example.com/watch.jpg'),
(4, 'Vintage Camera', 'Rare 1960s film camera in excellent condition', 'https://example.com/camera.jpg'),
(5, 'Gaming Console', 'PS5 with 2 controllers and 3 games', 'https://example.com/ps5.jpg');

-- AUCTIONS
INSERT INTO auctions (item_id, seller_id, auction_type, start_price, current_price, end_time)
VALUES 
(1, 1, 'FORWARD', 100, 120, '2025-11-01 18:00:00'),  -- Vintage Clock
(2, 4, 'DUTCH', 500, 500, '2025-11-05 20:00:00'),   -- Art Painting
(3, 1, 'FORWARD', 600, 650, '2025-11-03 19:30:00'), -- Laptop
(4, 5, 'DUTCH', 2000, 2000, '2025-11-10 15:00:00'), -- Designer Watch
(5, 4, 'DUTCH', 800, 800, '2025-11-08 12:00:00'),   -- Vintage Camera
(6, 5, 'DUTCH', 600, 600, '2025-11-12 18:00:00');   -- Gaming Console

-- FORWARD_AUCTIONS
INSERT INTO forward_auctions (auction_id, min_increment, reserve_price) VALUES
(1, 10, 100),
(3, 25, 600);

-- DUTCH_AUCTIONS
INSERT INTO dutch_auctions (auction_id, price_drop_step, step_interval_sec) VALUES
(2, 25, 60),    -- Art Painting: drops $25 every 60 seconds
(4, 100, 300),  -- Designer Watch: drops $100 every 5 minutes
(5, 50, 120),   -- Vintage Camera: drops $50 every 2 minutes
(6, 30, 180);   -- Gaming Console: drops $30 every 3 minutes

-- BIDS
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
(1, 2, 110),
(1, 3, 120),
(3, 2, 625),
(3, 3, 650);

-- DUTCH_ACCEPTS
INSERT INTO dutch_accepts (auction_id, buyer_id, accepted_price, accepted) VALUES
-- Art Painting (auction_id: 2)
(2, 3, 500, true),   -- Charlie accepted at starting price
(2, 2, 475, false),  -- Bob rejected at $475

-- Designer Watch (auction_id: 4)
(4, 6, 2000, false), -- Frank rejected at starting price
(4, 2, 1900, false), -- Bob rejected at $1900
(4, 3, 1800, true),  -- Charlie accepted at $1800

-- Vintage Camera (auction_id: 5)
(5, 2, 800, false),  -- Bob rejected at starting price
(5, 6, 750, true),   -- Frank accepted at $750

-- Gaming Console (auction_id: 6)
(6, 3, 600, false),  -- Charlie rejected at starting price
(6, 2, 570, false),  -- Bob rejected at $570
(6, 6, 540, true);   -- Frank accepted at $540

-- PAYMENTS
INSERT INTO payments (auction_id, payer_id, shipping_address, payment_status) VALUES
(1, 3, '123 Maple St, Toronto, ON', 'COMPLETED'),
(2, 3, '45 Queen St, Ottawa, ON', 'COMPLETED'),
(3, 2, '789 Elm St, Vancouver, BC', 'PENDING'),
(4, 3, '45 Queen St, Ottawa, ON', 'COMPLETED'),
(5, 6, '321 Pine Ave, Montreal, QC', 'PENDING'),
(6, 6, '321 Pine Ave, Montreal, QC', 'PENDING');


-- View all auctions with item and seller info
SELECT a.auction_id, i.title, u.username AS seller, a.auction_type, a.start_price, a.current_price
FROM auctions a
JOIN items i ON a.item_id = i.item_id
JOIN users u ON a.seller_id = u.user_id;

-- View all payments with buyer and item info
SELECT p.payment_id, u.username AS buyer, i.title AS item, p.shipping_address, p.created_at
FROM payments p
JOIN auctions a ON p.auction_id = a.auction_id
JOIN items i ON a.item_id = i.item_id
JOIN users u ON p.payer_id = u.user_id;