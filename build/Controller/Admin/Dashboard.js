"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomersBySalesPerson = exports.GetSalesPersonByAdmin = exports.GetAllAdmins = void 0;
const User_1 = __importDefault(require("../../Model/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const SalesPerson_1 = __importDefault(require("../../Model/SalesPerson"));
const Customer_1 = __importDefault(require("../../Model/Customer"));
const GetAllAdmins = (req, res) => {
    User_1.default.aggregate([
        { $match: { userType: "Admin" } },
        { $project: { __v: 0, token: 0 } }
    ])
        .then((admins) => {
        res.status(200).json({
            status: true,
            data: admins,
            message: "Admins retrieved successfully"
        });
    })
        .catch((error) => {
        res.status(500).json({ status: false, message: "Error retrieving admins", error });
    });
};
exports.GetAllAdmins = GetAllAdmins;
const GetSalesPersonByAdmin = (req, res) => {
    const adminId = req.params.id;
    User_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(adminId), userType: "Admin" })
        .then((admin) => {
        if (!admin) {
            return res.status(404).json({ status: false, message: "Admin not found" });
        }
        SalesPerson_1.default.aggregate([
            { $match: { referralCode: admin.code } },
            {
                $project: {
                    token: 0,
                    __v: 0
                }
            }
        ])
            .then((salesPerson) => {
            if (!salesPerson) {
                return res
                    .status(404)
                    .json({ status: false, message: "Salesperson not found" });
            }
            res.status(200).json({
                status: true,
                data: salesPerson,
                message: "Salesperson retrieved successfully"
            });
        })
            .catch((error) => {
            res
                .status(500)
                .json({ status: false, message: "Error retrieving salesperson", error });
        });
    })
        .catch((error) => {
        res.status(500).json({ status: false, message: "Error retrieving admin", error });
    });
};
exports.GetSalesPersonByAdmin = GetSalesPersonByAdmin;
const GetCustomersBySalesPerson = (req, res) => {
    const salesPersonId = new mongoose_1.default.Types.ObjectId(req.params.id);
    Customer_1.default.aggregate([
        { $match: { salesPersonId: salesPersonId, userType: "Customer" } },
        {
            $project: {
                token: 0,
                __v: 0
            }
        }
    ])
        .then((customers) => {
        res.status(200).json({
            status: true,
            data: customers,
            message: "Customers retrieved successfully"
        });
    })
        .catch((error) => {
        res
            .status(500)
            .json({ status: false, message: "Error retrieving customers", error });
    });
};
exports.GetCustomersBySalesPerson = GetCustomersBySalesPerson;
