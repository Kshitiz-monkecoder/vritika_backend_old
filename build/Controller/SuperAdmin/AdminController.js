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
exports.DeleteAdmin = exports.GetAdminById = exports.GetAllAdmins = exports.UpdateAdmin = exports.AddAdmin = void 0;
const User_1 = __importDefault(require("../../Model/User"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const password_hash_1 = __importDefault(require("password-hash"));
const ReferralCode_1 = require("../../Lib/Utils/ReferralCode");
// SuperAdmin: Add a new Admin
const AddAdmin = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        name: "required|string",
        email: "required|email",
        phone: "required|string"
    })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const code = yield (0, ReferralCode_1.GenerateUniqueReferralCode)(8);
        // Get SuperAdmin ID from authenticated user (from middleware)
        const superAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const newAdmin = new User_1.default(Object.assign(Object.assign({}, req.body), { code, userType: "Admin", createdBy: superAdminId // Reference to SuperAdmin
         }));
        if (req.body.password) {
            newAdmin.password = password_hash_1.default.generate(req.body.password);
        }
        newAdmin
            .save()
            .then((admin) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: admin,
                message: "Admin created successfully"
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
exports.AddAdmin = AddAdmin;
// SuperAdmin: Update an Admin by ID
const UpdateAdmin = (req, res) => {
    const { id } = req.params;
    (0, ErrorHandler_1.InputValidator)(req.body, {
        name: "string",
        email: "email",
        phone: "string"
    })
        .then(() => {
        var _a;
        const updatedData = Object.assign({}, req.body);
        // Only hash the password if it's being updated
        if (updatedData.password) {
            updatedData.password = password_hash_1.default.generate(updatedData.password);
        }
        // Get SuperAdmin ID from authenticated user
        const superAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Only update if this admin was created by this SuperAdmin
        User_1.default.findOneAndUpdate({ _id: id, createdBy: superAdminId }, updatedData, { new: true })
            .then((admin) => {
            if (admin) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: admin,
                    message: "Admin updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Admin not found or you don't have permission to update this admin"
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
exports.UpdateAdmin = UpdateAdmin;
// SuperAdmin: Get all Admins created by this SuperAdmin
const GetAllAdmins = (req, res) => {
    var _a;
    // Get SuperAdmin ID from authenticated user
    const superAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    User_1.default.find({ userType: "Admin", createdBy: superAdminId })
        .select("-password -token")
        .populate("createdBy", "name email")
        .then((admins) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: admins,
            message: "Admins retrieved successfully"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllAdmins = GetAllAdmins;
// SuperAdmin: Get a single Admin by ID
const GetAdminById = (req, res) => {
    var _a;
    const { id } = req.params;
    const superAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    User_1.default.findOne({ _id: id, createdBy: superAdminId })
        .select("-password -token")
        .populate("createdBy", "name email")
        .then((admin) => {
        if (admin) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: admin,
                message: "Admin retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "Admin not found or you don't have permission"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAdminById = GetAdminById;
// SuperAdmin: Delete an Admin by ID
const DeleteAdmin = (req, res) => {
    var _a;
    const { id } = req.params;
    const superAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    User_1.default.findOneAndDelete({ _id: id, createdBy: superAdminId })
        .then((deletedAdmin) => {
        if (deletedAdmin) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedAdmin,
                message: "Admin deleted successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "Admin not found or you don't have permission"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteAdmin = DeleteAdmin;
