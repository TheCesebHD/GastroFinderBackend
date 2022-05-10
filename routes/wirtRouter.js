//these routes can only be accessed by a user with the wirt role

const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Order = require('../models/order');
const Restaurant = require('../models/restaurant');
const Dish = require('../models/dish');

const config = require('../config')

//todo: outsource the checks into a functions as they will most likely be reused

router.post('/getOwnRestaurants', async (req, res) => { //returns dishes owned by the wirt who made the request
    try{
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let user = await User.findOne({_id: jwtUserID._id}) //get user
        let restaurants = []

        if(!user.restaurants){      // we could also write this in the err() callback in the query but this way it is more readable
            res.status(404).send({
                message: "No restaurants are owned by this user"
            })
        }

        for(let restaurantID of user.restaurants){  //prototype.foreach doesnt support async
            restaurants.push(await Restaurant.findOne({_id: restaurantID}))
        }

        res.status(200).send(restaurants)
        
    } catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
})

router.post('/updateRestaurant', async (req, res) => {
    try{
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let restaurantID = req.body.id;

        let user = await User.findOne({_id: jwtUserID._id, restaurants: restaurantID}) //get user
        if(!user){
            return res.status(404).send({
                message: "No restaurant with the provided ID found for this user"
            })
        }

        let restaurant = await Restaurant.findOne({_id: restaurantID}) 

        //mongoose docs recommend to use save() instead of findOneAndUpdate()
        restaurant.name = req.body.name
        restaurant.address = req.body.address
        restaurant.phoneNumber = req.body.phoneNumber

        await restaurant.save()

        res.status(200).send({
            message: "successfully updated restaurant!"
        })
        
    } catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
})

router.post('/createDish', async (req, res) => {   //adds a dish to a specific restaurant
    try{
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let restaurantID = req.body.restaurantID //id of the target restaurant 
        let user = await User.findOne({_id: jwtUserID._id})     //find user

        if(!restaurantID){      //todo: check all req.body properties
            return res.status(400).send({
                message: "Invalid request data"
            })
        }
        if(!user.restaurants.includes(restaurantID)){   //if user is not the owner of the restaurant
            return res.status(403).send({
                message: "unauthorised"
            })
        }

        let restaurant = await Restaurant.findOne({_id: restaurantID})

        if(!restaurant){
            return res.status(404).send({
                message: "Restaurant does not exist"
            })
        }

        let dish = new Dish({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            delivery: req.body.delivery,
            isActive: req.body.isActive
        })
        await dish.save();

        restaurant.dishes.push(dish._id)    //save dish id to dishes array in restaurant collection 
        await restaurant.save();

        return res.status(200).send({
            message: "successfully created dish"
        })

    }catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
});

router.post('/updateDish', async (req, res) => {   //updates a certain dish
    console.log('updating dish')
    try{
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let restaurantID = req.body.restaurantID
        let dishID = req.body.dishID

        let user = await User.findOne({_id: jwtUserID._id, restaurants: restaurantID})  //check if user owns the restaurant
        
        if(!user){      //user does not own the restaurant
            return res.status(403).send({
                message: "unauthorised"
            })
        }

        let restaurant = await Restaurant.findOne({_id: restaurantID, dishes: dishID})  //checks if the restaurant contains the dish
        
        if(!restaurant){    //the restaurant does not contain this dish
            return res.status(404).send({
                message: "restaurant not found"
            })
        }

        let dish = await Dish.findOne({_id: dishID})

        if(!dish){      //in case the reference exists but the dish does not (mongoDB does not automatically delete references if the target object gets deleted)
            return res.status(404).send({
                message: "dish not found"
            })
        }

        dish.name = req.body.name
        dish.price =  req.body.price
        dish.description = req.body.description
        dish.delivery = req.body.delivery
        dish.isActive = req.body.isActive

        //mongoose recommends to use save() instead of findOneAndUpdate()
        await dish.save();

        return res.status(200).send({
            message: "successfully updated dish"
        })

    }catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
});

router.post('/deactivateDish', async (req, res) => {   //removes a dish from a specific restaurant
    try{
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let restaurantID = req.body.restaurantID
        let dishID = req.body.dishID

        let user = await User.findOne({_id: jwtUserID._id, restaurants: restaurantID})  //check if user owns the restaurant
        
        if(!user){      //user does not own the restaurant
            return res.status(403).send({
                message: "unauthorised"
            })
        }

        let restaurant = await Restaurant.findOne({_id: restaurantID, dishes: dishID})  //checks if the restaurant contains the dish
        
        if(!restaurant){    //the restaurant does not contain this dish
            return res.status(404).send({
                message: "restaurant not found"
            })
        }

        let dish = await Dish.findOne({_id: dishID})

        if(!dish){      //in case the reference exists but the dish does not (mongoDB does not automatically delete references if the target object gets deleted)
            return res.status(404).send({
                message: "dish not found"
            })
        }

        dish.isActive = false;
        
        await dish.save()

        return res.status(200).send({
            message: "successfully deleted dish"
        })

    }catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
});

router.post('/getActiveOrders', async (req, res) => {       //returns all orders of a certain restaurant
    try{
        //res.body will look somewhat like this: 
        /*
        [
            {
                "_id": "objectID",
                "user": {
                    //user object 
                },
                "restaurant": "objectID",
                "dishes": [
                    {
                        "amount": number,
                        "dish": {
                            //dish object
                        }
                    },
                    ...
                ],
                //other order properties
            },
            ...
        ]
        */ 
        let restaurantID = req.body.restaurantID

        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let user = await User.findOne({restaurants: restaurantID, _id: jwtUserID._id})    //check if user owns the restaurant

        if(!user){      	//if user doesnt own the restaurant
            return res.status(403).send({
                message: "user does not own this restaurant / restaurant does not exist"
            })
        }

        let orders = await Order.find({restaurant: restaurantID, status: 'PROCESSING'}).populate('dishes.dish').exec()

        return res.status(200).send(orders)

    } catch (ex) {
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

router.post('/getOrderHistory', async (req, res) => {       //returns the entire order history of a specific specific restaurant by ID
    try{
        let restaurantID = req.body.restaurantID

        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid

        let user = await User.findOne({restaurants: restaurantID, _id: jwtUserID._id})    //check if user owns the restaurant

        if(!user){
            return res.status(403).send({
                message: "user does not own this restaurant / restaurant does not exist"
            })
        }

        let orders = await Order.find({restaurant: restaurantID}).populate('dishes.dish').exec()

        return res.status(200).send(orders)
    } catch (ex){
        console.log(ex)
        return res.status(500).send()
    }
})

router.post('/markOrderAsCompleted', async (req, res) => {  //mark a certain order of a certain restaurant as completed (using the restaurantID and the orderID as identifier)
    try{
        let restaurantID = req.body.restaurantID
        let orderID = req.body.orderID
    
        let cookie = req.cookies['jwt'];        
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)   //decode jwt to get userid
    
        let user = await User.findOne({restaurants: restaurantID, _id: jwtUserID._id})    //check if user owns the restaurant
    
        if(!user){
            return res.status(403).send({
                message: "user does not own this restaurant / restaurant does not exist"
            })
        }
    
        let order = await Order.findOne({_id: orderID})
        if(!order){
            return res.status(200).send({
                message:"order does not exist"
            })
        }
    
        order.status = 'COMPLETED'
        
        await order.save()
        
        return res.send({
            message: "successfully marked order as completed"
        })
    }catch(ex){
        console.log(ex)
        return res.status(500).send()
    }
})

module.exports = router;