const connectionWrapper = require('./connection-wrapper');
const AppError = require('../error/AppError');
const errorType = require('../consts/ErrorTypes');



const addRecipe = async (recipe, connection) => {
    let sql = "insert into recipes (title, description, image, steps, user_id, likes_amount) values (?,?,?,?,?,?)";
    let parameters = [recipe.title, recipe.description, recipe.steps, recipe.image, recipe.userId, recipe.likesAmount];
    try {
        let response = await connectionWrapper.executeWithParameters(sql, parameters, connection);
        return response.insertId;
    } catch (error) {
        cconsole.log(`${calculateCurrentTime()} - recipesDal.AddRecipe ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add recipe to database", 500, false);
    }
}

const getAllRecipes = async () => {
    let sql = `SELECT id, title, description, image, steps, user_id, likes_amount FROM recipes;`;
    try {
        let recipes = await connectionWrapper.execute(sql);
        return recipes;
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.getAllRecipes ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to get all recipes from database", 500, false);
    }
}

const linkRecipeWithTags = async (recipeId, tagsId, connection) => {
    // Create placeholders for parameterized query
    const placeholders = tagsId.map(() => "(?, ?)").join(", ");
    const sql = `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${placeholders}`;

    // Create a flat array of parameters, alternating between recipeId and each tagId
    const parameters = tagsId.flatMap(tagId => [recipeId, tagId]);

    try {
        // Ensure the transaction connection is used if provided
        await connection.execute(sql, parameters);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.likeRecipesWithTags ${error.message}`);
        throw new AppError(errorType.DB_ERROR, error.message, 500, false);
    }
};

const linkRecipeWithIngredients = async (recipeId, ingredientsId, connection) => {
    const placeholders = ingredientsId.map(() => "(?, ?)").join(", ");
    const sql = `INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ${placeholders}`;
    const parameters = ingredientsId.flatMap(ingredientId => [recipeId, ingredientId]);

    try {
        await connection.execute(sql, parameters);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.likeRecipesWithIngredients ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to add ingredients to recipe in database", 500, false);
    }
};

const updateLikeCounter = async (recipeId, amountToUpdate, connection) => {
    let sql = "update recipes set likes_amount=likes_amount + ? where id = ?";
    let parameters = [amountToUpdate, recipeId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters, connection);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.updateLikeCounter ${error.message}`);
        throw new AppError(errorType.DB_ERROR, error.message, 500, false);
    }
}

const checkIfRecipeExists = async (recipeId) => {
    let sql = "select id from recipes where id = ?";
    let parameters = [recipeId];
    try {
        let recipeId = await connectionWrapper.executeWithParameters(sql, parameters);
        if (!recipeId) {
            return false;
        }
        else {
            return true;
        }
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.checkIfRecipeExists ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to check if recipe exists in database", 500, false);
    }
}

const getRecipe = async (recipeId) => {
    let sql = `SELECT id, title, description, image, steps, user_id, likes_amount FROM recipes WHERE id = ?`;
    let parameters = [recipeId];
    try {
        let recipe = await connectionWrapper.executeWithParameters(sql, parameters);
        return recipe;
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.getRecipe ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to get recipe from database", 500, false);
    }
}
const deleteRecipe = async (recipeId, connection) => {
    let sql = "delete from recipes where id = ?";
    let parameters = [recipeId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters, connection);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.deleteRecipe ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe from database", 500, false);
    }
}

const deleteIngredientsRecipesTableColumn = async (recipeId, connection) => {
    let sql = "delete from recipe_ingredients where recipe_id = ?";
    let parameters = [recipeId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters, connection);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.deleteIngredientsRecipesTableColumn ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe_ingredients from database", 500, false);
    }
}
const deleteTagsRecipesTableColumn = async (recipeId, connection) => {
    let sql = "delete from recipe_tags where recipe_id = ?";
    let parameters = [recipeId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters, connection);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - recipesDal.deleteTagsRecipesTableColumn ${error.message}`);
        throw new AppError(errorType.DB_ERROR, "Failed to delete recipe_tags from database", 500, false);
    }
}




module.exports = {
    addRecipe,
    linkRecipeWithIngredients,
    linkRecipeWithTags,
    getAllRecipes,
    updateLikeCounter,
    checkIfRecipeExists,
    getRecipe,
    deleteRecipe,
    deleteIngredientsRecipesTableColumn,
    deleteTagsRecipesTableColumn
};
