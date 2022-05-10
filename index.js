/*********************************************************************************************************
 * refer to the docs.md file in the Github repository if you want more information about the application *
 *                                                                                                       *
 * The entire project was written by an underpaid intern who never wrote an express server before        *
 * Please be nice to the author, they know their code is a mess and are very self-conscious about it     *
 * If they would have been allowed to use ASP.NET the quality of the code would be different             *
 *********************************************************************************************************/

/*--------------------imports------------------------*/

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

//logging
const winston = require('winston')

//`store` for the socket map 
const {socketMap} = require('./socketio/socketMap')

//middleware
const verifyJWT = require('./middleware/verifyJWT')
const checkIsWirt = require('./middleware/checkIsWirt')

//routers
const authRouter = require('./routes/authRouter')
const orderRouter = require('./routes/orderRouter')
const restaurantRouter = require('./routes/restaurantRouter')
const wirtRouter = require('./routes/wirtRouter')
const adminRouter = require('./routes/adminRouter')

/*-----------------------------------------------------*/
      
// logging
const logConfig = {
    'transports': [
        new winston.transports.Console()
    ]
};
const logger = winston.createLogger(logConfig);

console.log('starting server...')
console.log('connecting to database...')

//connect to db

mongoose.connect('mongodb://localhost/node_auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database')
})

//create express server
const app = express()     

app.use(cookieParser())     //use cookies

app.use(cors({              //activate cors
    credentials: true,
    origin: ['http://localhost:4200']
}))

app.use(express.json())     //use json for req body

app.use('/api/restaurant', restaurantRouter)
app.use('/api/auth', authRouter)

app.use(verifyJWT)   //checks for JWT
app.use('/api/order', orderRouter)

app.use(checkIsWirt)   //checks if user is a wirt - express does not allow async middleware
app.use('/api/wirt', wirtRouter)

//app.use(checkIsAdmin)  //not implemented yet - checks if the user requesting the resource is an admin
app.use('/api/admin', adminRouter)

//app.use()

app.listen(8000, () => {  //start server
    console.log("server running: listening to port 8000")
})