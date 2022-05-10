//these routes can be accessed by anyone

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');
const emailService = require('../emailService/emailService');
const config = require('../config')
const jwtVerify = require('../middleware/verifyJWt')

router.post('/register', async (req, res) => {  //register  //todo: fix bug with email
    try{
        if(req.body.name === null || typeof req.body.name != 'string' 
            || req.body.email === null || typeof req.body.email != 'string' 
            || req.body.password === null || typeof req.body.password != 'string' ){
            
            return res.status(400).send({
                message: 'invalid user data'
            })
        }
        
        let user = await User.findOne({email: req.body.email.toLowerCase()})

        if(user){        //check if email is already in use
            return res.status(409).send({
                message: 'User already exists'
            })
        }
        
        let salt = await bcrypt.genSalt(10);        
        let hashedPassword = await bcrypt.hash(req.body.password, salt);        //hashes and salts password --> todo: research if bcrypt is safe enough
        
        let verCode = crypto.randomBytes(20).toString('hex');           //code to verify the user email

        user = new User({       //saves user data from req into user obj to save it to the db
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: hashedPassword,
            verificationCode: verCode,
            isVerified: false
        });

        let result = await user.save(); //saves user to db
        let {_id, email, password, isVerified, verificationCode, __v, ...data} = result.toJSON();   //deconstructs the user 
    
        let verificationLink = 'http://' + req.headers.host + '/api/auth/verify/' + user.email + '/' + user.verificationCode;

        emailService.sendVerificationMail(user.email, verificationLink);

        return res.status(200).send({
            message: "success, please verify"
        });
    } catch (e){
        console.log(e.name + ': ' + e.message);
        return res.status(500).send({
            message: 'An error occoured!'
        })
    }
});

router.get('/verify/:email/:verificationCode', async (req, res) => { //router link to verify the user email
    try {

        let user = await User.findOne({ email: req.params.email })
        if(user.isVerified){
            return res.status(200).send({
                message: 'User already verified'
            })
        }
        if(!user){
            return res.status(404).send({
                message: 'user does not exist'
            })
        }
        if(user.verificationCode !== req.params.verificationCode){
            return res.status(403).send({
                message: 'invalid verification link'
            })
        }
        user.isVerified = true;
        await user.save();

        return res.status(200).send({
            message:'successfully verified user'
        });

    } catch (e){
        console.log(e.name + ': ' + e.message);
        return res.status(500).send({
            message: 'An error occoured!'
        })
    }
})

router.post('/login', async (req, res) => {     //login
    try{
        let user = await User.findOne({email: req.body.email?.toLowerCase()}) //looks for the email address in the db

        if(!user){      //if the user doesnt exist
            return res.status(403).send({
                message: 'wrong username/password'
            });
        }

        if(!await bcrypt.compare(req.body.password, user.password)){    //if the passwords dont match
            return res.status(403).send({
                message: 'wrong username/password'
            });
        }
        
        if(!user.isVerified){     //if the user didnt verify his email address
            return res.status(401).send({
                message: 'user is not verified'
            })
        }

        let token = jwt.sign({_id: user._id}, config.jwt.secret)  //jwt token for auth
    
        res.cookie('jwt', token, {  //token gets stored as a cookie
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //exp time 24 hours'
        });
        
        let {_id, email, password, isVerified, verificationCode, __v, ...data} = user.toJSON()   //deconstructs the user

        return res.status(200).send(data)
    } catch (e) {
        console.log(e.name + ": " + e.message);
        return res.status(500).send('An error occoured!')
    }
});

router.post('/logout', (req, res) => {      //logout
    try{
        res.cookie('jwt', '', {maxAge: 0}) //set cookie exp date to 0 to destruct it
        res.status(200).send({
            message: 'successfully logged out'
        });
    } catch (e){
        return res.status(500).send({
            message: 'An error occoured!'
        });
    }
});  

router.post(('/reset'), (req, res) => { //reset password
    //not implemented yet
    res.status(404).send({
        message: "not implemented yet"
    })
});
module.exports = router;