import express from 'express';
const router = express.Router();
import ingredientsLogic from '../logic/ingredients-logic.js';
import { tryCatch } from '../utils/trycatch.js';

const server = express();



router.post('/', tryCatch(async (request, response) => {
    let ingredient = request.body;
    await ingredientsLogic.addIngredient(ingredient);
    response.status(201).json({ message: 'Ingredient added successfully' });
})
);
//checked and works 16.02

router.get('/', tryCatch(async (request, response) => {
    const ingredients = await ingredientsLogic.getAllIngredients();
    response.status(200).json(ingredients);
}));
//checked and works 16.02

router.put('/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    const ingredient = request.body;
    ingredient.id = ingredientId;
    await ingredientsLogic.updateIngredient(ingredient, ingredientId);
    response.status(200).json({ message: 'Ingredient updated successfully' });
}
));
//checked and works 16.02

router.get('/byid/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    const ingredient = await ingredientsLogic.getIngredient(ingredientId);
    response.status(200).json(ingredient);
}));
//checked and works 16.02

router.get('/byrecipe/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const ingredients = await ingredientsLogic.getIngredientsByRecipeId(recipeId);
    response.status(200).json(ingredients);
}));
//checked and works 16.02

router.delete('/:ingredientId', tryCatch(async (request, response) => {
    const ingredientId = request.params.ingredientId;
    await ingredientsLogic.deleteIngredient(ingredientId);
    response.status(200).json({ message: 'Ingredient deleted successfully' });
}));
//checked and works 16.02

export default router;
