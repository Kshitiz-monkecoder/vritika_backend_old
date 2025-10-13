"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerController_1 = require("../Controller/SalesPerson/CustomerController");
const SiteSurveyController_1 = require("../Controller/SalesPerson/SiteSurveyController");
const QuotationController_1 = require("../Controller/SalesPerson/QuotationController");
const SalesPerson_1 = require("../Controller/SalesPerson");
const SalesPersonRoute = (0, express_1.Router)();
SalesPersonRoute.get("/profile", SalesPerson_1.GetSalesPersonProfile); // Get sales person profile
SalesPersonRoute.put("/profile", SalesPerson_1.UpdateSalesPersonProfile); // Update sales person profile
// Sub-SalesPerson Management (Multi-level)
SalesPersonRoute.post("/sub-salesperson", SalesPerson_1.CreateSubSalesPerson); // Create a sub-SalesPerson with incremented level
SalesPersonRoute.get("/sub-salesperson", SalesPerson_1.GetMySubSalesPersons); // Get all sub-SalesPersons created by this SalesPerson
SalesPersonRoute.get("/hierarchy", SalesPerson_1.GetSalesPersonHierarchy); // Get entire hierarchy tree
SalesPersonRoute.post("/customers", CustomerController_1.CreateCustomer); // Create a new customer
SalesPersonRoute.post("/customer-verify", CustomerController_1.CustomerVerifyOtp);
SalesPersonRoute.put("/customers/:id", CustomerController_1.UpdateCustomer); // Update an existing customer
SalesPersonRoute.get("/customers", CustomerController_1.GetAllCustomers); // Get all customers
SalesPersonRoute.get("/customers/:id", CustomerController_1.GetCustomerById); // Get a single customer by ID
SalesPersonRoute.delete("/customers/:id", CustomerController_1.DeleteCustomer); // Delete a customer by ID
SalesPersonRoute.get("/customer-group", CustomerController_1.GetAllCustomerGroup);
SalesPersonRoute.post("/customer-subgroup", CustomerController_1.GetAllCustomerSubGroup);
SalesPersonRoute.post("/customer-segment", CustomerController_1.GetAllCustomerSegment);
SalesPersonRoute.post("/customer-bydate", CustomerController_1.GetCustomersByDate);
SalesPersonRoute.post("/site-survey", SiteSurveyController_1.CreateSiteSurvey); // Create a new SiteSurvey
SalesPersonRoute.post("/site-survey/:id", SiteSurveyController_1.CreateSiteSurveySecend); // Create a new SiteSurvey
SalesPersonRoute.put("/site-survey/:id", SiteSurveyController_1.UpdateSiteSurvey); // Update an existing SiteSurvey
SalesPersonRoute.get("/site-survey", SiteSurveyController_1.GetAllSiteSurveys); // Get all site-survey
SalesPersonRoute.get("/site-survey/:id", SiteSurveyController_1.GetSiteSurveyById); // Get a single SiteSurvey by ID
SalesPersonRoute.delete("/site-survey/:id", SiteSurveyController_1.DeleteSiteSurvey); // Delete a SiteSurvey by ID
SalesPersonRoute.get("/site-survey/customer/:id", SiteSurveyController_1.GetSiteSurveyByCustomer); // Get a single SiteSurvey by customer ID
SalesPersonRoute.post("/quotation-band", QuotationController_1.GetQuotationBand);
SalesPersonRoute.post("/quotation-solar-module", QuotationController_1.GetQuotationSolarModule);
SalesPersonRoute.post("/quotation-product", QuotationController_1.GetQuotationProduct);
SalesPersonRoute.get("/products", QuotationController_1.GetProductSectionList);
SalesPersonRoute.post("/quotation", QuotationController_1.CreateQuotation);
SalesPersonRoute.get("/quotation-send/:id", QuotationController_1.SendQuotation);
SalesPersonRoute.get("/quotation-chart", SalesPerson_1.GetQuotationChart);
SalesPersonRoute.get("/quotation-summary", SalesPerson_1.GetQuotationSummary);
exports.default = SalesPersonRoute;
