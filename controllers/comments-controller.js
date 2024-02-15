const express = require('express');
const router = express.Router();
const commentsLogic = require('../logic/comments-logic');
const { tryCatch } = require('../utils/trycatch');
const AppError = require('../error/AppError');
const server = express();

router.post('/', tryCatch(async (request, response) => {
    let comment = request.body;
    await commentsLogic.addComment(comment);
    response.status(201).json({ message: 'Comment added successfully' });
}));

router.get('/', tryCatch(async (request, response) => {
    const comments = await commentsLogic.getAllComments();
    response.status(200).json(comments);
}));

router.get('/byrecipe/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const comments = await commentsLogic.getAllCommentsByRecipeId(recipeId);
    response.status(200).json(comments);
}));
router.get('/byid/:commentId', tryCatch(async (request, response) => {
    const commentId = request.params.commentId;
    const comment = await commentsLogic.getComment(commentId);
    response.status(200).json(comment);
}));


router.put('/:commentId', tryCatch(async (request, response) => {
    const commentId = request.params.commentId;
    const comment = request.body;
    comment.id = commentId;
    await commentsLogic.updateComment(comment);
    response.status(200).json({ message: 'Comment updated successfully' });
}));

router.delete('/:commentId', tryCatch(async (request, response) => {
    const commentId = request.params.commentId;
    await commentsLogic.deleteComment(commentId);
    response.status(200).json({ message: 'Comment deleted successfully' });
}));

module.exports = router;
