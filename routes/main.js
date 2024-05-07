const express = require('express');
const userModel = require('../models/userModel');
const foodModel = require('../models/foodModel');
const orderModel=require('../models/orederdfood');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = require('../multer');
const nodemailer = require("nodemailer");
const { response } = require('..');
// const redis=require('ioredis');
// const client = redis.createClient({
//     url: 'redis://red-coqu3tvsc6pc73dg5s30:6379', // Your Redis URL
// });
const axios = require('axios');
const uniqid=require('uniqid');
const secret = 'aaraav';
const router = express.Router();

const cloudinary=require('cloudinary').v2;

cloudinary.config({
    cloud_name:'dduprrzmb',
    api_key:'752366272453693',
    api_secret:'0W8EckvDgjyrI04JHQdxZn9KHEs'
})

// const merchantid='PGTESTPAYUAT';
// const phonepa_url='https://api-preprod.phonepe.com/apis/pg-sandbox';
// const key='099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';

// router.get('/pay',(req,res)=>{
//     const endpoint='/pg/v1/pay';
// const un=uniqid();
//     const payload={
//         "merchantId": "PGTESTPAYUAT",
//         "merchantTransactionId": un,
//         "merchantUserId": "MUID123",
//         "amount": 10000,
//         "redirectUrl": "https://webhook.site/redirect-url",
//         "redirectMode": "REDIRECT",
//         "callbackUrl": "https://webhook.site/callback-url",
//         "mobileNumber": "9999999999",
//         "paymentInstrument": {
//           "type": "PAY_PAGE"
//         }
//       };

// const options = {
//   method: 'post',
//   url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//   headers: {
//         accept: 'text/plain',
//         'Content-Type': 'application/json',
// 				},
// data: {
// }
// };
// axios
//   .request(options)
//       .then(function (response) {
//       console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });
// })

router.get('/signup', function(req, res) {
   res.send('Signup');
});

router.post('/set-status', async function (req, res) {
    const { status, username,id } = req.body;

    // Validate the status input
    const allowedStatuses = ['Fulfilled', 'Pending', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).send('Invalid status value');
    }

    try {
        // Find the user in the database
        const user = await userModel.findOne({ username });

        // Check if user is found
        if (!user) {
            return res.status(404).send('User not found');
        }
const order=await orderModel.findByIdAndUpdate(id);
        // Update the user's status
        order.status = status;
        await order.save();

        // Send success response
        res.send('Status updated successfully');
    } catch (error) {
        // Handle any errors that may occur
        console.error('Error updating user status:', error);
        res.status(500).send('Failed to update status');
    }
});

router.get('/getorder/:id',async(req,res)=>{
    const id=req.params.id;

    const order=await orderModel.findById(id);

   return res.json(order);
})

router.get('/getorder', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;

        // Find the user with the given username
        const user = await userModel.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find orders associated with the user's ID
        const orders = await orderModel.find({ user: user._id });

        return res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching orders' });
    }
});

router.get('/getorder/:username', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;
        const x=req.params.username;

        // Find the user with the given username
        const user = await userModel.findOne({ username: x });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find orders associated with the user's ID
        const orders = await orderModel.find({ user: user._id });

        return res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching orders' });
    }
});




router.get('/sendmail',verifyToken,async function(req,res){

    const username = req.user.username;
const user=await userModel.findOne({username});
const otp= Math.floor(Math.random() * 900000) + 100000;

    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service:'gmail',
        secure:true,
        port: 465,
        auth: {
          user: "aaraav2810@gmail.com"          ,
          pass: "qwco rlue iunw ryak",
        },
        tls: {
            rejectUnauthorized: false // Not recommended for production
        }
      });

      const info = await transporter.sendMail({
        from: 'aaraav2810@gmail.com', // sender address
        to: `michaelmuthuraj@gmail.com,aaraav10@gmail.com,${user.email}`, // list of receivers
        subject: "food order confirmation", // Subject line
        text: `Your OTP for food confirmation is ${otp}`, // plain text body
       
      });
   
        transporter.sendMail(info,(e,email)=>{
            if(e) throw e;
            console.log('success');
            console.log(email);
            res.json(email);
                        
          })

          return res.json(otp);

    
    
})

router


router.post('/signup', async function(req, res) {
    const { username, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new userModel({
        username: username,
        email: email,
        password: hashedPassword
    });
    const otp= Math.floor(Math.random() * 900000) + 100000;

    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service:'gmail',
        secure:true,
        port: 465,
        auth: {
          user: "aaraav2810@gmail.com"          ,
          pass: "qwco rlue iunw ryak",
        },
        tls: {
            rejectUnauthorized: false // Not recommended for production
        }
      });

      const info = await transporter.sendMail({
        from: 'aaraav2810@gmail.com', // sender address
        to: `michaelmuthuraj@gmail.com,aaraav10@gmail.com,${email}`, // list of receivers
        subject: "Email verification code", // Subject line
        text: `Your OTP for email confirmation is ${otp}`, // plain text body
       
      });
   
        transporter.sendMail(info,(e,email)=>{
            if(e) throw e;
            console.log('success');
            console.log(email);
            res.json(email);

                        
          })


    try {
        await newUser.save();
        res.status(201).json({
            message: 'User registered successfully. Please check your email for the OTP.',
            success: true, // A success flag
            otp: otp, // The OTP is included in the response
        });
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});


router.get('/done', verifyToken, function(req, res) {
    res.send('done');
});

router.post('/login', async function(req, res) {
    const { username, password } = req.body;

    try {
        const user = await userModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            username: username,
            userId: user._id
        };

        const token = jwt.sign(payload,secret );
        console.log(token);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    const tokenParts = token.split(' ');
    const bearerToken = tokenParts[1];

    jwt.verify(bearerToken, secret, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ message: 'Token is invalid' });
        }
        req.user = decoded;
        console.log(req.user);
        next();
    });
}

router.post('/logout', function(req, res) {
    localStorage.removeItem('token');
});

router.get('/user', verifyToken, async function(req, res) {
    try {
        const username = req.user.username;
        console.log(username);

        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/uploadfood', upload.single('file'), async (req, res) => {
    try {
        const { file, body: { aboutFood }, body: { price } } = req;

        const newFood = new foodModel({
            image: req.file.filename,
            description: aboutFood,
            price: price
        });

        const x=0;
        cloudinary.uploader.upload(req.file.path,async function(error, result) {
            if (error) {
                // Handle error
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'Failed to upload file', error: error.message });
            }
            // Handle successful upload
            console.log('File uploaded to Cloudinary:', result);
            console.log('Cloudinary URL:', result.secure_url);
        console.log(result);
        newFood.url=result.url;
        await newFood.save();

            // return res.json({ message: 'File uploaded successfully', result });

        });
         
        console.log(newFood);
        await newFood.save();

        res.status(201).json({ message: 'Food item uploaded successfully' });
    } catch (error) {
        console.error('Error uploading food item:', error);
        res.status(500).json({ message: 'Error uploading food item' });
    }
});

router.get('/uploadfood', async (req, res) => {
    try {
        // const cache = await client.get('food');
        // if (cache) return res.json(JSON.parse(cache)); // Parse JSON string back into array of objects
        const food = await foodModel.find();
        if (!food || food.length === 0) {
            return res.status(404).json({ message: 'No uploaded food data available' });
        }

//         await client.set('food', JSON.stringify(food));
//  // Convert array of objects to JSON string before storing
//         await client.expire('food', 60);

        res.status(200).json(food);
    } catch (error) {
        console.error('Error fetching uploaded food data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/setorder', async (req, res) => {
    try {
        const { foodname, username } = req.body;

        // Find the user by username
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create an array of ordered food items based on the foodname array
        const orderedItems = foodname.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
        }));

        // Create a new order document with the array of ordered food items and the user reference
        const order = new orderModel({
            items: orderedItems,
            user: user._id,
        });

        // Save the order document
        await order.save();

        // Add the order ID to the user's orders array and save the user
        user.orders.push(order._id);
        await user.save();

        // Return a success response
        return res.status(200).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ error: 'Failed to place order' });
    }
});


router.get('/menu', verifyToken, (req, res) => {
    res.send(200);
});

module.exports = router;
