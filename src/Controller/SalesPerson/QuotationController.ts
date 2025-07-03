import { Request, Response } from 'express'
import BrandModel from '../../Model/Brand'
import { ResponseCode } from '../../Lib/Utils/ResponseCode'
import { dbError, InputValidator } from '../../Lib/Utils/ErrorHandler'
import { Res } from '../../Lib/DataTypes/Common'
import { BrandModelType } from '../../Lib/DataTypes/Models/Brand'
import ProductModel from '../../Model/Product'
import { ProductModelType } from '../../Lib/DataTypes/Models/Product'
import QuotationModel from '../../Model/Quotation'
import mongoose from 'mongoose'
import axios from 'axios'
import { CustomerModelDataType } from '../../Lib/DataTypes/Models/Customer'

export const GetQuotationBand = (_req: Request, res: Response<Res<BrandModelType[]>>) => {
    BrandModel.find({ ..._req.body })
        .then((brands) => {
            res.status(ResponseCode.SUCCESS).json({
                status: true,
                data: brands,
                message: 'Brands retrieved successfully'
            })
        })
        .catch((error) => {
            dbError(error, res)
        })
}

export const GetQuotationSolarModule = (
    _req: Request,
    res: Response<Res<ProductModelType[]>>
) => {
    ProductModel.aggregate([
        {
            $match: {
                type: 'Solar Module'
            }
        },
        {
            $match: {
                ..._req.body
            }
        },
        {
            $lookup: {
                from: 'brands',
                foreignField: '_id',
                localField: 'spvBrand',
                as: 'brands'
            }
        },
        {
            $unwind: '$brands'
        },
        {
            $project: {
                __v: 0
            }
        }
    ])
        .then((brands) => {
            res.status(ResponseCode.SUCCESS).json({
                status: true,
                data: brands,
                message: 'Product retrieved successfully'
            })
        })
        .catch((error) => {
            dbError(error, res)
        })
}

export const GetProductSectionList = (
    _req: Request,
    res: Response<Res<ProductModelType[]>>
) => {
    ProductModel.aggregate([
        {
            $match: {
                type: { $nin: ['kit', 'BOS'] }
            }
        },
        {
            $group: {
                _id: '$type' // Field for distinct values
            }
        },
        {
            $addFields: {
                type: '$_id'
            }
        },
        {
            $sort: {
                type: 1
            }
        },
        {
            $lookup: {
                from: 'products',
                foreignField: 'type',
                localField: '_id',
                as: 'products',
                pipeline: [
                    {
                        $addFields: {
                            selected: false
                        }
                    },
                    {
                        $lookup: {
                            from: 'brands',
                            foreignField: '_id',
                            localField: 'spvBrand',
                            as: 'brands'
                        }
                    },
                    {
                        $unwind: {
                            preserveNullAndEmptyArrays: true,
                            path: '$brands'
                        }
                    }
                ]
            }
        }
    ])
        .then((brands) => {
            res.status(ResponseCode.SUCCESS).json({
                status: true,
                data: brands,
                message: 'Product retrieved successfully'
            })
        })
        .catch((error) => {
            dbError(error, res)
        })
}

export const GetInverter = () => {}

export const GetQuotationProduct = (
    _req: Request,
    res: Response<Res<ProductModelType[]>>
) => {
    ProductModel.aggregate([
        {
            $match: { ..._req.body }
        },
        {
            $project: {
                __v: 0
            }
        }
    ])
        .then((brands) => {
            res.status(ResponseCode.SUCCESS).json({
                status: true,
                data: brands,
                message: 'Product retrieved successfully'
            })
        })
        .catch((error) => {
            dbError(error, res)
        })
}

export const CreateQuotation = (req: Request, res: Response<Res>) => {
    InputValidator(req.body, {
        customerId: 'required|string',
        data: 'required|array'
    })
        .then(() => {
            // console.log('req.body', JSON.stringify(req.body))
            QuotationModel.findOne({
                salesPersonId: req.User?._id,
                customerId: req.body.customerId,
                SiteSurveyId: req.body.SiteSurveyId
            })
                .then((data) => {
                    if (data) {
                        data.updateOne({
                            $set: {
                                ...req.body
                            },
                            new: true
                        })
                            .then(() => {
                                res.status(ResponseCode.SUCCESS).json({
                                    status: true,
                                    data: data,
                                    message: 'Quotation Create successfully'
                                })
                            })
                            .catch((error) => {
                                dbError(error, res)
                            })
                    } else {
                        const quotation = new QuotationModel({
                            ...req.body,
                            salesPersonId: req.User?._id
                        })
                        quotation
                            .save()
                            .then((savedQuotation) => {
                                res.status(ResponseCode.SUCCESS).json({
                                    status: true,
                                    data: savedQuotation,
                                    message: 'Quotation Create successfully'
                                })
                            })
                            .catch((error) => {
                                dbError(error, res)
                            })
                    }
                })
                .catch((error) => {
                    dbError(error, res)
                })
        })
        .catch((error) => {
            dbError(error, res)
        })
}

export const SendQuotation = (req: Request<{ id: string }>, res: Response<Res>) => {
    QuotationModel.findOne({
        salesPersonId: new mongoose.Types.ObjectId(req.User?._id || ''),
        _id: new mongoose.Types.ObjectId(req.params.id)
    })
        .populate<{ customerId: CustomerModelDataType }>('customerId')
        .then((data) => {
            if (data && data.SiteSurveyId) {
                axios
                    .request({
                        method: 'POST',
                        url: 'https://services.kit19.com/IMS/Whatsapp/Template',
                        headers: { 'Content-Type': 'application/JSON' },
                        data: JSON.stringify({
                            key: '2B09C330FE0F4EC9B725CE0C5B0B6ADA',
                            username: 'divypower106334',
                            name: 'whatsapp',
                            remarks:
                                'Hello Kit19 IT Support,\n\nThank you for choosing Divy Power! 😊\nPlease find attached your solar rooftop system quotation based on the site survey and details provided.',
                            whatsapp: {
                                to: `91${data.customerId.customerPhoneNo}`,
                                type: 'template',
                                category: 'MARKETING',
                                recipient_type: 'individual',
                                template: {
                                    namespace: '',
                                    language: {
                                        policy: 'deterministic',
                                        code: 'en'
                                    },
                                    name: 'api_testing',
                                    components: [
                                        {
                                            type: 'header',
                                            parameters: [
                                                {
                                                    type: 'document',
                                                    document: {
                                                        link: `https://api.viritika.com/api/v1/sales-person/quotation-pdf/${data.SiteSurveyId}`,
                                                        filename: 'CRM.pdf'
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type: 'body',
                                            parameters: [
                                                {
                                                    type: 'text',
                                                    text: data.customerId
                                                        .customerContactName
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        })
                    })
                    .then(async () => {
                        res.sendStatus(ResponseCode.SUCCESS).send({
                            status: true,
                            message: 'Successful quotation send via whatsapp'
                        })
                    })
                    .catch((error) => {
                        console.error('Error sending quotation via WhatsApp:', error)
                        res.status(ResponseCode.BAD_REQUEST).json({
                            status: false,
                            message: 'Failed to send quotation via WhatsApp'
                        })
                    })
            } else {
                res.status(ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: 'No Quotation found'
                })
            }
        })
        .catch((error) => {
            dbError(error, res)
        })
}
