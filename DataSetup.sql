-- USERS
INSERT INTO users (username, password_hash, email, first_name, last_name, address) VALUES
('alice_seller', '$2b$10$abcdefghijklmnopqrstuv', 'alice@example.com', 'Alice', 'Smith', '123 Main St, Toronto, ON, M5H 2N2'),
('bob_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'bob@example.com', 'Bob', 'Johnson', '456 Oak Ave, Vancouver, BC, V6B 1A1'),
('charlie_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'charlie@example.com', 'Charlie', 'Williams', '789 Elm St, Montreal, QC, H3B 1A1'),
('diane_seller', '$2b$10$abcdefghijklmnopqrstuv', 'diane@example.com', 'Diane', 'Brown', '321 Pine Ave, Calgary, AB, T2P 1A1'),
('emma_seller', '$2b$10$abcdefghijklmnopqrstuv', 'emma@example.com', 'Emma', 'Davis', '654 Maple Rd, Ottawa, ON, K1P 1A1'),
('frank_buyer', '$2b$10$abcdefghijklmnopqrstuv', 'frank@example.com', 'Frank', 'Miller', '987 Cedar Ln, Halifax, NS, B3H 1A1');

-- ITEMS
INSERT INTO items (seller_id, title, description, image_url) VALUES
(1, 'Vintage Clock', 'Antique wooden clock from 1920s', 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400'),
(4, 'Art Painting', 'Modern abstract canvas painting', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'),
(1, 'Laptop', 'Lightly used MacBook Air 2020', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
(5, 'Designer Watch', 'Luxury Swiss watch, brand new', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400'),
(4, 'Vintage Camera', 'Rare 1960s film camera in excellent condition', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'),
(5, 'Gaming Console', 'PS5 with 2 controllers and 3 games', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400');

-- AUCTIONS (with 1 minute timer for testing)
-- Using NOW() + INTERVAL to set end times relative to current time
INSERT INTO auctions (item_id, seller_id, winner_id, auction_type, start_price, current_price, end_time, shipping_price, expedited_price, shipping_days)
VALUES 
-- Forward Auctions with 1 minute timer
(1, 1, NULL, 'FORWARD', 100, 120, NOW() + INTERVAL '3 minute', 10, 15, 5),  -- Ends in 1 minute
(3, 1, NULL, 'FORWARD', 600, 650, NOW() + INTERVAL '3 minute', 12, 18, 5),  -- Ends in 1 minute

-- Dutch Auctions with longer timers
(2, 4, NULL, 'DUTCH', 500, 500, NOW() + INTERVAL '10 minutes', 15, 20, 7),    -- Ends in 10 minutes
(4, 5, NULL, 'DUTCH', 2000, 2000, NOW() + INTERVAL '15 minutes', 20, 30, 10), -- Ends in 15 minutes
(5, 4, NULL, 'DUTCH', 800, 800, NOW() + INTERVAL '20 minutes', 15, 22, 7),    -- Ends in 20 minutes
(6, 5, NULL, 'DUTCH', 600, 600, NOW() + INTERVAL '30 minutes', 10, 15, 5);    -- Ends in 30 minutes

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

-- PAYMENTS (with expedited column)
INSERT INTO payments (auction_id, payer_id, shipping_address, expedited, payment_status) VALUES
(1, 3, '789 Elm St, Montreal, QC, H3B 1A1', false, 'COMPLETED'),
(2, 3, '789 Elm St, Montreal, QC, H3B 1A1', true, 'COMPLETED'),
(3, 2, '456 Oak Ave, Vancouver, BC, V6B 1A1', false, 'PENDING'),
(4, 3, '789 Elm St, Montreal, QC, H3B 1A1', true, 'COMPLETED'),
(5, 6, '987 Cedar Ln, Halifax, NS, B3H 1A1', false, 'PENDING'),
(6, 6, '987 Cedar Ln, Halifax, NS, B3H 1A1', true, 'PENDING');


-- View all auctions with item and seller info
SELECT a.auction_id, i.title, u.username AS seller, a.auction_type, a.start_price, a.current_price, a.end_time, a.shipping_price, a.expedited_price, a.winner_id
FROM auctions a
JOIN items i ON a.item_id = i.item_id
JOIN users u ON a.seller_id = u.user_id;

-- View all payments with buyer and item info
SELECT p.payment_id, u.username AS buyer, i.title AS item, p.shipping_address, p.expedited, p.payment_status, p.created_at
FROM payments p
JOIN auctions a ON p.auction_id = a.auction_id
JOIN items i ON a.item_id = i.item_id
JOIN users u ON p.payer_id = u.user_id;