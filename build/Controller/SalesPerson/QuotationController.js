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
exports.SendQuotation = exports.CreateQuotation = exports.GetQuotationProduct = exports.GetInverter = exports.GetProductSectionList = exports.GetQuotationSolarModule = exports.GetQuotationBand = void 0;
const Brand_1 = __importDefault(require("../../Model/Brand"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const Product_1 = __importDefault(require("../../Model/Product"));
const Quotation_1 = __importDefault(require("../../Model/Quotation"));
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const GetQuotationBand = (_req, res) => {
    Brand_1.default.find(Object.assign({}, _req.body))
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
exports.GetQuotationBand = GetQuotationBand;
const GetQuotationSolarModule = (_req, res) => {
    Product_1.default.aggregate([
        {
            $match: {
                type: "Solar Module",
            },
        },
        {
            $match: Object.assign({}, _req.body),
        },
        {
            $lookup: {
                from: "brands",
                foreignField: "_id",
                localField: "spvBrand",
                as: "brands",
            },
        },
        {
            $unwind: "$brands",
        },
        {
            $project: {
                __v: 0,
            },
        },
    ])
        .then((brands) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: brands,
            message: "Product retrieved successfully",
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetQuotationSolarModule = GetQuotationSolarModule;
const GetProductSectionList = (_req, res) => {
    Product_1.default.aggregate([
        {
            $match: {
                type: { $nin: ["kit", "BOS"] },
            },
        },
        {
            $group: {
                _id: "$type", // Field for distinct values
            },
        },
        {
            $addFields: {
                type: "$_id",
            },
        },
        {
            $sort: {
                type: 1,
            },
        },
        {
            $lookup: {
                from: "products",
                foreignField: "type",
                localField: "_id",
                as: "products",
                pipeline: [
                    {
                        $addFields: {
                            selected: false,
                        },
                    },
                    {
                        $lookup: {
                            from: "brands",
                            foreignField: "_id",
                            localField: "spvBrand",
                            as: "brands",
                        },
                    },
                    {
                        $unwind: {
                            preserveNullAndEmptyArrays: true,
                            path: "$brands",
                        },
                    },
                ],
            },
        },
    ])
        .then((brands) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: brands,
            message: "Product retrieved successfully",
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetProductSectionList = GetProductSectionList;
const GetInverter = () => { };
exports.GetInverter = GetInverter;
const GetQuotationProduct = (_req, res) => {
    Product_1.default.aggregate([
        {
            $match: Object.assign({}, _req.body),
        },
        {
            $project: {
                __v: 0,
            },
        },
    ])
        .then((brands) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: brands,
            message: "Product retrieved successfully",
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetQuotationProduct = GetQuotationProduct;
const CreateQuotation = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        customerId: "required|string",
        data: "required|array",
    })
        .then(() => {
        var _a;
        // console.log('req.body', JSON.stringify(req.body))
        Quotation_1.default.findOne({
            salesPersonId: (_a = req.User) === null || _a === void 0 ? void 0 : _a._id,
            customerId: req.body.customerId,
            SiteSurveyId: req.body.SiteSurveyId,
        })
            .then((data) => {
            var _a;
            if (data) {
                data
                    .updateOne({
                    $set: Object.assign({}, req.body),
                    new: true,
                })
                    .then(() => {
                    res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                        status: true,
                        data: data,
                        message: "Quotation Create successfully",
                    });
                })
                    .catch((error) => {
                    (0, ErrorHandler_1.dbError)(error, res);
                });
            }
            else {
                const quotation = new Quotation_1.default(Object.assign(Object.assign({}, req.body), { salesPersonId: (_a = req.User) === null || _a === void 0 ? void 0 : _a._id }));
                quotation
                    .save()
                    .then((savedQuotation) => {
                    res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                        status: true,
                        data: savedQuotation,
                        message: "Quotation Create successfully",
                    });
                })
                    .catch((error) => {
                    (0, ErrorHandler_1.dbError)(error, res);
                });
            }
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.CreateQuotation = CreateQuotation;
const SendQuotation = (req, res) => {
    var _a;
    console.log((_a = req.User) === null || _a === void 0 ? void 0 : _a._id);
    Quotation_1.default.findOne({
        // salesPersonId: new mongoose.Types.ObjectId(req.User?._id || ''),
        _id: new mongoose_1.default.Types.ObjectId(req.params.id),
    })
        .populate("customerId")
        .then((data) => {
        var _a;
        if (data && data.SiteSurveyId) {
            const pdfUrl = `https://api.vritika.co/api/v1/sales-person/quotation-pdf/${data.SiteSurveyId}`;
            axios_1.default
                .request({
                method: "POST",
                url: "https://services.kit19.com/IMS/Whatsapp/Template",
                headers: { "Content-Type": "application/JSON" },
                data: JSON.stringify({
                    key: "2B09C330FE0F4EC9B725CE0C5B0B6ADA",
                    username: "divypower106334",
                    name: "whatsapp",
                    remarks: "Hello Kit19 IT Support,\n\nThank you for choosing Divy Power! 😊\nPlease find attached your solar rooftop system quotation based on the site survey and details provided.",
                    whatsapp: {
                        to: `91${data.customerId.customerPhoneNo}`,
                        type: "template",
                        category: "UTILITY",
                        recipient_type: "individual",
                        template: {
                            namespace: "",
                            language: {
                                policy: "deterministic",
                                code: "en",
                            },
                            name: "test_api1",
                            components: [
                                {
                                    type: "header",
                                    parameters: [
                                        {
                                            type: "document",
                                            document: {
                                                link: pdfUrl,
                                                filename: "CRM.pdf",
                                            },
                                            mediaId: "",
                                        },
                                    ],
                                },
                                {
                                    type: "body",
                                    parameters: [
                                        {
                                            type: "text",
                                            text: (_a = data === null || data === void 0 ? void 0 : data.customerId) === null || _a === void 0 ? void 0 : _a.customerContactName,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                }),
            })
                .then(() => __awaiter(void 0, void 0, void 0, function* () {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).send({
                    status: true,
                    message: "Successful quotation send via whatsapp",
                });
            }))
                .catch((error) => {
                console.error("Error sending quotation via WhatsApp:", error);
                res.status(ResponseCode_1.ResponseCode.BAD_REQUEST).json({
                    status: false,
                    message: "Failed to send quotation via WhatsApp",
                });
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "No Quotation found",
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.SendQuotation = SendQuotation;
