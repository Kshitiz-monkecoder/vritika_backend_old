import { Router } from "express"
import {
	CreateBrand,
	DeleteBrand,
	GetAllBrands,
	GetBrandById,
	UpdateBrand
} from "../Controller/Admin/BrandController"
import {
	CreateProduct,
	DeleteProduct,
	GetAllProducts,
	GetProductById,
	UpdateProduct
} from "../Controller/Admin/ProductController"
import {
	AddUser,
	DeleteUser,
	GetAllUsers,
	GetUserById,
	UpdateUser
} from "../Controller/Admin/UserController"
import {
	AddSalesPerson,
	DeleteSalesPerson,
	GetAllSalesPersons,
	GetSalesPersonById,
	UpdateSalesPerson,
	GetSalesPersonHierarchyTree
} from "../Controller/Admin/SalesPersonController"
import {
	GetAllAdmins,
	GetCustomersBySalesPerson,
	GetSalesPersonByAdmin
} from "../Controller/Admin/Dashboard"
import {
	AddRoleCommission,
	DeleteRoleCommission,
	GetAllRoleCommissions,
	GetRoleCommissionById,
	UpdateRoleCommission
} from "../Controller/Admin/RoleCommissionController"
import AnalyticsRouter from "./Analytics"

const AdminRouter: Router = Router()

AdminRouter.get("/dashboad", GetAllAdmins)
AdminRouter.get("/dashboad-admin/:id", GetSalesPersonByAdmin)
AdminRouter.get("/dashboad-sales-persons/:id", GetCustomersBySalesPerson)

AdminRouter.post("/brand", CreateBrand)
AdminRouter.get("/brand", GetAllBrands)
AdminRouter.get("/brand/:id", GetBrandById)
AdminRouter.put("/brand/:id", UpdateBrand)
AdminRouter.delete("/brand/:id", DeleteBrand)

AdminRouter.post("/product", CreateProduct)
AdminRouter.get("/product", GetAllProducts)
AdminRouter.get("/product/:id", GetProductById)
AdminRouter.put("/product/:id", UpdateProduct)
AdminRouter.delete("/product/:id", DeleteProduct)

AdminRouter.post("/users", AddUser)
AdminRouter.put("/users/:id", UpdateUser)
AdminRouter.get("/users", GetAllUsers)
AdminRouter.get("/users/:id", GetUserById)
AdminRouter.delete("/users/:id", DeleteUser)

AdminRouter.post("/sales-persons", AddSalesPerson)
AdminRouter.put("/sales-persons/:id", UpdateSalesPerson)
AdminRouter.get("/sales-persons", GetAllSalesPersons)
AdminRouter.get("/sales-persons/hierarchy-tree", GetSalesPersonHierarchyTree) // Get hierarchy tree
AdminRouter.get("/sales-persons/:id", GetSalesPersonById)
AdminRouter.delete("/sales-persons/:id", DeleteSalesPerson)

AdminRouter.post("/role-commission", AddRoleCommission)
AdminRouter.put("/role-commission/:id", UpdateRoleCommission)
AdminRouter.get("/role-commission", GetAllRoleCommissions)
AdminRouter.get("/role-commission/:id", GetRoleCommissionById)
AdminRouter.delete("/role-commission/:id", DeleteRoleCommission)

AdminRouter.use(AnalyticsRouter)

export default AdminRouter
