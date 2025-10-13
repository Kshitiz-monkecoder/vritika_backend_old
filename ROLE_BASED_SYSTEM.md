# Role-Based Access Control System

## Overview
This system implements a three-tier role-based hierarchy:
- **SuperAdmin** → Creates and manages **Admins**
- **Admin** → Creates and manages **SalesPersons**
- **SalesPerson** → End users

## Key Features

### 1. Hierarchical Structure
- SuperAdmin can create multiple Admins
- Each Admin can create multiple SalesPersons
- Each Admin only sees their own SalesPersons (isolated data)
- Each SalesPerson is linked to the Admin who created them

### 2. Data Isolation
- **SuperAdmin**: Can only see/manage Admins they created
- **Admin**: Can only see/manage SalesPersons they created
- **One Admin cannot see another Admin's SalesPersons**

## Database Schema Changes

### SuperAdmin Model (`src/Model/SuperAdmin.ts`)
```typescript
- New model created based on User model structure
- userType: "SuperAdmin"
- Contains all admin fields (name, email, documents, etc.)
```

### User Model (`src/Model/User.ts`)
```typescript
- Added: createdBy (Reference to SuperAdmin)
- userType: "Admin"
```

### SalesPerson Model (`src/Model/SalesPerson.ts`)
```typescript
- Added: createdBy (Reference to Admin/User)
```

## API Endpoints

### SuperAdmin Routes (`/super-admin`)

#### Authentication
- `POST /super-admin/login` - SuperAdmin login

#### Admin Management (Protected with isSuperAdmin middleware)
- `POST /super-admin/admins` - Create new Admin
- `GET /super-admin/admins` - Get all Admins created by this SuperAdmin
- `GET /super-admin/admins/:id` - Get specific Admin
- `PUT /super-admin/admins/:id` - Update Admin
- `DELETE /super-admin/admins/:id` - Delete Admin

### Admin Routes (`/admin`)

#### SalesPerson Management
- `POST /admin/sales-persons` - Create new SalesPerson
- `GET /admin/sales-persons` - Get all SalesPersons created by this Admin
- `GET /admin/sales-persons/:id` - Get specific SalesPerson
- `PUT /admin/sales-persons/:id` - Update SalesPerson
- `DELETE /admin/sales-persons/:id` - Delete SalesPerson

## Controllers Created/Updated

### New Controllers
1. **`src/Controller/SuperAdmin/AdminController.ts`**
   - AddAdmin - Creates Admin with createdBy reference
   - GetAllAdmins - Filters by createdBy (SuperAdmin ID)
   - GetAdminById - Validates ownership
   - UpdateAdmin - Validates ownership before update
   - DeleteAdmin - Validates ownership before delete

2. **`src/Controller/Auth/SuperAdmin.ts`**
   - login - SuperAdmin authentication

### Updated Controllers
1. **`src/Controller/Admin/SalesPersonController.ts`**
   - AddSalesPerson - Now adds createdBy (Admin ID)
   - GetAllSalesPersons - Now filters by createdBy
   - GetSalesPersonById - Validates ownership
   - UpdateSalesPerson - Validates ownership
   - DeleteSalesPerson - Validates ownership

2. **`src/Controller/Admin/UserController.ts`**
   - AddUser - Now adds createdBy reference

## Middleware

### Updated `src/Lib/Utils/Middleware.ts`

#### New Middlewares:
1. **`isSuperAdmin`** - Ensures only SuperAdmin can access
2. **`isAdmin`** - Ensures only Admin or SuperAdmin can access

#### Enhanced `middleware`:
- Now attaches full user object with type to request
- Available as `(req as any).user` with `_id`, `email`, and `type`

## Data Type Updates

### `src/Lib/DataTypes/Models/User.ts`
```typescript
- Added: createdBy?: mongoose.Types.ObjectId
```

### `src/Lib/DataTypes/Models/SalesPerson.ts`
```typescript
- Added: createdBy?: mongoose.Types.ObjectId
```

## How It Works

### SuperAdmin Creates Admin
1. SuperAdmin logs in with credentials
2. Receives JWT token with `type: "SuperAdmin"`
3. Creates Admin via `POST /super-admin/admins`
4. Admin is created with `createdBy: SuperAdminID`

### Admin Creates SalesPerson
1. Admin logs in with credentials
2. Receives JWT token with `type: "Admin"`
3. Creates SalesPerson via `POST /admin/sales-persons`
4. SalesPerson is created with `createdBy: AdminID`

### Data Isolation Example
```
SuperAdmin A
  ├── Admin 1 (createdBy: SuperAdmin A)
  │   ├── SalesPerson 1 (createdBy: Admin 1)
  │   └── SalesPerson 2 (createdBy: Admin 1)
  └── Admin 2 (createdBy: SuperAdmin A)
      ├── SalesPerson 3 (createdBy: Admin 2)
      └── SalesPerson 4 (createdBy: Admin 2)

SuperAdmin B
  └── Admin 3 (createdBy: SuperAdmin B)
      └── SalesPerson 5 (createdBy: Admin 3)

Results:
- Admin 1 can only see SalesPerson 1 & 2
- Admin 2 can only see SalesPerson 3 & 4
- Admin 3 can only see SalesPerson 5
- SuperAdmin A can only see Admin 1 & 2
- SuperAdmin B can only see Admin 3
```

## Authentication Flow

### 1. SuperAdmin Login
```bash
POST /super-admin/login
Body: { "email": "superadmin@example.com", "password": "password" }
Response: { "token": "jwt_token", "userData": {...} }
```

### 2. Admin Login
```bash
POST /admin/login
Body: { "email": "admin@example.com", "password": "password" }
Response: { "token": "jwt_token", "userData": {...} }
```

### 3. Protected Requests
All protected routes require:
```
Headers: {
  "Authorization": "your_jwt_token"
}
```

## Usage Example

### SuperAdmin Creates Admin
```bash
POST /super-admin/admins
Headers: { "Authorization": "superadmin_jwt_token" }
Body: {
  "name": "John Admin",
  "email": "john@example.com",
  "phone": "1234567890",
  "adminType": "Individual",
  "address": "123 Street",
  "aadharCardNo": "1234-5678-9012",
  "aadharCardImage": ["url1", "url2"],
  "panCardNo": "ABCDE1234F",
  "panCardImage": ["url1"],
  "bankAccountNo": "123456789",
  "ifscCode": "BANK0001234",
  "bankHolderName": "John Admin",
  "passbookImage": "url",
  "password": "securepassword"
}
```

### Admin Creates SalesPerson
```bash
POST /admin/sales-persons
Headers: { "Authorization": "admin_jwt_token" }
Body: {
  "name": "Jane Sales",
  "phoneNumber": "9876543210",
  "email": "jane@example.com",
  "address": "456 Avenue",
  "selfie": "selfie_url",
  "aadharCardNumber": "9876-5432-1098",
  "aadharCardFront": "url",
  "aadharCardBack": "url",
  "panCardNumber": "XYZAB5678C",
  "panCardFront": "url",
  "bankAccountNumber": "987654321",
  "bankIfscCode": "BANK0005678",
  "bankAccountName": "Jane Sales",
  "cancelChequePhoto": "url",
  "status": "Active"
}
```

### Admin Gets Their SalesPersons
```bash
GET /admin/sales-persons
Headers: { "Authorization": "admin_jwt_token" }
Response: {
  "status": true,
  "data": [/* Only SalesPersons created by this Admin */],
  "message": "SalesPersons retrieved successfully"
}
```

## Security Features

1. **Token-based Authentication**: JWT tokens with user type
2. **Role-based Middleware**: Prevents unauthorized access
3. **Data Ownership Validation**: All queries filter by `createdBy`
4. **Password Hashing**: Using password-hash library
5. **Unique Email Constraint**: Prevents duplicate accounts

## Files Created

1. `/src/Model/SuperAdmin.ts` - SuperAdmin database model
2. `/src/Controller/SuperAdmin/AdminController.ts` - Admin management by SuperAdmin
3. `/src/Controller/Auth/SuperAdmin.ts` - SuperAdmin authentication
4. `/src/Routes/SuperAdmin.ts` - SuperAdmin routes

## Files Modified

1. `/src/Model/User.ts` - Added createdBy field
2. `/src/Model/SalesPerson.ts` - Added createdBy field
3. `/src/Lib/DataTypes/Models/User.ts` - Added createdBy type
4. `/src/Lib/DataTypes/Models/SalesPerson.ts` - Added createdBy type
5. `/src/Controller/Admin/UserController.ts` - Added createdBy on create
6. `/src/Controller/Admin/SalesPersonController.ts` - Added ownership validation
7. `/src/Lib/Utils/Middleware.ts` - Added role-based middlewares
8. `/src/Routes/Index.ts` - Added SuperAdmin routes

## Testing the System

### Step 1: Create a SuperAdmin (Manual DB Insert)
Since there's no SuperAdmin registration endpoint, you'll need to create the first SuperAdmin directly in the database:

```javascript
// Run this in MongoDB shell or use Compass
db.superadmins.insertOne({
  name: "Super Admin",
  email: "super@admin.com",
  phone: "1234567890",
  userType: "SuperAdmin",
  password: "sha1$..." // Use password-hash to generate
  adminType: "Individual",
  address: "HQ Address",
  aadharCardNo: "1111-2222-3333",
  aadharCardImage: ["url"],
  panCardNo: "SUPER1234A",
  panCardImage: ["url"],
  bankAccountNo: "111222333",
  ifscCode: "BANK0001111",
  bankHolderName: "Super Admin",
  code: "SUPER001",
  passbookImage: "url",
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Step 2: Login as SuperAdmin
```bash
POST /super-admin/login
```

### Step 3: Create Admin
```bash
POST /super-admin/admins
```

### Step 4: Login as Admin
```bash
POST /admin/login
```

### Step 5: Create SalesPerson
```bash
POST /admin/sales-persons
```

## Notes

- All relationships use MongoDB ObjectId references
- Soft delete can be implemented using `isDeleted` flag
- Token expiration should be configured in production
- Add input validation for all endpoints
- Consider adding pagination for list endpoints
- Add logging for audit trails
