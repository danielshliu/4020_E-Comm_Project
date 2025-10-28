const express = require('express');
const router = express.Router();
const client = require('../db');

// UC2.2: Get all active items
router.get('/items', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM items WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UC2.3: Get item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query('SELECT * FROM items WHERE item_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UC2.1: Search items by keyword
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    const result = await client.query(
      'SELECT * FROM items WHERE $1 = ANY(keywords) AND is_active = true',
      [keyword]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UC7: Create new item
router.post('/items', async (req, res) => {
  try {
    const {
      name, description, category, auction_type, starting_price,
      reserve_price, shipping_cost_regular, shipping_cost_expedited,
      estimated_shipping_days, condition, quantity, image_url,
      keywords, auction_end_time
    } = req.body;

    const result = await client.query(
      `INSERT INTO items (
        name, description, category, auction_type, starting_price, current_price,
        reserve_price, shipping_cost_regular, shipping_cost_expedited,
        estimated_shipping_days, condition, quantity, image_url, keywords, auction_end_time
      ) VALUES (
        $1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *`,
      [
        name, description, category, auction_type, starting_price,
        reserve_price, shipping_cost_regular, shipping_cost_expedited,
        estimated_shipping_days, condition, quantity, image_url, keywords, auction_end_time
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UC8: Update Dutch auction price
router.put('/items/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_price } = req.body;

    const result = await client.query(
      'UPDATE items SET current_price = $1 WHERE item_id = $2 AND auction_type = $3 RETURNING *',
      [new_price, id, 'dutch']
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found or not a Dutch auction' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
