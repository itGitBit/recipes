const validateLikes = require("./validator");
const likesDal = require("../dal/likes-dal");
const AppError = require("../error/AppError");
const errorType = require("../consts/ErrorTypes");
const recipeLogic = require("./recipes-logic");
const { beginTransaction, commitTransaction, rollbackTransaction } = require('../dal/connection-wrapper');
//use import instead of require

const addLike = async (like) => {

    //overkill. preferred to count the like per recipe everytime a like is added.
    let connection;
    const { error, value } = validateLikes.validateLikes(like);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    try {
        connection = await beginTransaction();
        await likesDal.addLike(like, connection);
        await recipeLogic.updateLikeCounter(like.recipeId, +1, connection);
        await commitTransaction(connection);
        return "like added";
    } catch (error) {
        if (error.errorType === errorType.DOUBLE_LIKE) {
            try {
                await toggleLikeOff(like.userId, like.recipeId, -1, connection);
                await commitTransaction(connection);
                return "like removed"; 
            } catch (innerError) {
                await rollbackTransaction(connection);
            }
        } else if (connection) {
            await rollbackTransaction(connection);
        }
        throw new AppError(errorType.DB_ERROR, "Failed to add like to database", 500, false);
    }

};

const getAllLikes = async () => {
    const likes = await likesDal.getAllLikes();
    if (!likes) {
        throw new AppError(errorType.NO_LIKES_FOUND, "no likes found", 404, "no likes found", true);
    }
    return likes;
};

const getAllLikesByRecipeId = async (recipeId) => {
    const likes = await likesDal.getAllLikesByRecipeId(recipeId);
    if (!likes) {
        return;
    }
    return likes;
}
const getAllLikesByUserId = async (userId) => {
    const likes = await likesDal.getAllLikesByUserId(userId);
    if (!likes) {
        return;
    }
    return likes;
}

const deleteLike = async (userId, recipeId) => {
    let connection;
    try {
        connection = await beginTransaction();
        await recipeLogic.updateLikeCounter(recipeId, -1);
        await likesDal.deleteLike(userId, recipeId);
        await commitTransaction(connection);
    }
    catch (error) {
        if (connection) {
            await rollbackTransaction(connection);
            throw new AppError(errorType.DB_ERROR, error.message, 500, true);
        }

    }
};

const toggleLikeOff = async (userId, recipeId, amountToUpdate, connection) => {
    try {
        await recipeLogic.updateLikeCounter(recipeId, amountToUpdate, connection);
        await likesDal.deleteLike(userId, recipeId, connection);
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, error.message, 500, false)
    }
}

const deleteLikesByRecipeId = async (recipeId, connection) => {
    await likesDal.deleteLikesByRecipeId(recipeId, connection);
};


module.exports = {
    addLike,
    getAllLikes,
    getAllLikesByRecipeId,
    deleteLike,
    getAllLikesByUserId,
    deleteLikesByRecipeId
};