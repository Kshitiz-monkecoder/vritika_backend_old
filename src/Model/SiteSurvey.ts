import mongoose, { Schema } from "mongoose"
import { SiteSurveyModelDataType } from "../Lib/DataTypes/Models/SiteSurvey"

// Define the SiteSurvey schema
const SiteSurveySchema = new Schema<SiteSurveyModelDataType>(
	{
		length: { type: Number, required: true },
		width: { type: Number, required: true },
		images: { type: [String] },
		obstacleCheck: { type: Boolean, required: true },
		shadowAnalysis: { type: Boolean, required: true },
		roofSurfaceType: { type: String, required: true },
		totalRoofs: { type: Number, required: true },
		roofAccessibility: { type: String, required: true },
		sensationLoadKW: { type: Number, required: true },
		solarCapacity: { type: Number },
		electricityBillImages: { type: [String] },
		gensatAvailable: { type: Boolean },

		salesPersonId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		customerId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			unique: true
		},

		distance: { type: String },
		surfaceSoil: { type: String },
		roofSurface: { type: String },

		loanRequired: { type: Boolean },
		subsidy: { type: Boolean },
		conductPipe: { type: Boolean },

		carsOwned: { type: String },
		acPremises: { type: String },
		gridInverters: { type: String },

		coordinates: {
			type: { type: String, enum: ["Point"], required: true, default: "Point" },
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
				default: [0, 0]
			},
			status: {
				type: String,
				default: "active" // Default value set to 'active'
			}
		},
		boxCoordinates: {
			type: Array<Array<number>>,
			default: []
		}
	},
	{ timestamps: true }
)

// Create and export the SiteSurvey model
const SiteSurveyModel = mongoose.model<SiteSurveyModelDataType>(
	"SiteSurvey",
	SiteSurveySchema
)
export default SiteSurveyModel
