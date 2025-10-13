# Quick Reference - Multi-Level System

## 🔑 Key Fields Added

```typescript
// SalesPerson Model
{
  level: 1-5,              // ✅ Added (with min:1, max:5)
  adminId: ObjectId,       // ✅ Added (required)
  parentSalesPerson: ObjectId | null,  // ✅ Added
  createdBy: ObjectId,     // ✅ Added
  createdByType: "User" | "SalesPerson"  // ✅ Added
}
```

## 📊 Level Rules

| Level | Can Create? | Creates | Note |
|-------|------------|---------|------|
| Admin | ✅ Yes | Level 1 | Sets adminId |
| Level 1 | ✅ Yes | Level 2 | Inherits adminId |
| Level 2 | ✅ Yes | Level 3 | Inherits adminId |
| Level 3 | ✅ Yes | Level 4 | Inherits adminId |
| Level 4 | ✅ Yes | Level 5 | Inherits adminId |
| **Level 5** | ❌ **NO** | - | **BLOCKED** |

## 🚀 Quick API Reference

### Admin APIs

```bash
# Create Level 1 SalesPerson
POST /admin/sales-persons
Body: { name, email, phone, ... }
Result: level=1, adminId=<current_admin_id>

# Get all SalesPersons (all 5 levels)
GET /admin/sales-persons
Returns: All SalesPersons where adminId = current admin

# Get hierarchy tree
GET /admin/sales-persons/hierarchy-tree
Returns: Visual tree with all levels

# Get specific SalesPerson
GET /admin/sales-persons/:id
Returns: If adminId matches current admin

# Update SalesPerson
PUT /admin/sales-persons/:id
Condition: adminId must match current admin

# Delete SalesPerson
DELETE /admin/sales-persons/:id
Condition: adminId must match current admin
```

### SalesPerson APIs

```bash
# Create sub-SalesPerson (level + 1)
POST /sales-person/sub-salesperson
Body: { name, email, phone, ... }
Validation: 
  - If parent.level >= 5 → ERROR
  - Else: level = parent.level + 1
Result: New SalesPerson with inherited adminId

# Get direct children
GET /sales-person/sub-salesperson
Returns: Direct children only

# Get entire downline tree
GET /sales-person/hierarchy
Returns: Entire downline hierarchy (max depth 4)

# Get own profile
GET /sales-person/profile
Returns: Current SalesPerson details
```

## ✅ Validation Rules

### Creating SalesPerson

```javascript
// Admin creates Level 1
✅ adminId = current admin ID (required)
✅ level = 1 (hardcoded)
✅ parentSalesPerson = null
✅ createdByType = "User"

// SalesPerson creates Sub
✅ Check: parent.level < 5
✅ adminId = parent.adminId (inherited)
✅ level = parent.level + 1
✅ parentSalesPerson = parent._id
✅ createdByType = "SalesPerson"
```

### Error Cases

```javascript
// Level 5 tries to create
❌ Error: "Maximum level reached..."

// Invalid adminId
❌ Error: "adminId is required"

// Level out of range
❌ Error: Mongoose validation (min:1, max:5)
```

## 🔍 Query Patterns

```javascript
// Get all SalesPersons for Admin
SalesPersonModel.find({ adminId: adminId })

// Get specific level
SalesPersonModel.find({ adminId: adminId, level: 3 })

// Get children of a SalesPerson
SalesPersonModel.find({ parentSalesPerson: salesPersonId })

// Get hierarchy tree
SalesPersonModel.aggregate([
  { $match: { adminId: adminId, level: 1 } },
  {
    $graphLookup: {
      from: "salespersons",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "parentSalesPerson",
      as: "descendants",
      maxDepth: 4
    }
  }
])
```

## 📝 Example Data

```json
// Level 1 SalesPerson
{
  "_id": "sp001",
  "name": "Alice",
  "email": "alice@example.com",
  "level": 1,
  "adminId": "admin123",
  "createdBy": "admin123",
  "createdByType": "User",
  "parentSalesPerson": null
}

// Level 3 SalesPerson
{
  "_id": "sp003",
  "name": "Charlie",
  "email": "charlie@example.com",
  "level": 3,
  "adminId": "admin123",
  "createdBy": "sp002",
  "createdByType": "SalesPerson",
  "parentSalesPerson": "sp002"
}

// Level 5 SalesPerson (Cannot create more)
{
  "_id": "sp005",
  "name": "Eve",
  "email": "eve@example.com",
  "level": 5,
  "adminId": "admin123",
  "createdBy": "sp004",
  "createdByType": "SalesPerson",
  "parentSalesPerson": "sp004"
  // ❌ Cannot create sub-SalesPersons
}
```

## 🎯 Common Use Cases

### 1. Admin views entire hierarchy
```javascript
GET /admin/sales-persons/hierarchy-tree

// Returns tree structure with all levels
```

### 2. Check if SalesPerson can create sub
```javascript
const canCreate = salesPerson.level < 5
if (!canCreate) {
  // Show message: "You've reached maximum level"
}
```

### 3. Get all Level 1 SalesPersons
```javascript
GET /admin/sales-persons?level=1

// Or in code:
SalesPersonModel.find({ adminId: adminId, level: 1 })
```

### 4. Calculate total SalesPersons per Admin
```javascript
const count = await SalesPersonModel.countDocuments({ 
  adminId: adminId 
})
```

### 5. Get path from SalesPerson to Admin
```javascript
// Start with Level 5
let current = await SalesPersonModel.findById(sp005)
let path = [current]

// Trace up to Level 1
while (current.parentSalesPerson) {
  current = await SalesPersonModel.findById(current.parentSalesPerson)
  path.unshift(current)
}

// Get Admin
const admin = await UserModel.findById(current.adminId)
path.unshift(admin)

// Result: [Admin] → [Level1] → [Level2] → [Level3] → [Level4] → [Level5]
```

## 📦 Files Modified

```
✅ src/Model/SalesPerson.ts
✅ src/Lib/DataTypes/Models/SalesPerson.ts
✅ src/Controller/Admin/SalesPersonController.ts
✅ src/Controller/SalesPerson/index.ts
✅ Documentation files created
```

## 🎉 Status

```
✅ TypeScript compiled successfully
✅ All validations in place
✅ Level 5 blocking works
✅ AdminId tracking works
✅ ParentSalesPerson tracking works
✅ Efficient queries implemented
✅ Complete isolation between Admins

🚀 SYSTEM READY FOR PRODUCTION!
```

## 📞 Support

For issues or questions:
1. Check MULTI_LEVEL_ROLE_SYSTEM.md
2. Check LEVEL_5_MAX_SYSTEM.md
3. Check VISUAL_HIERARCHY_DIAGRAM.md
4. Review this QUICK_REFERENCE.md

Happy coding! 🎊
