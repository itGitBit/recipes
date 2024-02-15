require('dotenv').config();
const { validateSignup, validateLogin } = require("./validator");
const usersDal = require("../dal/users-dal");
const bcrypt = require("bcrypt");
const AppError = require("../error/AppError");
const errorType = require("../consts/ErrorTypes");
const { response } = require("express");
const jwt = require('jsonwebtoken');

const login = async (userLoginDetails) => {
    const { error, value } = validateLogin(userLoginDetails);
    if (error) { throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true); }
    const user = await usersDal.getUserByEmail(userLoginDetails.email);
    if (!user) {
        throw new AppError(errorType.NO_USERS_FOUND, "user not found", 404, "user not found", true);
    }
    const isPasswordMatch = await bcrypt.compare(userLoginDetails.password, user.password);
    if (!isPasswordMatch) {
        throw new AppError(errorType.VALIDATION_ERROR, "invalid password", 400, "invalid password", true);
    }
    const accessToken = jwt.sign({ username: user.username, type: user.type, id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ username: user.username, type: user.type, id: user.id }, process.env.REFRESH_TOKEN_SECRET);
    return { accessToken, refreshToken };
}


const register = async (user) => {
    const { error, value } = validateSignup(user);
    if (error) { throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true); }
    await usersDal.isUserExist(user.email);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    await usersDal.addUser(user);
};


const getUser = async (userId) => {
    const user = await usersDal.getUser(userId);
    if (!user) {
        throw new AppError(errorType.NO_USERS_FOUND, "user not found", 404, "user not found", true);
    }
    return user;
};

const deleteUser = async (userId) => {
    await usersDal.deleteUser(userId);
};

const updateUser = async (user) => {
    const { error, value } = validateSignup(user);
    if (error) { throw new AppError(errorType.VALIDATION_ERROR, error.message, 400, error.code, true); }
    await usersDal.updateUser(user);
};


const checkIfUserExists = async (userId) => {
    const user = await usersDal.getUser(userId);
    if (!user) {
        return false;
    }
    return true;
}

const getAllUsers = async () => {
    const users = await usersDal.getAllUsers()
    if (!users) {
        throw new AppError(errorType.NO_USERS_FOUND, "no users found", 400, false);
    }
}




module.exports = {
    register,
    getUser,
    login,
    checkIfUserExists,
    updateUser,
    deleteUser,
    getAllUsers
};
