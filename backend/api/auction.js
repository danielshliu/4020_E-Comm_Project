import express from 'express';
import db from '../db.js';

const router = express.Router();
router.use(express.json());

// get all the active auction listings
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM "Item" WHERE status = 'active' ORDER BY "endTime" ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//get the items details
router.get('/:itemID', async(req,res) =>{
    const{itemID} = req.params;
    try{
        const itemQuery = await db.query(
            'SELECT * FROM "Item" WHERE itemID = $1', [itemID]
        );

        const bidsQuery = await db.query(
            'SELECT * FROM "Bid" WHERE itemID = $1 ORDER BY amount DESC',[itemID]
        );

        res.json({
            item:itemQuery.rows[0],
            bids: bidsQuery.rows
        });
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

//Forward Auction Bidding: User must bid higher than current price
router.get('/bid',async(req,res) =>{
    const{itemID, amount} = req.body;
    const userID=1; //This will be replaced with the real userID
    
    try{
        await db.query('BEGIN')
        
        const itemQuery = await db.query(
            'SELECT currentPrice, auctionType FROM "Item" WHERE itemID = $1 AND status = `active`',
            [itemID]
        );

        if(!itemQuery.row.length) throw new Error("Auction not active");

        const{currentPrice, auctiontype} = itemQuery.rows[0];

        if(auctiontype !== 'forward') throw new Error("Not Forward Auction Type!");
        
        if(amount <= currentPrice) throw new Error("Bid too low!");

        await db.query(
            'UPDATe "Item" '
        )


    }catch(err){
        await db.query('ROLLBACK');
        res.status(400).json({error: err.message});
    }

});



export default router;