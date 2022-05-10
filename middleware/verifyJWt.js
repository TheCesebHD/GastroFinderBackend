const jwt = require("jsonwebtoken")
const config = require('../config')

const verifyToken = (req, res, next) => {
    try{
        let cookie = req.cookies['jwt'];        //gets token from cookie
    
        if(!cookie){                            //if the cookie doesnt exist
            return res.status(401).send({
                message: 'unauthenticated'
            })
        }
    
        let claims = jwt.verify(cookie, config.jwt.secret);    //verify json web token
    
        if (!claims){                          //if the token is not valid
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }
        next();
        
    }catch(ex){
        console.log(ex.message)
        return res.status(500).send({
            message: "internal server error"
        })
    }
}

module.exports = verifyToken;