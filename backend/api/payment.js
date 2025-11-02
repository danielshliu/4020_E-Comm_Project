import express from "express";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const payer_id = 1 //temp...
const auction_id = 2 //temp...

app.post("/pay", async (req, res) => {
    try{
        const { auction_id, payer_id, amount_due, payment_method } = req.body;

        const result = await pool.query(
            `INSERT INTO payments (auction_id, payer_id)
            VALUES (`+payer_id+ "," + auction_id +`)`
        )

        res.json({
        message: "Payment successful",});
    } catch{
        res.json({
            message: "Payment failed",})
    }}
);