const mongoose = require('mongoose');

const dishReference = new mongoose.Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    dishes: [
       dishReference
    ],
    address: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['PROCESSING', 'CANCELLED', 'COMPLETED', 'ERROR'],
        default: 'PROCESSING'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Order', orderSchema);