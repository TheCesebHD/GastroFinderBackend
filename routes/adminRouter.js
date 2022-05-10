//these routes can only be accessed by admins

const router = require('express').Router();

const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const Order = require('../models/order');
const Dish = require('../models/dish');

const jwt = require('jsonwebtoken')
const config = require('../config')

router.post('/createRestaurant', async (req, res) => {  //Create restaurant for wirt
    try{
        let user = await User.findOne({_id: req.body.userID})     //find user by id
        
        if(!user.isWirt){               //if user is not a wirt return 403
            return res.status(403).send({
                message: "user is not a wirt"
            })
        }
        let restaurant = new Restaurant({
            name: req.body.name,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
        })

        await restaurant.save()

        user.restaurants.push(restaurant._id)
        user.save()

        return res.status(200).send({
            message: "successfully created restaurant"
        })
    }catch(ex){
        console.log(ex)
        return res.status(500).send({
            message: "error"
        })
    }
})

router.get('/getAllUsers', async (req, res) => {
    try{
        let users = await User.find({}).populate('restaurants').exec()
        return res.send(users);
    } catch (ex) {
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

router.get('/getAllWirts', async (req, res) => {
    try{

    } catch (ex) {
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

router.post('/editUser', async (req, res) => {
    try{
        let userID = req.body.id
        let user = await User.findOne({_id: userID})

        if(!user){
            return res.status(404).send({
                message: "user not found"
            })
        }

        user.name = req.body.name;
        user.email = req.body.email;
        user.isWirt = req.body.isWirt;
        user.isAdmin = req.body.isAdmin;

        await user.save()

        return res.status(200).send({
            message: "successfully made user a wirt"
        })

    } catch (ex){
        console.log(ex)
        return res.status(500).send({

            message: "internal server error"
        })
    }
})

router.post('/editRestaurant', async (req, res) => {
    try{
        let restaurant = await Restaurant.findOne({_id: req.body.id})
        if(!restaurant){
            return res.status(404).send({
                message:"restaurant does not exist"
            })
        }

        restaurant.name = req.body.name;
        restaurant.address = req.body.address;
        restaurant.phoneNumber = req.body.phoneNumber;

        await restaurant.save()
        return res.status(200).send({
            message:"successfully updated restaurant"
        })
    } catch (ex){
        console.log(ex)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

module.exports = router;