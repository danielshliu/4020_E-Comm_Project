-- USERS
INSERT INTO users (username, password_hash, email) VALUES
('alice_seller', 'hash123', 'alice@example.com'),
('bob_buyer', 'hash456', 'bob@example.com'),
('charlie_buyer', 'hash789', 'charlie@example.com'),
('diane_seller', 'hashabc', 'diane@example.com');

-- ITEMS
INSERT INTO items (seller_id, title, description, image_url) VALUES
(1, 'Vintage Clock', 'Antique wooden clock from 1920s', 'https://example.com/clock.jpg'),
(4, 'Art Painting', 'Modern abstract canvas painting', 'https://example.com/painting.jpg'),
(1, 'Laptop', 'Lightly used MacBook Air 2020', 'https://example.com/laptop.jpg');

-- AUCTIONS
INSERT INTO auctions (item_id, seller_id, auction_type, start_price, current_price, end_time)
VALUES 
(1, 1, 'FORWARD', 100, 120, '2025-11-01 18:00:00'),  -- Vintage Clock
(2, 4, 'DUTCH', 500, 500, '2025-11-05 20:00:00'),   -- Art Painting
(3, 1, 'FORWARD', 600, 650, '2025-11-03 19:30:00'); -- Laptop

-- FORWARD_AUCTIONS
INSERT INTO forward_auctions (auction_id, min_increment, reserve_price) VALUES
(1, 10, 100),
(3, 25, 600);

-- DUTCH_AUCTIONS
INSERT INTO dutch_auctions (auction_id, price_drop_step, step_interval_sec) VALUES
(2, 25, 60);

-- BIDS
INSERT INTO bids (auction_id, bidder_id, amount) VALUES
(1, 2, 110),
(1, 3, 120),
(3, 2, 625),
(3, 3, 650);

-- DUTCH_ACCEPTS
INSERT INTO dutch_accepts (auction_id, buyer_id, accepted_price, accepted) VALUES
(2, 3, 450, true);

-- PAYMENTS
INSERT INTO payments (auction_id, payer_id, shipping_address) VALUES
(1, 3, '123 Maple St, Toronto, ON'),
(2, 3, '45 Queen St, Ottawa, ON'),
(3, 2, '789 Elm St, Vancouver, BC');


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