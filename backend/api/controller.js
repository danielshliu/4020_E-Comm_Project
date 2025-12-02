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
        
        if (!response.ok) {
            throw new Error('Failed to fetch from auction service');
        }
        
        const data = await response.json();
        
        console.log('Controller returning auctions:', data); // Debug log
        res.json(data);
    }catch(err){
        console.error('Controller Auction Error:', err);
        res.status(500).json({error: err.message}); // Fixed this line
    }
});

//done
router.get("/auction/:auction_id", async(req, res) => {
    try {
        const { auction_id } = req.params;
        
        const response = await fetch(`${AUCTION_SERVICE_URL}/${auction_id}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch(err) {
        console.error('Controller Get Auction Error:', err);
        res.status(500).json({error: err.message});
    }
});
//done
// Buy now - FIX: Get auction_id from body
router.post("/auction/buy", async(req, res) => {
    try {
        const { auction_id, buyer_id, accepted_price } = req.body;
        
        if (!auction_id) {
            return res.status(400).json({ error: 'auction_id is required' });
        }

        console.log('Controller forwarding buy to:', `${AUCTION_SERVICE_URL}/${auction_id}/buy`);
        
        const response = await fetch(`${AUCTION_SERVICE_URL}/${auction_id}/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyer_id, accepted_price })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch(err) {
        console.error('Controller Buy Error:', err);
        res.status(500).json({ error: err.message });
    }
});

//done
// Place bid - FIX: Get auction_id from body and put in URL
router.post("/auction/bid", async(req, res) => {
    try {
        const { auction_id, bidder_id, amount } = req.body;
        
        if (!auction_id) {
            return res.status(400).json({ error: 'auction_id is required' });
        }

        console.log('Controller forwarding bid to:', `${AUCTION_SERVICE_URL}/${auction_id}/bid`);
        
        const response = await fetch(`${AUCTION_SERVICE_URL}/${auction_id}/bid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidder_id, amount })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch(err) {
        console.error('Controller Bid Error:', err);
        res.status(500).json({ error: err.message });
    }
});


//catalogue services
//done
router.get('/catalogue', async (req, res) => {
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
router.post('/catalogue/createItem', async (req, res) => {
    try {
        console.log('Controller creating item:', req.body); // Debug
        
        const response = await fetch(`${CATALOGUE_SERVICE_URL}/createItems`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        console.log('Catalogue response:', { status: response.status, data }); // Debug
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
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
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(req.body)
        });
    
        const data = await response.json();
        
        if (!response.ok) {
          return res.status(response.status).json(data);
        }
        
        res.status(201).json(data);
      } catch(err) {
        console.error('Controller Payment Error:', err);
        res.status(500).json({error: err.message});
      }
});

// Payment service routes
router.post("/payment/pay", async(req, res) => {
    try {
        const response = await fetch(`${PAYMENT_SERVICE_URL}/pay`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.status(201).json(data);
    } catch(err) {
        console.error('Controller Payment Error:', err);
        res.status(500).json({error: err.message});
    }
});

router.get("/payment/receipt/:auction_id", async(req, res) => {
    try {
        const { auction_id } = req.params;
        
        const response = await fetch(`${PAYMENT_SERVICE_URL}/receipt/${auction_id}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch(err) {
        console.error('Controller Receipt Error:', err);
        res.status(500).json({error: err.message});
    }
});

//user service
router.post('/user/signup', async(req, res) => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.status(201).json(data);
    } catch(err) {
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

// ADD THIS: Create auction route
router.post('/auction/create', async (req, res) => {
    try {
        console.log('Controller creating auction:', req.body); // Debug
        
        const response = await fetch(`${AUCTION_SERVICE_URL}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        console.log('Auction create response:', { status: response.status, data }); // Debug
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.status(201).json(data);
    } catch (err) {
        console.error('Controller Create Auction Error:', err);
        res.status(500).json({ error: 'Failed to create auction', details: err.message });
    }
});

// DECLINE forward auction winner
router.post("/auction/decline", async (req, res) => {
    try {
        const { auction_id, user_id } = req.body;
    
        if (!auction_id || !user_id) {
          return res
            .status(400)
            .json({ error: "auction_id and user_id are required" });
        }
    
        const response = await fetch(`${AUCTION_SERVICE_URL}/${auction_id}/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          return res.status(response.status).json(data);
        }
    
        res.json(data);
      } catch (err) {
        console.error("Controller Decline Error:", err);
        res.status(500).json({ error: err.message });
      }
});


export default router;
