"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const password_hash_1 = __importDefault(require("password-hash"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        default: "Admin"
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    adminType: {
        type: String,
        required: true,
        enum: ["Organisation", "Individual"]
    },
    gstNo: { type: String },
    contactPersonName: { type: String },
    address: { type: String, required: true },
    aadharCardNo: { type: String, required: true },
    aadharCardImage: { type: [String], required: true },
    panCardNo: { type: String, required: true },
    panCardImage: { type: [String], required: true },
    bankAccountNo: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankHolderName: { type: String, required: true },
    code: { type: String },
    password: { type: String },
    image: {
        type: String,
        default: "https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png"
    },
    token: { type: String },
    passbookImage: { type: String }
}, { timestamps: true });
UserSchema.methods.comparePassword = function (candidatePassword) {
    return password_hash_1.default.verify(candidatePassword, this.password);
};
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
