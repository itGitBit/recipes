import {
    addRecipe as addRecipeDal, linkRecipeWithIngredients, linkRecipeWithTags,
    deleteIngredientsRecipesTableColumn, deleteTagsRecipesTableColumn, updateLikeCounter as updateLikeCounterDal, getRecipe as getRecipeDal, getAllRecipes as getAllRecipesDal,
    getAllRecipesByIngredientId as getAllRecipesByIngredientIdDal, getAllRecipesByTagDal, getAllRecipesByUserIdDal, updateRecipeDal, getAllRecipesIngredientByIngredientIds
} from '../dal/recipes-dal.js';
import { validateRecipe } from './validator.js';
import AppError from '../error/AppError.js';
import errorType from '../consts/ErrorTypes.js';
import { addIngredientsFromRecipe, getIngredientsByRecipeId } from './ingredients-logic.js';
import { addTagsFromRecipe, getTagsByRecipeId, } from './tags-logic.js';
import { beginTransaction, commitTransaction, rollbackTransaction } from '../dal/connection-wrapper.js';
import { deleteLikesByRecipeIdWithConnection, getAllLikesByRecipeId } from './likes-logic.js';
import calculateCurrentTime from '../utils/calculate-time.js';




//WITH TRANSACTION
async function addRecipe(recipe, ingredients, tags) {
    let connection;

    let { error, value } = validateRecipe(recipe);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    try {
        connection = await beginTransaction();
        // await checkIfRecipeExistsDal(value);
        let newRecipeId = await addRecipeDal(value, connection);
        await organizeIngredients(ingredients, connection, newRecipeId);
        await organizeTags(tags, connection, newRecipeId);
        await commitTransaction(connection);

    } catch (error) {
        if (connection) await rollbackTransaction(connection);
        console.error(`${calculateCurrentTime()} - Failed to add recipe and its components: ${error}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add recipe and its components", 500, false);
    }
}

async function updateRecipe(recipe, ingredients, tags) {
    let connection;

    let { error, value } = validateRecipe(recipe);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    try {
        connection = await beginTransaction();
        await updateRecipeDal(value, connection);
        await organizeIngredients(ingredients, connection, newRecipeId);
        await organizeTags(tags, connection, newRecipeId);
        await commitTransaction(connection);

    } catch (error) {
        if (connection) await rollbackTransaction(connection);
        console.error(`${calculateCurrentTime()} - Failed to add recipe and its components: ${error}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add recipe and its components", 500, false);
    }
}

const organizeIngredients = async (ingredients, connection, recipeId) => {
    let ingredientsToLink = await addIngredientsFromRecipe(ingredients, connection);
    let ingredientIds = ingredientsToLink.map(ingredient => ingredient.id);
    await linkRecipeWithIngredients(recipeId, ingredientIds, connection);
}

const organizeTags = async (tags, connection, recipeId) => {
    let tagToLink = await addTagsFromRecipe(tags, connection);
    let tagIds = tagToLink.map(tag => tag.id);
    await linkRecipeWithTags(recipeId, tagIds, connection);
}


const deleteRecipe = async (recipeId) => {
    let connection;
    try {
        connection = await beginTransaction();
        await deleteIngredientsRecipesTableColumn(recipeId, connection);
        await deleteTagsRecipesTableColumn(recipeId, connection);
        await deleteRecipe(recipeId, connection);
        await deleteLikesByRecipeIdWithConnection(recipeId, connection);
        await commitTransaction(connection);
        console.log('Recipe and its components were deleted successfully.');
    }
    catch (error) {
        if (connection) await rollbackTransaction(connection);
        console.error(`Failed to delete recipe and its components: ${calculateCurrentTime()} ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe and its components", 500, false);
    }
};


const updateLikeCounter = async (recipeId) => {
    let likesPerRecipe = await getAllLikesByRecipeId(recipeId);
    let likesAmount = likesPerRecipe.length;
    await updateLikeCounterDal(recipeId, likesAmount);
    return likesAmount;
};

const checkIfRecipeExists = async (recipeId) => {
    const recipe = await getRecipeDal(recipeId);
    if (!recipe) {
        return false;
    }
    else {
        return true;
    }
}


const getAllRecipes = async () => {
    const recipes = await getAllRecipesDal();
    if (!recipes || recipes.length === 0) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "no recipes found", 404, "no recipes found", true);
    }
    const updatedRecipes = await Promise.all(recipes.map(async (recipe) => {
        const updatedRecipeLikesAmount = await updateLikeCounter(recipe.id);
        const tags = await getTagsByRecipeId(recipe.id);
        const ingredients = await getIngredientsByRecipeId(recipe.id);
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

    const recipe = await getRecipeDal(recipeId);
    if (!recipe) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipe not found", 404, true);
    }
    const tags = await getTagsByRecipeId(recipeId);
    const ingredients = await getIngredientsByRecipeId(recipeId);
    return { recipe, tags, ingredients };
};

const getAllRecipesByIngredientId = async (ingredientId) => {
    const recipes = await getAllRecipesByIngredientIdDal(ingredientId);
    if (!recipes) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipes not found", 404, true)
    }
    const extendedRecipes = await Promise.all(recipes.map(async (recipe) => {
        const updatedRecipeLikesAmount = await updateLikeCounterDal(recipe.id);
        const tags = await getTagsByRecipeId(recipe.id);
        const ingredients = await getIngredientsByRecipeId(recipe.id);
        return {
            ...recipe,
            likesAmount: updatedRecipeLikesAmount,
            tags: tags,
            ingredients: ingredients
        };
    }))
    return extendedRecipes;
}
const getAllRecipesByTag = async (tag) => {
    const recipes = await getAllRecipesByTagDal(tag.name);
    if (!recipes) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipes not found", 404, true)
    }
    const extendedRecipes = await Promise.all(recipes.map(async (recipe) => {
        const updatedRecipeLikesAmount = await updateLikeCounterDal(recipe.id);
        const tags = await getTagsByRecipeId(recipe.id);
        const ingredients = await getIngredientsByRecipeId(recipe.id);
        return {
            ...recipe,
            likesAmount: updatedRecipeLikesAmount,
            tags: tags,
            ingredients: ingredients
        };
    }))
    return extendedRecipes;
}

const getAllRecipesByUserId = async (userId) => {
    const recipes = await getAllRecipesByUserIdDal(userId);
    if (!recipes) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "recipes not found", 404, true)
    }
    const extendedRecipes = await Promise.all(recipes.map(async (recipe) => {
        const updatedRecipeLikesAmount = await updateLikeCounterDal(recipe.id);
        const tags = await getTagsByRecipeId(recipe.id);
        const ingredients = await getIngredientsByRecipeId(recipe.id);
        return {
            ...recipe,
            likesAmount: updatedRecipeLikesAmount,
            tags: tags,
            ingredients: ingredients
        };
    }))
    return extendedRecipes;
}

const getAllRecipesByIngredients = async (ingredients) => {
    const unusedIngredient = ingredients.shift();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "No ingredients provided", 400, true);
    }
    const ingredientIds = ingredients.map(ingredient => ingredient.id);
    const recipesPromises = ingredientIds.map(async (ingredientId) => {
        return await getAllRecipesIngredientByIngredientIds(ingredientId);
    });
    const recipes = await Promise.all(recipesPromises);
    if (!recipes || recipes.length === 0) {
        throw new AppError(errorType.NO_RECIPES_FOUND, "Recipes not found", 404, true);
    }
    const recipeSet = new Set();
    let lengthCounter = 0;
    let recipesToReturn = [];
    for (let recipe of recipes) {
        if (recipe.length > lengthCounter) {
            lengthCounter = recipe.length;
            recipesToReturn.unshift(recipe);

        }else{
            recipesToReturn.push(recipe);
        }
    }
    console.log(recipesToReturn);
    return recipesToReturn;
};




export {
    addRecipe,
    getAllRecipes,
    getRecipe,
    updateLikeCounter,
    checkIfRecipeExists,
    deleteRecipe,
    getAllRecipesByIngredientId,
    getAllRecipesByTag,
    getAllRecipesByUserId,
    updateRecipe,
    getAllRecipesByIngredients
};