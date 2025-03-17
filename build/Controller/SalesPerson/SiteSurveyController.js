"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSiteSurvey = exports.GetSiteSurveyByCustomer = exports.GetSiteSurveyById = exports.GetAllSiteSurveys = exports.UpdateSiteSurvey = exports.CreateSiteSurveySecend = exports.CreateSiteSurvey = void 0;
const SiteSurvey_1 = __importDefault(require("../../Model/SiteSurvey"));
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new SiteSurvey
const CreateSiteSurvey = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        customerId: "required|string",
        length: "required|number|min:1",
        width: "required|number|min:1",
        images: "array",
        obstacleCheck: "required|boolean",
        shadowAnalysis: "required|boolean",
        roofSurfaceType: "required|string",
        totalRoofs: "required|number|min:1",
        roofAccessibility: "required|string",
        sensationLoadKW: "required|number|min:1",
        solarCapacity: "number",
        electricityBillImages: "array",
        gensatAvailable: "boolean"
    })
        .then(() => {
        var _a;
        const siteSurvey = new SiteSurvey_1.default(Object.assign(Object.assign({}, req.body), { salesPersonId: (_a = req.User) === null || _a === void 0 ? void 0 : _a._id }));
        siteSurvey.save()
            .then((savedSurvey) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: savedSurvey,
                message: "Site survey created successfully"
            });
        })
            .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.CreateSiteSurvey = CreateSiteSurvey;
// Update an existing SiteSurvey by ID
const CreateSiteSurveySecend = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        distance: "string",
        surfaceSoil: "string",
        roofSurface: "string",
        loanRequired: "boolean",
        subsidy: "boolean|required",
        conductPipe: "boolean",
        carsOwned: "string",
        acPremises: "string",
        gridInverters: "string|required"
    })
        .then(() => {
        const { id } = req.params;
        const siteSurveyData = req.body;
        SiteSurvey_1.default.findByIdAndUpdate(id, siteSurveyData, { new: true })
            .then((updatedSurvey) => {
            if (updatedSurvey) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedSurvey,
                    message: "Site survey updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "Site survey not found"
                });
            }
        })
            .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.CreateSiteSurveySecend = CreateSiteSurveySecend;
// Update an existing SiteSurvey by ID
const UpdateSiteSurvey = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        length: "number",
        width: "number",
        images: "array",
        obstacleCheck: "boolean",
        shadowAnalysis: "boolean",
        roofSurfaceType: "string",
        totalRoofs: "number",
        roofAccessibility: "string",
        sensationLoadKW: "number",
        solarCapacity: "number",
        electricityBillImages: "array",
        gensatAvailable: "boolean"
    })
        .then(() => {
        const { id } = req.params;
        const siteSurveyData = req.body;
        SiteSurvey_1.default.findByIdAndUpdate(id, siteSurveyData, { new: true })
            .then((updatedSurvey) => {
            if (updatedSurvey) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedSurvey,
                    message: "Site survey updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "Site survey not found"
                });
            }
        })
            .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.UpdateSiteSurvey = UpdateSiteSurvey;
// Get all SiteSurveys
const GetAllSiteSurveys = (_req, res) => {
    SiteSurvey_1.default.find({})
        .then((siteSurveys) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: siteSurveys,
            message: "Site surveys retrieved successfully"
        });
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.GetAllSiteSurveys = GetAllSiteSurveys;
// Get a single SiteSurvey by ID
const GetSiteSurveyById = (req, res) => {
    const { id } = req.params;
    SiteSurvey_1.default.findById(id)
        .then((siteSurvey) => {
        if (siteSurvey) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: siteSurvey,
                message: "Site survey retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Site survey not found"
            });
        }
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.GetSiteSurveyById = GetSiteSurveyById;
const GetSiteSurveyByCustomer = (req, res) => {
    SiteSurvey_1.default.aggregate([
        {
            $match: {
                customerId: new mongoose_1.default.Types.ObjectId(req.params.id)
            }
        }
    ])
        .then((siteSurvey) => {
        if (siteSurvey && siteSurvey.length) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: siteSurvey[0],
                message: "Site survey retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Site survey not found"
            });
        }
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.GetSiteSurveyByCustomer = GetSiteSurveyByCustomer;
// Delete a SiteSurvey by ID
const DeleteSiteSurvey = (req, res) => {
    const { id } = req.params;
    SiteSurvey_1.default.findByIdAndDelete(id)
        .then((deletedSurvey) => {
        if (deletedSurvey) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedSurvey,
                message: "Site survey deleted successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Site survey not found"
            });
        }
    })
        .catch((error) => (0, ErrorHandler_1.dbError)(error, res));
};
exports.DeleteSiteSurvey = DeleteSiteSurvey;
