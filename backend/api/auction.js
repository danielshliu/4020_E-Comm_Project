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
        res.status(500).json("Controlelr API Working");
        
        //res.status(500).json({ error: err.message });
    }
});

//get the items details
router.get('/:itemID', async(req,res) =>{
    const{itemID} = req.params;
    try{
        const itemQuery = await db.query(
            'SELECT * FROM "Item" WHERE itemID = $1', 
            [itemID]
        );

        const bidsQuery = await db.query(
            'SELECT * FROM "Bid" WHERE itemID = $1 ORDER BY amount DESC',
            [itemID]
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
router.post('/bid',async(req,res) =>{
    const{itemID, amount} = req.body;
    const userID=1; //This will be replaced with the real userID
    
    try{
        await db.query('BEGIN')
        
        //get active auctions price and forward
        const itemQuery = await db.query(
            'SELECT currentPrice, auctionType FROM "Item" WHERE itemID = $1 AND status = `active`',
            [itemID]
        );

        if(!itemQuery.row.length) throw new Error("Auction not active");

        const{currentPrice, auctionType} = itemQuery.rows[0];

        if(auctionType !== 'forward') throw new Error("Not Forward Auction Type!");
        
        if(amount <= currentPrice) throw new Error("Bid too low!");

        //new bid to bid table
        await db.query(
            'UPDATE  INTO "Bid"(itemID, userID, amount) VALUES ($1, $2, $3)', 
            [itemID, userID, amount]
        );

        //update new price to Item table
        await db.query(
            'UPDATE "Item" SET currentPrice = $1 WHERE itemID = $2', 
            [amount, itemID]
        );

        await db.query('COMMIT');
        res.json({message: "Bid Accepted!"});

    }catch(err){
        await db.query('ROLLBACK');
        res.status(400).json({error: err.message});
    }

});


//Dutch Auction Bidding: Buy instantly at the current price
router.post('/buy', async(req,res) =>{
    const {itemID} = req.body;
    const userID = 1; //temp will be replaced with real userID

    try{
        await db.query('BEGIN');

        //get active action and dutch type
        const itemQuery = await db.query(
            'SELECT "currentPrice", "auctionType" FROM "Item" WHERE itemID = $1 AND status = `active`',
            [itemID]
        );

        if(!itemQuery.rows.length) throw new Error("Auction not active");

        const {currentprice, auctionType} = itemQuery.rows[0];

        if(auctionType !== 'dutch') throw new Error("Not Dutch Auction Type!");

        //update to item sold and who bought it
        await db.query(
            'UPDATE "Item" SET status = $1, buyerID = $2 WHERE itemID = $3',
            ['sold',userID, itemID]
        );

        //update the DB
        await db.query('COMMIT');
        res.json({
            message: "Item Purchased!",
            price: currentPrice,
        });
    }catch(err){
        await db.query('ROLLBACK');
        res.status(400).jsono({error: err.message});
    }
    
});


export default router;