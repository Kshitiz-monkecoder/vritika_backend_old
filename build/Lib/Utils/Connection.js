"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => {
    var _a;
    const mongoURI = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "mongodb://localhost:27017/mydatabase";
    mongoose_1.default.connect(mongoURI)
        .then(() => {
        console.log("MongoDB connected");
    })
        .catch((error) => {
        console.error("MongoDB connection error:", error);
    });
};
exports.connectDB = connectDB;
