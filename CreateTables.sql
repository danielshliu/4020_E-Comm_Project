-- =========================================================
-- DROP TABLES (in FK-safe order)
-- =========================================================
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS dutch_accepts;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS dutch_auctions;
DROP TABLE IF EXISTS forward_auctions;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- =========================================================
-- CREATE TABLES
-- =========================================================

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  address VARCHAR(255),
  reset_token VARCHAR(6),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  seller_id INT REFERENCES users(user_id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auctions (
  auction_id SERIAL PRIMARY KEY,
  item_id INT REFERENCES items(item_id),
  seller_id INT REFERENCES users(user_id),
  winner_id INT REFERENCES users(user_id),
  auction_type VARCHAR(10) CHECK (auction_type IN ('FORWARD', 'DUTCH')),
  start_price INT NOT NULL,
  current_price INT NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  shipping_price INT DEFAULT 10,
  expedited_price INT DEFAULT 15,
  shipping_days INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forward_auctions (
  auction_id INT PRIMARY KEY REFERENCES auctions(auction_id),
  min_increment INT NOT NULL DEFAULT 1,
  reserve_price INT
);

CREATE TABLE dutch_auctions (
  auction_id INT PRIMARY KEY REFERENCES auctions(auction_id),
  price_drop_step INT NOT NULL,
  step_interval_sec INT NOT NULL,
  reserve_price INT NOT NULL
);

CREATE TABLE bids (
  bid_id SERIAL PRIMARY KEY,
  auction_id INT REFERENCES forward_auctions(auction_id),
  bidder_id INT REFERENCES users(user_id),
  amount INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dutch_accepts (
  accept_id SERIAL PRIMARY KEY,
  auction_id INT REFERENCES dutch_auctions(auction_id),
  buyer_id INT REFERENCES users(user_id),
  accepted_price INT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  auction_id INT REFERENCES auctions(auction_id),
  payer_id INT REFERENCES users(user_id),
  shipping_address VARCHAR(255),
  expedited BOOLEAN DEFAULT false,
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);