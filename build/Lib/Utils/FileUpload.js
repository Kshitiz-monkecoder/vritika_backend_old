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
exports.UploadMulter = exports.UploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const BucketName = "db-power";
const BucketRegion = "ap-south-1";
/**
 * Uploads a buffer to an Amazon S3 bucket.
 *
 * @param {Buffer} buffer - The buffer to be uploaded.
 * @param {string} mimetype - The mimetype (fileMata) add file mata.
 * @param {string | null} folderName - Optional folder name within the bucket. Defaults to null.
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 */
const UploadToS3 = (buffer_1, mimetype_1, ...args_1) => __awaiter(void 0, [buffer_1, mimetype_1, ...args_1], void 0, function* (buffer, mimetype, folderName = null) {
    const s3 = new client_s3_1.S3Client({
        // forcePathStyle: false,
        // endpoint,
        credentials: {
            accessKeyId: "AKIA6GBMGGDREOPTYFYU",
            secretAccessKey: "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"
        },
        region: BucketRegion
    });
    const NewKey = (0, uuid_1.v4)() + "." + mimetype.split("/")[1];
    const params = {
        Bucket: BucketName,
        Key: `${folderName}/${NewKey}`,
        Body: buffer,
        ACL: "public-read",
        ContentType: mimetype,
        Metadata: {
            "Content-Type": mimetype
        }
    };
    const command = new client_s3_1.PutObjectCommand(params);
    return Object.assign(Object.assign({}, yield s3.send(command)), { link: `https://${BucketName}.s3.${BucketRegion}.amazonaws.com/${params.Key}` });
    // return await s3.upload(params).promise();
});
exports.UploadToS3 = UploadToS3;
const storage = multer_1.default.memoryStorage();
exports.UploadMulter = (0, multer_1.default)({
    // dest: 'uploads/'
    storage
});
