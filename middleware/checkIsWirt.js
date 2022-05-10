const jwt = require("jsonwebtoken")
const User = require("../models/user")
const config = require('../config')

const checkIsWirt = async (req, res, next) => {   //todo: add async handler in middleware since express does not support promises ootb
    try{
        let cookie = req.cookies['jwt'];
        let jwtUserID = jwt.decode(cookie, config.jwt.secret)
    
        let user = await User.findOne({_id: jwtUserID._id})

        if(!user || !jwtUserID || !cookie){
            return res.status(400).send({
                message: "invalid request data"
            })
        }
        
        if(!user.isWirt && !user.isAdmin){
            return res.status(403).send({
                message: "unauthorised"
            })
        }
        next();

    }catch(ex){
        console.log(ex.message)
        return res.status(500).send({
            message: "internal server error"
        })
    }
}

module.exports = checkIsWirt;