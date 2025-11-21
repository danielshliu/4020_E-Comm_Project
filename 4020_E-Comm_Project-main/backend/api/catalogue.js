import express from 'express';
import db from '../db.js';

const router = express.Router();
router.use(express.json());

// UC2.2: Get all active items
//Fixed
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
        SELECT * FROM items
      `);
    res.json(result.rows);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

// UC2.1: Search items by keyword
//Fixed
router.get('/search', async (req, res) => {
  try {

    //debugging, the keyword wasnt working but it was a dumb fix...
     if (!req.query.keyword) {
            return res.status(400).json({ error: 'Search keyword is required' });
        }
    
    //geet keyword as a String
    const keyword  = String(req.query.keyword).trim();
    console.log('Search keyword received:', keyword);

    const result = await db.query(
     `SELECT 
        item_id,
        seller_id,
        title,
        description,
        image_url
       FROM items 
       WHERE LOWER(title) LIKE LOWER($1)
       OR LOWER(description) LIKE LOWER($1)
       ORDER BY item_id ASC`,
      [`%${keyword}%`]
    );

     //MORE DEBUGGING I THINK
    console.log('Parameters:', [`%${keyword}%`]);
    console.log('Results found:', result.rows.length);
    console.log('Search results:', result.rows);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
    


// UC7: Create new item
//fixed
router.post('/createItems', async (req, res) => {
  try {
    const {seller_id,title,description,image_url} = req.body;

    const result = await db.query(
      `INSERT INTO items  (seller_id, title, description, image_url) VALUES 
      ($1, $2, $3, $4) RETURNING *`,
      [seller_id, title, description, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UC2.3: Get item by ID
router.get('/:item_id', async (req, res) => {
  try {
    const { item_id } = req.params;

    const result = await db.query('SELECT * FROM items WHERE item_id = $1', [item_id]);

    if (result.rows.length === 0) 
      return res.status(404).json({ error: 'Item not found' });

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UC8: Update Dutch auction price
router.put('/:id/price', async (req, res) => {
  try {


    //not sure why its diff params, but if it cause problems i will fix...
    const { id } = req.params;
    const { new_price } = req.body;

    const result = await db.query(
     `UPDATE auctions 
       SET current_price = $1 
       WHERE auction_id = $2 
       AND winner_id IS NULL
       RETURNING 
         auction_id,
         item_id,
         current_price,
         winner_id`,
      [new_price, id]
    );

    if (result.rows.length === 0) 
      return res.status(404).json({ error: 'Item not found' });
    
    console.log('Price updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
