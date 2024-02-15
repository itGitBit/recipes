const errorTypes = require("../consts/ErrorTypes");
const AppError = require("../error/AppError");
const {calculateCurrentTime} = require("./calculate-time")

exports.tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - ${error.message}`);
        return next(error);

    }
};

