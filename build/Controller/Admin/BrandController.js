"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteBrand = exports.GetBrandById = exports.GetAllBrands = exports.UpdateBrand = exports.CreateBrand = void 0;
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const Brand_1 = __importDefault(require("../../Model/Brand"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
// Add a new brand
const CreateBrand = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        brandName: "required|string",
        brandDetails: "required|string",
        productCategory: "required|array",
        quality: "required|string",
        image: "string"
    })
        .then(() => {
        const brand = new Brand_1.default(Object.assign({}, req.body));
        brand.save()
            .then((savedBrand) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: savedBrand,
                message: "Brand created successfully",
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
};
exports.CreateBrand = CreateBrand;
// Update an existing brand by ID
const UpdateBrand = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        brandName: "string",
        brandDetails: "string",
        productCategory: "array",
        quality: "string",
        image: "string"
    })
        .then(() => {
        const { id } = req.params;
        const brandData = req.body;
        Brand_1.default.findByIdAndUpdate(id, brandData, { new: true })
            .then((updatedBrand) => {
            if (updatedBrand) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedBrand,
                    message: "Brand updated successfully",
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "Brand not found",
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
exports.UpdateBrand = UpdateBrand;
// Get all brands
const GetAllBrands = (_req, res) => {
    Brand_1.default.find({})
        .then((brands) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: brands,
            message: "Brands retrieved successfully",
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllBrands = GetAllBrands;
// Get a single brand by ID
const GetBrandById = (req, res) => {
    const { id } = req.params;
    Brand_1.default.findById(id)
        .then((brand) => {
        if (brand) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: brand,
                message: "Brand retrieved successfully",
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Brand not found",
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetBrandById = GetBrandById;
// Delete a brand by ID
const DeleteBrand = (req, res) => {
    const { id } = req.params;
    Brand_1.default.findByIdAndDelete(id)
        .then((deletedBrand) => {
        if (deletedBrand) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedBrand,
                message: "Brand deleted successfully",
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Brand not found",
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteBrand = DeleteBrand;
