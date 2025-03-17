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
exports.DeleteSalesPerson = exports.GetSalesPersonById = exports.GetAllSalesPersons = exports.UpdateSalesPerson = exports.AddSalesPerson = void 0;
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode"); // Custom response codes utility
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler"); // Error handling utils
const SalesPerson_1 = __importDefault(require("../../Model/SalesPerson"));
// Add a new SalesPerson
const AddSalesPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        name: "required|string",
        phoneNumber: "required|string",
        email: "required|string|email",
        address: "required|string",
        selfie: "required|string",
        aadharCardNumber: "required|string",
        aadharCardFront: "required|string",
        aadharCardBack: "required|string",
        panCardNumber: "required|string",
        panCardFront: "required|string",
        bankAccountNumber: "required|string",
        bankIfscCode: "required|string",
        bankAccountName: "required|string",
        cancelChequePhoto: "required|string",
        status: "required|string|in:Inactive,Active,Pending"
    })
        .then(() => {
        const salesPerson = new SalesPerson_1.default(Object.assign({}, req.body));
        salesPerson
            .save()
            .then((savedSalesPerson) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: savedSalesPerson,
                message: "SalesPerson created successfully",
            });
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error,
        });
    });
});
exports.AddSalesPerson = AddSalesPerson;
// Update an existing SalesPerson by ID
const UpdateSalesPerson = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        name: "string",
        phoneNumber: "string",
        email: "string|email",
        address: "string",
        selfie: "string",
        aadharCardNumber: "string",
        aadharCardFront: "string",
        aadharCardBack: "string",
        panCardNumber: "string",
        panCardFront: "string",
        bankAccountNumber: "string",
        bankIfscCode: "string",
        bankAccountName: "string",
        cancelChequePhoto: "string",
        status: "string|in:Inactive,Active,Pending"
    })
        .then(() => {
        const { id } = req.params;
        SalesPerson_1.default.findByIdAndUpdate(id, req.body, { new: true })
            .then((updatedSalesPerson) => {
            if (updatedSalesPerson) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedSalesPerson,
                    message: "SalesPerson updated successfully",
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "SalesPerson not found",
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
            message: error,
        });
    });
};
exports.UpdateSalesPerson = UpdateSalesPerson;
// Get all SalesPersons
const GetAllSalesPersons = (_req, res) => {
    SalesPerson_1.default.aggregate([
        {
            $project: {
                token: 0
            }
        }
    ])
        .then((salesPersons) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: salesPersons,
            message: "SalesPersons retrieved successfully",
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllSalesPersons = GetAllSalesPersons;
// Retrieve a single SalesPerson by ID
const GetSalesPersonById = (req, res) => {
    const { id } = req.params;
    SalesPerson_1.default.findById(id)
        .then((salesPerson) => {
        if (salesPerson) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: salesPerson,
                message: "SalesPerson retrieved successfully",
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "SalesPerson not found",
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetSalesPersonById = GetSalesPersonById;
// Delete a SalesPerson by ID
const DeleteSalesPerson = (req, res) => {
    const { id } = req.params;
    SalesPerson_1.default.findByIdAndDelete(id)
        .then((deletedSalesPerson) => {
        if (deletedSalesPerson) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedSalesPerson,
                message: "SalesPerson deleted successfully",
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "SalesPerson not found",
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteSalesPerson = DeleteSalesPerson;
