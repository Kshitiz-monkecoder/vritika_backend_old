"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUser = exports.GetUserById = exports.GetAllUsers = exports.UpdateUser = exports.AddUser = void 0;
const User_1 = __importDefault(require("../../Model/User"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode"); // Adjust the path according to your structure
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const password_hash_1 = __importDefault(require("password-hash"));
const ReferralCode_1 = require("../../Lib/Utils/ReferralCode");
// Add a new user
const AddUser = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        name: "required|string",
        email: "required|email",
        phone: "required|string"
    })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        const code = yield (0, ReferralCode_1.GenerateUniqueReferralCode)(8);
        const newUser = new User_1.default(Object.assign(Object.assign({}, req.body), { code }));
        if (req.body.password)
            newUser.password = password_hash_1.default.generate(req.body.password);
        newUser
            .save()
            .then((user) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: user,
                message: "User created successfully"
            });
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    }))
        .catch((error) => {
        console.log("error", error);
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.AddUser = AddUser;
// Update an existing user by ID
const UpdateUser = (req, res) => {
    const { id } = req.params;
    (0, ErrorHandler_1.InputValidator)(req.body, {
        firstName: "string",
        lastName: "string",
        type: "string",
        email: "email",
        password: "string"
    })
        .then(() => {
        const updatedData = Object.assign({}, req.body);
        // Only hash the password if it's being updated
        if (updatedData.password) {
            updatedData.password = password_hash_1.default.generate(updatedData.password);
        }
        User_1.default.findByIdAndUpdate(id, updatedData, { new: true })
            .then((user) => {
            if (user) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: user,
                    message: "User updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "User not found"
                });
            }
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.UpdateUser = UpdateUser;
// Retrieve all users
const GetAllUsers = (_req, res) => {
    User_1.default.find({ userType: "Admin" })
        .then((users) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: users,
            message: "Users retrieved successfully"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllUsers = GetAllUsers;
// Retrieve a single user by ID
const GetUserById = (req, res) => {
    const { id } = req.params;
    User_1.default.findById(id)
        .then((user) => {
        if (user) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: user,
                message: "User retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "User not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetUserById = GetUserById;
// Delete a user by ID
const DeleteUser = (req, res) => {
    const { id } = req.params;
    User_1.default.findByIdAndDelete(id)
        .then((deletedUser) => {
        if (deletedUser) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedUser,
                message: "User deleted successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "User not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteUser = DeleteUser;
