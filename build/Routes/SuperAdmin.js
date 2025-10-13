"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../Controller/SuperAdmin/AdminController");
const Middleware_1 = require("../Lib/Utils/Middleware");
const SuperAdminRouter = (0, express_1.Router)();
// SuperAdmin: Admin Management (all routes protected with isSuperAdmin middleware)
SuperAdminRouter.post("/admins", Middleware_1.isSuperAdmin, AdminController_1.AddAdmin);
SuperAdminRouter.put("/admins/:id", Middleware_1.isSuperAdmin, AdminController_1.UpdateAdmin);
SuperAdminRouter.get("/admins", Middleware_1.isSuperAdmin, AdminController_1.GetAllAdmins);
SuperAdminRouter.get("/admins/:id", Middleware_1.isSuperAdmin, AdminController_1.GetAdminById);
SuperAdminRouter.delete("/admins/:id", Middleware_1.isSuperAdmin, AdminController_1.DeleteAdmin);
exports.default = SuperAdminRouter;
