const express=require('express');
const cors=require('cors');
const path =require('path');
const app=express();
const mainRoutes=require('./routes/main')

const foodModel=require('./models/foodModel')
app.use(cors({
    origin:'https://restaurantaaraav.netlify.app/'
}));
app.use(express.json());
const bcyrpt=require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.static(path.join(__dirname, 'public')));



const userModel=require('./models/userModel');

const port=process.env.PORT||9000;




app.use('/',mainRoutes);

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
});

module.exports=app;