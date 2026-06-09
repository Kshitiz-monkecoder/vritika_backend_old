import { Request, Response } from "express"
import {
	UserLoginRequest
} from "../../Lib/DataTypes/Requests/Auth/User"
import {
	UserLoginResponse
} from "../../Lib/DataTypes/Responses/Auth/User"
import UserModel from "../../Model/User"
import jwt from "jsonwebtoken"
import { dbError } from "../../Lib/Utils/ErrorHandler"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"

const createToken = (data: Record<string, any>): string => {
	return jwt.sign(data, process.env.JWT_SECRET ?? "")
}

const login = (
	req: Request<any, any, UserLoginRequest>,
	res: Response<Res<UserLoginResponse>>
): void => {
	const { email, password } = req.body
	console.log("Login attempt for email:", email, "+ password:", password) // Debug log

	UserModel.findOne({ email })
		.then((result) => {
			if (result && result.comparePassword && result.comparePassword(password)) {
				const response: Res<UserLoginResponse> = {
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
				}
				res.status(ResponseCode.SUCCESS).json(response)
			} else {
				res.status(ResponseCode.AUTH_ERROR).json({
					status: false,
					message: "No admin found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

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
}

export default UserAuthController
