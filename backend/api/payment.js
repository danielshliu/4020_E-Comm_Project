import express from "express";
import dotenv from "dotenv";
import db from '../db.js';

dotenv.config();

const router = express();
router.use(express.json());


router.post('/pay', async (req, res) => {
    try{
        const { auction_id, payer_id, shipping_address} = req.body;

        const result = await db.query(
           `INSERT INTO payments(auction_id, payer_id, shipping_address)
           VALUES($1, $2, $3)
           RETURNING *`,
           [auction_id,payer_id,shipping_address]
        );

        res.status(201).json({
            message: "Payment successful",
            payment: result.rows[0]
        });

    } catch(err){
        console.log("Payment API error", err);
        res.status(500).json({error: err.message});
    }
});

export default router;