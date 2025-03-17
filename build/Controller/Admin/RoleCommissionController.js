"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRoleCommission = exports.UpdateRoleCommission = exports.GetRoleCommissionById = exports.GetAllRoleCommissions = exports.AddRoleCommission = void 0;
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const RoleCommissionModel_1 = __importDefault(require("../../Model/RoleCommissionModel"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
// Add a new role commission
const AddRoleCommission = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        roleName: "required|string",
        commission: "required|number",
        status: "required|string"
    })
        .then(() => {
        const newRoleCommission = new RoleCommissionModel_1.default(req.body);
        newRoleCommission
            .save()
            .then((data) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data,
                message: "Role commission created successfully"
            });
        })
            .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({ status: false, message: error });
    });
};
exports.AddRoleCommission = AddRoleCommission;
// Get all role commissions
const GetAllRoleCommissions = (_req, res) => {
    RoleCommissionModel_1.default.find()
        .then((data) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data,
            message: "Role commissions retrieved successfully"
        });
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.GetAllRoleCommissions = GetAllRoleCommissions;
// Get a single role commission by ID
const GetRoleCommissionById = (req, res) => {
    RoleCommissionModel_1.default.findById(req.params.id)
        .then((data) => {
        if (data) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data,
                message: "Role commission retrieved successfully"
            });
        }
        else {
            res
                .status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR)
                .json({ status: false, message: "Role commission not found" });
        }
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.GetRoleCommissionById = GetRoleCommissionById;
// Update a role commission by ID
const UpdateRoleCommission = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        roleName: "string",
        commission: "number",
        status: "string"
    })
        .then(() => {
        RoleCommissionModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then((data) => {
            if (data) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data,
                    message: "Role commission updated successfully"
                });
            }
            else {
                res
                    .status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR)
                    .json({ status: false, message: "Role commission not found" });
            }
        })
            .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({ status: false, message: error });
    });
};
exports.UpdateRoleCommission = UpdateRoleCommission;
// Delete a role commission by ID
const DeleteRoleCommission = (req, res) => {
    RoleCommissionModel_1.default.findByIdAndDelete(req.params.id)
        .then((data) => {
        if (data) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data,
                message: "Role commission deleted successfully"
            });
        }
        else {
            res
                .status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR)
                .json({ status: false, message: "Role commission not found" });
        }
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.DeleteRoleCommission = DeleteRoleCommission;
