"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SuperAdmin_1 = __importDefault(require("../../Model/SuperAdmin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const password_hash_1 = __importDefault(require("password-hash"));
const createToken = (data) => {
    var _a;
    return jsonwebtoken_1.default.sign(data, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "");
};
const create = (req, res) => {
    const { email, password, name } = req.body;
    // Check if SuperAdmin already exists
    SuperAdmin_1.default.findOne({ email })
        .then((existingSuperAdmin) => {
        if (existingSuperAdmin) {
            res.status(ResponseCode_1.ResponseCode.DUPLICATE_KEY_ERROR).json({
                status: false,
                message: "SuperAdmin with this email already exists"
            });
            return;
        }
        // Create new SuperAdmin with hashed password
        const newSuperAdmin = new SuperAdmin_1.default({
            email,
            password: password_hash_1.default.generate(password), // Hash the password
            name,
            userType: "SuperAdmin"
        });
        newSuperAdmin.save()
            .then((savedSuperAdmin) => {
            const response = {
                data: {
                    _id: savedSuperAdmin._id,
                    email: savedSuperAdmin.email,
                    name: savedSuperAdmin.name,
                    userType: savedSuperAdmin.userType
                },
                status: true,
                message: "SuperAdmin created successfully"
            };
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
const login = (req, res) => {
    const { email, password } = req.body;
    SuperAdmin_1.default.findOne({ email })
        .then((result) => {
        if (result && result.comparePassword && result.comparePassword(password)) {
            const response = {
                data: {
                    token: createToken({
                        _id: result._id,
                        email: result.email,
                        type: result.userType
                    }),
                    userData: {
                        _id: result._id,
                        email: result.email,
                        userType: result.userType,
                        image: result.image,
                        name: result.name
                    }
                },
                status: true,
                message: "SuperAdmin login successful"
            };
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
        }
        else {
            res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                status: false,
                message: "Invalid credentials or SuperAdmin not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
const SuperAdminAuthController = {
    create,
    login
};
exports.default = SuperAdminAuthController;
