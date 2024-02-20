import recipesDal from '../dal/recipes-dal.js';
import validator from './validator.js';
import AppError from '../error/AppError.js';
import errorType from '../consts/ErrorTypes.js'; // Check if errorType is default or named export
import ingredientsLogic from './ingredients-logic.js';
import tagsLogic from './tags-logic.js'; // Check if it's a default import or needs specific named imports
import connectionWrapper from '../dal/connection-wrapper.js';
import likesLogic from './likes-logic.js'; // Check if it's a default import or needs specific named imports
import calculateCurrentTime from '../utils/calculate-time.js';




//WITH TRANSACTION
async function addRecipe(recipe, ingredients, tags) {
    let connection;
    
    let { error, value } = validator.validateRecipe(recipe);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    try {
        connection = await connectionWrapper.beginTransaction();
        await recipesDal.checkIfRecipeExists(value);
        let newRecipeId = await recipesDal.addRecipe(value, connection);
        await organizeIngredients(ingredients, connection, newRecipeId);
        await organizeTags(tags, connection, newRecipeId);
        await connectionWrapper.commitTransaction(connection);

    } catch (error) {
        if (connection) await connectionWrapper.rollbackTransaction(connection);
        console.error(`${calculateCurrentTime()} - Failed to add recipe and its components: ${error}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add recipe and its components", 500, false);
    }
}

const organizeIngredients = async (ingredients, connection, recipeId) => {
    let ingredientsToLink = await ingredientsLogic.addIngredientsFromRecipe(ingredients, connection);
    let ingredientIds = ingredientsToLink.map(ingredient => ingredient.id);
    await recipesDal.linkRecipeWithIngredients(recipeId, ingredientIds, connection);
}

const organizeTags = async (tags, connection, recipeId) => {
    let tagToLink = await tagsLogic.addTagsFromRecipe(tags, connection);
    let tagIds = tagToLink.map(tag => tag.id);
    await recipesDal.linkRecipeWithTags(recipeId, tagIds, connection);
}


const deleteRecipe = async (recipeId) => {
    let connection;
    try {
        connection = await connectionWrapper.beginTransaction();
        await recipesDal.deleteIngredientsRecipesTableColumn(recipeId, connection);
        await recipesDal.deleteTagsRecipesTableColumn(recipeId, connection);
        await recipesDal.deleteRecipe(recipeId, connection);
        await likesLogic.deleteLikesByRecipeIdWithConnection(recipeId, connection);
        await connectionWrapper.commitTransaction(connection);
        console.log('Recipe and its components were deleted successfully.');
    }
    catch (error) {
        if (connection) await connectionWrapper.rollbackTransaction(connection);
        console.error(`Failed to delete recipe and its components: ${calculateCurrentTime()} ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe and its components", 500, false);
    }
};


const updateLikeCounter = async (recipeId) => {
    let likesPerRecipe = await likesLogic.getAllLikesByRecipeId(recipeId);
    let likesAmount = likesPerRecipe.length;
    await recipesDal.updateLikeCounter(recipeId, likesAmount);
    return likesAmount;
};

const checkIfRecipeExists = async (recipeId) => {
    const recipe = await recipesDal.getRecipe(recipeId);
    if (!recipe) {
        return false;
    }
    else {
        return true;
    }
}


const getAllRecipes = async () => {
    const recipes = await recipesDal.getAllRecipes();
    if (!recipes || recipes.length === 0) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "no recipes found", 404, "no recipes found", true);
    }
    const updatedRecipes = await Promise.all(recipes.map(async (recipe) => {
        const updatedRecipeLikesAmount = await updateLikeCounter(recipe.id);
        const tags = await tagsLogic.getTagsByRecipeId(recipe.id);
        const ingredients = await ingredientsLogic.getIngredientsByRecipeId(recipe.id);
        return {
            ...recipe,
            likesAmount: updatedRecipeLikesAmount,
            tags: tags,
            ingredients: ingredients
        };
    }));

    return updatedRecipes;
};

const getRecipe = async (recipeId) => {

    const recipe = await recipesDal.getRecipe(recipeId);
    if (!recipe) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipe not found", 404, "recipe not found", true);
    }
    const tags = await tagsLogic.getTagsByRecipeId(recipeId);
    const ingredients = await ingredientsLogic.getIngredientsByRecipeId(recipeId);
    return { recipe, tags, ingredients };
};


export default {
    addRecipe,
    getAllRecipes,
    getRecipe,
    updateLikeCounter,
    checkIfRecipeExists,
    deleteRecipe
};