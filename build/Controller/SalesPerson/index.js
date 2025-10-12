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
exports.GetSalesPersonHierarchy = exports.GetMySubSalesPersons = exports.CreateSubSalesPerson = exports.GetQuotationSummary = exports.GetQuotationChart = exports.UpdateSalesPersonProfile = exports.GetSalesPersonProfile = void 0;
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const SalesPerson_1 = __importDefault(require("../../Model/SalesPerson"));
const mongoose_1 = __importDefault(require("mongoose"));
const Quotation_1 = __importDefault(require("../../Model/Quotation"));
const Customer_1 = __importDefault(require("../../Model/Customer"));
const GetSalesPersonProfile = (req, res) => {
    var _a;
    SalesPerson_1.default.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id) } },
        {
            $project: {
                token: 0,
                __v: 0
            }
        }
    ])
        .then((salesPerson) => {
        if (!salesPerson || salesPerson.length === 0) {
            return res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: 'Sales person not found'
            });
        }
        const response = {
            data: salesPerson[0],
            status: true,
            message: 'Profile fetched successfully'
        };
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error fetching profile',
            error
        });
    });
};
exports.GetSalesPersonProfile = GetSalesPersonProfile;
const UpdateSalesPersonProfile = (req, res) => {
    var _a;
    SalesPerson_1.default.findByIdAndUpdate((_a = req.User) === null || _a === void 0 ? void 0 : _a._id, {
        $set: Object.assign({}, req.body)
    }, { new: true, runValidators: true })
        .then((updatedSalesPerson) => {
        if (!updatedSalesPerson) {
            return res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: 'Sales person not found'
            });
        }
        const response = {
            data: updatedSalesPerson,
            status: true,
            message: 'Updated successfully'
        };
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error updating profile',
            error
        });
    });
};
exports.UpdateSalesPersonProfile = UpdateSalesPersonProfile;
const GetQuotationChart = (req, res) => {
    var _a;
    const filter = req.query.filter; // "today", "week", or "month"
    const now = new Date();
    let startDate;
    const endDate = new Date(now.setHours(23, 59, 59, 999)); // End of today
    if (filter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    }
    else if (filter === 'week') {
        startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
    }
    else if (filter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
    }
    else {
        res.status(400).json({ status: false, message: 'Invalid filter' });
        return;
    }
    Quotation_1.default.aggregate([
        {
            $match: {
                salesPersonId: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id),
                createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
            }
        },
        {
            $unwind: '$data' // Flatten the data array to process each item separately
        },
        {
            $group: {
                _id: '$_id', // Group by Quotation ID
                salesPersonId: { $first: '$salesPersonId' },
                SiteSurveyId: { $first: '$SiteSurveyId' },
                customerId: { $first: '$customerId' },
                sytemType: { $first: '$sytemType' },
                createdAt: { $first: '$createdAt' },
                totalAmount: {
                    $sum: {
                        $multiply: [
                            { $toDouble: '$data.price' },
                            { $ifNull: ['$data.quantity', 1] }
                        ]
                    }
                }
            }
        },
        {
            $sort: { createdAt: 1 } // Sort by createdAt date
        }
    ])
        .then((quotations) => {
        res.json({ status: true, data: quotations, message: 'fetched successfully' });
    })
        .catch((error) => {
        res.status(500).json({ status: false, message: error.message });
    });
};
exports.GetQuotationChart = GetQuotationChart;
const GetQuotationSummary = (req, res) => {
    var _a;
    const filter = req.query.filter; // "today", "week", "month"
    const now = new Date();
    let startDate;
    const endDate = new Date(now.setHours(23, 59, 59, 999)); // End of today
    if (filter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    }
    else if (filter === 'week') {
        startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
    }
    else if (filter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
    }
    else {
        res.status(400).json({ status: false, message: 'Invalid filter' });
        return;
    }
    Quotation_1.default.aggregate([
        {
            $match: {
                salesPersonId: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id),
                createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
            }
        },
        {
            $unwind: '$data' // Flatten the data array to process each item separately
        },
        {
            $group: {
                _id: null, // Group all quotations together
                totalRevenue: {
                    $sum: {
                        $multiply: [
                            { $toDouble: '$data.price' },
                            { $ifNull: ['$data.quantity', 1] }
                        ]
                    }
                },
                totalQuotations: { $sum: 1 } // Count the total quotations created
            }
        }
    ])
        .then((result) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const totalQuotations = yield Customer_1.default.countDocuments({
            salesPersonId: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id)
        }).exec();
        res.json({
            status: true,
            message: 'fetched successfully',
            data: {
                totalRevenue: result.length > 0 ? result[0].totalQuotations : 0,
                totalQuotations: totalQuotations
            }
        });
    }))
        .catch((error) => {
        res.status(500).json({ status: false, message: error.message });
    });
};
exports.GetQuotationSummary = GetQuotationSummary;
// SalesPerson: Create Sub-SalesPerson (with incremented level)
const CreateSubSalesPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parentSalesPersonId = (_a = req.User) === null || _a === void 0 ? void 0 : _a._id;
        // Get parent SalesPerson to determine the level
        const parentSalesPerson = yield SalesPerson_1.default.findById(parentSalesPersonId);
        if (!parentSalesPerson) {
            res.status(ResponseCode_1.ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: 'Parent SalesPerson not found'
            });
            return;
        }
        // Check if parent is at Level 5 (maximum level)
        if (parentSalesPerson.level >= 5) {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: 'Maximum level reached. Level 5 SalesPersons cannot create sub-SalesPersons.'
            });
            return;
        }
        // Create new SalesPerson with incremented level
        const newSalesPerson = new SalesPerson_1.default(Object.assign(Object.assign({}, req.body), { createdBy: parentSalesPersonId, createdByType: "SalesPerson", level: parentSalesPerson.level + 1, parentSalesPerson: parentSalesPersonId, adminId: parentSalesPerson.adminId // Inherit adminId from parent
         }));
        const savedSalesPerson = yield newSalesPerson.save();
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: savedSalesPerson,
            message: `Sub-SalesPerson created successfully at level ${savedSalesPerson.level}`
        });
    }
    catch (error) {
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error creating sub-SalesPerson',
            error
        });
    }
});
exports.CreateSubSalesPerson = CreateSubSalesPerson;
// SalesPerson: Get all Sub-SalesPersons created by this SalesPerson
const GetMySubSalesPersons = (req, res) => {
    var _a;
    const salesPersonId = (_a = req.User) === null || _a === void 0 ? void 0 : _a._id;
    SalesPerson_1.default.find({
        createdBy: salesPersonId,
        createdByType: "SalesPerson"
    })
        .select("-token -password")
        .populate("parentSalesPerson", "name email level")
        .then((subSalesPersons) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: subSalesPersons,
            message: 'Sub-SalesPersons retrieved successfully'
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error fetching sub-SalesPersons',
            error
        });
    });
};
exports.GetMySubSalesPersons = GetMySubSalesPersons;
// SalesPerson: Get entire hierarchy tree (downline)
const GetSalesPersonHierarchy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salesPersonId = (_a = req.User) === null || _a === void 0 ? void 0 : _a._id;
        const hierarchy = yield SalesPerson_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(salesPersonId) } },
            {
                $graphLookup: {
                    from: "salespersons",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parentSalesPerson",
                    as: "hierarchy",
                    maxDepth: 4 // Max 4 levels down from current (total 5 levels max)
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    level: 1,
                    adminId: 1,
                    parentSalesPerson: 1,
                    hierarchy: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        level: 1,
                        parentSalesPerson: 1,
                        adminId: 1
                    }
                }
            }
        ]);
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: hierarchy[0],
            message: 'Hierarchy retrieved successfully (Max 5 levels)'
        });
    }
    catch (error) {
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error fetching hierarchy',
            error
        });
    }
});
exports.GetSalesPersonHierarchy = GetSalesPersonHierarchy;
