import { Request, Response } from "express"
import { readFileSync } from "fs"
import path from "path"
import { PDFDocument, PDFPage, rgb } from "pdf-lib"
import PDFParser from "pdf2json"
import SiteSurveyModel from "../../Model/SiteSurvey"
import mongoose from "mongoose"
import { SiteSurveyDataType } from "../../Lib/DataTypes/Responses/QuotationDataType"

const filePath = path.join(process.cwd(), "Asset/input.pdf")
const pdfParser = new PDFParser()
pdfParser.loadPDF(filePath)

interface PdfTextData {
  x: number;
  y: number;
  w: number;
  clr: number;
  sw: number;
  text: string;
}

const pdfDataGlobal: Record<string, Array<PdfTextData>> = {}

export const QuotationPdfGenerate = async (
	_req: Request<{ id: string }>,
	res: Response
) => {
	SiteSurveyModel.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(_req.params.id)
			}
		},
		{
			$lookup: {
				from: "customerdetails",
				foreignField: "_id",
				localField: "customerId",
				as: "customer"
			}
		},
		{
			$unwind: "$customer"
		},
		{
			$lookup: {
				from: "salespeople",
				foreignField: "_id",
				localField: "salesPersonId",
				as: "salesPerson"
			}
		},
		{
			$unwind: "$salesPerson"
		},
		{
			$lookup: {
				from: "quotations",
				foreignField: "SiteSurveyId",
				localField: "_id",
				as: "quotations"
			}
		},
		{
			$unwind: "$quotations"
		}
	])
		.then(async (data) => {
			// return res.send(pdfDataGlobal);
			if (data.length > 0) {
				const siteSurveyData = data[0] as SiteSurveyDataType

				const pdfDocBytes = readFileSync(filePath)
				const pdfDoc = await PDFDocument.load(pdfDocBytes)

				const therdPages = pdfDoc.getPage(2)

				await ReplaceContent(
					therdPages,
					"2",
					"Customer_Name",
					`${siteSurveyData.customer.title}${siteSurveyData.customer.customerContactName}`
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Customer_Address",
					`${siteSurveyData.customer.customerAddress}`
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Customer_District",
					`${siteSurveyData.customer.district}`
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Customer_state",
					`${siteSurveyData.customer.state}`
				)

				await ReplaceContent(
					therdPages,
					"2",
					"Name: Customer_Name",
					`Name: ${siteSurveyData.customer.title}${siteSurveyData.customer.customerContactName}`,
					10,
					4.2
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Mobile: CustomerMobile",
					`Mobile: ${siteSurveyData.customer.customerPhoneNo}`,
					10,
					4.2
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Email: Customes_email",
					`Email: ${siteSurveyData.customer.emailId}`,
					10,
					4.2
				)

				await ReplaceContent(
					therdPages,
					"2",
					"3.18",
					`${Number(siteSurveyData.sensationLoadKW).toFixed(2)} KWP Mono Half Cut`,
					10,
					4.2
				)

				await ReplaceContent(
					therdPages,
					"2",
					"Name: SalespersonName",
					`Name: ${siteSurveyData.salesPerson.name}`,
					10,
					4.2
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Mobile: SalespersonModile",
					`Mobile: ${siteSurveyData.salesPerson.phoneNumber}`,
					10,
					4.2
				)
				await ReplaceContent(
					therdPages,
					"2",
					"Email: SalespersonEmail",
					`Email: ${siteSurveyData.salesPerson.email}`,
					10,
					4.2
				)

				const fourthPages = pdfDoc.getPage(4)
				await ReplaceContent(
					fourthPages,
					"4",
					"OnGrid",
					`${siteSurveyData.quotations.sytemType}`,
					12,
					2,
					73
				)
				await ReplaceContent(
					fourthPages,
					"4",
					"3.18",
					`${Number(siteSurveyData.solarCapacity).toFixed(2)}`,
					12,
					5,
					60
				)

				const TotalPrice = siteSurveyData.quotations.data.reduce((acc, item) => {
					return acc + Number(item?.price) * (item?.quantity || 1)
				}, 0)

				await ReplaceContent(
					fourthPages,
					"4",
					"171720",
					`${Number(TotalPrice).toFixed(2)}`,
					15,
					5,
					-165
				)

				// pdfDoc.removePage(0);
				// pdfDoc.removePage(0);
				// pdfDoc.removePage(0)
				// pdfDoc.removePage(0)

				// pdfDoc.removePage(2)
				// pdfDoc.removePage(4)

				// Save the modified PDF to a buffer
				const pdfBytes = await pdfDoc.save()

				res.set({
					"Content-Type": "application/pdf",
					"Content-Disposition": "inline; filename=output.pdf"
				})

				// Send the modified PDF
				res.send(Buffer.from(pdfBytes))
			} else {
				res.status(403).send("No Quotation Found")
			}
		})
		.catch(() => {
			res.status(403).send("No Quotation Found")
		})
}

// Function to replace the old text with new text
const ReplaceContent = async (
	page: PDFPage,
	pageId: string,
	oldText: string,
	newText: string,
	fontSize: number = 13,
	adjustY: number = 0,
	adjustX: number = 0
): Promise<void> => {
	const pageWidth = page.getWidth()
	const getCoordinateArray = pdfDataGlobal[pageId].filter((it) => it.text === oldText)

	if (getCoordinateArray.length > 0 && newText) {
		getCoordinateArray.forEach((getCoordinate) => {
			const Textwidth = newText.length * 6
			const width = Number(getCoordinate.w) >= Textwidth ? getCoordinate.w : Textwidth

			const gap = (12.301 - getCoordinate.y) * 15

			const adjustedY = 644 - getCoordinate.y // Example for flipping y-axis
			const scaledX = pageWidth - 261 - getCoordinate.x - adjustX // Example scale factor for x position
			const scaledY = adjustedY + gap + adjustY // Example scale factor for y position
			if (getCoordinate.text === "3.18") {
				console.log("width", getCoordinate)
			}

			page.drawRectangle({
				x: scaledX - 3, // X-coordinate of "hello"
				y: scaledY - 5, // Y-coordinate of "hello"
				width, // Width of the rectangle to hide "hello"
				height: fontSize + 2, // Height of the rectangle
				color: rgb(1, 1, 1) // White rectangle to cover "hello"
			})

			page.drawText(newText, {
				x: scaledX, // Same X-coordinate as the rectangle
				y: scaledY - 2, // Same Y-coordinate as the rectangle
				size: fontSize, // Font size for the text
				color: rgb(0, 0, 0) // Black text color
			})
		})
	}
}

pdfParser.on("pdfParser_dataReady", (pdfData) => {
	const pageIdList = [2, 4]

	pageIdList.forEach((pageId) => {
		// const pageId = 2;
		const pdfDataList: PdfTextData[] = []
		const page = pdfData.Pages[pageId]
		if (page) {
			page.Texts.forEach((text: any) => {
				const textContent = decodeURIComponent(text.R[0].T) // Text item
				// console.log('textContent', textContent)
				if (![" ", "   "].includes(textContent)) {
					pdfDataList.push({
						x: text.x,
						y: text.y,
						w: text.w,
						clr: text.clr,
						sw: text.sw,
						text: textContent
					})
				}
			})
		} else {
			console.log(`Page ${pageId} not found in the PDF.`)
		}
		pdfDataGlobal[pageId] = pdfDataList
	})
})
