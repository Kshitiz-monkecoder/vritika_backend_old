"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../Model/User"));
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const getUserProfile = (req, res) => {
    var _a;
    User_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id)
            }
        },
        {
            $project: {
                __v: 0,
                token: 0,
                createdOn: 0,
                updatedOn: 0,
                isDeleted: 0,
                password: 0
            }
        }
    ])
        .then((result) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: result[0],
            message: "Successfully Get UserProfile"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
const UserController = {
    getUserProfile
};
exports.default = UserController;
