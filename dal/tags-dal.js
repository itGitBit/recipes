import connectionWrapper from './connection-wrapper.js';
import AppError from '../error/AppError.js';
import ErrorTypes from '../consts/ErrorTypes.js';


const addTag = async (tag) => {
    let sql = "insert into tags (name) values (?)";
    let parameters = [tag.name];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(ErrorTypes.VALIDATION_ERROR, "Tag already exists", 400, error.code, true);
        }
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to add tag to database", 500, false);
    }
}



const getAllTags = async () => {
    let sql = "select id, name from tags";
    try {
        let tags = await connectionWrapper.execute(sql);
        return tags;
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get tags from database", 500, false);
    }
}

const getTag = async (tagId) => {
    let sql = "select id, name from tags where id = ?";
    let parameters = [tagId];
    try {
        let tag = await connectionWrapper.executeWithParameters(sql, parameters);
        return tag;
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, error.message, 500, false);
    }
}

const updateTag = async (tag) => {
    let sql = "update tags set name = ? where id = ?";
    let parameters = [tag.name, tag.id];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to update tag in database", 500, false);
    }
}

const deleteTag = async (tagId) => {
    let sql = "delete from tags where id = ?";
    let parameters = [tagId];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to delete tag from database", 500, false);
    }
}

const getTagsByRecipeId = async (recipeId) => {
    let sql = `SELECT t.id, t.name, rt.recipe_id
    FROM tags t 
    JOIN recipe_tags rt ON rt.tag_id = t.id where rt.recipe_id=? ;`;
    let parameters = [recipeId];
    try {
        let tags = await connectionWrapper.executeWithParameters(sql, parameters);
        return tags;
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get tags from database", 500, false);
    }
}

const checkIfTagsExist = async (tags, connection) => {
    const tagNames = tags.map(tag => tag.name); // Extract tag names
    const placeholders = tagNames.map(() => '?').join(',');
    const sql = `SELECT id, name FROM tags WHERE name IN (${placeholders})`;
    try {
        let [rows] = await connection.execute(sql, tagNames);
        const existingTags = rows.map(row => ({ name: row.name, id: row.id }));
        return existingTags;
    } catch (error) {
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to check if tags exist in database", 500, false);
    }
};


const addTagsFromRecipe = async (tags, connection) => {
    let tagsReturning = [];
    for (const tag of tags) {
        const sql = "INSERT INTO tags (name) VALUES (?)";
        const parameters = [tag.name];
        try {
            const result = await connection.execute(sql, parameters);
            tagsReturning.push({ id: result[0].insertId, name: tag.name });
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new AppError(ErrorTypes.VALIDATION_ERROR, "tag already exists", 400, error.code, true);
            }
            console.log(error.message);
            throw new Error("Failed to add tag to database", 500, false);
        }
    }
    return tagsReturning; // Return the collection of new ingredient IDs
}

export default {
    addTag,
    getAllTags,
    getTag,
    updateTag,
    deleteTag,
    checkIfTagsExist,
    addTagsFromRecipe,
    getTagsByRecipeId
};