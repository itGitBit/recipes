const connectionWrapper = require('./connection-wrapper');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');
const { calculateCurrentTime } = require('../utils/calculate-time');



const addComment = async (comment) => {
    let sql = "insert into comments (title, description, user_id, recipe_id) values (?,?,?,?)";
    let parameters = [comment.title, comment.description, comment.userId, comment.recipeId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        console.log(`${calculateCurrentTime()} -CommentsDal.addComment ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add comment to database", 500, false);
    }
}

const getAllComments = async () => {
    let sql = "select id, title, description, user_id, recipe_id from comments";
    try {
        let comments = await connectionWrapper.execute(sql);
        return comments;
    } catch (error) {
        console.log(`${calculateCurrentTime()} -CommentsDal.getAllComments ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to get comments from database", 500, false);
    }
}

const getComment = async (commentId) => {
    let sql = "select id, title, description, user_id, recipe_id from comments where id = ?";
    let parameters = [commentId];
    try {
        let comment = await connectionWrapper.executeWithParameters(sql, parameters);
        return comment;
    } catch (error) {
        console.log(`${calculateCurrentTime()} -CommentsDal.getComment ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to get comment from database", 500, false);
    }
}

const getAllCommentsByRecipeId = async (recipeId) => {
    let sql = "select id, title, description, user_id, recipe_id from comments where recipe_id = ?";
    let parameters = [recipeId];
    try {
        let comments = await connectionWrapper.executeWithParameters(sql, parameters);
        return comments;
    } catch (error) {
        console.log(`${calculateCurrentTime()} -CommentsDal.getAllCommentsByRecipeId ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to get comments from database", 500, false);
    }
}

const getAllCommentsByUserId = async (userId) => {
    let sql = "select id, title, description, user_id, recipe_id from comments where user_id = ?";
    let parameters = [userId];
    try {
        let comments = await connectionWrapper.executeWithParameters(sql, parameters);
        return comments;
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to get comments from database", 500, false);
    }
}

const updateComment = async (comment) => {
    let sql = "update comments set title = ?, description = ? where id = ?";
    let parameters = [comment.title, comment.description, comment.id];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to update comment in database", 500, false);
    }
}

const deleteComment = async (commentId) => {
    let sql = "delete from comments where id = ?";
    let parameters = [commentId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to delete comment from database", 500, false);
    }
}
module.exports = {
    addComment,
    getAllComments,
    getComment,
    getAllCommentsByRecipeId,
    getAllCommentsByUserId,
    updateComment,
    deleteComment
};
