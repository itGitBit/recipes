const express = require('express');
const router = express.Router();
const likeLogic = require('../logic/likes-logic');
const { tryCatch } = require('../utils/trycatch');

router.post('/', tryCatch(async (request, response) => {
    let like = request.body;
    let returnMessage = await likeLogic.addLike(like);
    response.status(200).json({ message: returnMessage });
}));

router.get('/', tryCatch(async (request, response) => {
    const likes = await likeLogic.getAllLikes();
    response.status(200).json(likes);
}
));

router.get('/byrecipe/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const likes = await likeLogic.getAllLikesByRecipeId(recipeId);
    response.status(200).json(likes);
}));

router.get('/byuser/:userId', tryCatch(async (request, response) => {
    const userId = request.params.userId;
    const likes = await likeLogic.getAllLikesByUserId(userId);
    response.status(200).json(likes);
}));

router.delete('/:recipeId/:userId', tryCatch(async (request, response) => {
    const { recipeId, userId } = request.params;
    await likeLogic.deleteLike(recipeId, userId);
    response.status(200).json({ message: 'Like deleted successfully' });
}));



module.exports = router;