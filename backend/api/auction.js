import express from 'express';
import db from '../db.js';

const router = express.Router();
router.use(express.json());

// Get all active auction listings
router.get('/', async (req, res) => {

    try {
        //query all the live active auction in listings
        const result = await db.query(`
            SELECT a.*, i.title, i.description, i.image_url 
            FROM auctions a
            JOIN items i ON a.item_id = i.item_id
            WHERE a.winner_id IS NULL
            ORDER BY a.end_time ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get specfic auction details with item info and bids
router.get('/:auction_id', async(req, res) => {
    const { auction_id } = req.params;
    try {
        // Get auction and item details for the specific
        const auctionQuery = await db.query(`
            SELECT a.*, i.title, i.description, i.image_url,
                   u.username as seller_username
            FROM auctions a
            JOIN items i ON a.item_id = i.item_id
            JOIN users u ON a.seller_id = u.user_id
            WHERE a.auction_id = $1
        `, [auction_id]);

        // Get bids if it's a forward auction
        const bidsQuery = await db.query(`
            SELECT b.*, u.username as bidder_username
            FROM bids b
            JOIN users u ON b.bidder_id = u.user_id
            WHERE b.auction_id = $1
            ORDER BY b.amount DESC
        `, [auction_id]);

        res.json({
            auction: auctionQuery.rows[0],
            bids: bidsQuery.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Forward Auction Bidding
router.post('/bid', async(req, res) => {
    const { auction_id, amount } = req.body;
    const bidder_id = 1; // This will be replaced with the real user_id
    
    try {
        await db.query('BEGIN');
        
        // Get auction details and lock the row
        const auctionQuery = await db.query(`
            SELECT a.*, fa.min_increment
            FROM auctions a
            JOIN forward_auctions fa ON a.auction_id = fa.auction_id
            WHERE a.auction_id = $1 AND a.winner_id IS NULL
            FOR UPDATE
        `, [auction_id]);

        
        if (!auctionQuery.rows.length) {
            throw new Error("Auction not found or not active");
        }

        const auction = auctionQuery.rows[0];
        
        if (auction.auction_type !== 'FORWARD') {
            throw new Error("Not a forward auction");
        }

        const minValidBid = auction.current_price + auction.min_increment;
        if (amount < minValidBid) {
            throw new Error(`Bid too low. Minimum bid required: ${minValidBid}`);
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
        res.status(400).json({ error: err.message });
    }
});

// Dutch Auction Accept Price
router.post('/buy', async(req, res) => {
    const { auction_id, accept } = req.body;
    const buyer_id = 1; // This will be replaced with the real user_id

    try {
        await db.query('BEGIN');

        //get all the dtuch querys
        const auctionQuery = await db.query(`
            SELECT a.*
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

        // Record the acceptance
        await db.query(`
            INSERT INTO dutch_accepts (auction_id, buyer_id, accepted_price)
            VALUES ($1, $2, $3)
        `, [auction_id, buyer_id, auction.current_price]);


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
        }

        
        if(nextBuyerQ.row.length > 0){
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
    
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    }
});

export default router;