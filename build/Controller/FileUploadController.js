"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocoment = void 0;
const FileUpload_1 = require("../Lib/Utils/FileUpload");
const ResponseCode_1 = require("../Lib/Utils/ResponseCode");
const ErrorHandler_1 = require("../Lib/Utils/ErrorHandler");
const UploadDocoment = (req, res) => {
    var _a;
    if (typeof (req.file) !== "undefined" && typeof (req.file.mimetype) !== "undefined" && typeof (req.file.buffer) !== "undefined") {
        (0, FileUpload_1.UploadToS3)(req.file.buffer, req.file.mimetype, `client/${(_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id}/${req.params.loction}`)
            .then((data) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data,
                message: "succesfull Upload Your File"
            });
        }).catch((error) => {
            console.log("error", error);
            (0, ErrorHandler_1.dbError)(error, res);
        });
    }
    else {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: "File is Not Found"
        });
    }
};
exports.UploadDocoment = UploadDocoment;
