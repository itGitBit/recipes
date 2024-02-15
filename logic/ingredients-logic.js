const ingredientsDal = require('../dal/ingredients-dal');
const validator = require('./validator');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');

const addIngredient = async (ingredient) => {
    // add userId to the ingredient
    //add to db as well
    const { error, value } = validator.validateIngredients(ingredient);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await ingredientsDal.addIngredient(ingredient);
};
const getAllIngredients = async () => {
    const ingredients = await ingredientsDal.getAllIngredients();
    if (!ingredients) {
        throw new AppError(errorType.NO_INGREDIENTS_FOUND, "no ingredients found", 404, "no ingredients found", true);
    }
    return ingredients;
};

const getIngredient = async (ingredientId) => {
    const ingredient = await ingredientsDal.getIngredient(ingredientId);
    if (!ingredient) {
        throw new AppError(errorType.NO_INGREDIENTS_FOUND, "ingredient not found", 404, "ingredient not found", true);
    }
    return ingredient;
};

const updateIngredient = async (ingredient) => {
    // await getIngredient(ingredient.id);
    //check if the creator is the one updating?
    const { error, value } = validator.validateIngredients(ingredient);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await ingredientsDal.updateIngredient(ingredient);
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
    ingredients.forEach(ingredient => {
        const { error, value } = validator.validateIngredients(ingredient);
        if (error) {
            throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
        }
    });
    try {
        let existingIngredients = await ingredientsDal.checkIfIngredientsExist(ingredients, connection); // Pass connection
        const existingIngredientNames = existingIngredients.map(ingredient => ingredient.name);
        const newIngredients = ingredients.filter(ingredient =>
            !existingIngredientNames.map(name => name.toLowerCase()).includes(ingredient.name.toLowerCase())
        );

        if (newIngredients.length > 0) {
            let addedIngredients = await ingredientsDal.addIngredientsFromRecipe(newIngredients, connection); // Pass connection
            existingIngredients.push(...addedIngredients);
        }
        return existingIngredients;
    } catch (error) {
        throw error; // Rethrow or handle the error accordingly
    }
};


module.exports = {
    addIngredient,
    getAllIngredients,
    getIngredient,
    updateIngredient,
    deleteIngredient,
    addIngredientsFromRecipe,
    getIngredientsByRecipeId,
    getAllIngredientsForRecipes
};