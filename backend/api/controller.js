import express from 'express';
import fetch from 'node-fetch';

const router  = express.Router();
router.use(express.json());

const AUCTION_SERVICE_URL = "http://localhost:3001/api/auction";
const CATALOGUE_SERVICE_URL = "http://localhost:3002/api/catalogue";
const PAYMENT_SERVICE_URL = "http://localhost:3003/api/payment";
const USER_SERVICE_URL = "http://localhost:3004/api/user";


//auction service
router.get("/auction", async(req,res) => {
    try{
        const response = await fetch(AUCTION_SERVICE_URL);
        const data = await response.json();

        res.json(data);
    }catch(err){
        res.status(500).json("Auction Error", {error: err.message});
    }
});

router.post("/auction/bid", async(req,res) =>{
    try{
        const response = await fetch(`${AUCTION_SERVICE_URL}/bid`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    }catch(err){
        res.status(500).json("Auction Bidding Error", {error: err.messsage});
    }
});

router.post("/auction/buy", async(req,res)=>{
    try{
        const response = await fetch(`${AUCTION_SERVICE_URL}/buy`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        //check if the purchased went through
        if(!response.ok) throw new Error(data.error || 'Failed to process purchaase');
    
        res.json({
            message: 'Purchase Successfull',
            transaction: data
        });
    }catch(err){
        res.status(500).json("Auction Purchase Error", {error: err.messsage});
    }
});

//catalogue services

router.get('/items', async (req, res) => {
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/items`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to fetch items', details: err.message });
    }
});

//ITEM:ID
router.get('/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/items/${id}`);
        const data = await response.json();
        if (!data) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to fetch item', details: err.message });
    }
});

// SEARCH
router.get('/search', async (req, res) => {
    const { keyword } = req.query;
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/search?keyword=${keyword}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to search items', details: err.message });
    }
});

//CREATE ITEM
router.post('/items', async (req, res) => {
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(201).json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to create item', details: err.message });
    }
});

//UPDATE ITEM PRICE
router.put('/items/:id/price', async (req, res) => {
    const { id } = req.params;
    const { new_price } = req.body;
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/items/${id}/price`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_price })
        });
        const data = await response.json();
        if (!data) {
            return res.status(404).json({ error: 'Item not found or not a Dutch auction' });
        }
        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to update item price', details: err.message });
    }
});

//BRO IM WATCHING THE FUCKING BLUE JAYS GAME ITS 2:12 AM AND ITS THE BEGINNIG OF THE 17TH INNING IM GONNA DIE
//payment service
router.post('/payments/process', async (req, res) => {
    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json(handleServiceError(error, 'Payment'));
    }
});





//user service
router.get('/users/:id', async (req, res) => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/${req.params.id}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json(handleServiceError(error, 'User'));
    }
});




export default router;
