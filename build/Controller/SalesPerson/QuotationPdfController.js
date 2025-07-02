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
exports.QuotationPdfGenerate = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const pdf2json_1 = __importDefault(require("pdf2json"));
const SiteSurvey_1 = __importDefault(require("../../Model/SiteSurvey"));
const mongoose_1 = __importDefault(require("mongoose"));
// const filePath = path.join(process.cwd(), 'Asset/input.pdf')
const filePath = path_1.default.join(process.cwd(), 'Asset/divy_table.pdf');
const pdfParser = new pdf2json_1.default();
pdfParser.loadPDF(filePath);
const pdfDataGlobal = {};
const QuotationPdfGenerate = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    SiteSurvey_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(_req.params.id)
            }
        },
        {
            $lookup: {
                from: 'customerdetails',
                foreignField: '_id',
                localField: 'customerId',
                as: 'customer'
            }
        },
        {
            $unwind: '$customer'
        },
        {
            $lookup: {
                from: 'salespeople',
                foreignField: '_id',
                localField: 'salesPersonId',
                as: 'salesPerson'
            }
        },
        {
            $unwind: '$salesPerson'
        },
        {
            $lookup: {
                from: 'quotations',
                foreignField: 'SiteSurveyId',
                localField: '_id',
                as: 'quotations'
            }
        },
        {
            $unwind: '$quotations'
        }
    ])
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        // return res.send(pdfDataGlobal);
        if (data.length > 0) {
            const siteSurveyData = data[0];
            // return res.send(siteSurveyData)
            const pdfDocBytes = (0, fs_1.readFileSync)(filePath);
            const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfDocBytes);
            const page = pdfDoc.getPage(0); // Get the first page of the PDF
            const { width, height } = page.getSize();
            // const therdPages = pdfDoc.getPage(2)
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Customer_Name",
            // 	`${siteSurveyData.customer.title}${siteSurveyData.customer.customerContactName}`
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Customer_Address",
            // 	`${siteSurveyData.customer.customerAddress}`
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Customer_District",
            // 	`${siteSurveyData.customer.district}`
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Customer_state",
            // 	`${siteSurveyData.customer.state}`
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Name: Customer_Name",
            // 	`Name: ${siteSurveyData.customer.title}${siteSurveyData.customer.customerContactName}`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Mobile: CustomerMobile",
            // 	`Mobile: ${siteSurveyData.customer.customerPhoneNo}`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Email: Customes_email",
            // 	`Email: ${siteSurveyData.customer.emailId}`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"3.18",
            // 	`${Number(siteSurveyData.sensationLoadKW).toFixed(2)} KWP Mono Half Cut`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Name: SalespersonName",
            // 	`Name: ${siteSurveyData.salesPerson.name}`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Mobile: SalespersonModile",
            // 	`Mobile: ${siteSurveyData.salesPerson.phoneNumber}`,
            // 	10,
            // 	4.2
            // )
            // await ReplaceContent(
            // 	therdPages,
            // 	"2",
            // 	"Email: SalespersonEmail",
            // 	`Email: ${siteSurveyData.salesPerson.email}`,
            // 	10,
            // 	4.2
            // )
            // const fourthPages = pdfDoc.getPage(4)
            // await ReplaceContent(
            // 	fourthPages,
            // 	"4",
            // 	"OnGrid",
            // 	`${siteSurveyData.quotations.sytemType}`,
            // 	12,
            // 	2,
            // 	73
            // )
            // await ReplaceContent(
            // 	fourthPages,
            // 	"4",
            // 	"3.18",
            // 	`${Number(siteSurveyData.solarCapacity).toFixed(2)}`,
            // 	12,
            // 	5,
            // 	60
            // )
            // const TotalPrice = siteSurveyData.quotations.data.reduce((acc, item) => {
            // 	return acc + Number(item?.price) * (item?.quantity || 1)
            // }, 0)
            // await ReplaceContent(
            // 	fourthPages,
            // 	"4",
            // 	"171720",
            // 	`${Number(TotalPrice).toFixed(2)}`,
            // 	15,
            // 	5,
            // 	-165
            // )
            page.drawRectangle({
                x: 50,
                y: 325,
                width: width - 80,
                height: 400,
                color: (0, pdf_lib_1.rgb)(1, 1, 1) // White background for the rectangle
            });
            yield createDetailedQuotationTable(page, siteSurveyData, width + 10, height - 15);
            // Save the modified PDF to a buffer
            const pdfBytes = yield pdfDoc.save();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename=output.pdf'
            });
            // Send the modified PDF
            res.send(Buffer.from(pdfBytes));
        }
        else {
            res.status(403).send('No Quotation Found');
        }
    }))
        .catch(() => {
        res.status(403).send('No Quotation Found');
    });
});
exports.QuotationPdfGenerate = QuotationPdfGenerate;
// Function to replace the old text with new text
const ReplaceContent = (page_1, pageId_1, oldText_1, newText_1, ...args_1) => __awaiter(void 0, [page_1, pageId_1, oldText_1, newText_1, ...args_1], void 0, function* (page, pageId, oldText, newText, fontSize = 13, adjustY = 0, adjustX = 0) {
    const pageWidth = page.getWidth();
    const getCoordinateArray = pdfDataGlobal[pageId].filter((it) => it.text === oldText);
    if (getCoordinateArray.length > 0 && newText) {
        getCoordinateArray.forEach((getCoordinate) => {
            const Textwidth = newText.length * 6;
            const width = Number(getCoordinate.w) >= Textwidth ? getCoordinate.w : Textwidth;
            const gap = (12.301 - getCoordinate.y) * 15;
            const adjustedY = 644 - getCoordinate.y; // Example for flipping y-axis
            const scaledX = pageWidth - 261 - getCoordinate.x - adjustX; // Example scale factor for x position
            const scaledY = adjustedY + gap + adjustY; // Example scale factor for y position
            if (getCoordinate.text === '3.18') {
                console.log('width', getCoordinate);
            }
            page.drawRectangle({
                x: scaledX - 3, // X-coordinate of "hello"
                y: scaledY - 5, // Y-coordinate of "hello"
                width, // Width of the rectangle to hide "hello"
                height: fontSize + 2, // Height of the rectangle
                color: (0, pdf_lib_1.rgb)(1, 1, 1) // White rectangle to cover "hello"
            });
            page.drawText(newText, {
                x: scaledX, // Same X-coordinate as the rectangle
                y: scaledY - 2, // Same Y-coordinate as the rectangle
                size: fontSize, // Font size for the text
                color: (0, pdf_lib_1.rgb)(0, 0, 0) // Black text color
            });
        });
    }
});
pdfParser.on('pdfParser_dataReady', (pdfData) => {
    const pageIdList = [2, 4];
    pageIdList.forEach((pageId) => {
        // const pageId = 2;
        const pdfDataList = [];
        const page = pdfData.Pages[pageId];
        if (page) {
            page.Texts.forEach((text) => {
                const textContent = decodeURIComponent(text.R[0].T); // Text item
                // console.log('textContent', textContent)
                if (![' ', '   '].includes(textContent)) {
                    pdfDataList.push({
                        x: text.x,
                        y: text.y,
                        w: text.w,
                        clr: text.clr,
                        sw: text.sw,
                        text: textContent
                    });
                }
            });
        }
        else {
            console.log(`Page ${pageId} not found in the PDF.`);
        }
        pdfDataGlobal[pageId] = pdfDataList;
    });
});
// Function to create a detailed quotation table
const createDetailedQuotationTable = (page, siteSurveyData, pageWidth, pageHeight) => __awaiter(void 0, void 0, void 0, function* () {
    const startX = 50;
    const startY = pageHeight - 100;
    const rowHeight = 35;
    const colWidth = (pageWidth - 100) / 3;
    // Title
    // page.drawText('Quotation Details', {
    //     x: startX,
    //     y: startY + 30,
    //     size: 16,
    //     color: rgb(0, 0, 0)
    // })
    // Table headers with background
    const headers = ['Description', 'Quantity', 'Amount'];
    drawTableRow(page, headers, startX, startY, colWidth, rowHeight, true);
    // Data rows
    let currentY = startY - rowHeight;
    let totalAmount = 0;
    page.drawText('Total Amount', {
        x: startX + 10,
        y: currentY - 15,
        size: 14,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    for (const item of siteSurveyData.quotations.data) {
        const itemTotal = Number((item === null || item === void 0 ? void 0 : item.price) || 0) * ((item === null || item === void 0 ? void 0 : item.quantity) || 1);
        totalAmount += itemTotal;
        // console.log('itemTotal', itemTotal, 'item', item)
        const rowData = [
            `${(item === null || item === void 0 ? void 0 : item.productName) || 'Item description'} ${(item === null || item === void 0 ? void 0 : item.spvType) ? '- ' + (item === null || item === void 0 ? void 0 : item.spvType) : ''} ${(item === null || item === void 0 ? void 0 : item.type) ? '- ' + (item === null || item === void 0 ? void 0 : item.type) : ''}`,
            ((item === null || item === void 0 ? void 0 : item.quantity) || 1).toString(),
            `${itemTotal.toFixed(2)}`
        ];
        // console.log('rowData', rowData)
        drawTableRow(page, rowData, startX, currentY, colWidth, rowHeight, false);
        currentY -= rowHeight;
    }
    // Total amount row
    currentY -= 0;
    page.drawRectangle({
        x: startX,
        y: currentY - rowHeight,
        width: pageWidth - 100,
        height: rowHeight,
        color: (0, pdf_lib_1.rgb)(201 / 255, 236 / 255, 225 / 255)
        // borderColor: rgb(0, 0, 0),
        // borderWidth: 0.5
    });
    page.drawText('Total Amount', {
        x: startX + 10,
        y: currentY - 20,
        size: 11,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    page.drawText(`${totalAmount.toFixed(2)}`, {
        x: startX + (pageWidth - 165),
        y: currentY - 20,
        size: 11,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
});
const drawTableRow = (page, data, startX, startY, colWidth, rowHeight, isHeader = false, backgroundColor) => {
    data.forEach((text, colIndex) => {
        const x = startX + colIndex * colWidth;
        if (colIndex === 0) {
            colWidth = colWidth + 70;
        }
        else {
            colWidth = colWidth - 52.5;
        }
        // Draw cell background
        const bgColor = backgroundColor ||
            (isHeader ? (0, pdf_lib_1.rgb)(254 / 255, 234 / 255, 206 / 255) : (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95));
        // Draw cell background
        const cellBgColor = isHeader
            ? (0, pdf_lib_1.rgb)(254 / 255, 234 / 255, 206 / 255)
            : (0, pdf_lib_1.rgb)(0.98, 0.98, 1);
        page.drawRectangle({
            x,
            y: startY - rowHeight,
            width: colWidth,
            height: rowHeight,
            color: backgroundColor || cellBgColor,
            borderColor: (0, pdf_lib_1.rgb)(0.7, 0.7, 0.8),
            borderWidth: 0.5
        });
        // Draw cell text
        page.drawText(text, {
            x: x + 10 + (colIndex === 2 ? colWidth - 70 : 0), // Adjust for last column
            y: startY - rowHeight / 2 - 5,
            size: isHeader ? 11 : 9,
            // font: isHeader ? 'Helvetica-Bold' : 'Helvetica',
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
    });
};
