import ErrorTypes from "../consts/ErrorTypes.js";
import AppError from "../error/AppError.js";
import connectionWrapper from "./connection-wrapper.js";


const addUser = async (user) => {
    let sql = " INSERT INTO users (username, password, email, type, profile_picture, active) VALUES (?, ?, ?, ?,?)"
    let parameters = [user.username, user.password, user.email, user.type];
    try {
        await connectionWrapper.executeWithParameters(sql, parameters);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(ErrorTypes.VALIDATION_ERROR, "User already exists", 400, error.code, true);
        }
        console.log(error.message);
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to add user to database", 500, false);
    }
}


const getUser = async (userId) => {
    let sql = "select username, email, type, profile_picture from users where id=?"
    let parameters = [userId];
    let user;
    try {
        user = await connectionWrapper.executeWithParameters(sql, parameters);
        if (!user) {

            throw new AppError(ErrorTypes.INVALID_USER, "user not found", 404, true);
        }

    }
    catch (error) {

        if (error instanceof AppError) {
            throw error;
        }

        console.log(error.message);
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get user from database", 500, false);
    }
    return user;

}

const getAllUsers = async () => {
    let sql = "select name, email, type, profile_picture from users"
    try {
        let userList = await connection.execute(sql);
        if (!userList) {
            throw new AppError(ErrorTypes.INVALID_USER, "no user found in database", 404, true);
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.log(error.message);
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get users from database", 500, false);
    }
    return userList;
}

const isUserExist = async (email) => {
    let sql = "select email from users where email = ?"
    let parameters = [email];
    try {
        let user = await connectionWrapper.executeWithParameters(sql, parameters);
        if (user[0] != null) {
            console.log("user already exists", user);
            throw new AppError(ErrorTypes.INVALID_USER, "user already exists", 404, true);
        }
    }
    catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.log(error.message);
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get user from database", 500, false);

    }
}


const getUserByEmail = async (email, password) => {
    const sql = "SELECT id, username, password, email, type, profile_picture FROM users WHERE email = ?";
    let parameters = [email];
    try {
        let users = await connectionWrapper.executeWithParameters(sql, parameters);
        let user = users[0];
        if (!user) {
            throw new AppError("user not found");
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.log(error.message);
        throw new AppError(ErrorTypes.DB_ERROR, "Failed to get user from database", 500, false);
    }

    return user;
}



export default {
    addUser,
    getUser,
    getAllUsers,
    getUserByEmail,
    isUserExist
}