//these routes can be accessed by authenticated users
const router = require('express').Router();

const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const Order = require('../models/order');
const Dish = require('../models/dish');

const {socketMap} = require('../socketio/socketMap')

const jwt = require('jsonwebtoken')
const config = require('../config')

router.post('/create',async (req, res) => {      //creates new order
    try{
        //This function can be confusing if you do not understand the request body structure. Check out the API documentation if you need more information

        console.log(socketMap)

        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let restaurantID = req.body.restaurantID
        let dishes = req.body.dishes        //array of objects containing an id and amount

        //check if user even exists (already kind of checked by jwt middleware check but since it does not access the database we check again in case the user was deleted)
        let user = await User.findOne({_id: jwtUserID._id})  
        if(!user){
            return res.status(404).send({
                message: "user does not exist"
            })
        }
    
        //check if restaurant exists
        let restaurant = await Restaurant.findOne({_id: restaurantID}) 
        if(!restaurant){
            return res.status(404).send({
                message: "restaurant does not exist"
            })
        }

        //check if the restaurant.dishes array contains the ordered dishes
        let dishesAreValid = dishes.map(dish => restaurant.dishes.includes(dish.id))
        if(!dishesAreValid){
            return res.status(404).send({
                message: "dish does not exist on restaurant"
            })
        }
    
        //calculate order Price on the server since the client data could be manipulated
        let orderPrice = 0
        for(let element of dishes){
            let dish = await Dish.findOne({_id: element.id})    //get dish from db
            orderPrice += dish.price * element.amount;      //add dish price to price and multiply it by the amount
        }

        //since the req.body dishes array contains a property called 'id' for the ID, but the DB calls the property 'dish', we need to rename 'id' to 'dish'
        //Todo: tink of a better solution, this solution feels like it causes a lot of tech debt
        for(let dish of dishes){
            dish['dish'] = dish['id']
            delete dish['id']
        }

        let order = new Order({
            user: jwtUserID,
            restaurant: restaurantID,
            price: orderPrice,
            dishes: dishes,
            comment: req.body.comment
        })

        await order.save()

        return res.status(200).send({
            message: "successfully created new order"
        })
    }
    catch(ex){
        console.log(ex)
        res.status(500).send({
            message: "internal server error"
        })
    }
});

module.exports = router;