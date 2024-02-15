const AppError = require('./AppError');
const errorType = require('../consts/ErrorTypes.js');


const errorHandler = (err, req, res, next) => {


    if (err instanceof AppError) {

        if (err.errorType == errorType.VALIDATION_ERROR) {
            return res.status(400).send({
                errorCode: err.errorType,
                details: err.message,
            });
        }


        return res.status(err.statusCode).json({ errorCode: err.errorCode, details: err.message });
    }


    console.error(err);
    res.status(500).send('Something went wrong');

};



module.exports = errorHandler;