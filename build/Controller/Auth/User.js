"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../Model/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const createToken = (data) => {
    var _a;
    return jsonwebtoken_1.default.sign(data, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "");
};
const login = (req, res) => {
    const { email, password } = req.body;
    User_1.default.findOne({ email })
        .then((result) => {
        if (result && result.comparePassword && result.comparePassword(password)) {
            const response = {
                data: {
                    token: createToken({
                        _id: result._id,
                        email: result.email,
                        type: result.userType
                    }),
                    userData: {
                        _id: result._id,
                        email: result.email,
                        userType: result.userType,
                        image: result.image,
                        name: result.name
                    }
                },
                status: true,
                message: "Success"
            };
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json(response);
        }
        else {
            res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                status: false,
                message: "No admin found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
// const register = (
//     req: Request<any, any, UserRegisterRequest>,
//     res: Response<Res<UserRegisterResponse>>
// ): void => {
//     InputValidator(req.body, {
//         email: 'required|email',
//         password: 'required|minLength:6',
//         name: 'required'
//     })
//         .then(() => {
//             const _id = new mongoose.Types.ObjectId();
//             const userData: UserModelType<{ _id: mongoose.Types.ObjectId }> = {
//                 ...req.body,
//                 password: passwordHash.generate(req.body.password, { saltLength: 10 }),
//                 token: createToken({ _id, email: req.body.email }),
//                 _id,
//                 userType: "Admin"
//             };
//             const userModel = new UserModel(userData);
//             userModel
//                 .save()
//                 .then(() => {
//                     const response: Res<UserRegisterResponse> = {
//                         data: {
//                             token: userData.token,
//                             userData: {
//                                 _id: userData._id,
//                                 email: userData.email,
//                                 userType: userData.userType,
//                                 image: userData.image,
//                                 name: userData.name
//                             }
//                         },
//                         status: true,
//                         message: 'Success'
//                     };
//                     res.status(ResponseCode.SUCCESS).json(response);
//                 })
//                 .catch((error) => {
//                     dbError(error, res);
//                 });
//         })
//         .catch((error) => {
//             res.status(ResponseCode.VALIDATION_ERROR).json({
//                 status: false,
//                 message: error
//             });
//         });
// };
const UserAuthController = {
    login,
    // register
};
exports.default = UserAuthController;
