const connectionWrapper = require('./connection-wrapper');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');
const { calculateCurrentTime } = require('../utils/calculate-time');



const addIngredient = async (ingredient) => {
    let sql = "insert into ingredients (name) values (?)";
    let parameters = [ingredient.name];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - ${error.message}`);
        if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(errorType.VALIDATION_ERROR, "Ingredient already exists", 400, error.code, true);
        }
        throw new AppError(errorType.DB_ERROR, "Failed to add ingredient to database", 500, false);
    }
}

const getAllIngredients = async () => {
    let sql = "select id,name from ingredients";
    try {
        let ingredients = await connectionWrapper.execute(sql);
        return ingredients;
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to get ingredients from database", 500, false);
    }
}
const getIngredient = async (ingredientId) => {
    let sql = "select id, name from ingredients where id = ?";
    let parameters = [ingredientId];
    try {
        let ingredient = await connectionWrapper.executeWithParameters(sql, parameters);
        return ingredient;
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to get ingredient from database", 500, false);
    }
}

const getIngredientsByRecipeId = async (recipeId) => {
    let sql = `SELECT i.id, i.name , ri.recipe_id
    FROM ingredients i 
    JOIN recipe_ingredients ri ON ri.ingredient_id = i.id where ri.recipe_id=? ;`;

    let parameters = [recipeId];
    try {
        let ingredients = await connectionWrapper.executeWithParameters(sql, parameters);
        return ingredients;
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to get ingredients from database", 500, false);
    }
}



const updateIngredient = async (ingredient) => {
    let sql = "update ingredients set name = ? where id = ?";
    let parameters = [ingredient.name, ingredient.id];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to update ingredient in database", 500, false);
    }
}
const deleteIngredient = async (ingredientId) => {
    let sql = "delete from ingredients where id = ?";
    let parameters = [ingredientId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete ingredient from database", 500, false);
    }
}

const checkIfIngredientsExist = async (ingredients, connection) => {
    let ingredientsNames = ingredients.map(ingredient => ingredient.name);
    const placeholders = ingredientsNames.map(() => '?').join(',');
    const sql = `SELECT id, name FROM ingredients WHERE name IN (${placeholders})`;
    const parameters = ingredients.map(ingredient => ingredient.name);

    try {
        // Execute the query and directly destructure to get the rows from the response
        const [rows] = await connection.execute(sql, parameters);
        // Map over the rows to format them as desired
        let existingIngredients = rows.map(row => ({ name: row.name, id: row.id }));
        return existingIngredients;
    } catch (error) {
        throw new AppError(errorType.DB_ERROR, "Failed to get ingredients from database", 500, false);
    }
};





async function addIngredientsFromRecipe(ingredients, connection) {
    let ingredientsReturning = [];
    for (const ingredient of ingredients) {
        const sql = "INSERT INTO ingredients (name) VALUES (?)";
        const parameters = [ingredient.name];
        try {
            const result = await connection.execute(sql, parameters);
            ingredientsReturning.push({ id: result[0].insertId, name: ingredient.name });
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new AppError(errorType.VALIDATION_ERROR, "Ingredient already exists", 400, error.code, true);
            }
            console.log(`${calculateCurrentTime()} - ${error.message}`);
            throw new Error("Failed to add ingredient to database", 500, false);
        }
    }
    return ingredientsReturning; // Return the collection of new ingredient IDs
}


module.exports = {
    addIngredient,
    getAllIngredients,
    getIngredient,
    getIngredientsByRecipeId,
    updateIngredient,
    deleteIngredient,
    checkIfIngredientsExist,
    addIngredientsFromRecipe
};