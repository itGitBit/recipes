const commentsDal = require('../dal/comments-dal');
const validator = require('./validator');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');
const recipesLogic = require('./recipes-logic');
const usersLogic = require('./users-logic');

const addComment = async (comment) => {
    const { error, value } = validator.validateComments(comment);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    let validateRecipe = await recipesLogic.checkIfRecipeExists(comment.recipeId);
    if (!validateRecipe) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipe not found", 404,  true);
    }
    let isUserValid = await usersLogic.checkIfUserExists(comment.userId);
    if(!isUserValid){
        throw new AppError(errorType.INVALID_USER, "user not found", 404, true)
    }
    await commentsDal.addComment(comment);
};

const getAllComments = async () => {
    const comments = await commentsDal.getAllComments();
    if (!comments) {
        throw new AppError(errorType.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};

const getAllCommentsByRecipeId = async (recipeId) => {
    const comments = await commentsDal.getAllCommentsByRecipeId(recipeId);
    if (!comments) {
        throw new AppError(errorType.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};

const getAllCommentsByUserId = async (userId) => {
    const comments = await commentsDal.getAllCommentsByUserId(userId);
    if (!comments) {
        throw new AppError(errorType.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};


const getComment = async (commentId) => {
    const comment = await commentsDal.getComment(commentId);
    if (!comment) {
        throw new AppError(errorType.NO_COMMENTS_FOUND, "comment not found", 404, "comment not found", true);
    }
    return comment;
};

const updateComment = async (comment) => {
    const { error, value } = validator.validateComments(comment);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await commentsDal.updateComment(comment);
};

const deleteComment = async (commentId) => {
    await commentsDal.deleteComment(commentId);
};

module.exports = {
    addComment,
    getAllComments,
    getAllCommentsByRecipeId,
    getAllCommentsByUserId,
    getComment,
    updateComment,
    deleteComment
};