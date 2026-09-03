const express = require("express");

const {
    createAccessRequest,
    getMyAccessRequests,
    getAllAccessRequests,
    approveAccessRequest,
    rejectAccessRequest
} = require("../controllers/accessRequestController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


const router =
    express.Router();


// =====================================================
// ALL ACCESS REQUEST ROUTES REQUIRE LOGIN
// =====================================================

router.use(protect);


// =====================================================
// OFFICER
// =====================================================

// Create access request
router.post(
    "/",
    createAccessRequest
);


// Get requests created by logged-in officer
router.get(
    "/my-requests",
    getMyAccessRequests
);


// =====================================================
// ADMIN
// =====================================================

// Get all access requests
router.get(
    "/",
    adminOnly,
    getAllAccessRequests
);


// Approve
router.put(
    "/:id/approve",
    adminOnly,
    approveAccessRequest
);


// Reject
router.put(
    "/:id/reject",
    adminOnly,
    rejectAccessRequest
);


module.exports = router;