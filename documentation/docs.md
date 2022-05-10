# gastrofinder documentation
Sebastian Unterberger, © 2021 Creativomedia GMBH 

## Github Repositories

https://github.com/WantsToCodeEverythingInDotNet/GastroFinderBackend
https://github.com/WantsToCodeEverythingInDotNet/GastroFinderFrontend

<!-------------------------------------------------------------------------------------------------------------->
<!--    To see the pretty version of this file, open it in visual studio code and press ctrl + shift + v      -->
<!-------------------------------------------------------------------------------------------------------------->
## terminology

| term  | meaning |  
| :---- | ------: |
| user | anyone using the app without specific permissions | 
| wirt | a user with the permission manage a restaurant and associated data |  
| restaurant | an entity that sells food |  
| admin | a user with permissions to edit every database entry |
| frontend | t0he angular application |
| backend | everything not visible to any kind of user |
| server | the NodeJS application, including database |
| client | An entity that communicates with the server, including the angular application and the rasberry PI |
| js | javascript
| ts | typescript
| SPA | Single Page Application
| JWT | Json web token used for the SPA authentification

## What is gastrofinder?  

Gastofinder is a delivery app made with angular and nodeJS. It provides the fllowing functionalities:  
- order food 
- create / edit a restaurants and associated data (e.g menu, opening hours, etc.) as a wirt
- print the orders for the restaurant, using a thermal printer and a raspberry pi

## Tech Stack

### MongoDB (Database)

https://www.mongodb.com/

#### mongoose

https://www.npmjs.com/package/mongoose

### NodeJS with express (Backend)

https://nodejs.org/

### Angular (Frontend)

https://angular.io/


# Concept

## Entities
### Guest (unregistered)

An entity visiting the website while not being logged in is allowed to perform the following tasks:
- see all restaurants
- see all active dishes of a restaurant
- Register

### User
A user is an entity with a registered account and verified email address that is allowed to perform the following tasks: 
- place an order
- see orders placed by them
- login/out
- modify account (email and name are fixed)
- apply to become a wirt (approved by administrators)

A customer has to have a verified and registered user account to be able to perform the tasks mentioned above

### Wirt
A wirt is a user entity with the addition of being permitted to perform the following tasks: 
- Update restaurant data
- Edit Dishes
- take orders
- see orders being placed at their restaurant

### Admin
An admin is a user entity with the permission to edit the entire database

## Order

An order starts with a user ordering certain products from a specific restaurant in the Angular application. The order will then be sent to the server, where it will be checked for validity. If it is valid, it will be sent to a raspberry PI of a certain restaurant where it will be printed out, and displayed in the frontend of the logged-in wirt owning the restaurant the order is directed at. The user then will get feedback about the order process.
_*This application does not handle any kind of payments*_

## Viewing Restaurants / Menu (dishes)

Every entity navigating the website will be able to view active restaurants and corresponding dishes, regardless of their authentification status/role. 

# Business logic

todo: add diagram to visualise comm structure

## Order process

- user places an order out of a list of active dishes associated to a certain restaurant
- the angular application triggers an http request to the /api/order API
- the request handler will check the request for validity
    - if the request is invalid the user will get an error
- the order is then saved to the database
- the raspberry pi is being contacted per websocket connection
    - if the print task was successfull, the raspberryPI will send a success message
- the wirt will be able to view the order regardless of the print status
- if everything worked, the user will recieve a status update regarding their order ("success")

# Database

## Users

| property | description |
| :-- | --: |
| name |  |
| email | unique identifier, type string |
| password |  |
| isVerified | flag to see if the user's email address is verified |
| verificationCode | the code that gets sent to the user's email address to verify it |
| isWirt | flag to determine whether a user is able to create/edit restaurants and take orders |
| restaurants | an array of restaurants controlled by the user containing ObjectIDs (foreign keys) to restaurant documents

## Restaurants

| property | description |
| :-- | --: |
| name |
| address |
| phoneNumber |
| dishes | an array of ObjectIDs to dish documents, resembling a restaurants menu

## Dishes 

| property | description |
| :-- | --: |
| name | |
| price | |
| description | |
| delivery | flag that displays if delivery is possible |
| isActive | flag that displays if the dish is active (aka showing up in the restaurant's menu)

## Orders
| property | description |
| :-- | --: |
| user | ObjectID pointing at a user document, resembling the user who placed the order |
| restaurant | the restaurant the order was placed on |
| dishes[] | Array of objects containing an Object reference to a dish document and an amount |
| price | |
| comment | |  
| status | Enum that indicates the order status. Values: 'PROCESSING', 'CANCELLED', 'COMPLETED', 'ERROR' |
| timestamp | |

# NodeJS server

# Angular Frontend

In this section the structure of the frontend will be explained. Some components with more complicated logic will be explained here, too

## wirt mgmt 

The wirt mgmt consists of a few different components: 

## wirt.component

This component displays a list of restaurants owned by the logged in wirt. It is protected by the wirt-guard. If an element in the restaurant lis is clicked on, the user will be redirected to the restaurantmgmt component and the restaurant will be provided for it in the WirtStoreService

## WirtStoreService

contains a behavioral subject and returns an observable to simulate a simple ngrx store. It allows us to send data between components that do not share a child/parent relationship

## restaurantmgmt.component

Contains an admin panel for the wirt. 

The admin panel consists of the following elements: 
- an edit restaurant data component that lets the user edit their restaurant data
- a list of dishes where entries can be deleted or edited
- an edit page for the dishes

Clicking the "edit restaurant" button initialises a component called edit-restaurant which then sends an http call to the server to update the restaurant

editing or creating a new dish uses the edit-dish.component which will be explained on its own. If the user want to edit a dish the edit-dish component gets passed down a dish object which it will return, if the user just creates a new dish the component gets passed down a dish object that is undefined

the component has an event listener listenign to each childs output to stop displaying the component when it is done

## edit-dish.component
This component is always meant to be a child component

this component requires a dish object as input. If the dish object is undefined (or not given at all) it will enter a create state where it will create a new dish. if it recieves a valid dish object the component will update the dish in the database. It emits an event once it is done to let the parent know that it can stop displaying the child

# Rasberry PI

# API Documentation

The api consists of multiple routes grouped together in routers, with each router having a specific purpose. Each router has different access criterias (e.g. having a valid JWT).   

The following section will provide an overview of the different API routes

## restaurant routes(name might get changed in the future)

The restaurant router provides information about restaurants and dishes that can be accessed by anyone. The route to it is /api/restaurant/

| route | type | request parameters  | returns | description |
| :-- | --- | --- | --- | --: |
| /getRestaurants | POST | none | Array of restaurant Objects (JSON) | returns all restaurants in the Database
| /getMenu | POST | restaurantID : ObjectID | Array of Dish Objects (JSON) | returns all dishes of a restaurant by the restaurant ID

## auth router

The auth router handles the whole authentication process. It can be accessed by anyone. The route to it is /api/auth

| route | type | request parameters  | returns | description |  
| :-- | --- | --- | --- | --: |
| /register | POST | name: String, email: string, password: string | status message | the route used to register new users
| /verify | GET | /:email/:verificationCode | status message | the route used to verify an email address with the code sent to the email address in /login
| /login | POST | email: string, password: string | HTTP Only JWT Cookie | the route used to log in as a user, it sets the JWT cookie used to authenticate the user
| /logout | POST | none | HTTP Only JWT Cookie with negative maxAge | overwrites the JWT Cookie and sets it to maxAge zero to invalidate it 

## order router 

The order router handles the whole order process. It can be accessed by authenticated users with a valid JWT Cookie, and is protected by the verifyJWT.js file. The route to it is /api/order

| route | type | request parameters  | returns | description |  
| :-- | --- | --- | --- | --: |
| /create | POST | restaurantID: string, dishes: Array<{id: string, amount: string}>, comment: string | status message | creates a new order document in the database and triggers the websocket connection to the raspberry pi

## wirt router 

The auth router handles the CRUD operations for the restaurant/dish management. It can be accessed by authenticated users with the flag isWirt set to true with a valid JWT Cookie. The route to it is /api/wirt. It is protected by the checkIsWirt.js file

| route | type | request parameters  | returns | description |  
| :-- | --- | --- | --- | --: |
| /addDish | POST | restuarantID: ObjectID, name: string, price: number, description: string, delivery: boolean, isActive: boolean | status message | adds a dish to the database and links it to the dishes array in the restaurant document of the provided restaurantID  
| /updateDish | POST | restuarantID: ObjectID, dishID: ObjectID, name: string, price: number, description: string, delivery: boolean, isActive: boolean | status message | updates the dish with the dishID if the id is in the restaurant.dishes array from the provided restaurant id |
| /deleteDish | POST | restaurantID: ObjectID, dishID: ObjectID | status message | deletes a dish and unlinks it from the restaurant.dishes array

## admin router

The admin router handles the creation of restaurants, setting users to isWirt = true and other similar tasks. It can be accessed by authenticated users with the flag isAdmin set to true with a valid JWT Cookie. The route to it is /api/admin. It is protected by checkIsAdmin.js

| route | type | request parameters  | returns | description |  
| :-- | --- | --- | --- | --: |
| /createRestaurant | POST | userID: ObjectID, other restaurant parameters | status | creates a new restaurant with the provided user as owner 
| /setWirt | POST | userID: ObjectID | status | sets a certain users isWirt flag to true


# Rollout Instructions


