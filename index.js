require('dotenv').config();
const express = require('express');
const errorHandler = require('./error/ErrorHandler');
const jwt = require('jsonwebtoken');
const server = express();
const cors = require('cors');
const usersController = require('./controllers/users-controller');
const ingredientsController = require('./controllers/ingredients-controller');
const likesController = require('./controllers/likes-controller');
const commentsController = require('./controllers/comments-controller');
const recipesController = require('./controllers/recipes-controller');
const tagsController = require('./controllers/tags-controller');
const { calculateCurrentTime } = require('./utils/calculate-time');




const authenticateToken = (request, response, next) => {
    if (request.path === '/users/login' || request.path === '/users/' || request.path === '/users/token') {

        next();
        return;
    }
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return response.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return response.sendStatus(403).json({ message: 'invalid token' });
        request.user = user;
        next();
    })
};

server.use(cors({ origin: 'http://localhost:3000' }));
server.use(express.json());
// server.use(authenticateToken);

server.use('/users', usersController);
server.use("/ingredients", ingredientsController);
server.use("/likes", likesController);
server.use("/comments", commentsController);
server.use("/recipes", recipesController);
server.use("/tags", tagsController);


server.use(errorHandler);
server.listen(3001, () => {
    console.log(`${calculateCurrentTime()} - Server is running on http://localhost:3001`);
});