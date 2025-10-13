import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { Res } from "../DataTypes/Common"
import { ResponseCode } from "./ResponseCode"

type UserType = "user" | "admin" | "sales-person";

const parmisoen: Array<{ url: string }> = [
	{
		url: "/sales-person/quotation-pdf"
	}
]

export function GenerateOTP(length: number = 6): string {
	const digits = "0123456789"
	let otp = ""
	for (let i = 0; i < length; i++) {
		otp += digits[Math.floor(Math.random() * 10)]
	}
	return otp
}

export const CreateToken = (data: Record<string, any>, userType: UserType): string => {
	return jwt.sign({ ...data, userType }, process.env.JWT_SECRET ?? "")
}

export const middleware = (
	req: Request,
	res: Response<Res>,
	next: NextFunction
): void => {
	const authorization: string | undefined = req.headers.authorization

	if (parmisoen.filter((it) => it.url === req.path).length > 0) {
		next()
	} else if (!authorization) {
		res.status(ResponseCode.AUTH_ERROR).json({
			status: false,
			message: "No credentials sent!"
		})
	} else {
		try {
			const decrypted = jwt.verify(
				authorization,
				process.env.JWT_SECRET ?? ""
			) as JwtPayload
			req.User = {
				_id: decrypted._id,
				email: decrypted.email
			}
			
			// Attach user info to request for role-based access
			;(req as any).user = {
				_id: decrypted._id,
				email: decrypted.email,
				type: decrypted.type
			}

			next()
		} catch (error) {
			res.status(ResponseCode.AUTH_ERROR).json({
				status: false,
				message: "Auth error!"
			})
		}
	}
}

// Role-based middleware
export const isSuperAdmin = (
	req: Request,
	res: Response<Res>,
	next: NextFunction
): void => {
	const user = (req as any).user
	if (user && user.type === "SuperAdmin") {
		next()
	} else {
		res.status(ResponseCode.AUTH_ERROR).json({
			status: false,
			message: "Access denied. SuperAdmin only."
		})
	}
}

export const isAdmin = (
	req: Request,
	res: Response<Res>,
	next: NextFunction
): void => {
	const user = (req as any).user
	if (user && (user.type === "Admin" || user.type === "SuperAdmin")) {
		next()
	} else {
		res.status(ResponseCode.AUTH_ERROR).json({
			status: false,
			message: "Access denied. Admin only."
		})
	}
}
