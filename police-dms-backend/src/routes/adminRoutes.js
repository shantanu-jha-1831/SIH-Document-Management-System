const express = require("express");

const {
    getPendingOfficers,
    approveOfficer,
    rejectOfficer,
    getAllOfficers,
    getDashboardStats
} = require("../controllers/adminController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// ADMIN AUTHENTICATION
// ===============================
// All routes below require:
// 1. Valid JWT
// 2. ADMIN role

router.use(protect);
router.use(adminOnly);


// ===============================
// DASHBOARD STATISTICS
// ===============================
router.get(
    "/dashboard",
    getDashboardStats
);


// ===============================
// GET ALL OFFICERS
// ===============================
router.get(
    "/officers",
    getAllOfficers
);


// ===============================
// GET PENDING OFFICER REQUESTS
// ===============================
router.get(
    "/officers/pending",
    getPendingOfficers
);


// ===============================
// APPROVE OFFICER
// ===============================
router.put(
    "/officers/:id/approve",
    approveOfficer
);


// ===============================
// REJECT OFFICER
// ===============================
router.put(
    "/officers/:id/reject",
    rejectOfficer
);


module.exports = router;