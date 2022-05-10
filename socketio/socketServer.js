//raspberry pi websocket server
const { WebSocketServer } = require('ws')
const Restaurant = require('../models/restaurant')
const { socketMap } = require('./socketMap')
const io = require('socket.io')(3000
//     , {
//     cors: {
//         origin: ["https://admin.socket.io/"]
//     }
// }
)

console.log("started socket server")

const raspberrySocketServer = () => {

    io.on('connection', (socket) => {
        console.log('got connection from ' + socket.id)
        let token = socket.handshake.query.token    //gets raspberryToken from url params if it is there
        if(token){      //is a raspberry pi
            console.log(token)
            socketMap.set(token, socket)     //saves socket-token key-value-pair to map to be able to get the socket by the raspberry token which is a unique identifier
            console.log(raspberrySockets)
        }
        socket.on('disconnect', () => {
            console.log('disconnected!')
            socketMap.delete(socket.handshake.query.token)
        })
    })
    return {
        requestPrint
    }

}

async function requestPrint(order, restaurantID) {   //request raspberry to print
    let restaurant = await Restaurant.findOne({_id: restaurantID})  //get restaurant from db
        
    if(!restaurant){
        throw new "invalid restaurant"
    }

    let socket = socketMap.get(restaurant.raspberryToken)    //get socket by restaurant.raspberryToken

    socket.emit('request-print', order)
}

module.exports = raspberrySocketServer