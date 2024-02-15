const ErrorTypes = {
    INVALID_USER: 400,
    INVALID_PASSWORD: 404,
    INVALID_EMAIL: 404,
    INVALID_TOKEN: 401,
    NO_USERS_FOUND: 404,
    DB_ERROR:500,
    VALIDATION_ERROR: 400,
    NO_INGREDIENTS_FOUND: 404,
    NO_RECIPES_FOUND: 404,
    NO_COMMENTS_FOUND: 404,
    NO_TAGS_FOUND: 404,
    NO_RECIPES_FOUND: 404,
    NO_LIKES_FOUND: 404,
    RECIPE_ADD_FAILED: 500,
    DOUBLE_LIKE: 400,
    
// change codes because it's confusing with http codes
};

module.exports = ErrorTypes;