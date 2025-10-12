# Multi-Level Role-Based System Documentation

## Overview
This system implements a hierarchical role-based access control with three main roles:
1. **SuperAdmin** - Top-level administrator
2. **Admin** - Created by SuperAdmin, manages SalesPersons
3. **SalesPerson** - Multi-level hierarchy (Level 1, 2, 3, etc.)

## Role Hierarchy

```
SuperAdmin
    └── Admin (created by SuperAdmin)
        └── SalesPerson (Level 1)
            └── SalesPerson (Level 2)
                └── SalesPerson (Level 3)
                    └── ... (infinite levels)
```

## Database Models

### 1. SuperAdmin Model
- **Model**: `SuperAdmin.ts`
- **Collection**: `superadmins`
- **Key Fields**:
  - `userType`: "SuperAdmin"
  - `email`, `password`, `name`, `phone`
  - Bank details, ID proofs
  - `code`: Unique referral code

### 2. User Model (Admin)
- **Model**: `User.ts`
- **Collection**: `users`
- **Key Fields**:
  - `userType`: "Admin"
  - `createdBy`: Reference to SuperAdmin who created this Admin
  - `email`, `password`, `name`, `phone`
  - Bank details, ID proofs
  - `code`: Unique referral code

### 3. SalesPerson Model
- **Model**: `SalesPerson.ts`
- **Collection**: `salespersons`
- **Key Fields**:
  - `createdBy`: Reference to Admin or SalesPerson who created this
  - `createdByType`: "User" (Admin) or "SalesPerson"
  - `level`: Number indicating hierarchy level (1, 2, 3, ...)
  - `parentSalesPerson`: Reference to parent SalesPerson (null if created by Admin)
  - `email`, `phoneNumber`, `name`
  - ID proofs, bank details
  - `referralCode`, `status`, `verify`

## Level System Logic

### Level Assignment Rules:
1. **Level 1**: When Admin creates a SalesPerson
   - `createdBy` = Admin ID
   - `createdByType` = "User"
   - `level` = 1
   - `parentSalesPerson` = null

2. **Level 2+**: When SalesPerson creates another SalesPerson
   - `createdBy` = Parent SalesPerson ID
   - `createdByType` = "SalesPerson"
   - `level` = Parent's level + 1
   - `parentSalesPerson` = Parent SalesPerson ID

### Example:
```
Admin (John)
  └── SalesPerson (Alice) [Level 1]
      ├── SalesPerson (Bob) [Level 2]
      │   └── SalesPerson (Charlie) [Level 3]
      │       └── SalesPerson (David) [Level 4]
      └── SalesPerson (Eve) [Level 2]
          └── SalesPerson (Frank) [Level 3]
```

## API Endpoints

### SuperAdmin Routes (`/super-admin/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | SuperAdmin login | No |
| POST | `/admins` | Create new Admin | Yes (SuperAdmin) |
| GET | `/admins` | Get all Admins created by this SuperAdmin | Yes (SuperAdmin) |
| GET | `/admins/:id` | Get specific Admin | Yes (SuperAdmin) |
| PUT | `/admins/:id` | Update Admin | Yes (SuperAdmin) |
| DELETE | `/admins/:id` | Delete Admin | Yes (SuperAdmin) |

### Admin Routes (`/admin/`)

#### User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create Admin (deprecated, use SuperAdmin) | Yes |
| GET | `/users` | Get all Admins | Yes |
| GET | `/users/:id` | Get specific Admin | Yes |
| PUT | `/users/:id` | Update Admin | Yes |
| DELETE | `/users/:id` | Delete Admin | Yes |

#### SalesPerson Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sales-persons` | Create Level 1 SalesPerson | Yes (Admin) |
| GET | `/sales-persons` | Get all SalesPersons (all levels) | Yes (Admin) |
| GET | `/sales-persons/hierarchy-tree` | Get complete hierarchy tree | Yes (Admin) |
| GET | `/sales-persons/:id` | Get specific SalesPerson | Yes (Admin) |
| PUT | `/sales-persons/:id` | Update SalesPerson | Yes (Admin) |
| DELETE | `/sales-persons/:id` | Delete SalesPerson | Yes (Admin) |

### SalesPerson Routes (`/sales-person/`)

#### Profile Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get own profile | Yes (SalesPerson) |
| PUT | `/profile` | Update own profile | Yes (SalesPerson) |

#### Sub-SalesPerson Management (Multi-Level)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sub-salesperson` | Create sub-SalesPerson (level + 1) | Yes (SalesPerson) |
| GET | `/sub-salesperson` | Get direct sub-SalesPersons | Yes (SalesPerson) |
| GET | `/hierarchy` | Get entire downline hierarchy | Yes (SalesPerson) |

#### Customer & Business Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | Get all customers |
| POST | `/site-survey` | Create site survey |
| POST | `/quotation` | Create quotation |
| GET | `/quotation-chart` | Get quotation analytics |

## Access Control Rules

### SuperAdmin Can:
- ✅ Create, Read, Update, Delete Admins (only their own created Admins)
- ✅ View all Admins they created
- ❌ Cannot see other SuperAdmins' Admins

### Admin Can:
- ✅ Create Level 1 SalesPersons
- ✅ View ALL SalesPersons in their hierarchy (Level 1, 2, 3, etc.)
- ✅ View complete hierarchy tree
- ✅ Update/Delete only their own created SalesPersons
- ❌ Cannot see SalesPersons from other Admins

### SalesPerson Can:
- ✅ Create sub-SalesPersons (level automatically incremented)
- ✅ View direct sub-SalesPersons they created
- ✅ View entire downline hierarchy
- ✅ Manage own customers, quotations, site surveys
- ❌ Cannot see other SalesPersons at same level
- ❌ Cannot see SalesPersons from other hierarchies

## Request/Response Examples

### 1. Admin Creates Level 1 SalesPerson
**Request:** `POST /admin/sales-persons`
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "aadharCardNumber": "1234-5678-9012",
  // ... other required fields
}
```

**Response:**
```json
{
  "status": true,
  "message": "SalesPerson created successfully",
  "data": {
    "_id": "sp001",
    "name": "Alice Smith",
    "level": 1,
    "createdBy": "admin001",
    "createdByType": "User",
    "parentSalesPerson": null
  }
}
```

### 2. SalesPerson Creates Sub-SalesPerson
**Request:** `POST /sales-person/sub-salesperson`
```json
{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phoneNumber": "+1234567891",
  "address": "456 Oak Ave",
  // ... other required fields
}
```

**Response:**
```json
{
  "status": true,
  "message": "Sub-SalesPerson created successfully at level 2",
  "data": {
    "_id": "sp002",
    "name": "Bob Johnson",
    "level": 2,
    "createdBy": "sp001",
    "createdByType": "SalesPerson",
    "parentSalesPerson": "sp001"
  }
}
```

### 3. Get Hierarchy Tree (Admin View)
**Request:** `GET /admin/sales-persons/hierarchy-tree`

**Response:**
```json
{
  "status": true,
  "message": "SalesPerson hierarchy tree retrieved successfully",
  "data": [
    {
      "_id": "sp001",
      "name": "Alice Smith",
      "level": 1,
      "descendants": [
        {
          "_id": "sp002",
          "name": "Bob Johnson",
          "level": 2,
          "depth": 1,
          "parentSalesPerson": "sp001"
        },
        {
          "_id": "sp003",
          "name": "Charlie Brown",
          "level": 3,
          "depth": 2,
          "parentSalesPerson": "sp002"
        }
      ]
    }
  ]
}
```

## Implementation Details

### Creating Sub-SalesPerson with Level Increment
```typescript
// In SalesPerson Controller
const parentSalesPerson = await SalesPersonModel.findById(parentSalesPersonId)
const newSalesPerson = new SalesPersonModel({
    ...req.body,
    createdBy: parentSalesPersonId,
    createdByType: "SalesPerson",
    level: parentSalesPerson.level + 1, // Auto-increment
    parentSalesPerson: parentSalesPersonId
})
```

### Filtering by Admin (Hierarchy Aware)
```typescript
// Get all SalesPersons in Admin's hierarchy
const level1SalesPersons = await SalesPersonModel.find({
    createdBy: adminId,
    createdByType: "User",
    level: 1
})

// Use $graphLookup to get entire tree
const allSalesPersons = await SalesPersonModel.aggregate([
    {
        $graphLookup: {
            from: "salespersons",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentSalesPerson",
            as: "descendants",
            maxDepth: 10
        }
    }
])
```

## Security Considerations

1. **Isolation**: Each Admin only sees their own SalesPersons hierarchy
2. **Level Validation**: Level is auto-calculated, cannot be manually set
3. **Parent Validation**: System ensures parent-child relationship is valid
4. **Authentication**: All routes require valid JWT token with role verification
5. **Cascade Delete**: Consider implementing cascade delete for hierarchy

## Future Enhancements

1. **Commission System**: Calculate commissions based on level
2. **Performance Metrics**: Track sales by level
3. **Limit Depth**: Optionally limit maximum hierarchy depth
4. **Transfer SalesPerson**: Allow moving SalesPerson between hierarchies
5. **Soft Delete**: Implement soft delete with hierarchy preservation
6. **Analytics Dashboard**: Show hierarchy statistics and performance

## Testing Scenarios

### Test Case 1: Multi-Level Creation
1. SuperAdmin creates Admin
2. Admin creates SalesPerson (Level 1)
3. Level 1 creates Level 2
4. Level 2 creates Level 3
5. Verify each level is correctly incremented

### Test Case 2: Isolation
1. Create 2 Admins under same SuperAdmin
2. Admin1 creates SalesPerson
3. Admin2 should NOT see Admin1's SalesPerson
4. Verify complete isolation

### Test Case 3: Hierarchy View
1. Create complex tree: 1 Level 1 → 2 Level 2s → 3 Level 3s
2. Admin gets hierarchy tree
3. Verify all descendants are returned correctly
4. SalesPerson at Level 2 should only see their downline

## Conclusion

This multi-level role-based system provides:
- ✅ Hierarchical organization structure
- ✅ Automatic level management
- ✅ Complete isolation between Admin hierarchies
- ✅ Scalable to infinite levels
- ✅ Easy tracking of parent-child relationships
- ✅ Foundation for commission/MLM systems
