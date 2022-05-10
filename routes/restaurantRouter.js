//these routes can be accessed by anyone

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const Restaurant = require('../models/restaurant');
const Dish = require('../models/dish');

const config = require('../config')

//TODO: better error handling/edge case handlings
router.post('/getRestaurants', async (req, res) => {
    try{
        let restaurants = JSON.stringify(await Restaurant.find({})) //gets all restaurants from the DB and saves them as JSON
        return res.status(200).send(restaurants)
    } catch (ex) {
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

router.post('/getMenu', async (req, res) => {       //returns all active dishes for a certain restaurant
    try{
        let restaurantID = req.body.restaurantID        //get restaurant id from req.body 
        let restaurant = await Restaurant.findOne({_id: restaurantID})     //get target restaurant

        if(!restaurant){
            return res.status(404).send({
                message: "invalid restaurant ID"
            })
        }
        
        let dishesAsJson = JSON.stringify( await Dish.find({isActive: true}).where('_id').in(restaurant.dishes).exec() ); //get all dishes by ObjectID that are saved in restaurant.dishes and parse the result to JSON
        
        return res.status(200).send(dishesAsJson)

    } catch (ex) {
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

module.exports = router;