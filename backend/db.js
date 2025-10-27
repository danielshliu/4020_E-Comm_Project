const {Client} = require('pg')
require("dotenv").config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error:", err.stack));


 // Example Query 
client.query("SELECT * FROM users", (err, res)=>{
    if (!err){
        console.log(res.rows)
    } else{
        console.log(err.message)
    }

    client.end
})