/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         VRITIKA ADMIN DASHBOARD — MONGODB SEED FILE         ║
 * ║                                                              ║
 * ║  Usage:                                                      ║
 * ║    node seed.js <MONGODB_URI>                                ║
 * ║                                                              ║
 * ║  Requirements (install in same folder as this file):         ║
 * ║    npm install mongodb password-hash                         ║
 * ║                                                              ║
 * ║  Login credentials after seed:                               ║
 * ║    SuperAdmin : superadmin@vritika.com  / Admin@123          ║
 * ║    Admin 1    : admin1@vritika.com      / Admin@123          ║
 * ║    Admin 2    : admin2@vritika.com      / Admin@123          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * NOTE ON PASSWORD HASHING
 * ────────────────────────
 * The backend uses the `password-hash` npm package (v1.2.2) and calls:
 *   passwordHash.generate(plain)  → stores hash
 *   passwordHash.verify(plain, hash) → checks on login
 *
 * This seed calls the SAME function so the stored hash is 100% compatible.
 * Hash format: sha1$<salt>$1$<hex-digest>
 *
 * NOTE ON NATIVE DRIVER
 * ─────────────────────
 * This seed uses the native MongoDB driver (not Mongoose) for insertMany.
 * This avoids any risk of Mongoose schema validation or field-stripping
 * silently dropping the password field during bulk insert.
 */

"use strict"

// ── Dependency check ──────────────────────────────────────────────────────────
let MongoClient, ObjectId, passwordHash
try {
  const mongodb = require("mongodb")
  MongoClient = mongodb.MongoClient
  ObjectId    = mongodb.ObjectId
} catch {
  console.error("\n❌  mongodb not found. Run: npm install mongodb password-hash\n")
  process.exit(1)
}
try {
  passwordHash = require("password-hash")
} catch {
  console.error("\n❌  password-hash not found. Run: npm install mongodb password-hash\n")
  process.exit(1)
}

// ── SELF-TEST: verify password-hash round-trip before touching the DB ─────────
;(function selfTest() {
  const h = passwordHash.generate("Admin@123")
  if (!passwordHash.verify("Admin@123", h)) {
    console.error("❌  password-hash self-test FAILED — do not proceed.")
    process.exit(1)
  }
  if (passwordHash.verify("WRONG_PASSWORD", h)) {
    console.error("❌  password-hash self-test FAILED (false positive) — do not proceed.")
    process.exit(1)
  }
  console.log("✅  password-hash self-test passed. Hash format:", h.split("$")[0])
})()

// ── Helpers ───────────────────────────────────────────────────────────────────
const id   = () => new ObjectId()
const rnd  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[rnd(0, arr.length - 1)]

// Generate a fresh hash per call (each admin gets a unique salt, all verify correctly)
const hash = () => passwordHash.generate("Admin@123")

const IMG    = "https://via.placeholder.com/150"
const SELFIE = "https://via.placeholder.com/300"
const DOC    = "https://via.placeholder.com/400"

// ── Fixed IDs ─────────────────────────────────────────────────────────────────
const SUPER_ADMIN_ID  = id()
const ADMIN_1_ID      = id()
const ADMIN_2_ID      = id()
const SUB_ADMIN_1A_ID = id()
const SUB_ADMIN_1B_ID = id()
const SUB_ADMIN_2A_ID = id()
const SUB_ADMIN_2B_ID = id()

// ── MongoDB URI ───────────────────────────────────────────────────────────────
const MONGO_URI = process.argv[2]
if (!MONGO_URI) {
  console.error("\n❌  Please provide a MongoDB URI as the first argument.")
  console.error("    Example: node seed.js mongodb://localhost:27017/vritika\n")
  process.exit(1)
}

// ── Data builders ─────────────────────────────────────────────────────────────

function makeSuperAdmin() {
  return {
    _id: SUPER_ADMIN_ID,
    name: "Super Admin",
    userType: "SuperAdmin",
    phone: "9000000000",
    email: "superadmin@vritika.com",
    password: hash(),
    image: SELFIE,
    token: null,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function makeAdmin(idx, adminId) {
  const types  = ["Organisation", "Individual"]
  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"]
  const names  = ["Rajesh Solar Solutions", "Priya Energy Pvt Ltd", "Suresh Renewables", "Anita Power Corp"]
  return {
    _id: adminId,
    name: names[idx - 1] || `Admin ${idx}`,
    userType: "Admin",
    phone: `900000000${idx}`,
    email: `admin${idx}@vritika.com`,
    adminType: types[(idx - 1) % 2],
    gstNo: `27AAPFU0939F1Z${idx}`,
    contactPersonName: `Contact Person ${idx}`,
    address: `${rnd(1, 999)}, ${pick(cities)} - 40000${idx}`,
    aadharCardNo: `2345 6789 012${idx}`,
    aadharCardImage: [DOC, DOC],
    panCardNo: `ABCDE123${idx}F`,
    panCardImage: [DOC],
    bankAccountNo: `00${idx}1234567890`,
    ifscCode: `SBIN000${idx}123`,
    bankHolderName: names[idx - 1] || `Admin ${idx}`,
    code: `ADM${String(idx).padStart(4, "0")}`,
    password: hash(),
    image: SELFIE,
    token: null,
    passbookImage: null,
    createdBy: SUPER_ADMIN_ID,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function makeSubAdmin(idx, adminId, subAdminId) {
  const names = [
    "Vikram Sharma", "Meena Patel", "Arun Kumar", "Sona Mehta",
    "Deepak Verma", "Ritu Singh", "Nikhil Joshi", "Pooja Rao"
  ]
  return {
    _id: subAdminId,
    name: names[idx % names.length],
    userType: "Admin",
    phone: `980000${String(idx).padStart(4, "0")}`,
    email: `subadmin${idx}@vritika.com`,
    adminType: "Individual",
    gstNo: null,
    contactPersonName: names[idx % names.length],
    address: `${rnd(1, 999)}, Sector ${rnd(1, 50)}, Noida - 201301`,
    aadharCardNo: `9876 5432 10${String(idx).padStart(2, "0")}`,
    aadharCardImage: [DOC],
    panCardNo: `XYZAB${idx}23C`,
    panCardImage: [DOC],
    bankAccountNo: `11${idx}2345678901`,
    ifscCode: `HDFC000${idx}456`,
    bankHolderName: names[idx % names.length],
    code: `SUB${String(idx).padStart(4, "0")}`,
    password: hash(),
    image: SELFIE,
    token: null,
    passbookImage: null,
    createdBy: adminId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function makeSalesPersons(adminId) {
  const firstNames = ["Amit","Priya","Rahul","Sneha","Vijay","Kavya","Arjun","Divya",
    "Kiran","Neha","Suresh","Anjali","Manish","Pooja","Ravi","Swati",
    "Nitin","Rekha","Gaurav","Sunita","Harsh","Nidhi","Sanjay","Pallavi",
    "Deepak","Asha","Arun","Geeta","Rohit","Usha"]
  const lastNames = ["Sharma","Patel","Singh","Mehta","Kumar","Verma","Joshi",
    "Rao","Nair","Gupta","Mishra","Das","Yadav","Reddy","Iyer"]
  const statuses = ["Active","Active","Active","Inactive","Pending"]

  const persons = []
  let emailIdx = Math.abs(adminId.toString().charCodeAt(0) % 100)

  const l1 = []
  for (let i = 0; i < 3; i++) {
    const pid = id()
    l1.push(pid)
    persons.push({
      _id: pid,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phoneNumber: `7${rnd(100000000, 999999999)}`,
      email: `sp_l1_${emailIdx++}_${adminId.toString().slice(-4)}@vritika.com`,
      address: `${rnd(1,999)}, MG Road, Pune - 411001`,
      selfie: SELFIE, aadharCardNumber: `1234 5678 90${rnd(10,99)}`,
      aadharCardFront: DOC, aadharCardBack: DOC,
      panCardNumber: `AAAPL${rnd(1000,9999)}Q`, panCardFront: DOC,
      bankAccountNumber: `${rnd(10000000000,99999999999)}`,
      bankIfscCode: `ICIC000${rnd(1000,9999)}`,
      bankAccountName: `${pick(firstNames)} ${pick(lastNames)}`,
      cancelChequePhoto: DOC, verify: true,
      referralCode: `REF${rnd(100000,999999)}`, status: pick(statuses),
      createdByType: "User", createdBy: adminId,
      level: 1, parentSalesPerson: null, adminId,
      createdAt: new Date(), updatedAt: new Date()
    })
  }

  const l2 = []
  for (const parentId of l1) {
    for (let i = 0; i < 2; i++) {
      const pid = id(); l2.push(pid)
      persons.push({
        _id: pid,
        name: `${pick(firstNames)} ${pick(lastNames)}`,
        phoneNumber: `8${rnd(100000000,999999999)}`,
        email: `sp_l2_${emailIdx++}_${adminId.toString().slice(-4)}@vritika.com`,
        address: `${rnd(1,999)}, Ring Road, Ahmedabad - 380001`,
        selfie: SELFIE, aadharCardNumber: `2345 6789 01${rnd(10,99)}`,
        aadharCardFront: DOC, aadharCardBack: DOC,
        panCardNumber: `BBBPL${rnd(1000,9999)}R`, panCardFront: DOC,
        bankAccountNumber: `${rnd(10000000000,99999999999)}`,
        bankIfscCode: `AXIS000${rnd(1000,9999)}`,
        bankAccountName: `${pick(firstNames)} ${pick(lastNames)}`,
        cancelChequePhoto: DOC, verify: true,
        referralCode: `REF${rnd(100000,999999)}`, status: pick(statuses),
        createdByType: "SalesPerson", createdBy: parentId,
        level: 2, parentSalesPerson: parentId, adminId,
        createdAt: new Date(), updatedAt: new Date()
      })
    }
  }

  const l3 = []
  for (const parentId of l2) {
    for (let i = 0; i < 2; i++) {
      const pid = id(); l3.push(pid)
      persons.push({
        _id: pid,
        name: `${pick(firstNames)} ${pick(lastNames)}`,
        phoneNumber: `9${rnd(100000000,999999999)}`,
        email: `sp_l3_${emailIdx++}_${adminId.toString().slice(-4)}@vritika.com`,
        address: `${rnd(1,999)}, Lal Bahadur Nagar, Hyderabad - 500074`,
        selfie: SELFIE, aadharCardNumber: `3456 7890 12${rnd(10,99)}`,
        aadharCardFront: DOC, aadharCardBack: DOC,
        panCardNumber: `CCCPL${rnd(1000,9999)}S`, panCardFront: DOC,
        bankAccountNumber: `${rnd(10000000000,99999999999)}`,
        bankIfscCode: `KOTAK00${rnd(1000,9999)}`,
        bankAccountName: `${pick(firstNames)} ${pick(lastNames)}`,
        cancelChequePhoto: DOC, verify: pick([true,true,false]),
        referralCode: `REF${rnd(100000,999999)}`, status: pick(statuses),
        createdByType: "SalesPerson", createdBy: parentId,
        level: 3, parentSalesPerson: parentId, adminId,
        createdAt: new Date(), updatedAt: new Date()
      })
    }
  }

  const l4 = []
  for (const parentId of l3.slice(0, 6)) {
    const pid = id(); l4.push(pid)
    persons.push({
      _id: pid,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phoneNumber: `6${rnd(100000000,999999999)}`,
      email: `sp_l4_${emailIdx++}_${adminId.toString().slice(-4)}@vritika.com`,
      address: `${rnd(1,999)}, Anna Nagar, Chennai - 600040`,
      selfie: SELFIE, aadharCardNumber: `4567 8901 23${rnd(10,99)}`,
      aadharCardFront: DOC, aadharCardBack: DOC,
      panCardNumber: `DDDPL${rnd(1000,9999)}T`, panCardFront: DOC,
      bankAccountNumber: `${rnd(10000000000,99999999999)}`,
      bankIfscCode: `YESB000${rnd(1000,9999)}`,
      bankAccountName: `${pick(firstNames)} ${pick(lastNames)}`,
      cancelChequePhoto: DOC, verify: false,
      referralCode: `REF${rnd(100000,999999)}`,
      status: pick(["Active","Pending","Inactive"]),
      createdByType: "SalesPerson", createdBy: parentId,
      level: 4, parentSalesPerson: parentId, adminId,
      createdAt: new Date(), updatedAt: new Date()
    })
  }

  for (const parentId of l4) {
    persons.push({
      _id: id(),
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phoneNumber: `7${rnd(100000000,999999999)}`,
      email: `sp_l5_${emailIdx++}_${adminId.toString().slice(-4)}@vritika.com`,
      address: `${rnd(1,999)}, Shivaji Nagar, Nagpur - 440001`,
      selfie: SELFIE, aadharCardNumber: `5678 9012 34${rnd(10,99)}`,
      aadharCardFront: DOC, aadharCardBack: DOC,
      panCardNumber: `EEEPL${rnd(1000,9999)}U`, panCardFront: DOC,
      bankAccountNumber: `${rnd(10000000000,99999999999)}`,
      bankIfscCode: `PUNB000${rnd(1000,9999)}`,
      bankAccountName: `${pick(firstNames)} ${pick(lastNames)}`,
      cancelChequePhoto: DOC, verify: false,
      referralCode: `REF${rnd(100000,999999)}`, status: "Pending",
      createdByType: "SalesPerson", createdBy: parentId,
      level: 5, parentSalesPerson: parentId, adminId,
      createdAt: new Date(), updatedAt: new Date()
    })
  }

  return persons
}

function makeBrands() {
  return [
    { _id: id(), brandName: "SolarTech Pro", brandDetails: "Premium solar panel manufacturer from Gujarat with 15+ years of expertise.", productCategory: ["Solar Panels","Inverters"], quality: "Premium", image: IMG, createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), brandName: "SunPower India", brandDetails: "Trusted brand for residential and commercial solar installations across India.", productCategory: ["Solar Panels","Mounting Structures"], quality: "High", image: IMG, createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), brandName: "GreenVolt Systems", brandDetails: "Specialised in high-efficiency solar inverters and battery storage systems.", productCategory: ["Inverters","Batteries","Charge Controllers"], quality: "Standard", image: IMG, createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), brandName: "EcoSolar Structures", brandDetails: "Leading provider of rooftop solar mounting structures.", productCategory: ["Mounting Structures","Cables"], quality: "Premium", image: IMG, createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), brandName: "PowerGrid Components", brandDetails: "Manufacturers of solar cables, junction boxes, and BOS components.", productCategory: ["Cables","Junction Boxes","MCBs"], quality: "Standard", image: IMG, createdAt: new Date(), updatedAt: new Date() },
  ]
}

function makeProducts(brands) {
  const b = brands.map(x => x._id)
  const p = (o) => ({ ...o, _id: id(), image: IMG, createdAt: new Date(), updatedAt: new Date() })
  return [
    p({ productName:"MonoPERC 400W Panel", type:"Solar Panel", productType:"Monocrystalline", spvBrand:b[0], spvType:"PERC", phase:"Single", capacity:"400W", spvCapacity:"400W", price:12500, category:"Solar Panel", unit:"pcs", width:"1134mm", height:"2094mm", weight:"22.5kg", deception:"High-efficiency 400W monocrystalline solar panel" }),
    p({ productName:"PolyCrystalline 330W Panel", type:"Solar Panel", productType:"Polycrystalline", spvBrand:b[1], spvType:"Poly", phase:"Single", capacity:"330W", spvCapacity:"330W", price:9800, category:"Solar Panel", unit:"pcs", width:"1100mm", height:"2000mm", weight:"20kg", deception:"Budget-friendly 330W poly panel for residential use" }),
    p({ productName:"Bifacial 450W Panel", type:"Solar Panel", productType:"Bifacial", spvBrand:b[0], spvType:"Bifacial PERC", phase:"Single", capacity:"450W", spvCapacity:"450W", price:15000, category:"Solar Panel", unit:"pcs", width:"1140mm", height:"2100mm", weight:"23kg", deception:"Double-sided energy generation, ideal for ground mounts" }),
    p({ productName:"HalfCut 380W Panel", type:"Solar Panel", productType:"HalfCut", spvBrand:b[1], spvType:"HalfCut PERC", phase:"Single", capacity:"380W", spvCapacity:"380W", price:11200, category:"Solar Panel", unit:"pcs", width:"1130mm", height:"2090mm", weight:"21kg", deception:"Half-cut cell technology for better shade tolerance" }),
    p({ productName:"String Inverter 5kW", type:"Inverter", productType:"String", spvBrand:b[2], phase:"Single", capacity:"5kW", price:28000, category:"Inverter", unit:"pcs", deception:"5kW single-phase string inverter with MPPT" }),
    p({ productName:"String Inverter 10kW 3-Phase", type:"Inverter", productType:"String", spvBrand:b[2], phase:"Three", capacity:"10kW", price:55000, category:"Inverter", unit:"pcs", deception:"10kW three-phase inverter for commercial use" }),
    p({ productName:"Hybrid Inverter 5kW", type:"Inverter", productType:"Hybrid", spvBrand:b[2], phase:"Single", capacity:"5kW", price:42000, category:"Inverter", unit:"pcs", deception:"Hybrid solar inverter with battery backup support" }),
    p({ productName:"Micro Inverter 300W", type:"Inverter", productType:"Micro", spvBrand:b[2], phase:"Single", capacity:"300W", price:8500, category:"Inverter", unit:"pcs", deception:"Module-level power electronics for small rooftops" }),
    p({ productName:"Lithium Battery 5kWh", type:"Battery", productType:"Lithium Ion", spvBrand:b[2], capacity:"5kWh", price:75000, category:"Battery", unit:"pcs", weight:"45kg", deception:"High-cycle lithium iron phosphate battery pack" }),
    p({ productName:"Lead Acid Battery 150Ah", type:"Battery", productType:"Lead Acid", spvBrand:b[2], capacity:"150Ah", price:14000, category:"Battery", unit:"pcs", weight:"42kg", deception:"Tubular lead acid battery for off-grid applications" }),
    p({ productName:"GI Rooftop Frame 2kW Set", type:"Mounting Structure", productType:"Rooftop GI", spvBrand:b[3], capacity:"2kW", price:6500, category:"Mounting Structure", unit:"set", weight:"18kg", deception:"Hot-dip galvanised iron rooftop mounting set" }),
    p({ productName:"Aluminium Rooftop Frame 5kW", type:"Mounting Structure", productType:"Rooftop Aluminium", spvBrand:b[3], capacity:"5kW", price:12000, category:"Mounting Structure", unit:"set", weight:"22kg", deception:"Lightweight aluminium structure for tiled/RCC roofs" }),
    p({ productName:"Ground Mount Frame 10kW", type:"Mounting Structure", productType:"Ground Mount", spvBrand:b[3], capacity:"10kW", price:22000, category:"Mounting Structure", unit:"set", deception:"Heavy-duty ground mounting structure with pile foundation" }),
    p({ productName:"DC Solar Cable 4mm (100m)", type:"Cable", productType:"DC Cable", spvBrand:b[4], price:4500, category:"Cable", unit:"roll", thickness:"4mm", deception:"UV-resistant DC solar cable, 1500V rated" }),
    p({ productName:"AC Cable 6mm (100m)", type:"Cable", productType:"AC Cable", spvBrand:b[4], price:5200, category:"Cable", unit:"roll", thickness:"6mm", deception:"Armoured AC output cable for inverter to grid connection" }),
    p({ productName:"MC4 Connector Pair", type:"Connector", productType:"MC4", spvBrand:b[4], price:120, category:"Connector", unit:"pair", deception:"IP68 rated MC4 solar connectors" }),
    p({ productName:"Junction Box 4-in-1", type:"Junction Box", productType:"PV Junction Box", spvBrand:b[4], price:850, category:"Junction Box", unit:"pcs", deception:"4-input combiner junction box for string connections" }),
    p({ productName:"DC MCB 16A", type:"MCB", productType:"DC MCB", spvBrand:b[4], price:380, category:"MCB", unit:"pcs", deception:"16A DC miniature circuit breaker for solar systems" }),
    p({ productName:"Earthing Kit Complete", type:"Earthing", productType:"Earthing Kit", spvBrand:b[4], price:2200, category:"Earthing", unit:"set", deception:"Complete earthing kit with copper plate and accessories" }),
    p({ productName:"Charge Controller 40A MPPT", type:"Charge Controller", productType:"MPPT", spvBrand:b[2], capacity:"40A", price:9500, category:"Charge Controller", unit:"pcs", deception:"40A MPPT charge controller with LCD display" }),
  ]
}

function makeRoleCommissions() {
  return [
    { _id: id(), roleName: "Level 1 Agent Commission", commission: 5, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Level 2 Agent Commission", commission: 4, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Level 3 Agent Commission", commission: 3, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Level 4 Agent Commission", commission: 2, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Level 5 Agent Commission", commission: 1, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Salesperson Base Commission", commission: 2, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Senior Salesperson Commission", commission: 3, status: "Active", createdAt: new Date(), updatedAt: new Date() },
    { _id: id(), roleName: "Star Performer Commission", commission: 6, status: "Inactive", createdAt: new Date(), updatedAt: new Date() },
  ]
}

function makeCustomerHierarchy() {
  const groups = [
    { _id: id(), name: "Residential" },
    { _id: id(), name: "Commercial" },
    { _id: id(), name: "Industrial" },
  ]
  const subGroups = [
    { _id: id(), name: "Home Owner",      group_id: groups[0]._id },
    { _id: id(), name: "Housing Society", group_id: groups[0]._id },
    { _id: id(), name: "Small Shop",      group_id: groups[1]._id },
    { _id: id(), name: "Office Complex",  group_id: groups[1]._id },
    { _id: id(), name: "Factory",         group_id: groups[2]._id },
    { _id: id(), name: "Warehouse",       group_id: groups[2]._id },
  ]
  const segments = [
    { _id: id(), name: "Tier 1 City",     sub_group_id: subGroups[0]._id },
    { _id: id(), name: "Tier 2 City",     sub_group_id: subGroups[0]._id },
    { _id: id(), name: "Rural",           sub_group_id: subGroups[1]._id },
    { _id: id(), name: "Metro",           sub_group_id: subGroups[2]._id },
    { _id: id(), name: "Semi-Urban",      sub_group_id: subGroups[3]._id },
    { _id: id(), name: "Industrial Belt", sub_group_id: subGroups[4]._id },
  ]
  return { groups, subGroups, segments }
}

function makeCustomersAndSurveys(salesPersons, hierarchy) {
  const { groups, subGroups, segments } = hierarchy
  const titles    = ["Mr.","Ms.","Mrs.","Dr."]
  const states    = ["Maharashtra","Gujarat","Karnataka","Tamil Nadu","Telangana","Rajasthan","Uttar Pradesh","Punjab"]
  const districts = ["Pune","Ahmedabad","Bengaluru","Chennai","Hyderabad","Jaipur","Lucknow","Amritsar"]
  const roofTypes  = ["RCC","Tiled","Tin Shed","Metal Sheet","Asbestos"]
  const roofAccess = ["Easy","Moderate","Difficult"]
  const soilTypes  = ["Hard Rock","Soft Soil","Sandy","Clay"]
  const sysTypes   = ["On-Grid","Off-Grid","Hybrid","On-Grid with Battery Backup"]

  const activeSPs = salesPersons.filter(sp => sp.status === "Active")
  if (!activeSPs.length) return { customers: [], surveys: [], quotations: [] }

  const customers = [], surveys = [], quotations = []

  for (let i = 1; i <= 30; i++) {
    const sp  = pick(activeSPs)
    const grp = pick(groups)
    const filteredSubs = subGroups.filter(s => s.group_id.toString() === grp._id.toString())
    const sub = filteredSubs.length ? pick(filteredSubs) : subGroups[0]
    const filteredSegs = segments.filter(s => s.sub_group_id.toString() === sub._id.toString())
    const seg = filteredSegs.length ? pick(filteredSegs) : segments[0]

    const custId   = id()
    const stateIdx = rnd(0, states.length - 1)
    customers.push({
      _id: custId,
      leadId: `LEAD${String(i).padStart(5,"0")}`,
      customerPhoneNo: `9${rnd(100000000,999999999)}`,
      customerGroup: grp._id, customerSubGroup: sub._id, segment: seg._id,
      proposalDate: new Date(Date.now() - rnd(1,180)*86400000).toISOString().split("T")[0],
      proposal: `Proposal for ${rnd(3,20)}kW solar system`,
      title: pick(titles),
      customerContactName: `Customer ${i}`,
      emailId: `customer${i}@example.com`,
      customerAddress: `${rnd(1,999)}, ${pick(["Main St","Park Ave","MG Road","Civil Lines","Sector 12"])}`,
      state: states[stateIdx], district: districts[stateIdx],
      pinCode: `${rnd(100000,999999)}`,
      verify: pick([true,true,false]),
      salesPersonId: sp._id,
      createdAt: new Date(), updatedAt: new Date()
    })

    const surveyId = id()
    const solarCap = rnd(3, 20)
    surveys.push({
      _id: surveyId,
      length: rnd(10,50), width: rnd(8,40), images: [DOC,DOC],
      obstacleCheck: pick([true,false]), shadowAnalysis: pick([true,false]),
      roofSurfaceType: pick(roofTypes), totalRoofs: rnd(1,4),
      roofAccessibility: pick(roofAccess), sensationLoadKW: rnd(2,15),
      solarCapacity: solarCap, electricityBillImages: [DOC],
      gensatAvailable: pick([true,false]),
      salesPersonId: sp._id, customerId: custId,
      distance: `${rnd(1,30)} km`, surfaceSoil: pick(soilTypes), roofSurface: pick(roofTypes),
      loanRequired: pick([true,false]), subsidy: pick([true,true,false]),
      conductPipe: pick([true,false]), carsOwned: String(rnd(0,3)),
      acPremises: String(rnd(0,5)), gridInverters: String(rnd(0,2)),
      coordinates: {
        type: "Point",
        coordinates: [parseFloat((72+Math.random()*10).toFixed(6)), parseFloat((18+Math.random()*10).toFixed(6))],
        status: "active"
      },
      boxCoordinates: [],
      createdAt: new Date(), updatedAt: new Date()
    })

    for (let q = 0; q < rnd(1,3); q++) {
      const numPanels = solarCap * rnd(2,3)
      const panelP = rnd(9000,15000), invP = rnd(25000,55000), structP = rnd(5000,20000)
      quotations.push({
        _id: id(),
        salesPersonId: sp._id, SiteSurveyId: surveyId, customerId: custId,
        sytemType: pick(sysTypes),
        data: [
          { itemType:"Solar Panel",          quantity:numPanels, unitPrice:panelP, totalPrice:numPanels*panelP, brand:"SolarTech Pro" },
          { itemType:"Inverter",             quantity:1,         unitPrice:invP,   totalPrice:invP,             brand:"GreenVolt Systems" },
          { itemType:"Mounting Structure",   quantity:1,         unitPrice:structP,totalPrice:structP,           brand:"EcoSolar Structures" },
          { itemType:"Cables & Accessories", quantity:1,         unitPrice:rnd(3000,8000), totalPrice:rnd(3000,8000), brand:"PowerGrid Components" }
        ],
        createdAt: new Date(), updatedAt: new Date()
      })
    }
  }
  return { customers, surveys, quotations }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Connecting to MongoDB...")
  const client = new MongoClient(MONGO_URI)
  await client.connect()

  // Derive DB name from URI, fall back to "vritika"
  const dbName = MONGO_URI.split("/").pop()?.split("?")[0] || "vritika"
  const db = client.db(dbName)
  console.log(`✅  Connected to database: "${dbName}"\n`)

  // Drop collections for clean slate
  const toDrop = [
    "superadmins","users","salespersons","brands","products","rolecommissions",
    "customergroups","customersubgroups","customesegments",
    "customerdetails","sitesurveys","quotations"
  ]
  for (const col of toDrop) {
    try { await db.collection(col).drop(); console.log(`🗑️   Dropped: ${col}`) }
    catch { /* didn't exist */ }
  }
  console.log("")

  // ── SuperAdmin ──
  const superAdminDoc = makeSuperAdmin()
  await db.collection("superadmins").insertOne(superAdminDoc)
  console.log(`✅  SuperAdmin created       → ${superAdminDoc.email}  /  Admin@123`)

  // ── Admins ──
  const adminDocs = [makeAdmin(1, ADMIN_1_ID), makeAdmin(2, ADMIN_2_ID)]
  await db.collection("users").insertMany(adminDocs)
  console.log(`✅  Admins created           → admin1@vritika.com  /  Admin@123`)
  console.log(`                              → admin2@vritika.com  /  Admin@123`)

  // ── Sub-Admins ──
  const subAdminDocs = [
    makeSubAdmin(1, ADMIN_1_ID, SUB_ADMIN_1A_ID),
    makeSubAdmin(2, ADMIN_1_ID, SUB_ADMIN_1B_ID),
    makeSubAdmin(3, ADMIN_2_ID, SUB_ADMIN_2A_ID),
    makeSubAdmin(4, ADMIN_2_ID, SUB_ADMIN_2B_ID),
  ]
  await db.collection("users").insertMany(subAdminDocs)
  console.log(`✅  Sub-Admins created       → 4 sub-admins (2 per admin)`)

  // ── SalesPersons ──
  const sp1 = makeSalesPersons(ADMIN_1_ID)
  const sp2 = makeSalesPersons(ADMIN_2_ID)
  const allSP = [...sp1, ...sp2]
  await db.collection("salespersons").insertMany(allSP)
  console.log(`✅  SalesPersons created     → ${allSP.length} across 5 levels`)

  // ── Brands ──
  const brands = makeBrands()
  await db.collection("brands").insertMany(brands)
  console.log(`✅  Brands created           → ${brands.length} brands`)

  // ── Products ──
  const products = makeProducts(brands)
  await db.collection("products").insertMany(products)
  console.log(`✅  Products created         → ${products.length} products`)

  // ── Role Commissions ──
  const commissions = makeRoleCommissions()
  await db.collection("rolecommissions").insertMany(commissions)
  console.log(`✅  Role Commissions created → ${commissions.length} rules`)

  // ── Customer Hierarchy ──
  const hier = makeCustomerHierarchy()
  await db.collection("customergroups").insertMany(hier.groups)
  await db.collection("customersubgroups").insertMany(hier.subGroups)
  await db.collection("customesegments").insertMany(hier.segments)
  console.log(`✅  Customer segments        → ${hier.groups.length} groups, ${hier.subGroups.length} subgroups, ${hier.segments.length} segments`)

  // ── Customers, Surveys, Quotations ──
  const { customers, surveys, quotations } = makeCustomersAndSurveys(allSP, hier)
  if (customers.length) {
    await db.collection("customerdetails").insertMany(customers)
    await db.collection("sitesurveys").insertMany(surveys)
    await db.collection("quotations").insertMany(quotations)
  }
  console.log(`✅  Customers created        → ${customers.length}`)
  console.log(`✅  Site Surveys created     → ${surveys.length}`)
  console.log(`✅  Quotations created       → ${quotations.length}`)

  // ── VERIFY: read back admin1 and confirm hash round-trips ────────────────
  console.log("\n🔍  Verifying stored passwords...")
  const storedSA  = await db.collection("superadmins").findOne({ email: "superadmin@vritika.com" })
  const storedAdm = await db.collection("users").findOne({ email: "admin1@vritika.com" })

  const saOk  = storedSA  && passwordHash.verify("Admin@123", storedSA.password)
  const admOk = storedAdm && passwordHash.verify("Admin@123", storedAdm.password)

  if (saOk && admOk) {
    console.log("✅  Password verification PASSED — login will work correctly")
  } else {
    console.error("❌  Password verification FAILED!")
    if (!saOk)  console.error("    superadmin password does not verify. Stored hash:", storedSA?.password)
    if (!admOk) console.error("    admin1 password does not verify. Stored hash:", storedAdm?.password)
    console.error("    Something is wrong with the environment. Do NOT use this data.")
    await client.close()
    process.exit(1)
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    SEED COMPLETE ✅                          ║
╠══════════════════════════════════════════════════════════════╣
║  Login Credentials                                           ║
║  ─────────────────────────────────────────────────────────  ║
║  SuperAdmin → superadmin@vritika.com  /  Admin@123           ║
║  Admin 1    → admin1@vritika.com      /  Admin@123           ║
║  Admin 2    → admin2@vritika.com      /  Admin@123           ║
╚══════════════════════════════════════════════════════════════╝
`)

  await client.close()
  process.exit(0)
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message)
  console.error(err)
  process.exit(1)
})