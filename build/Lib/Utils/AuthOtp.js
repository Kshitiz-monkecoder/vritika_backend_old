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
exports.SendOTPwhatsApp = void 0;
const axios_1 = __importDefault(require("axios"));
const Middleware_1 = require("./Middleware");
const OTPverification_1 = __importDefault(require("../../Model/OTPverification"));
const SendOTPwhatsApp = (phoneNumber_1, ...args_1) => __awaiter(void 0, [phoneNumber_1, ...args_1], void 0, function* (phoneNumber, type = "salesPerson") {
    return new Promise((resolve, reject) => {
        if (phoneNumber === "916290118661") {
            // use in test numnber
            const modelData = new OTPverification_1.default({
                phoneNumber,
                otp: "123456",
                type
            });
            modelData
                .save()
                .then(() => {
                resolve(true);
            })
                .catch(reject);
        }
        else {
            const OTP = (0, Middleware_1.GenerateOTP)(6);
            axios_1.default
                .request({
                method: "POST",
                url: "https://services.kit19.com/IMS/Whatsapp/Template",
                headers: { "Content-Type": "application/JSON" },
                data: JSON.stringify({
                    key: "2B09C330FE0F4EC9B725CE0C5B0B6ADA",
                    username: "divypower106334",
                    name: "whatsapp",
                    remarks: "Thanks for applying  Vritika Application. \nSecurely enter OTP 497140 to proceed with your Vritika Application. Please do not share OTP with anyone for security reasons\nRegards - Divy Power",
                    whatsapp: {
                        to: phoneNumber,
                        type: "template",
                        category: "UTILITY",
                        recipient_type: "individual",
                        template: {
                            namespace: "e1bc99b6_a612_4ecb_9a0b_716deb718086",
                            language: { policy: "deterministic", code: "en" },
                            name: "otp_1_new",
                            components: [
                                {
                                    type: "body",
                                    parameters: [
                                        {
                                            type: "text",
                                            text: `Securely enter OTP ${OTP} to proceed with your Vritika Application. Please do not share OTP with anyone for security reasons`
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                })
            })
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                if (response.data.success) {
                    //"customerNumberVerification"
                    const modelData = new OTPverification_1.default({
                        phoneNumber,
                        otp: OTP,
                        type
                    });
                    yield modelData.save();
                    resolve(true);
                }
                else {
                    reject(new Error("Otp not send"));
                }
            }))
                .catch(reject);
        }
    });
});
exports.SendOTPwhatsApp = SendOTPwhatsApp;
