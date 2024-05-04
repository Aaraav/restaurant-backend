const mongoose = require('mongoose');

const orderedFoodItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

const orderedfoodSchema = new mongoose.Schema({
    items: [orderedFoodItemSchema],  
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,  
    },
    status: {
        type: String,
        enum: ['Fulfilled', 'Pending', 'Cancelled'],
        default: 'Pending' // Set a default value if needed
    }
});

const orderModel = mongoose.model('order', orderedfoodSchema);

module.exports = orderModel;
