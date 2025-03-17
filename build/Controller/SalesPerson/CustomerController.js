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
exports.GetCustomersByDate = exports.GetAllCustomerSegment = exports.GetAllCustomerSubGroup = exports.GetAllCustomerGroup = exports.DeleteCustomer = exports.GetCustomerById = exports.GetAllCustomers = exports.UpdateCustomer = exports.CustomerVerifyOtp = exports.CreateCustomer = void 0;
const ErrorHandler_1 = require("../../Lib/Utils/ErrorHandler");
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const Customer_1 = __importDefault(require("../../Model/Customer"));
const CustomerGroup_1 = __importDefault(require("../../Model/CustomerGroup"));
const CustomerSubGroup_1 = __importDefault(require("../../Model/CustomerSubGroup"));
const mongoose_1 = __importDefault(require("mongoose"));
const CustomeSegment_1 = __importDefault(require("../../Model/CustomeSegment"));
const dotenv_1 = require("dotenv");
const AuthOtp_1 = require("../../Lib/Utils/AuthOtp");
const OTPverification_1 = __importDefault(require("../../Model/OTPverification"));
(0, dotenv_1.configDotenv)();
// Add a new customer
const CreateCustomer = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        customerPhoneNo: "required|string",
        customerContactName: "required|string",
        leadId: "required|string",
        customerGroup: "required|string",
        customerSubGroup: "required|string",
        segment: "required|string",
        proposalDate: "required|string",
        // proposal: "required|string",
        title: "required|string|in:Mr.,Ms.,Mrs.,Dr.",
        // emailId: "required|string|email",
        customerAddress: "required|string",
        state: "required|string",
        district: "required|string",
        pinCode: "required|string"
    })
        .then(() => {
        var _a;
        const customer = new Customer_1.default(Object.assign(Object.assign({}, req.body), { salesPersonId: (_a = req.User) === null || _a === void 0 ? void 0 : _a._id }));
        customer
            .save()
            .then((savedCustomer) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: savedCustomer,
                message: "Customer OTP sent successfully"
            });
            (0, AuthOtp_1.SendOTPwhatsApp)(`91${savedCustomer.customerPhoneNo}`, "customerNumberVerification");
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.CreateCustomer = CreateCustomer;
const CustomerVerifyOtp = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        phoneNumber: "required|string",
        otp: "required|string",
        _id: "required|string"
    })
        .then(() => {
        const { phoneNumber, otp } = req.body;
        console.log("otp", otp, `91${phoneNumber},`);
        OTPverification_1.default.findOne({
            otp: Number(otp),
            phoneNumber: `91${phoneNumber}`,
            status: true,
            type: "customerNumberVerification"
        })
            .then((response) => {
            if (response) {
                Customer_1.default.findById(req.body._id)
                    .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                    if (data) {
                        yield data.updateOne({
                            $set: {
                                verify: true
                            }
                        });
                        yield response.updateOne({
                            $set: {
                                status: false
                            }
                        });
                        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                            status: true,
                            message: "Customer OTP Verify successfully"
                        });
                    }
                    else {
                        res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                            status: false,
                            message: "No Customer Found, please check try again"
                        });
                    }
                }))
                    .catch(() => {
                    res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                        status: false,
                        message: "Invalid otp. please check your code and try again"
                    });
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.AUTH_ERROR).json({
                    status: false,
                    message: "Invalid otp. please check your code and try again"
                });
            }
        })
            .catch((error) => {
            res
                .status(ResponseCode_1.ResponseCode.SERVER_ERROR)
                .json({ status: false, message: "Error sending OTP", error });
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.CustomerVerifyOtp = CustomerVerifyOtp;
// Update an existing customer by ID
const UpdateCustomer = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        leadId: "string",
        customerPhoneNo: "string",
        customerGroup: "string",
        customerSubGroup: "string",
        segment: "string",
        proposalDate: "string",
        proposal: "string",
        title: "string|in:Mr.,Ms.,Mrs.,Dr.",
        customerContactName: "string",
        emailId: "string|email",
        customerAddress: "string",
        state: "string",
        district: "string",
        pinCode: "string"
    })
        .then(() => {
        const { id } = req.params;
        const customerData = req.body;
        Customer_1.default.findByIdAndUpdate(id, customerData, { new: true })
            .then((updatedCustomer) => {
            if (updatedCustomer) {
                res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                    status: true,
                    data: updatedCustomer,
                    message: "Customer updated successfully"
                });
            }
            else {
                res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: "Customer not found"
                });
            }
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.UpdateCustomer = UpdateCustomer;
// Get all customers
const GetAllCustomers = (_req, res) => {
    var _a;
    Customer_1.default.find({
        state: true,
        salesPersonId: new mongoose_1.default.Types.ObjectId((_a = _req.User) === null || _a === void 0 ? void 0 : _a._id)
    })
        .then((customers) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: customers,
            message: "Customers retrieved successfully"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllCustomers = GetAllCustomers;
// Get a single customer by ID
const GetCustomerById = (req, res) => {
    const { id } = req.params;
    Customer_1.default.findById(id)
        .then((customer) => {
        if (customer) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: customer,
                message: "Customer retrieved successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Customer not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetCustomerById = GetCustomerById;
// Delete a customer by ID
const DeleteCustomer = (req, res) => {
    const { id } = req.params;
    Customer_1.default.findByIdAndDelete(id)
        .then((deletedCustomer) => {
        if (deletedCustomer) {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: deletedCustomer,
                message: "Customer deleted successfully"
            });
        }
        else {
            res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
                status: false,
                message: "Customer not found"
            });
        }
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.DeleteCustomer = DeleteCustomer;
const GetAllCustomerGroup = (req, res) => {
    CustomerGroup_1.default.find({})
        .then((customerGroups) => {
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            data: customerGroups,
            message: "Customer Groups retrieved successfully"
        });
    })
        .catch((error) => {
        (0, ErrorHandler_1.dbError)(error, res);
    });
};
exports.GetAllCustomerGroup = GetAllCustomerGroup;
const GetAllCustomerSubGroup = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        group_id: "string|required"
    })
        .then(() => {
        CustomerSubGroup_1.default.find({
            group_id: new mongoose_1.default.Types.ObjectId(req.body.group_id)
        })
            .then((customerSubGroups) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: customerSubGroups,
                message: "Customer SubGroup retrieved successfully"
            });
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.GetAllCustomerSubGroup = GetAllCustomerSubGroup;
const GetAllCustomerSegment = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        sub_group_id: "string|required"
    })
        .then(() => {
        CustomeSegment_1.default.find({
            sub_group_id: new mongoose_1.default.Types.ObjectId(req.body.sub_group_id)
        })
            .then((customerSegment) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: customerSegment,
                message: "Customer Segment retrieved successfully"
            });
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.GetAllCustomerSegment = GetAllCustomerSegment;
// Get customers created on a specific date
const GetCustomersByDate = (req, res) => {
    (0, ErrorHandler_1.InputValidator)(req.body, {
        date: "required|string"
    })
        .then(() => {
        var _a;
        const { date } = req.body;
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        Customer_1.default.aggregate([
            {
                $match: {
                    salesPersonId: new mongoose_1.default.Types.ObjectId((_a = req.User) === null || _a === void 0 ? void 0 : _a._id)
                }
            },
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            }
        ])
            .then((customers) => {
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                data: customers,
                message: "Customers retrieved successfully"
            });
        })
            .catch((error) => {
            (0, ErrorHandler_1.dbError)(error, res);
        });
    })
        .catch((error) => {
        res.status(ResponseCode_1.ResponseCode.VALIDATION_ERROR).json({
            status: false,
            message: error
        });
    });
};
exports.GetCustomersByDate = GetCustomersByDate;
