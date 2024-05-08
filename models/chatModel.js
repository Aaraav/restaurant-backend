const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb+srv://aaraav:aaraav@cluster0.kyxqnj3.mongodb.net/blog');

// Define the ChatMessage schema
const chatMessageSchema = new Schema({
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    chat: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now, // Automatically set the current date and time
    },
});

// Create the ChatMessage model based on the schema
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Export the model for use in other parts of your application
module.exports = ChatMessage;
