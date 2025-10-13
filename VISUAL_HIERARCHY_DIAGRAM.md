# Visual Hierarchy System - Max Level 5

## 🎨 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                           │
│                     (Top Level Admin)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ creates
                        ▼
        ┌───────────────────────────────────────┐
        │          ADMIN (User Model)            │
        │        adminId: admin123               │
        └───────────────┬───────────────────────┘
                        │
                        │ creates Level 1
                        ▼
        ┌───────────────────────────────────────┐
        │         SALESPERSON - LEVEL 1          │
        │  • createdBy: admin123                 │
        │  • createdByType: "User"               │
        │  • adminId: admin123                   │
        │  • parentSalesPerson: null             │
        │  • level: 1                            │
        │  • ✅ Can create Level 2               │
        └───────────────┬───────────────────────┘
                        │
                        │ creates Level 2
                        ▼
        ┌───────────────────────────────────────┐
        │         SALESPERSON - LEVEL 2          │
        │  • createdBy: <Level1_ID>              │
        │  • createdByType: "SalesPerson"        │
        │  • adminId: admin123                   │
        │  • parentSalesPerson: <Level1_ID>      │
        │  • level: 2                            │
        │  • ✅ Can create Level 3               │
        └───────────────┬───────────────────────┘
                        │
                        │ creates Level 3
                        ▼
        ┌───────────────────────────────────────┐
        │         SALESPERSON - LEVEL 3          │
        │  • createdBy: <Level2_ID>              │
        │  • createdByType: "SalesPerson"        │
        │  • adminId: admin123                   │
        │  • parentSalesPerson: <Level2_ID>      │
        │  • level: 3                            │
        │  • ✅ Can create Level 4               │
        └───────────────┬───────────────────────┘
                        │
                        │ creates Level 4
                        ▼
        ┌───────────────────────────────────────┐
        │         SALESPERSON - LEVEL 4          │
        │  • createdBy: <Level3_ID>              │
        │  • createdByType: "SalesPerson"        │
        │  • adminId: admin123                   │
        │  • parentSalesPerson: <Level3_ID>      │
        │  • level: 4                            │
        │  • ✅ Can create Level 5 (LAST ONE!)   │
        └───────────────┬───────────────────────┘
                        │
                        │ creates Level 5
                        ▼
        ┌───────────────────────────────────────┐
        │         SALESPERSON - LEVEL 5          │
        │  • createdBy: <Level4_ID>              │
        │  • createdByType: "SalesPerson"        │
        │  • adminId: admin123                   │
        │  • parentSalesPerson: <Level4_ID>      │
        │  • level: 5 (MAXIMUM!)                 │
        │  • ❌ CANNOT create Level 6            │
        └───────────────────────────────────────┘
                        │
                        │ tries to create Level 6
                        ▼
                    ⛔ BLOCKED!
        "Maximum level reached. Level 5 
         SalesPersons cannot create 
         sub-SalesPersons."
```

## 📊 Multi-Branch Hierarchy Example

```
                        Admin (John)
                    [adminId: admin123]
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    Level 1             Level 1             Level 1
    (Alice)             (Bob)              (Charlie)
   adminId:123        adminId:123         adminId:123
        │                   │                   │
    ┌───┴───┐           Level 2             Level 2
    │       │          (Grace)              (Harry)
 Level 2  Level 2    adminId:123          adminId:123
 (David)  (Eve)          │                    │
adminId:123 adminId:123  │                    │
    │       │        Level 3              Level 3
    │   Level 3     (Ivy)                (Jack)
    │   (Frank)   adminId:123          adminId:123
    │  adminId:123    │                    │
 Level 3          Level 4              Level 4
 (George)         (Kate)               (Leo)
adminId:123     adminId:123          adminId:123
    │               │                    │
 Level 4         Level 5              Level 5
 (Henry)         (Mike)               (Nina)
adminId:123    adminId:123          adminId:123
    │              ❌                   ❌
 Level 5        BLOCKED!             BLOCKED!
 (Iris)
adminId:123
   ❌
BLOCKED!

ALL have adminId: admin123
```

## 🔍 AdminId Tracking - The Key Feature

```
┌─────────────────────────────────────────────────────────┐
│  Why adminId is Important:                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Admin A (adminId: A1)          Admin B (adminId: B1)   │
│         │                                │               │
│    SalesPerson                      SalesPerson         │
│    (adminId: A1)                    (adminId: B1)       │
│         │                                │               │
│    SalesPerson                      SalesPerson         │
│    (adminId: A1)                    (adminId: B1)       │
│         │                                │               │
│       ...                              ...               │
│         │                                │               │
│    All inherit A1                   All inherit B1      │
│                                                          │
│  ✅ Easy Query: find({ adminId: A1 })                   │
│     Returns ONLY Admin A's entire hierarchy             │
│                                                          │
│  ✅ Complete Isolation:                                 │
│     Admin A cannot see Admin B's SalesPersons           │
│     Admin B cannot see Admin A's SalesPersons           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🚦 Level Creation Rules

```
┌─────────┬─────────────┬──────────────────┬─────────────┐
│  Level  │ Can Create? │ Creates Level    │ Max Depth   │
├─────────┼─────────────┼──────────────────┼─────────────┤
│ Admin   │     ✅      │ Level 1          │     -       │
│ Level 1 │     ✅      │ Level 2          │     4       │
│ Level 2 │     ✅      │ Level 3          │     3       │
│ Level 3 │     ✅      │ Level 4          │     2       │
│ Level 4 │     ✅      │ Level 5          │     1       │
│ Level 5 │     ❌      │ BLOCKED!         │     0       │
└─────────┴─────────────┴──────────────────┴─────────────┘
```

## 🔐 Permission Matrix

```
┌──────────────┬────────┬─────────┬─────────┬─────────┬─────────┐
│              │ Level 1│ Level 2 │ Level 3 │ Level 4 │ Level 5 │
├──────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ Create Sub   │   ✅   │   ✅    │   ✅    │   ✅    │   ❌    │
│ View Profile │   ✅   │   ✅    │   ✅    │   ✅    │   ✅    │
│ View Downline│   ✅   │   ✅    │   ✅    │   ✅    │   ✅    │
│ Edit Self    │   ✅   │   ✅    │   ✅    │   ✅    │   ✅    │
│ Max Children │  4 lvls│  3 lvls │  2 lvls │  1 lvl  │  None   │
└──────────────┴────────┴─────────┴─────────┴─────────┴─────────┘
```

## 📡 API Response Examples

### ✅ Success: Level 4 Creates Level 5

```json
POST /sales-person/sub-salesperson

Request Body:
{
  "name": "Eve",
  "email": "eve@example.com",
  "phoneNumber": "+1234567890",
  ...
}

Response: 200 OK
{
  "status": true,
  "message": "Sub-SalesPerson created successfully at level 5",
  "data": {
    "_id": "sp005",
    "name": "Eve",
    "level": 5,
    "createdBy": "sp004",
    "createdByType": "SalesPerson",
    "parentSalesPerson": "sp004",
    "adminId": "admin123",
    "email": "eve@example.com"
  }
}
```

### ❌ Error: Level 5 Tries to Create

```json
POST /sales-person/sub-salesperson

Request Body:
{
  "name": "Failed User",
  "email": "fail@example.com",
  ...
}

Response: 400 Bad Request
{
  "status": false,
  "message": "Maximum level reached. Level 5 SalesPersons cannot create sub-SalesPersons."
}
```

## 🎯 Field Inheritance Flow

```
Admin creates Level 1:
┌─────────────────────────────────────┐
│ adminId: admin123 (set by Admin)    │
│ createdBy: admin123                 │
│ createdByType: "User"               │
│ level: 1 (hardcoded)                │
│ parentSalesPerson: null             │
└─────────────────────────────────────┘
                │
                ▼
Level 1 creates Level 2:
┌─────────────────────────────────────┐
│ adminId: admin123 (inherited) ✨     │
│ createdBy: sp001 (Level 1 ID)      │
│ createdByType: "SalesPerson"        │
│ level: 2 (parent.level + 1)        │
│ parentSalesPerson: sp001 (Level 1)  │
└─────────────────────────────────────┘
                │
                ▼
Level 2 creates Level 3:
┌─────────────────────────────────────┐
│ adminId: admin123 (inherited) ✨     │
│ createdBy: sp002 (Level 2 ID)      │
│ createdByType: "SalesPerson"        │
│ level: 3 (parent.level + 1)        │
│ parentSalesPerson: sp002 (Level 2)  │
└─────────────────────────────────────┘

... continues until Level 5 ...
```

## 💾 Database Structure

```javascript
// SalesPerson Document Example - Level 3

{
  _id: ObjectId("sp003"),
  name: "Charlie",
  email: "charlie@example.com",
  phoneNumber: "+1234567890",
  
  // Hierarchy Fields (The Important Ones!)
  level: 3,                              // Current level (1-5)
  adminId: ObjectId("admin123"),         // Owner Admin
  createdBy: ObjectId("sp002"),          // Immediate creator (Level 2)
  createdByType: "SalesPerson",          // Creator type
  parentSalesPerson: ObjectId("sp002"),  // Parent in tree (Level 2)
  
  // Other fields...
  aadharCardNumber: "1234-5678-9012",
  status: "Active",
  createdAt: ISODate("2025-10-12T10:00:00Z"),
  updatedAt: ISODate("2025-10-12T10:00:00Z")
}
```

## 🎉 Summary

```
╔════════════════════════════════════════════════════════╗
║          MULTI-LEVEL SYSTEM COMPLETE!                  ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  ✅ Maximum 5 Levels                                   ║
║  ✅ Level 5 Cannot Create Sub-SalesPersons            ║
║  ✅ Every SalesPerson has adminId                      ║
║  ✅ Every SalesPerson has parentSalesPerson            ║
║  ✅ Automatic level increment                          ║
║  ✅ Complete Admin isolation                           ║
║  ✅ Efficient queries with adminId                     ║
║  ✅ TypeScript compiled successfully                   ║
║                                                        ║
║         🚀 READY FOR PRODUCTION! 🚀                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```
