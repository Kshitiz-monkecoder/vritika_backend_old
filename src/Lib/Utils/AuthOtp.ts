import axios from "axios"
import { GenerateOTP } from "./Middleware"
import OTPVerificationModel from "../../Model/OTPverification"
import { OTPVerificationDataType } from "../DataTypes/Models/OTP"

export const SendOTPwhatsApp = async (
	phoneNumber: string,
	type: OTPVerificationDataType["type"] = "salesPerson"
): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		if (phoneNumber === "916290118661") {
			// use in test numnber
			const modelData = new OTPVerificationModel({
				phoneNumber,
				otp: "123456",
				type
			})
			modelData
				.save()
				.then(() => {
					resolve(true)
				})
				.catch(reject)
		} else {
			const OTP = GenerateOTP(6)
			axios
				.request({
					method: "POST",
					url: "https://services.kit19.com/IMS/Whatsapp/Template",
					headers: { "Content-Type": "application/JSON" },
					data: JSON.stringify({
						key: "2B09C330FE0F4EC9B725CE0C5B0B6ADA",
						username: "divypower106334",
						name: "whatsapp",
						remarks:
                            "Thanks for applying  Vritika Application. \nSecurely enter OTP 497140 to proceed with your Vritika Application. Please do not share OTP with anyone for security reasons\nRegards - Divy Power",
						whatsapp: {
							to: phoneNumber,
							type: "template",
							category: "UTILITY",
							recipient_type: "individual",
							template: {
								namespace: "e1bc99b6_a612_4ecb_9a0b_716deb718086",
								language: { policy: "deterministic", code: "en" },
								name: "otp_1_new",
								components: [
									{
										type: "body",
										parameters: [
											{
												type: "text",
												text: `Securely enter OTP ${OTP} to proceed with your Vritika Application. Please do not share OTP with anyone for security reasons`
											}
										]
									}
								]
							}
						}
					})
				})
				.then(async (response) => {
					if (response.data.success) {
						//"customerNumberVerification"
						const modelData = new OTPVerificationModel({
							phoneNumber,
							otp: OTP,
							type
						})

						await modelData.save()
						resolve(true)
					} else {
						reject(new Error("Otp not send"))
					}
				})
				.catch(reject)
		}
	})
}
