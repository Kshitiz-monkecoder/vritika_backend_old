"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.CreateToken = void 0;
exports.GenerateOTP = GenerateOTP;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ResponseCode_1 = require("./ResponseCode");
const parmisoen = [
    {
        url: "/sales-person/quotation-pdf"
    }
];
function GenerateOTP(length = 6) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}
const CreateToken = (data, userType) => {
    var _a;
    return jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, data), { userType }), (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "");
};
exports.CreateToken = CreateToken;
const middleware = (req, res, next) => {
    var _a;
    const authorization = req.headers.authorization;
    if (parmisoen.filter((it) => it.url === req.path).length > 0) {
        next();
    }
    else if (!authorization) {
        res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
            status: false,
            message: "No credentials sent!"
        });
    }
    else {
        try {
            const decrypted = jsonwebtoken_1.default.verify(authorization, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "");
            req.User = {
                _id: decrypted._id,
                email: decrypted.email
            };
            next();
        }
        catch (error) {
            res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                status: false,
                message: "Auth error!"
            });
        }
    }
};
exports.middleware = middleware;
