import { Router } from "express"
import {
	CreateCustomer,
	CustomerVerifyOtp,
	DeleteCustomer,
	GetAllCustomerGroup,
	GetAllCustomers,
	GetAllCustomerSegment,
	GetAllCustomerSubGroup,
	GetCustomerById,
	GetCustomersByDate,
	UpdateCustomer
} from "../Controller/SalesPerson/CustomerController"
import {
	CreateSiteSurvey,
	CreateSiteSurveySecend,
	DeleteSiteSurvey,
	GetAllSiteSurveys,
	GetSiteSurveyByCustomer,
	GetSiteSurveyById,
	UpdateSiteSurvey
} from "../Controller/SalesPerson/SiteSurveyController"
import {
	CreateQuotation,
	GetProductSectionList,
	GetQuotationBand,
	GetQuotationProduct,
	GetQuotationSolarModule,
	SendQuotation
} from "../Controller/SalesPerson/QuotationController"
import {
	GetQuotationChart,
	GetQuotationSummary,
	GetSalesPersonProfile,
	UpdateSalesPersonProfile
} from "../Controller/SalesPerson"

const SalesPersonRoute: Router = Router()

SalesPersonRoute.get("/profile", GetSalesPersonProfile) // Get sales person profile
SalesPersonRoute.put("/profile", UpdateSalesPersonProfile) // Update sales person profile

SalesPersonRoute.post("/customers", CreateCustomer) // Create a new customer
SalesPersonRoute.post("/customer-verify", CustomerVerifyOtp)
SalesPersonRoute.put("/customers/:id", UpdateCustomer) // Update an existing customer
SalesPersonRoute.get("/customers", GetAllCustomers) // Get all customers
SalesPersonRoute.get("/customers/:id", GetCustomerById) // Get a single customer by ID
SalesPersonRoute.delete("/customers/:id", DeleteCustomer) // Delete a customer by ID

SalesPersonRoute.get("/customer-group", GetAllCustomerGroup)
SalesPersonRoute.post("/customer-subgroup", GetAllCustomerSubGroup)
SalesPersonRoute.post("/customer-segment", GetAllCustomerSegment)
SalesPersonRoute.post("/customer-bydate", GetCustomersByDate)

SalesPersonRoute.post("/site-survey", CreateSiteSurvey) // Create a new SiteSurvey
SalesPersonRoute.post("/site-survey/:id", CreateSiteSurveySecend) // Create a new SiteSurvey
SalesPersonRoute.put("/site-survey/:id", UpdateSiteSurvey) // Update an existing SiteSurvey
SalesPersonRoute.get("/site-survey", GetAllSiteSurveys) // Get all site-survey
SalesPersonRoute.get("/site-survey/:id", GetSiteSurveyById) // Get a single SiteSurvey by ID
SalesPersonRoute.delete("/site-survey/:id", DeleteSiteSurvey) // Delete a SiteSurvey by ID
SalesPersonRoute.get("/site-survey/customer/:id", GetSiteSurveyByCustomer) // Get a single SiteSurvey by customer ID

SalesPersonRoute.post("/quotation-band", GetQuotationBand)
SalesPersonRoute.post("/quotation-solar-module", GetQuotationSolarModule)
SalesPersonRoute.post("/quotation-product", GetQuotationProduct)
SalesPersonRoute.get("/products", GetProductSectionList)

SalesPersonRoute.post("/quotation", CreateQuotation)
SalesPersonRoute.get("/quotation-send/:id", SendQuotation)
SalesPersonRoute.get("/quotation-chart", GetQuotationChart)
SalesPersonRoute.get("/quotation-summary", GetQuotationSummary)






export default SalesPersonRoute
