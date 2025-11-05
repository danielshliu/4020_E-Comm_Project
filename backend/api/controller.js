import express from 'express';
import fetch from 'node-fetch';

const router  = express.Router();
router.use(express.json());

const AUCTION_SERVICE_URL = "http://localhost:3001/api/auction";
const CATALOGUE_SERVICE_URL = "http://localhost:3001/api/catalogue";
const PAYMENT_SERVICE_URL = "http://localhost:3001/api/payment";
const USER_SERVICE_URL = "http://localhost:3001/api/user";


//auction service
//done
router.get("/auction", async(req,res) => {
    try{
        const response = await fetch(AUCTION_SERVICE_URL);
        const data = await response.json();

        res.json(data);
    }catch(err){
        res.status(500).json("Auction Error", {error: err.message});
    }
});

//done
router.get("/auction/:auction_id", async(req, res) => {
    try {
        const response = await fetch(`${AUCTION_SERVICE_URL}/${req.params.auction_id}`);
        if (!response.ok) {
            throw new Error('Auction not found');
        }
        const data = await response.json();
        res.json(data);
    } catch(err) {
        console.error('Controller Error:', err);
        res.status(500).json({ error: err.message });
    }
});
//done
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

//done
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


//catalogue services
//done
router.get('/catalouge', async (req, res) => {
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}`);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to fetch items', details: err.message });
    }
});



// SEARCH
//done
router.get('/catalogue/search', async (req, res) => {

    
    try {
        console.log('Query parameters:', req.query);


        const keyword  = String(req.query.keyword).trim();
        
        console.log('Controller searching for:', keyword);

        const response = await fetch(
            `${CATALOGUE_SERVICE_URL}/search?keyword=${encodeURIComponent(keyword)}`);
        
        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to search items', details: err.message });
    }
});


//CREATE ITEM
//done
router.post('/catalogue/createItems', async (req, res) => {
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

//ITEM:ID
//done
router.get('/catalogue/:item_id', async (req, res) => {

    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/${req.params.item_id}`);
        const data = await response.json();
        if (!data) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log("Results:", data);
        res.json(data);
    } catch (err) {
        console.error('Catalogue Service Error:', err);
        res.status(500).json({ error: 'Failed to fetch item', details: err.message });
    }
});

//UPDATE ITEM PRICE
router.put('/catalogue/:item_id/price', async (req, res) => {
    const { item_id } = req.params;
    const { new_price } = req.body;
    try {
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/${item_id}/price`, {
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
router.post('/payments/pay', async (req, res) => {
    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/pay`, {
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
router.post('/user/signup',async(req,res)=>{
    try{
        const response = await fetch(`${USER_SERVICE_URL}/signup`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        res.status(201).json(data);
    }catch(err){
        console.error('Controller Signup Error:', err);
        res.status(500).json({error: err.message});
    }
});

router.post('/user/signin', async (req, res) => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Signin failed');
        }

        res.json(data);
    } catch (err) {
        console.error('Controller Signin Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/user/forgetpassword', async (req, res) => {
    try {

        console.log('Forget password request:', req.body); 

        const response = await fetch(`${USER_SERVICE_URL}/forgetpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Password reset request failed');
        }

          console.log('Forget password response:', data); 

        res.json(data);
    } catch (err) {
        console.error('Controller Forget Password Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/user/resetpassword', async (req, res) => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/resetpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Password reset failed');
        }

        res.json(data);
    } catch (err) {
        console.error('Controller Reset Password Error:', err);
        res.status(500).json({ error: err.message });
    }
});




export default router;
