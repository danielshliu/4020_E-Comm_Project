import express from 'express';
import dotenv from 'dotenv';
import db from './db.js';
import auctionAPI from './api/auction.js';
import facadeController from './api/controller.js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT

app.use(express.json());

// check db is okay and connected
app.get('/health', async (req, res) => {
	try {
		const result = await db.query('SELECT 1 AS ok');
		res.json({ db: !!result, ok: true });
	} catch (err) {
		console.error('Check DB error:', err.message);
		res.status(500).json({ ok: false, error: err.message });
	}
});

// temp controller API router

app.use('/api/auction', auctionAPI);

app.use('/api/controller', facadeController);

// the default route//check if working
app.get('/', (req, res) => res.json({ message: 'Backend running' }));

// START THE SERVER MY FRIENDS!!!
app.listen(PORT, () => {
	console.log(`Server on port ${PORT}`);
});
