import express from 'express';
import db from '../db.js';

const router = express.Router();
router.use(express.json());


function computeDutchPrice(row) {
    if (row.auction_type !== "DUTCH" || row.price_drop_step == null) {
      return row;
    }
  
    const start = new Date(row.created_at);
    const end = new Date(row.end_time);
    const now = new Date();
  
    // Use end time as the cap – price stops changing after end_time
    const effectiveTime = now > end ? end : now;
  
    let elapsedMs = effectiveTime - start;
  
    // If we somehow haven't reached the start yet, use start price
    if (elapsedMs <= 0) {
      row.current_price = row.start_price;
      return row;
    }
  
    const stepMs = row.step_interval_sec * 1000;
    const steps = Math.floor(elapsedMs / stepMs);
  
    let newPrice = row.start_price - steps * row.price_drop_step;
  
    // Never go below reserve_price
    if (newPrice < row.reserve_price) {
      newPrice = row.reserve_price;
    }
  
    row.current_price = newPrice;
    return row;
  }

// Get all active auction listings
router.get('/', async (req, res) => {
    try {
        //query all the live active auction in listings
        const result = await db.query(`
            SELECT 
              a.*,
              i.title,
              i.description,
              i.image_url,
              da.price_drop_step,
              da.step_interval_sec,
              da.reserve_price
            FROM auctions a
            JOIN items i ON a.item_id = i.item_id
            LEFT JOIN dutch_auctions da ON da.auction_id = a.auction_id
            WHERE a.winner_id IS NULL
            ORDER BY a.end_time ASC
          `);

        const rows = result.rows;
        // Apply dynamic pricing for any dutch auctions
        for (const row of rows) {
            if (row.auction_type === "DUTCH" && row.price_drop_step) {
            computeDutchPrice(row);
            }
        }
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get specific auction details with item info and bids
router.get('/:auction_id', async (req, res) => {
    try {
        const { auction_id} = req.params;
        
        console.log('Fetching auction:', auction_id); // Debug log
        
        // Get auction details
        const result = await db.query(
            `
            SELECT 
              a.auction_id,
              a.seller_id,
              a.winner_id,
              a.auction_type,
              a.start_price,
              a.current_price,
              a.end_time,
              a.shipping_price,
              a.expedited_price,
              a.shipping_days,
              a.created_at,
              i.item_id,
              i.title,
              i.description,
              i.image_url,
              seller.username AS seller_username,
              winner.username AS winner_username,
              da.price_drop_step,
              da.step_interval_sec,
              da.reserve_price
            FROM auctions a
            JOIN items i ON a.item_id = i.item_id
            JOIN users seller ON a.seller_id = seller.user_id
            LEFT JOIN users winner ON a.winner_id = winner.user_id
            LEFT JOIN dutch_auctions da ON da.auction_id = a.auction_id
            WHERE a.auction_id = $1
            `,
            [auction_id]
          );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Auction not found' });
        }

        const auction = result.rows[0];

        if (auction.auction_type === "DUTCH" && auction.price_drop_step) {
            computeDutchPrice(auction);
          }
          
        console.log(auction.start_price, "TYPEEEEEEEEEE")

        // Get bids for forward auctions (ordered by amount DESC to get highest first)
        
        if (auction.auction_type === 'FORWARD') {
          const bidsResult = await db.query(
            `SELECT 
              b.bid_id,
              b.amount,
              b.created_at,
              u.user_id AS bidder_id,
              u.username AS bidder_username
            FROM bids b
            JOIN users u ON b.bidder_id = u.user_id
            WHERE b.auction_id = $1
            ORDER BY b.amount DESC, b.created_at DESC`,
            [auction_id]
          );
          
          auction.bids = bidsResult.rows;
        }

        console.log('Auction found with bids:', auction); // Debug log
        res.json(auction);
    } catch (err) {
        console.error('Get auction by ID error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Forward Auction Bidding
router.post('/bid', async(req, res) => {
    const { auction_id, bidder_id, amount } = req.body;
    
    if (!bidder_id || !amount) {
        return res.status(400).json({ error: 'bidder_id and amount are required' });
    }
    
    try {
        await db.query('BEGIN');
        console.log(auction_id)
        // Get auction details and lock the row
        const auctionQuery = await db.query(`
            SELECT a.*, fa.min_increment
            FROM auctions a
            JOIN forward_auctions fa ON a.auction_id = fa.auction_id
            WHERE a.auction_id = $1 AND a.winner_id IS NULL
            FOR UPDATE
        `, [auction_id]);

        //console.log(auctionQuery)
        
        if (!auctionQuery.rows.length) {
            throw new Error("Auction not found or not active");
        }

        const auction = auctionQuery.rows[0];
        
        if (auction.auction_type !== 'FORWARD') {
            throw new Error("Not a forward auction");
        }

        // Check if auction has ended
        if (new Date(auction.end_time) < new Date()) {
            throw new Error("Auction has ended");
        }

        const minValidBid = auction.current_price + auction.min_increment;
        if (amount < minValidBid) {
            throw new Error(`Bid too low. Minimum bid required: $${minValidBid}`);
        }

        // Insert a new bid
        await db.query(`
            INSERT INTO bids (auction_id, bidder_id, amount)
            VALUES ($1, $2, $3)
        `, [auction_id, bidder_id, amount]);

        // Update current price to new price
        await db.query(`
            UPDATE auctions 
            SET current_price = $1
            WHERE auction_id = $2
        `, [amount, auction_id]);

        await db.query('COMMIT');
        res.json({ 
            message: "Bid accepted!",
            current_price: amount
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Bid error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Dutch Auction Buy Now - SIMPLIFIED
router.post('/buy', async(req, res) => {
    const { auction_id, buyer_id, accepted_price } = req.body;

    if (!buyer_id) {
        return res.status(400).json({ error: 'buyer_id is required' });
    }

    try {
        await db.query('BEGIN');

        //get all the dutch querys
        const auctionQuery = await db.query(`
            SELECT a.*, da.price_drop_step, da.step_interval_sec
            FROM auctions a
            JOIN dutch_auctions da ON a.auction_id = da.auction_id
            WHERE a.auction_id = $1 AND a.winner_id IS NULL
            FOR UPDATE
        `, [auction_id]);

        if (!auctionQuery.rows.length) {
            throw new Error("Auction not found or not active");
        }

        const auction = auctionQuery.rows[0];

        if (auction.auction_type !== 'DUTCH') {
            throw new Error("Not a dutch auction");
        }

        // Check if auction has ended
        if (new Date(auction.end_time) < new Date()) {
            throw new Error("Auction has ended");
        }

        // Record the acceptance with accepted = true
        await db.query(`
            INSERT INTO dutch_accepts (auction_id, buyer_id, accepted_price, accepted)
            VALUES ($1, $2, $3, true)
        `, [auction_id, buyer_id, accepted_price]);

        const accept = true
        //If the buyer accpets the order and confirms it then, item is purchased
        if(accept){
            await db.query(`
                UPDATE auctions
                SET winner_id = $1
                WHERE auction_id = $2
            `, [buyer_id, auction_id]);
            
            await db.query('COMMIT');
            res.json({
                message: "Purchase successful!",
                price: auction.current_price
            });
        // If the buyer doesnt accept the order then goes to next buyer.
        }else{
            const nextBuyerQ = await db.query(`
              SELECT da.buyer_id, u.username
                FROM dutch_accepts da
                JOIN users u ON da.buyer_id = u.user_id
                WHERE da.auction_id = $1
                AND da.accepted_price > $2
                AND da.buyer_id NOT IN(
                    SELECT buyer_id
                    FROM dutch_accepts
                    WHERE auction_id = $1
                    AND accepted = false    
                )
                ORDER BY da.accepted_price DESC
                LIMIT 1
                `, [auction_id, auction.current_price - auction.price_drop_step]);
                
                
                if(nextBuyerQ.rows.length > 0){
                    await db.query('COMMIT');
                    res.json({
                        message: "You've opted-out this buy. Next Buyer Notified",
                        next_buyer: nextBuyerQ.rows[0].username,
                        current_price: auction.current_price
                    });
                }else{
                    await db.query(`
                        UPDATE auctions
                        SET current_price = current_price - $1
                        WHERE auction_id = $2
                        `, [auction.price_drop_step, auction_id]);
                        
                        await db.query('COMMIT');
                        res.json({
                            message: "Price has Dropped. Waiting for new buyer",
                            new_price: auction.current_price - auction.price_drop_step
                        })
                    }
        }
    
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Buy error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Create new auction
router.post('/create', async (req, res) => {
    try {
        const {
            item_id,
            seller_id,
            auction_type,
            start_price,
            current_price,
            end_time,
            reserve_price,
            price_drop_step,
            step_interval_sec,
            shipping_price,
            expedited_price,
            shipping_days
        } = req.body;

        console.log("ENDING", end_time)
        console.log('Creating auction:', req.body); // Debug

        if (!item_id || !seller_id || !auction_type || !start_price || !end_time) {
            return res.status(400).json({ 
                error: 'item_id, seller_id, auction_type, start_price, and end_time are required' 
            });
        }

        await db.query('BEGIN');

        // Insert auction
        const auctionResult = await db.query(
            `INSERT INTO auctions (
                item_id, seller_id, auction_type, start_price, current_price, 
                end_time, shipping_price, expedited_price, shipping_days
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                item_id, 
                seller_id, 
                auction_type, 
                start_price, 
                current_price || start_price, 
                end_time,
                shipping_price || 10,
                expedited_price || 15,
                shipping_days || 5
            ]
        );

        const auction = auctionResult.rows[0];

        console.log('Auction created:', auction); // Debug

        // Insert type-specific data
        if (auction_type === 'FORWARD') {
            await db.query(
                `INSERT INTO forward_auctions (auction_id, min_increment, reserve_price) 
                 VALUES ($1, $2, $3)`,
                [auction.auction_id, 10, reserve_price || start_price]
            );
        } else if (auction_type === 'DUTCH') {
            await db.query(
                `INSERT INTO dutch_auctions (auction_id, price_drop_step, step_interval_sec, reserve_price) 
                 VALUES ($1, $2, $3, $4)`,
                [auction.auction_id, price_drop_step || 10, step_interval_sec || 60, reserve_price]
            );
        }

        await db.query('COMMIT');

        res.status(201).json(auction);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Create auction error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Winner declines forward auction → offer to next highest bidder or clear winner
router.post("/decline", async (req, res) => {
    const { auction_id, user_id} = req.body;
  
    try {
        // 1) Load auction info (to get type + start_price + end_time)
        const aRes = await db.query(
          `
          SELECT auction_type, start_price, end_time
          FROM auctions
          WHERE auction_id = $1
          `,
          [auction_id]
        );
    
        if (aRes.rowCount === 0) {
          return res.status(404).json({ error: "Auction not found" });
        }
    
        const auction = aRes.rows[0];
    
        if (auction.auction_type !== "FORWARD") {
          return res
            .status(400)
            .json({ error: "Decline is only supported for forward auctions." });
        }
    
        // Optional: require that the auction has already ended
        const now = new Date();
        const endTime = new Date(auction.end_time);
        if (now < endTime) {
          return res
            .status(400)
            .json({ error: "Auction has not ended yet; cannot decline." });
        }
    
        // 2) Get all bids for this auction, highest first
        const bidsRes = await db.query(
          `
          SELECT b.bid_id,
                 b.bidder_id,
                 b.amount,
                 b.created_at,
                 u.username
          FROM bids b
          JOIN users u ON u.user_id = b.bidder_id
          WHERE b.auction_id = $1
          ORDER BY b.amount DESC, b.created_at ASC
          `,
          [auction_id]
        );
    
        if (bidsRes.rowCount === 0) {
          // No bids at all → nothing to decline, just ensure price is at start_price
          await db.query(
            `
            UPDATE auctions
            SET current_price = start_price
            WHERE auction_id = $1
            `,
            [auction_id]
          );
    
          return res.json({
            message:
              "There were no bids to decline. Auction remains with no bids and start price.",
            new_highest_bidder: null,
            new_price: auction.start_price,
          });
        }
    
        const topBid = bidsRes.rows[0];
    
        // 3) Only the current highest bidder can decline
        if (topBid.bidder_id !== Number(user_id)) {
          return res.status(403).json({
            error: "Only the current highest bidder can decline this auction.",
          });
        }
    
        // 4) Delete all bids from this highest bidder for this auction
        await db.query(
          `
          DELETE FROM bids
          WHERE auction_id = $1
            AND bidder_id = $2
          `,
          [auction_id, user_id]
        );
    
        // 5) Recalculate highest bid after deletion
        const newBidsRes = await db.query(
          `
          SELECT b.bid_id,
                 b.bidder_id,
                 b.amount,
                 b.created_at,
                 u.username
          FROM bids b
          JOIN users u ON u.user_id = b.bidder_id
          WHERE b.auction_id = $1
          ORDER BY b.amount DESC, b.created_at ASC
          `,
          [auction_id]
        );
    
        if (newBidsRes.rowCount === 0) {
          // No more bids left → set price back to start and no effective winner
          await db.query(
            `
            UPDATE auctions
            SET current_price = start_price
            WHERE auction_id = $1
            `,
            [auction_id]
          );
    
          return res.json({
            message:
              "You declined and there are no other bids. Auction now has no highest bidder.",
            new_highest_bidder: null,
            new_price: auction.start_price,
          });
        }
    
        const newTop = newBidsRes.rows[0];
    
        // 6) Update auction current_price to the new highest bid
        await db.query(
          `
          UPDATE auctions
          SET current_price = $1
          WHERE auction_id = $2
          `,
          [newTop.amount, auction_id]
        );
    
        return res.json({
          message: `You declined. The auction is now led by ${newTop.username} at ${newTop.amount}.`,
          new_highest_bidder: newTop.username,
          new_price: newTop.amount,
        });
      } catch (err) {
        console.error("Auction Decline Error:", err);
        res.status(500).json({ error: err.message });
      }
});
    
  

export default router;