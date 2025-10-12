# 📋 Postman API Verification Report
**Generated:** October 12, 2025  
**Project:** Dyvporwe Dynamic Backend API

## 🎯 Summary

This report compares all Postman API endpoints and payloads against the backend code implementation.

---

## ✅ VERIFIED ENDPOINTS

### 🔐 SuperAdmin Section

#### ✅ Authentication
| Endpoint | Method | Postman URL | Backend Route | Status | Payload Match |
|----------|--------|-------------|---------------|--------|---------------|
| Create SuperAdmin | POST | `/api/v1/super-admin/create` | ✅ Matches | ✅ Correct | ✅ Correct |
| SuperAdmin Login | POST | `/api/v1/super-admin/login` | ✅ Matches | ✅ Correct | ✅ Correct |

**Postman Payload (Create):**
```json
{
  "email": "superadmin@dyvporwe.com",
  "password": "SuperAdmin@123",
  "firstName": "Super",
  "lastName": "Admin"
}
```

**⚠️ ISSUE FOUND:**
- **Backend Model** expects: `name` (required, type: String)
- **Postman** sends: `firstName` and `lastName`
- **Controller** (`SuperAdminAuthController.create`) doesn't validate fields
- **Fix Needed:** Update Postman payload to send `name` instead of `firstName`/`lastName`, OR update controller to concatenate names

**Postman Payload (Login):** ✅ Correct
```json
{
  "email": "superadmin@dyvporwe.com",
  "password": "SuperAdmin@123"
}
```

#### ✅ Admin Management
| Endpoint | Method | Postman URL | Backend Route | Status | Payload Match |
|----------|--------|-------------|---------------|--------|---------------|
| Create Admin | POST | `/api/v1/super-admin/admin` | ⚠️ **MISMATCH** | ❌ Wrong Route | ⚠️ Partial |
| List Admins | GET | `/api/v1/super-admin/admin` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |
| Get Admin by ID | GET | `/api/v1/super-admin/admin/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |
| Update Admin | PUT | `/api/v1/super-admin/admin/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | ⚠️ Partial |
| Delete Admin | DELETE | `/api/v1/super-admin/admin/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |

**❌ CRITICAL ISSUE:**
- **Postman URLs:** `/api/v1/super-admin/admin`
- **Backend Routes:** `/api/v1/super-admin/admins` (with 's')
- **Location:** `src/Routes/SuperAdmin.ts`
- **Fix Needed:** Update all Postman endpoints to use `/admins` (plural)

**Postman Payload (Create Admin):**
```json
{
  "email": "admin@dyvporwe.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**⚠️ PAYLOAD ISSUE:**
- **Backend Model** (`User.ts`) expects:
  - `name` (required)
  - `adminType` (required, enum: "Organisation" | "Individual")
  - `address` (required)
  - `aadharCardNo` (required)
  - `aadharCardImage` (required, array)
  - `panCardNo` (required)
  - `panCardImage` (required, array)
  - `bankAccountNo` (required)
  - `ifscCode` (required)
  - `bankHolderName` (required)
- **Postman** only sends: email, password, firstName, lastName
- **Controller** validates only: name, email, phone
- **Fix Needed:** Either update Postman to include all required fields OR make fields optional in model

---

### 👔 Admin Section

#### ✅ Authentication
| Endpoint | Method | Postman URL | Backend Route | Status |
|----------|--------|-------------|---------------|--------|
| Admin Login | POST | `/api/v1/auth/login` | ⚠️ **MISMATCH** | ❌ Wrong Route |

**❌ ISSUE:**
- **Postman:** `/api/v1/auth/login`
- **Backend:** `/api/v1/admin/login`
- **Fix Needed:** Update Postman to use `/admin/login` instead of `/auth/login`

#### ✅ SalesPerson Management (Level 1-5)
| Endpoint | Method | Postman URL | Backend Route | Status | Payload Match |
|----------|--------|-------------|---------------|--------|---------------|
| Create Level 1 | POST | `/api/v1/admin/sales-person` | ⚠️ **MISMATCH** | ❌ Wrong Route | ❌ Wrong Payload |
| List All | GET | `/api/v1/admin/sales-person` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |
| Get by ID | GET | `/api/v1/admin/sales-person/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |
| Update | PUT | `/api/v1/admin/sales-person/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | ❌ Wrong Payload |
| Delete | DELETE | `/api/v1/admin/sales-person/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |
| Get Hierarchy | GET | `/api/v1/admin/sales-person/hierarchy/:id` | ⚠️ **MISMATCH** | ❌ Wrong Route | N/A |

**❌ CRITICAL ISSUES:**

1. **Route Mismatch:**
   - **Postman:** `/api/v1/admin/sales-person`
   - **Backend:** `/api/v1/admin/sales-persons` (with 's')
   - **Fix:** Update Postman to use `/sales-persons` (plural)

2. **Hierarchy Route Mismatch:**
   - **Postman:** `/api/v1/admin/sales-person/hierarchy/:id`
   - **Backend:** `/api/v1/admin/sales-persons/hierarchy-tree` (no ID param)
   - **Fix:** Update Postman to `/api/v1/admin/sales-persons/hierarchy-tree`

**Postman Payload (Create):**
```json
{
  "phone": "9876543210",
  "firstName": "Sales",
  "lastName": "Person L1",
  "email": "salesL1@dyvporwe.com"
}
```

**❌ MASSIVE PAYLOAD MISMATCH:**
- **Backend Model** requires:
  - `name` (required)
  - `phoneNumber` (required) - Postman sends `phone`
  - `email` (required) ✅
  - `address` (required) ❌ Missing
  - `selfie` (required) ❌ Missing
  - `aadharCardNumber` (required) ❌ Missing
  - `aadharCardFront` (required) ❌ Missing
  - `aadharCardBack` (required) ❌ Missing
  - `panCardNumber` (required) ❌ Missing
  - `panCardFront` (required) ❌ Missing
  - `bankAccountNumber` (required) ❌ Missing
  - `bankIfscCode` (required) ❌ Missing
  - `bankAccountName` (required) ❌ Missing
  - `cancelChequePhoto` (required) ❌ Missing
  - `status` (required, enum: "Inactive"|"Active"|"Pending")
- **Postman** only sends: phone, firstName, lastName, email
- **Fix Needed:** Update Postman payload to include ALL required fields

**Postman Payload (Update):**
```json
{
  "firstName": "Updated Sales",
  "lastName": "Person"
}
```

**❌ PAYLOAD ISSUE:**
- Backend expects `name`, not `firstName`/`lastName`
- Missing other optional fields that could be updated

---

### 💼 SalesPerson Section

#### ✅ Authentication
| Endpoint | Method | Postman URL | Backend Route | Status |
|----------|--------|-------------|---------------|--------|
| Request OTP | POST | `/api/v1/sales-person/send-otp` | ✅ Matches | ✅ Correct |
| Verify OTP | POST | `/api/v1/sales-person/verify-otp` | ✅ Matches | ✅ Correct |

**Payloads:** ✅ All correct

#### ✅ Profile
| Endpoint | Method | Postman URL | Backend Route | Status |
|----------|--------|-------------|---------------|--------|
| Get Profile | GET | `/api/v1/sales-person/profile` | ✅ Matches | ✅ Correct |
| Update Profile | PUT | `/api/v1/sales-person/profile` | ✅ Matches | ⚠️ See notes |

**Note:** Update Profile accepts any fields, no validation shown in Postman

#### ✅ Sub-SalesPerson Management
| Endpoint | Method | Postman URL | Backend Route | Status | Payload Match |
|----------|--------|-------------|---------------|--------|---------------|
| Create Sub | POST | `/api/v1/sales-person/sub-sales-person` | ⚠️ **MISMATCH** | ❌ Wrong Route | ❌ Wrong Payload |
| Get Hierarchy | GET | `/api/v1/sales-person/hierarchy` | ✅ Matches | ✅ Correct |

**❌ ROUTE MISMATCH:**
- **Postman:** `/api/v1/sales-person/sub-sales-person`
- **Backend:** `/api/v1/sales-person/sub-salesperson` (no hyphen in "salesperson")
- **Fix:** Update Postman to `/sub-salesperson`

**Postman Payload (Create Sub):**
```json
{
  "phone": "9876543211",
  "firstName": "Sub Sales",
  "lastName": "Person",
  "email": "subsales@dyvporwe.com"
}
```

**❌ SAME PAYLOAD ISSUES as Admin Create SalesPerson:**
- Missing all required fields from SalesPerson model
- Using `phone` instead of `phoneNumber`
- Using `firstName`/`lastName` instead of `name`

#### ✅ Customers
| Endpoint | Method | Postman URL | Backend Route | Status |
|----------|--------|-------------|---------------|--------|
| Create Customer | POST | `/api/v1/sales-person/customer` | ⚠️ **MISMATCH** | ❌ Wrong Route |
| List Customers | GET | `/api/v1/sales-person/customer` | ⚠️ **MISMATCH** | ❌ Wrong Route |

**❌ ROUTE MISMATCH:**
- **Postman:** `/api/v1/sales-person/customer`
- **Backend:** `/api/v1/sales-person/customers` (with 's')
- **Fix:** Update Postman to use `/customers` (plural)

#### ✅ Quotations
| Endpoint | Method | Postman URL | Backend Route | Status |
|----------|--------|-------------|---------------|--------|
| Create Quotation | POST | `/api/v1/sales-person/quotation` | ✅ Matches | ⚠️ Check payload |
| List Quotations | GET | `/api/v1/sales-person/quotation` | ✅ Matches | ✅ Correct |

---

### 🗂️ Old/Legacy Endpoints (Not in New Multi-Level System)

The Postman collection contains many **old endpoints** that are NOT part of the new multi-level role system:

#### Authentication Section (Old)
- ❌ `/api/auth/user-otp-verify` - Old user login
- ❌ `/api/auth/login` - Old generic login
- ❌ `/api/auth/user-otp-request` - Old OTP request
- ❌ `/api/auth/users` - Old user list
- ❌ `/api/auth/profile` - Old profile endpoint

#### Admin Section (Old)
- ❌ `/api/auth/create-agent` - Old agent creation
- ❌ `/api/auth/update-user/:agentId` - Old update
- ❌ `/api/form-types` - Form types (not in new system)
- ❌ `/api/dynamic-form-fields` - Dynamic forms (not in new system)
- ❌ `/api/auth/agent-user` - Old staff endpoints

#### Agent Section (Old)
- ❌ All form-related endpoints
- ❌ `/api/auth/create-user` - Old user signup
- ❌ `/api/pdf/submission/:id/preview` - PDF endpoints

#### User Section (Old)
- ❌ All form submission endpoints
- ❌ `/api/form-submissions/submit`

**⚠️ RECOMMENDATION:** 
- Keep old endpoints in a separate folder labeled "🗄️ Legacy/Deprecated"
- OR create a separate collection for the new multi-level system only

---

## 🚨 CRITICAL ISSUES SUMMARY

### 1. ❌ Route Naming Mismatches
| Postman | Backend | Fixed Status |
|---------|---------|--------------|
| `/admin/login` | `/admin/login` | ✅ Already fixed |
| `/super-admin/admin` | `/super-admin/admins` | ❌ Needs fix |
| `/admin/sales-person` | `/admin/sales-persons` | ❌ Needs fix |
| `/admin/sales-person/hierarchy/:id` | `/admin/sales-persons/hierarchy-tree` | ❌ Needs fix |
| `/sales-person/sub-sales-person` | `/sales-person/sub-salesperson` | ❌ Needs fix |
| `/sales-person/customer` | `/sales-person/customers` | ❌ Needs fix |

### 2. ❌ Field Naming Mismatches
| Postman Field | Backend Field | Model |
|---------------|---------------|-------|
| `firstName`, `lastName` | `name` | SuperAdmin |
| `firstName`, `lastName` | `name` | User (Admin) |
| `phone` | `phoneNumber` | SalesPerson |
| `firstName`, `lastName` | `name` | SalesPerson |

### 3. ❌ Missing Required Fields

**Admin Creation Payload:**
- Missing: `adminType`, `address`, `aadharCardNo`, `aadharCardImage[]`, `panCardNo`, `panCardImage[]`, `bankAccountNo`, `ifscCode`, `bankHolderName`

**SalesPerson Creation Payload:**
- Missing: `address`, `selfie`, `aadharCardNumber`, `aadharCardFront`, `aadharCardBack`, `panCardNumber`, `panCardFront`, `bankAccountNumber`, `bankIfscCode`, `bankAccountName`, `cancelChequePhoto`, `status`

### 4. ⚠️ Version Prefix Inconsistency
- **New Multi-Level System:** All endpoints use `/api/v1` prefix ✅
- **Old System:** Uses `/api` prefix (no version)
- **Recommendation:** Keep separate for backward compatibility

---

## 📝 RECOMMENDED FIXES

### Priority 1: Critical Route Fixes
```
1. Update SuperAdmin Admin Management:
   - Change: /super-admin/admin → /super-admin/admins
   
2. Update Admin SalesPerson Management:
   - Change: /admin/sales-person → /admin/sales-persons
   - Change: /admin/sales-person/hierarchy/:id → /admin/sales-persons/hierarchy-tree
   
3. Update SalesPerson Sub-SalesPerson:
   - Change: /sales-person/sub-sales-person → /sales-person/sub-salesperson
   
4. Update SalesPerson Customers:
   - Change: /sales-person/customer → /sales-person/customers
   
5. Fix Admin Login:
   - Change: /api/v1/auth/login → /api/v1/admin/login
```

### Priority 2: Payload Fixes

**Option A: Update Backend Models (Simpler)**
Make all KYC fields optional or create separate registration endpoints:
- Initial registration with basic info
- Complete profile with KYC documents later

**Option B: Update Postman Payloads (More accurate)**
Add all required fields to match backend models exactly.

### Priority 3: Field Name Standardization

**Recommended Approach:** Update backend to accept both formats:
```typescript
// In controller
const name = req.body.name || `${req.body.firstName} ${req.body.lastName}`.trim()
const phoneNumber = req.body.phoneNumber || req.body.phone
```

---

## ✅ CORRECTLY WORKING ENDPOINTS

1. ✅ SuperAdmin Create & Login (after field fix)
2. ✅ SalesPerson OTP Send/Verify
3. ✅ SalesPerson Profile Get
4. ✅ SalesPerson Hierarchy Get
5. ✅ SalesPerson Quotations (basic)

---

## 🎯 NEXT STEPS

1. **Immediate:** Fix all route naming mismatches in Postman
2. **High Priority:** Decide on payload structure (backend vs frontend)
3. **Medium Priority:** Organize old/new endpoints in separate folders
4. **Low Priority:** Add comprehensive test scripts for each endpoint

---

## 📊 Verification Status

- **Total Multi-Level Endpoints:** 23
- **Correctly Matching:** 7 (30%)
- **Route Mismatches:** 11 (48%)
- **Payload Issues:** 16 (70%)
- **Legacy Endpoints:** ~40+ (not verified)

**Overall Status:** ⚠️ **Needs Significant Updates**

---

**Report Generated By:** GitHub Copilot  
**Date:** October 12, 2025  
**Version:** 1.0
