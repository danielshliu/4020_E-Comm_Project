import { Client } from 'pg';

import dotenv from 'dotenv';

dotenv.config();
const dbClient = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

dbClient
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error:", err.stack));


//  // Example Query 
// dbClient.query("SELECT * FROM users", (err, res)=>{
//     if (!err){
//         console.log(res.rows)
//     } else{
//         console.log(err.message)
//     }

//     dbClient.end
// })

export default dbClient;