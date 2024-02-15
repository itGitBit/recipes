const express = require('express');
const router = express.Router();
const ingredientsLogic = require('../logic/ingredients-logic');
const { tryCatch } = require('../utils/trycatch');
const AppError = require('../error/AppError');
const server = express();


router.post('/', tryCatch(async (request, response) => {
    let ingredient = request.body;
    await ingredientsLogic.addIngredient(ingredient);
    response.status(201).json({ message: 'Ingredient added successfully' });
})
);

router.get('/', tryCatch(async (request, response) => {
    const ingredients = await ingredientsLogic.getAllIngredients();
    response.status(200).json(ingredients);
}));

router.put('/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    const ingredient = request.body;
    ingredient.id = ingredientId;
    await ingredientsLogic.updateIngredient(ingredient, ingredientId);
    response.status(200).json({ message: 'Ingredient updated successfully' });
}
));

router.get('/byid/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    const ingredient = await ingredientsLogic.getIngredient(ingredientId);
    response.status(200).json(ingredient);
}));

router.get('/byrecipe/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const ingredients = await ingredientsLogic.getIngredientsByRecipeId(recipeId);
    response.status(200).json(ingredients);
}));

router.delete('/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    await ingredientsLogic.deleteIngredient(ingredientId);
    response.status(200).json({ message: 'Ingredient deleted successfully' });
}));

module.exports = router;
