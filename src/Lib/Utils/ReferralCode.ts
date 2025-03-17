import UserModel from "../../Model/User"

export const GenerateUniqueReferralCode = async (length: number = 8): Promise<string> => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let referralCode: string
	let isUnique = false

	do {
		referralCode = ""
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length)
			referralCode += characters[randomIndex]
		}

		// Check if the generated code already exists in the database
		const existingUser = await UserModel.findOne({ code: referralCode }).lean()
		isUnique = !existingUser // Unique if no user exists with this code
	} while (!isUnique)

	return referralCode
}
