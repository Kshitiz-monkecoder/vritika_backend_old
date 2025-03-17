import { Request, Response } from 'express'
import { Res } from '../../Lib/DataTypes/Common'
import { ResponseCode } from '../../Lib/Utils/ResponseCode'
import SalesPersonModel from '../../Model/SalesPerson'
import mongoose from 'mongoose'
import QuotationModel from '../../Model/Quotation'
import CustomerModel from '../../Model/Customer'

export const GetSalesPersonProfile = (req: Request, res: Response<Res>): void => {
    SalesPersonModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.User?._id) } },
        {
            $project: {
                token: 0,
                __v: 0
            }
        }
    ])
        .then((salesPerson) => {
            if (!salesPerson || salesPerson.length === 0) {
                return res.status(ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: 'Sales person not found'
                })
            }

            const response: Res = {
                data: salesPerson[0],
                status: true,
                message: 'Profile fetched successfully'
            }

            res.status(ResponseCode.SUCCESS).json(response)
        })
        .catch((error) => {
            res.status(ResponseCode.SERVER_ERROR).json({
                status: false,
                message: 'Error fetching profile',
                error
            })
        })
}

export const UpdateSalesPersonProfile = (req: Request, res: Response<Res>): void => {
    SalesPersonModel.findByIdAndUpdate(
        req.User?._id,
        {
            $set: {
                ...req.body
            }
        },
        { new: true, runValidators: true }
    )
        .then((updatedSalesPerson) => {
            if (!updatedSalesPerson) {
                return res.status(ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: 'Sales person not found'
                })
            }

            const response: Res = {
                data: updatedSalesPerson,
                status: true,
                message: 'Updated successfully'
            }

            res.status(ResponseCode.SUCCESS).json(response)
        })
        .catch((error) => {
            res.status(ResponseCode.SERVER_ERROR).json({
                status: false,
                message: 'Error updating profile',
                error
            })
        })
}

export const GetQuotationChart = (req: Request, res: Response<Res>): void => {
    const filter = req.query.filter as string // "today", "week", or "month"

    const now = new Date()
    let startDate: Date
    const endDate: Date = new Date(now.setHours(23, 59, 59, 999)) // End of today

    if (filter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0)) // Start of today
    } else if (filter === 'week') {
        startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week (Sunday)
    } else if (filter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1) // Start of month
    } else {
        res.status(400).json({ status: false, message: 'Invalid filter' })
        return
    }

    QuotationModel.aggregate([
        {
            $match: {
                salesPersonId: new mongoose.Types.ObjectId(req.User?._id),
                createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
            }
        },
        {
            $unwind: '$data' // Flatten the data array to process each item separately
        },
        {
            $group: {
                _id: '$_id', // Group by Quotation ID
                salesPersonId: { $first: '$salesPersonId' },
                SiteSurveyId: { $first: '$SiteSurveyId' },
                customerId: { $first: '$customerId' },
                sytemType: { $first: '$sytemType' },
                createdAt: { $first: '$createdAt' },
                totalAmount: {
                    $sum: {
                        $multiply: [
                            { $toDouble: '$data.price' },
                            { $ifNull: ['$data.quantity', 1] }
                        ]
                    }
                }
            }
        },
        {
            $sort: { createdAt: 1 } // Sort by createdAt date
        }
    ])
        .then((quotations) => {
            res.json({ status: true, data: quotations, message: 'fetched successfully' })
        })
        .catch((error) => {
            res.status(500).json({ status: false, message: error.message })
        })
}

export const GetQuotationSummary = (req: Request, res: Response<Res>) => {
    const filter = req.query.filter as string // "today", "week", "month"

    const now = new Date()
    let startDate: Date
    const endDate: Date = new Date(now.setHours(23, 59, 59, 999)) // End of today

    if (filter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0)) // Start of today
    } else if (filter === 'week') {
        startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week (Sunday)
    } else if (filter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1) // Start of month
    } else {
        res.status(400).json({ status: false, message: 'Invalid filter' })
        return
    }

    QuotationModel.aggregate([
        {
            $match: {
                salesPersonId: new mongoose.Types.ObjectId(req.User?._id),
                createdAt: { $gte: startDate, $lte: endDate } // Filter by date range
            }
        },
        {
            $unwind: '$data' // Flatten the data array to process each item separately
        },
        {
            $group: {
                _id: null, // Group all quotations together
                totalRevenue: {
                    $sum: {
                        $multiply: [
                            { $toDouble: '$data.price' },
                            { $ifNull: ['$data.quantity', 1] }
                        ]
                    }
                },
                totalQuotations: { $sum: 1 } // Count the total quotations created
            }
        }
    ])
        .then(async (result) => {
            const totalQuotations = await CustomerModel.countDocuments({
                salesPersonId: new mongoose.Types.ObjectId(req.User?._id)
            }).exec()
            res.json({
                status: true,
                message: 'fetched successfully',
                data: {
                    totalRevenue: result.length > 0 ? result[0].totalQuotations : 0,
                    totalQuotations: totalQuotations
                }
            })
        })
        .catch((error) => {
            res.status(500).json({ status: false, message: error.message })
        })
}
