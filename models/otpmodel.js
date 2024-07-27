const mongoose=require('mongoose');

mongoose.connect('mongodb+srv://aaraav:aaraav@cluster0.kyxqnj3.mongodb.net/blog');


const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  });

  module.exports=mongoose.model('otp',otpSchema);
