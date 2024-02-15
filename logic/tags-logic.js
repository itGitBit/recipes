const validateTags = require("./validator");
const tagsDal = require("../dal/tags-dal");
const AppError = require("../error/AppError");
const errorType = require("../consts/ErrorTypes");
const e = require("cors");


const addTag = async (tag) => {
    const { error, value } = validateTags.validateTags(tag);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await tagsDal.addTag(tag);
};

const getAllTags = async () => {
    const tags = await tagsDal.getAllTags();
    if (!tags) {
        throw new AppError(errorType.NO_TAGS_FOUND, "no tags found", 404, "no tags found", true);
    }
    return tags;
};

const getTag = async (tagId) => {
    const tag = await tagsDal.getTag(tagId);
    if (!tag) {
        throw new AppError(errorType.NO_TAGS_FOUND, "no tags found", 404, "no tags found", true);
    }
    return tag;
}

const getTagsByRecipeId = async (recipeId) => {
    const tags = await tagsDal.getTagsByRecipeId(recipeId);
    if (!tags) {
        return;
    }
    return tags;
}

const getAllTagsForRecipes = async (recipeIds) => {
    let tags = [];
    recipeIds.forEach(id => {
        let receivedTags = getTagsByRecipeId(id);
        tags.push(receivedTags);
    });
    return tags;
}


const updateTag = async (tag) => {
    const { error, value } = validateTags.validateTags(tag);
    if (error) {
        throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
    }
    await tagsDal.updateTag(tag);
};

const deleteTag = async (tagId) => {
    await tagsDal.deleteTag(tagId);
};

const addTagsFromRecipe = async (tags, connection) => {
    tags.forEach(tag => {
        const { error, value } = validateTags.validateTags(tag);
        if (error) {
            throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true);
        }
    });
    const existingTags = await tagsDal.checkIfTagsExist(tags, connection);
    const existingTagsNames = existingTags.map(tag => tag.name);
    const newTagsList = tags.filter(tag => !existingTagsNames.includes(tag.name));
    console.log(`tags-logic: newTagsList: ${JSON.stringify(newTagsList)}`);
    if (newTagsList.length > 0) {
        let addedTags = await tagsDal.addTagsFromRecipe(newTagsList, connection);
        existingTags.push(...addedTags);
    }
    console.log(`tags-logic: existingTags: ${existingTags}`);
    return existingTags;
}

module.exports = {
    addTag,
    getAllTags,
    getTag,
    getTagsByRecipeId,
    updateTag,
    deleteTag,
    addTagsFromRecipe,
    getAllTagsForRecipes
};