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

// SalesPerson: Create Sub-SalesPerson (with incremented level)
export const CreateSubSalesPerson = async (req: Request, res: Response<Res>): Promise<void> => {
    try {
        const parentSalesPersonId = req.User?._id

        // Get parent SalesPerson to determine the level
        const parentSalesPerson = await SalesPersonModel.findById(parentSalesPersonId)

        if (!parentSalesPerson) {
            res.status(ResponseCode.NOT_FOUND_ERROR).json({
                status: false,
                message: 'Parent SalesPerson not found'
            })
            return
        }

        // Check if parent is at Level 5 (maximum level)
        if (parentSalesPerson.level >= 5) {
            res.status(ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: 'Maximum level reached. Level 5 SalesPersons cannot create sub-SalesPersons.'
            })
            return
        }

        // Create new SalesPerson with incremented level
        const newSalesPerson = new SalesPersonModel({
            ...req.body,
            createdBy: parentSalesPersonId,
            createdByType: "SalesPerson",
            level: parentSalesPerson.level + 1, // Increment level (max will be 5)
            parentSalesPerson: parentSalesPersonId,
            adminId: parentSalesPerson.adminId // Inherit adminId from parent
        })

        const savedSalesPerson = await newSalesPerson.save()

        res.status(ResponseCode.SUCCESS).json({
            status: true,
            data: savedSalesPerson,
            message: `Sub-SalesPerson created successfully at level ${savedSalesPerson.level}`
        })
    } catch (error) {
        res.status(ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error creating sub-SalesPerson',
            error
        })
    }
}

// SalesPerson: Get all Sub-SalesPersons created by this SalesPerson
export const GetMySubSalesPersons = (req: Request, res: Response<Res>): void => {
    const salesPersonId = req.User?._id

    SalesPersonModel.find({ 
        createdBy: salesPersonId,
        createdByType: "SalesPerson" 
    })
        .select("-token -password")
        .populate("parentSalesPerson", "name email level")
        .then((subSalesPersons) => {
            res.status(ResponseCode.SUCCESS).json({
                status: true,
                data: subSalesPersons,
                message: 'Sub-SalesPersons retrieved successfully'
            })
        })
        .catch((error) => {
            res.status(ResponseCode.SERVER_ERROR).json({
                status: false,
                message: 'Error fetching sub-SalesPersons',
                error
            })
        })
}

// SalesPerson: Get entire hierarchy tree (downline)
export const GetSalesPersonHierarchy = async (req: Request, res: Response<Res>): Promise<void> => {
    try {
        const salesPersonId = req.User?._id

        const hierarchy = await SalesPersonModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(salesPersonId) } },
            {
                $graphLookup: {
                    from: "salespersons",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parentSalesPerson",
                    as: "hierarchy",
                    maxDepth: 4 // Max 4 levels down from current (total 5 levels max)
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    level: 1,
                    adminId: 1,
                    parentSalesPerson: 1,
                    hierarchy: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        level: 1,
                        parentSalesPerson: 1,
                        adminId: 1
                    }
                }
            }
        ])

        res.status(ResponseCode.SUCCESS).json({
            status: true,
            data: hierarchy[0],
            message: 'Hierarchy retrieved successfully (Max 5 levels)'
        })
    } catch (error) {
        res.status(ResponseCode.SERVER_ERROR).json({
            status: false,
            message: 'Error fetching hierarchy',
            error
        })
    }
}
