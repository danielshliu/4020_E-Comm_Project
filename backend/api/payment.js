import express from "express";
import dotenv from "dotenv";
import db from '../db.js';

dotenv.config();

const router = express();
router.use(express.json());


router.post('/pay', async (req, res) => {
    try{
        const { auction_id, payer_id, shipping_address, expedited} = req.body;

        const auctionResult = await db.query(
            `SELECT current_price, shipping_price, expedited_price FROM auctions WHERE auction_id = $1`,
            [auction_id]
        );

        if (auctionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        const auction = auctionResult.rows[0];
        const totalAmount = auction.current_price + auction.shipping_price + (expedited ? auction.expedited_price : 0);

        const result = await db.query(
           `INSERT INTO payments(auction_id, payer_id, shipping_address, expedited, payment_status)
           VALUES($1, $2, $3, $4, 'COMPLETED')
           RETURNING *`,
           [auction_id, payer_id, shipping_address, expedited || false]
        );

        await db.query(
            `
            UPDATE auctions
            SET winner_id = $1
            WHERE auction_id = $2
            `,
            [payer_id, auction_id]
          );

        res.status(201).json({
            message: "Payment successful",
            payment: result.rows[0],
            total: totalAmount
        });
        

    } catch(err){
        console.log("Payment API error", err);
        res.status(500).json({error: err.message});
    }
});

router.get('/receipt/:auction_id', async (req, res) => {
    try {
        const { auction_id } = req.params;

        const result = await db.query(
            `SELECT 
                p.payment_id,
                p.auction_id,
                p.shipping_address,
                p.expedited,
                p.created_at,
                u.username as payer_username,
                i.title,
                a.current_price + a.shipping_price + (CASE WHEN p.expedited THEN a.expedited_price ELSE 0 END) as total_paid,
                a.shipping_days
            FROM payments p
            JOIN users u ON p.payer_id = u.user_id
            JOIN auctions a ON p.auction_id = a.auction_id
            JOIN items i ON a.item_id = i.item_id
            WHERE p.auction_id = $1
            ORDER BY p.created_at DESC
            LIMIT 1`,
            [auction_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get receipt error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;