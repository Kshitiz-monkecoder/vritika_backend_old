"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProduct = exports.GetProductById = exports.GetAllProducts = exports.UpdateProduct = exports.CreateProduct = void 0;
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const Product_1 = __importDefault(require("../../Model/Product"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
// Add a new product
const CreateProduct = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        // productName: 'required|string',
        type: "required|string",
        price: "required|number",
    })
        .then(() => {
        const product = new Product_1.default(Object.assign({}, req.body));
        product
            .save()
            .then((savedProduct) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: savedProduct,
                message: "Product created successfully"
            });
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
exports.CreateProduct = CreateProduct;
// Update an existing product by ID
const UpdateProduct = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        productName: "string",
        type: "string",
        price: "number"
    })
        .then(() => {
        const { id } = req.params;
        const productData = req.body;
        Product_1.default.findByIdAndUpdate(id, productData, { new: true })
            .then((updatedProduct) => {
            if (updatedProduct) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedProduct,
                    message: "Product updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "Product not found"
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
exports.UpdateProduct = UpdateProduct;
// Retrieve all products
const GetAllProducts = (_req, res) => {
    Product_1.default.find()
        .then((products) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: products,
            message: "Products retrieved successfully"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllProducts = GetAllProducts;
// Retrieve a single product by ID
const GetProductById = (req, res) => {
    const { id } = req.params;
    Product_1.default.findById(id)
        .then((product) => {
        if (product) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: product,
                message: "Product retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Product not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetProductById = GetProductById;
// Delete a product by ID
const DeleteProduct = (req, res) => {
    const { id } = req.params;
    Product_1.default.findByIdAndDelete(id)
        .then((deletedProduct) => {
        if (deletedProduct) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedProduct,
                message: "Product deleted successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Product not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteProduct = DeleteProduct;
