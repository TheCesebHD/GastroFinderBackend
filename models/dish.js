const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        requied: true
    },
    delivery: {
        type: Boolean,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('Dish', dishSchema);