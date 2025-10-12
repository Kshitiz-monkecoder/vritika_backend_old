import { Router } from "express"
import {
	AddAdmin,
	DeleteAdmin,
	GetAllAdmins,
	GetAdminById,
	UpdateAdmin
} from "../Controller/SuperAdmin/AdminController"
import SuperAdminAuthController from "../Controller/Auth/SuperAdmin"
import { isSuperAdmin } from "../Lib/Utils/Middleware"

const SuperAdminRouter: Router = Router()

// SuperAdmin: Admin Management (all routes protected with isSuperAdmin middleware)
SuperAdminRouter.post("/admins", isSuperAdmin, AddAdmin)
SuperAdminRouter.put("/admins/:id", isSuperAdmin, UpdateAdmin)
SuperAdminRouter.get("/admins", isSuperAdmin, GetAllAdmins)
SuperAdminRouter.get("/admins/:id", isSuperAdmin, GetAdminById)
SuperAdminRouter.delete("/admins/:id", isSuperAdmin, DeleteAdmin)

export default SuperAdminRouter
