import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express();
router.use(express.json());

//Transpoder for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  },

  // debug: true,
  // logger: true
})

//DEBUGGING PURPOSES: TO MAKE SURE THE TRANSPORTER EMAIL THING WAS CONNNECTED 
// AND WOKRING

// transporter.verify(function(error, success) {
//   if (error) {
//     console.log('SMTP Error:', error);
//   } else {
//     console.log('SMTP server is ready to take our messages');
//   }
// });


//Sign up POST function
router.post('/signup',async(req, res)=>{
  try{
    const{username, password, email, firstName, lastName, street, number, city, country, postal} = req.body;

    //hash the password
    const password_hash = await bcrypt.hash(password,10);

    const address = `${street} ${number}, ${city}, ${country}, ${postal}`;
    const result = await db.query(
      `INSERT INTO users (username,password_hash,email, first_name, last_name, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, username, email`,
      [username,password_hash,email, firstName,lastName,address]
    );

  
    res.status(201).json(result.rows[0]);

  }catch(err){
    console.error('Signup error:', err);
    res.status(500).json({error: err.message});
  }
})


//Sign in POST function
router.post('/signin',async(req,res)=>{
  try{
    const{username, password} = req.body;

    // console.log('Signin attempt for email:', email);

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const user = result.rows[0];

    //Check User
    if(!user){
      return res.status(401).json({error: 'Login incorrect'});
    }

    //Check Password
    const checkPassword = await bcrypt.compare(password, user.password_hash);
    if(!checkPassword){
      return res.status(401).json({error: 'Login incorrect'})
    }

    res.json({user_id: user.user_id, username: user.username});

  }catch(err){
    console.error('Signin error:', err);
    res.status(500).json({error: err.message});
  }
});

//Forget the password POST function
router.post('/forgetpassword', async(req,res)=>{
  try{
    const {email} = req.body

    //yeah i did not know how to do this but okay cool thanks
    const resetCode = Math.floor(10000 + Math.random()*900000);
    const resetCodeExpires = new Date(Date.now()+3600000);

    // console.log("ResetCode is:",resetCode);

    const result = await db.query(
      `UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE email = $3
      RETURNING user_id`,
      [resetCode.toString(), resetCodeExpires, email]
    );

    if(result.rows.length === 0){
      return res.status(404).json({error: 'Email not found!'});
    }

    //send resetCode
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}. This code will expire in 1 hour`
    });
    
    //Code sent!
    res.json({
      message: 'Reset Code sent to email',
      email: email
    });

  }catch(err){
    console.error('Forgot pass error', err);
    res.status(500).json({error: err.message});
  }
});

//this part is after forgetpass after u get the code
//Reset POST function
router.post('/resetpassword', async(req,res)=>{
  try{
    const {email, resetCode, newPassword} = req.body;

    const result = await db.query(
      `SELECT user_id FROM users
      WHERE email = $1
      AND reset_token = $2
      AND reset_token_expires > NOW()`,
      [email, resetCode]
    );

    if(result.rows.length === 0){
      return res.status(400).json({error: 'error code bad'});
    }

    //newPassword hashed.

    const password_hash = await bcrypt.hash(newPassword,10);
    await db.query(
      `UPDATE users
      SET password_hash = $1,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE user_id = $2`,
      [password_hash, result.rows[0].user_id]
    );

    res.json({message: 'Password Resetted'});

  }catch(err){
    console.error('Reset Pass Err', err);
    res.status(500).json({error: err.message});
  }
});

export default router;
