import express from 'express';
const router = express.Router();
import usersLogic from '../logic/users-logic.js';
import { tryCatch } from '../utils/trycatch.js';


router.post('/', tryCatch(async (request, response) => {
    let user = request.body; 
    await usersLogic.register(user);
    response.status(201).json({ message: 'User registered successfully' });

})
);


router.post('/login', tryCatch(async (request, response) => {
    let userLoginDetails = request.body;
    let {authToken, refreshToken} = await usersLogic.login(userLoginDetails);
    response.status(200).json({accessToken: authToken, refreshToken: refreshToken});
}));

router.post('/token', tryCatch(async (request, response) => {
    const refreshToken = request.body.token;
    if (refreshToken == null) return response.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return response.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) return response.sendStatus(403);
        const accessToken = generateAccessToken({ username: user.username, type: user.type, id: user.id });
        response.json({ accessToken: accessToken });
    });
}));

router.get('/:userId', tryCatch(async (request, response) => {
    const userId = request.params.userId;
    const user = await usersLogic.getUser(userId);
    response.status(200).json(user);
}));
router.get('/', tryCatch(async (request, response) => {
    const users = await usersLogic.getAllUsers();
    response.status(200).json(users);
}));


router.put('/:userId', tryCatch(async (request, response) => {
    const userId = request.params.userId;
    const user = request.body;
    user.id = userId;
    await usersLogic.updateUser(user);
    response.status(200).json({ message: 'User updated successfully' });
}
));
router.delete('/:userId', tryCatch(async (request, response) => {
    const userId = request.params.userId;
    await usersLogic.deleteUser(userId);
    response.status(200).json({ message: 'User deleted successfully' });
}));

export default router;

