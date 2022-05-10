const mongoose = require('mongoose');
const tokenGenerator = require('rand-token');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    //todo: save opening hrs
    raspberryToken: {
        type: String,
        default: function(){
            return tokenGenerator.generate(32)
        },
        unique: true
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]
})

const operationTimeSchema = new mongoose.Schema({
    mondayStart: {
        type: Number
    },
    mondayEnd: {
        type: Number
    },
    tuesdayStart: {
        type: Number
    },
    tuesdayEnd: {
        type: Number
    },
    wednesdayStart: {
        type: Number
    },
    wednesdayEnd: {
        type: Number
    },
})

module.exports = mongoose.model('Restaurant', restaurantSchema);