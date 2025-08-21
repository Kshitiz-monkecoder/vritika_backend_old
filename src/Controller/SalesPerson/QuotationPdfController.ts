import { Request, Response } from 'express'
import { readFileSync } from 'fs'
import path from 'path'
import { PDFDocument, PDFPage, PDFTextField, rgb } from 'pdf-lib'
import PDFParser from 'pdf2json'
import SiteSurveyModel from '../../Model/SiteSurvey'
import mongoose from 'mongoose'
import { SiteSurveyDataType } from '../../Lib/DataTypes/Responses/QuotationDataType'
import { title } from 'process'

// const filePath = path.join(process.cwd(), 'Asset/input.pdf')
const filePath = path.join(process.cwd(), 'Asset/DivyPowerQuotation.pdf')
const pdfParser = new PDFParser()
pdfParser.loadPDF(filePath)

interface PdfTextData {
    x: number
    y: number
    w: number
    clr: number
    sw: number
    text: string
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
        .then(async (data) => {
            // return res.send(pdfDataGlobal);
            if (data.length > 0) {
                const siteSurveyData = data[0] as SiteSurveyDataType
                // return res.send(siteSurveyData)

                const pdfDocBytes = readFileSync(filePath)
                const pdfDoc = await PDFDocument.load(pdfDocBytes)
                // const sixthPages = pdfDoc.getPage(6)

                const pdfForm = pdfDoc.getForm()
                const pdfFields = pdfForm.getFields()
                // console.log(' Name =>', pdfFields.map(field => ({name: field.getName(), title: (field as any).getText(), ...field})))
                for (const field of pdfFields) {
                    if ((field as any).getText() === 'NAME') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.title}${siteSurveyData.customer.customerContactName}`
                        )
                    }

                    if ((field as any).getText() === 'ADD') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.customerAddress}`
                        )
                    }

                    if ((field as any).getText() === 'STATE') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.state}`
                        )
                    }

                    if ((field as any).getText() === 'DISTRICT') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.district}`
                        )
                    }

                    if ((field as any).getText() === 'CU_NU') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.customerPhoneNo}`
                        )
                    }

                    if ((field as any).getText() === 'CUS_MAIL') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.emailId}`
                        )
                    }

                    if ((field as any).getText() === 'CU_NU') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.customer.customerPhoneNo}`
                        )
                    }

                    if ((field as any).getText() === 'ROOF') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.roofSurfaceType || ''}`
                        )
                    }

                    if ((field as any).getText() === 'PR_C') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.solarCapacity}`
                        )
                    }
                    if ((field as any).getText() === 'SPV_TE') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.quotations.sytemType || ''}`
                        )
                    }

                    if ((field as any).getText() === 'LENGTH') {
                        ;(field as PDFTextField).setText(`${siteSurveyData.length || ''}`)
                    }

                    if ((field as any).getText() === 'WIDTH') {
                        ;(field as PDFTextField).setText(`${siteSurveyData.width || ''}`)
                    }

                    if ((field as any).getText() === 'SA_LOAD') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.sensationLoadKW || ''}`
                        )
                    }

                    if ((field as any).getText() === 'SO_CAP') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.solarCapacity || ''}`
                        )
                    }
                    
                    if ((field as any).getText() === 'TOTAL_FL') {
                        ;(field as PDFTextField).setText(
                            `${siteSurveyData.totalRoofs || ''}`
                        )
                    }
                }
                pdfForm.flatten()

                const page = pdfDoc.getPage(7) // Get the eighth page of the PDF
                const { width, height } = page.getSize()
                page.drawRectangle({
                    x: 50,
                    y: 325,
                    width: width - 80,
                    height: 400,
                    color: rgb(1, 1, 1) // White background for the rectangle
                })
                await createDetailedQuotationTable(
                    page,
                    siteSurveyData,
                    width + 10,
                    height - 15
                )

                // Save the modified PDF to a buffer
                const pdfBytes = await pdfDoc.save()

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'inline; filename=output.pdf'
                })

                // Send the modified PDF
                res.send(Buffer.from(pdfBytes))
            } else {
                res.status(403).send('No Quotation Found length')
            }
        })
        .catch(() => {
            res.status(403).send('No Quotation Found')
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
            const width =
                Number(getCoordinate.w) >= Textwidth ? getCoordinate.w : Textwidth

            const gap = (12.301 - getCoordinate.y) * 15

            const adjustedY = 644 - getCoordinate.y // Example for flipping y-axis
            const scaledX = pageWidth - 261 - getCoordinate.x - adjustX // Example scale factor for x position
            const scaledY = adjustedY + gap + adjustY // Example scale factor for y position
            if (getCoordinate.text === '3.18') {
                console.log('width', getCoordinate)
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

pdfParser.on('pdfParser_dataReady', (pdfData) => {
    const pageIdList = [2, 4]

    pageIdList.forEach((pageId) => {
        // const pageId = 2;
        const pdfDataList: PdfTextData[] = []
        const page = pdfData.Pages[pageId]
        if (page) {
            page.Texts.forEach((text: any) => {
                const textContent = decodeURIComponent(text.R[0].T) // Text item
                // console.log('textContent', textContent)
                if (![' ', '   '].includes(textContent)) {
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

// Function to create a detailed quotation table
const createDetailedQuotationTable = async (
    page: PDFPage,
    siteSurveyData: SiteSurveyDataType,
    pageWidth: number,
    pageHeight: number
): Promise<void> => {
    const startX = 50
    const startY = pageHeight - 100
    const rowHeight = 35
    const colWidth = (pageWidth - 100) / 3

    // Title
    // page.drawText('Quotation Details', {
    //     x: startX,
    //     y: startY + 30,
    //     size: 16,
    //     color: rgb(0, 0, 0)
    // })

    // Table headers with background
    const headers = ['Description', 'Quantity', 'Amount']

    drawTableRow(page, headers, startX, startY, colWidth, rowHeight, true)

    // Data rows
    let currentY = startY - rowHeight
    let totalAmount = 0

    page.drawText('Total Amount', {
        x: startX + 10,
        y: currentY - 15,
        size: 14,
        color: rgb(0, 0, 0)
    })

    for (const item of siteSurveyData.quotations.data) {
        const itemTotal = Number(item?.price || 0) * (item?.quantity || 1)
        totalAmount += itemTotal
        // console.log('itemTotal', itemTotal, 'item', item)
        const rowData = [
            `${item?.productName || 'Item description'} ${
                item?.spvType ? '- ' + item?.spvType : ''
            } ${item?.type ? '- ' + item?.type : ''}`,
            (item?.quantity || 1).toString(),
            `${itemTotal.toFixed(2)}`
        ]
        // console.log('rowData', rowData)
        drawTableRow(page, rowData, startX, currentY, colWidth, rowHeight, false)
        currentY -= rowHeight
    }
    // Total amount row
    currentY -= 0
    page.drawRectangle({
        x: startX,
        y: currentY - rowHeight,
        width: pageWidth - 100,
        height: rowHeight,
        color: rgb(201 / 255, 236 / 255, 225 / 255)
        // borderColor: rgb(0, 0, 0),
        // borderWidth: 0.5
    })

    page.drawText('Total Amount', {
        x: startX + 10,
        y: currentY - 20,
        size: 11,
        color: rgb(0, 0, 0)
    })

    page.drawText(`${totalAmount.toFixed(2)}`, {
        x: startX + (pageWidth - 165),
        y: currentY - 20,
        size: 11,
        color: rgb(0, 0, 0)
    })
}

const drawTableRow = (
    page: PDFPage,
    data: string[],
    startX: number,
    startY: number,
    colWidth: number,
    rowHeight: number,
    isHeader: boolean = false,
    backgroundColor?: any
): void => {
    data.forEach((text, colIndex) => {
        const x = startX + colIndex * colWidth

        if (colIndex === 0) {
            colWidth = colWidth + 70
        } else {
            colWidth = colWidth - 52.5
        }

        // Draw cell background
        const bgColor =
            backgroundColor ||
            (isHeader ? rgb(254 / 255, 234 / 255, 206 / 255) : rgb(0.95, 0.95, 0.95))

        // Draw cell background
        const cellBgColor = isHeader
            ? rgb(254 / 255, 234 / 255, 206 / 255)
            : rgb(0.98, 0.98, 1)

        page.drawRectangle({
            x,
            y: startY - rowHeight,
            width: colWidth,
            height: rowHeight,
            color: backgroundColor || cellBgColor,
            borderColor: rgb(0.7, 0.7, 0.8),
            borderWidth: 0.5
        })

        // Draw cell text
        page.drawText(text, {
            x: x + 10 + (colIndex === 2 ? colWidth - 70 : 0), // Adjust for last column
            y: startY - rowHeight / 2 - 5,
            size: isHeader ? 11 : 9,

            // font: isHeader ? 'Helvetica-Bold' : 'Helvetica',
            color: rgb(0, 0, 0)
        })
    })
}
