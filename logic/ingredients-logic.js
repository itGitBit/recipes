import ingredientsDal from '../dal/ingredients-dal.js';
import validator from './validator.js';
import AppError from '../error/AppError.js';
import ErrorTypes from '../consts/ErrorTypes.js';

const addIngredient = async (ingredient) => {
    const { error, value } = validator.validateIngredients(ingredient);
    if (error) {
        throw new AppError(ErrorTypes.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await ingredientsDal.addIngredient(value);
};

const getAllIngredients = async () => {
    const ingredients = await ingredientsDal.getAllIngredients();
    if (!ingredients) {
        throw new AppError(ErrorTypes.NO_INGREDIENTS_FOUND, "no ingredients found", 404, "no ingredients found", true);
    }
    return ingredients;
};

const getIngredient = async (ingredientId) => {
    const ingredient = await ingredientsDal.getIngredient(ingredientId);
    if (!ingredient) {
        throw new AppError(ErrorTypes.NO_INGREDIENTS_FOUND, "ingredient not found", 404, "ingredient not found", true);
    }
    return ingredient;
};

const updateIngredient = async (ingredient) => {
    const { error, value } = validator.validateIngredients(ingredient);
    if (error) {
        throw new AppError(ErrorTypes.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await ingredientsDal.updateIngredient(value);
};

const deleteIngredient = async (ingredientId) => {
    await ingredientsDal.deleteIngredient(ingredientId);
};

const getIngredientsByRecipeId = async (recipeId) => {
    const ingredients = await ingredientsDal.getIngredientsByRecipeId(recipeId);
    if (!ingredients) {
        return;
    }
    return ingredients;
};

const getAllIngredientsForRecipes = async (recipeIds) => {
    let ingredients = [];
    recipeIds.forEach(id => {
        let receivedIngredients = getIngredientsByRecipeId(id);
        ingredients.push(receivedIngredients);
    });
    return ingredients;
};


const addIngredientsFromRecipe = async (ingredients, connection) => {
    let values = [];
    ingredients.forEach(ingredient => {
        const { error, value } = validator.validateIngredients(ingredient);
        values.push(value);
        if (error) {
            throw new AppError(ErrorTypes.VALIDATION_ERROR, error.message, 400, error.code, true);
        }
    });
    try {
        let existingIngredients = await ingredientsDal.checkIfIngredientsExist(values, connection);
        const existingIngredientNames = existingIngredients.map(ingredient => ingredient.name);
        const newIngredients = values.filter(ingredient =>
            !existingIngredientNames.map(name => name.toLowerCase()).includes(ingredient.name.toLowerCase())
        );

        if (newIngredients.length > 0) {
            let addedIngredients = await ingredientsDal.addIngredientsFromRecipe(newIngredients, connection);
            existingIngredients.push(...addedIngredients);
        }
        return existingIngredients;
    } catch (error) {
        throw new AppError(ErrorTypes.INVALID_INGREDIENT, error.message, 400, true);
    }
};


export default {
    addIngredient,
    getAllIngredients,
    getIngredient,
    updateIngredient,
    deleteIngredient,
    addIngredientsFromRecipe,
    getIngredientsByRecipeId,
    getAllIngredientsForRecipes
};