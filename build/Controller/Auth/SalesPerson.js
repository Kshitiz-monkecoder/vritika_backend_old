"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSalesPerson = exports.SalesPersonVerifyOtp = exports.SalesPersonOtpSent = void 0;
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const dotenv_1 = require("dotenv");
const SalesPerson_1 = __importDefault(require("../../Model/SalesPerson"));
const Middleware_1 = require("../../Lib/Utils/Middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const OTPverification_1 = __importDefault(require("../../Model/OTPverification"));
const AuthOtp_1 = require("../../Lib/Utils/AuthOtp");
(0, dotenv_1.configDotenv)();
const SalesPersonOtpSent = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        phoneNumber: "required|string"
    })
        .then(() => {
        const { phoneNumber } = req.body;
        (0, AuthOtp_1.SendOTPwhatsApp)(phoneNumber)
            .then(() => {
            res
                .status(ResponseCode_1.ResponseCode.SUCCESS)
                .json({ status: true, message: "OTP sent successfully" });
        })
            .catch((error) => {
            res
                .status(ResponseCode_1.ResponseCode.SERVER_ERROR)
                .json({ status: false, message: "Error sending OTP", error });
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.SalesPersonOtpSent = SalesPersonOtpSent;
const SalesPersonVerifyOtp = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        phoneNumber: "required|string",
        otp: "required|string"
    })
        .then(() => {
        const { phoneNumber, otp } = req.body;
        console.log("phoneNumber", phoneNumber, otp);
        OTPverification_1.default.findOne({
            otp,
            phoneNumber,
            status: true
        })
            .then((response) => {
            if (response) {
                response.updateOne({
                    $set: {
                        status: false
                    }
                });
                SalesPersonLogin(phoneNumber, res);
            }
            else {
                res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                    status: false,
                    message: "Invalid otp. please check your code and try again"
                });
            }
        })
            .catch((error) => {
            res
                .status(ResponseCode_1.ResponseCode.SERVER_ERROR)
                .json({ status: false, message: "Error sending OTP", error });
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.SalesPersonVerifyOtp = SalesPersonVerifyOtp;
const SalesPersonLogin = (phoneNumber, res) => {
    SalesPerson_1.default.findOne({ phoneNumber })
        .then((then) => {
        if (then) {
            const token = (0, Middleware_1.CreateToken)({
                _id: then._id,
                phoneNumber: phoneNumber
            }, "sales-person");
            const response = {
                data: {
                    token,
                    userData: {
                        phoneNumber: then.phoneNumber,
                        selfie: then.selfie,
                        name: then.name
                    }
                },
                status: true,
                message: "Login Success"
            };
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
        }
        else {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                message: "OTP Verify successfully",
                data: {
                    userData: {
                        phoneNumber: phoneNumber
                    }
                }
            });
        }
    })
        .catch(() => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            message: "OTP Verify successfully",
            data: {
                userData: {
                    phone: phoneNumber
                }
            }
        });
    });
};
const CreateSalesPerson = (req, res) => {
    try {
        const _id = new mongoose_1.default.Types.ObjectId();
        const token = (0, Middleware_1.CreateToken)({
            _id,
            phoneNumber: req.body.phoneNumber
        }, "sales-person");
        const ModelData = new SalesPerson_1.default(Object.assign(Object.assign({}, req.body), { token }));
        ModelData.save()
            .then((userData) => {
            const response = {
                data: {
                    token,
                    userData: {
                        phoneNumber: userData.phoneNumber,
                        selfie: userData.selfie,
                        name: userData.name
                    }
                },
                status: true,
                message: "Success"
            };
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    }
    catch (error) {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    }
};
exports.CreateSalesPerson = CreateSalesPerson;
