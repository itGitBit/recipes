import commentsDal from '../dal/comments-dal.js';
import validator from './validator.js';
import AppError from '../error/AppError.js';
import ErrorTypes from '../consts/ErrorTypes.js';
import recipesLogic from './recipes-logic.js';
import usersLogic from './users-logic.js';

const addComment = async (comment) => {
    const {error,value} = validator.validateComments(comment);
    if (error) {
        throw new AppError(ErrorTypes.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    let validateRecipe = await recipesLogic.checkIfRecipeExists(value.recipeId);
    if (!validateRecipe) {
        throw new AppError(ErrorTypes.NO_RECIPES_FOUND, "recipe not found", 404,  true);
    }
    let isUserValid = await usersLogic.checkIfUserExists(value.userId);
    if(!isUserValid){
        throw new AppError(ErrorTypes.INVALID_USER, "user not found", 404, true)
    }
    await commentsDal.addComment(value);
};

const getAllComments = async () => {
    const comments = await commentsDal.getAllComments();
    if (!comments) {
        throw new AppError(ErrorTypes.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};

const getAllCommentsByRecipeId = async (recipeId) => {
    const comments = await commentsDal.getAllCommentsByRecipeId(recipeId);
    if (!comments) {
        throw new AppError(ErrorTypes.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};

const getAllCommentsByUserId = async (userId) => {
    const comments = await commentsDal.getAllCommentsByUserId(userId);
    if (!comments) {
        throw new AppError(ErrorTypes.NO_COMMENTS_FOUND, "no comments found", 404, "no comments found", true);
    }
    return comments;
};


const getComment = async (commentId) => {
    const comment = await commentsDal.getComment(commentId);
    if (!comment) {
        throw new AppError(ErrorTypes.NO_COMMENTS_FOUND, "comment not found", 404, "comment not found", true);
    }
    return comment;
};

const updateComment = async (comment) => {
    const {error,value} = validator.validateComments(comment);
    if (error) {
        throw new AppError(ErrorTypes.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await commentsDal.updateComment(value);
};

const deleteComment = async (commentId) => {
    await commentsDal.deleteComment(commentId);
};

export default {
    addComment,
    getAllComments,
    getAllCommentsByRecipeId,
    getAllCommentsByUserId,
    getComment,
    updateComment,
    deleteComment
};