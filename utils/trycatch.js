import errorTypes from "../consts/ErrorTypes.js";
import AppError from "../error/AppError.js";
import calculateCurrentTime from "./calculate-time.js";

export function tryCatch(controller) { return async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        console.log(`${calculateCurrentTime()} - ${error.message}`);
        return next(error);

    }
};     }

