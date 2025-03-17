"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllState = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const GetAllState = (req, res) => {
    var _a;
    try {
        const collection = (_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.collection("states");
        collection === null || collection === void 0 ? void 0 : collection.find({}).sort({ name: 1 }).toArray().then((data) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS)
                .json({
                status: true,
                data,
                message: "States retrieved successfully"
            });
        }).catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    }
    catch (error) {
        (0, ErrorHandler_1.dbError)(error, res);
    }
};
exports.GetAllState = GetAllState;
