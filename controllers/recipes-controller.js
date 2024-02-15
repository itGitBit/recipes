const express = require('express');
const router = express.Router();
const recipesLogic = require('../logic/recipes-logic');
const { tryCatch } = require('../utils/trycatch');
const AppError = require('../error/AppError');

router.post('/', tryCatch(async (request, response) => {
    let recipe = request.body;
    let ingredients = request.body.ingredients;
    let tags = request.body.tags;
    await recipesLogic.addRecipe(recipe, ingredients, tags);

    response.status(201).json({ message: 'Recipe added successfully' });
}));

router.get('/', tryCatch(async (request, response) => {
    const recipesExtended = await recipesLogic.getAllRecipes();
    response.status(200).json(recipesExtended);
}));

router.get('/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const recipe = await recipesLogic.getRecipe(recipeId);
    response.status(200).json(recipe);
}));

router.get('/byingredient/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    const recipes = await recipesLogic.getAllRecipesByIngredientId(ingredientId);
    response.status(200).json(recipes);
}));

router.get('/bytags/:tags', tryCatch(async (request, response) => {
    const tags = request.params.tags;
    const recipes = await recipesLogic.getAllRecipesByTags(tags);
    response.status(200).json(recipes);
}));



router.get('/byuser/:userId', tryCatch(async (request, response) => {
    const userId = request.params.userId;
    const recipes = await recipesLogic.getAllRecipesByUserId(userId);
    response.status(200).json(recipes);
}));

router.put('/:recipeId', tryCatch(async (request, response) => {
    let recipe = request.body;
    recipe.id = request.params.recipeId;
    await recipesLogic.updateRecipe(recipe);
    response.status(200).json({ message: 'Recipe updated successfully' });
}));

router.delete('/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    await recipesLogic.deleteRecipe(recipeId);
    response.status(200).json({ message: 'Recipe deleted successfully' });
}));

module.exports = router;