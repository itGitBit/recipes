import express from 'express';
const router = express.Router();
import tagsLogic from '../logic/tags-logic.js';
import { tryCatch } from '../utils/trycatch.js';



router.post('/', tryCatch(async (request, response) => {
    let tag = request.body;
    await tagsLogic.addTag(tag);
    response.status(201).json({ message: 'Tag added successfully' });
}));

router.get('/', tryCatch(async (request, response) => {
    const tags = await tagsLogic.getAllTags();
    response.status(200).json(tags);
}));

router.get('/:tagId', tryCatch(async (request, response) => {
    const tagId = request.params.tagId;
    const tag = await tagsLogic.getTag(tagId);
    response.status(200).json(tag);
}));

router.get('/byrecipe/:recipeId', tryCatch(async (request, response) => {
    const recipeId = request.params.recipeId;
    const tags = await tagsLogic.getTagsByRecipeId(recipeId);
    response.status(200).json(tags);
}));

router.put('/:tagId', tryCatch(async (request, response) => {
    const tagId = request.params.tagId;
    const tag = request.body;
    tag.id = tagId;
    await tagsLogic.updateTag(tag);
    response.status(200).json({ message: 'Tag updated successfully' });
}));

router.delete('/:tagId', tryCatch(async (request, response) => {
    const tagId = request.params.tagId;
    await tagsLogic.deleteTag(tagId);
    response.status(200).json({ message: 'Tag deleted successfully' });
}));

export default router;
