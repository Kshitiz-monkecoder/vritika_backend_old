import { Router } from "express"
import UserAuthController from "../Controller/Auth/User"
import { middleware } from "../Lib/Utils/Middleware"
import UserRouter from "./User"
import AdminRouter from "./Admin"
import { UploadDocoment } from "../Controller/FileUploadController"
import { UploadMulter } from "../Lib/Utils/FileUpload"
import { CreateSalesPerson, SalesPersonOtpSent, SalesPersonVerifyOtp } from "../Controller/Auth/SalesPerson"
import SalesPersonRoute from "./SalesPerson"
import { GetAllState } from "../Controller/Common"
import { QuotationPdfGenerate } from "../Controller/SalesPerson/QuotationPdfController"

const Route: Router = Router()

Route.post("/user/login", UserAuthController.login)
// Route.post("/user/register", UserAuthController.register)

Route.post("/admin/login", UserAuthController.login)

Route.post("/sales-person/send-otp", SalesPersonOtpSent)
Route.post("/sales-person/verify-otp", SalesPersonVerifyOtp)

Route.post("/sales-person/register", CreateSalesPerson)

Route.get("/sales-person/quotation-pdf/:id", QuotationPdfGenerate)

Route.use(middleware)

Route.get("/:userType/states", GetAllState)
Route.use("/user", UserRouter)
Route.use("/admin", AdminRouter)
Route.use("/sales-person", SalesPersonRoute)


Route.use("/upload/:loction", UploadMulter.single("file"), UploadDocoment)

export default Route