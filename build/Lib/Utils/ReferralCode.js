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
exports.GenerateUniqueReferralCode = void 0;
const User_1 = __importDefault(require("../../Model/User"));
const GenerateUniqueReferralCode = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (length = 8) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referralCode;
    let isUnique = false;
    do {
        referralCode = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            referralCode += characters[randomIndex];
        }
        // Check if the generated code already exists in the database
        const existingUser = yield User_1.default.findOne({ code: referralCode }).lean();
        isUnique = !existingUser; // Unique if no user exists with this code
    } while (!isUnique);
    return referralCode;
});
exports.GenerateUniqueReferralCode = GenerateUniqueReferralCode;
