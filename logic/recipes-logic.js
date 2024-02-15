const recipesDal = require('../dal/recipes-dal');
const validator = require('./validator');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');
const ingredientsLogic = require('./ingredients-logic');
const tagsLogic = require('./tags-logic');
const { beginTransaction, commitTransaction, rollbackTransaction } = require('../dal/connection-wrapper');
const likesLogic = require('./likes-logic');
const { calculateCurrentTime } = require('../utils/calculate-time');



//WITH TRANSACTION
async function addRecipe(recipe, ingredients, tags) {
    let connection;
    let { error, value } = validator.validateRecipe(recipe);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    try {
        connection = await beginTransaction();
        let newRecipeId = await recipesDal.addRecipe(recipe, connection);
        await organizeIngredients(ingredients, connection);
        await organizeTags(tags, connection, newRecipeId);
        await commitTransaction(connection);

    } catch (error) {
        if (connection) await rollbackTransaction(connection);
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
        connection = await beginTransaction();
        await recipesDal.deleteIngredientsRecipesTableColumn(recipeId, connection);
        await recipesDal.deleteTagsRecipesTableColumn(recipeId, connection);
        await recipesDal.deleteRecipe(recipeId, connection);
        await likesLogic.deleteLikesByRecipeId(recipeId, connection);
        await commitTransaction(connection);
        console.log('Recipe and its components were deleted successfully.');
    }
    catch (error) {
        if (connection) await rollbackTransaction(connection);
        console.error(`Failed to delete recipe and its components: ${calculateCurrentTime()} ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe and its components", 500, false);
    }
};


const updateLikeCounter = async (recipeId, amountToUpdate, connection) => {
    await recipesDal.updateLikeCounter(recipeId, amountToUpdate, connection);
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
    const recipeIds = recipes.map(recipe => recipe.id);
    const tagsPromises = recipeIds.map(id => tagsLogic.getTagsByRecipeId(id));
    const ingredientsPromises = recipeIds.map(id => ingredientsLogic.getIngredientsByRecipeId(id));
    const tagsResults = await Promise.all(tagsPromises);
    const ingredientsResults = await Promise.all(ingredientsPromises);
    const tags = tagsResults.flat();
    const ingredients = ingredientsResults.flat();
    return { recipes, tags, ingredients };
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


module.exports = {
    addRecipe,
    getAllRecipes,
    getRecipe,
    updateLikeCounter,
    checkIfRecipeExists,
    deleteRecipe
};