const express = require("express");

const {
    createCase,
    getAllCases,
    getCaseById,
    getMyCases,
    updateCaseStatus,
    deleteCase
} = require("../controllers/caseController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// ALL CASE ROUTES REQUIRE LOGIN
// ===============================

router.use(protect);

// ===============================
// GET ALL CASES
// ===============================

router.get(
    "/",
    getAllCases
);

// ===============================
// GET CASES ASSIGNED TO LOGGED-IN OFFICER
// ===============================

router.get(
    "/my-cases",
    getMyCases
);

// ===============================
// GET SINGLE CASE
// ===============================

router.get(
    "/:id",
    getCaseById
);

// ===============================
// ADMIN ONLY
// ===============================

// Create case
router.post(
    "/",
    adminOnly,
    createCase
);

// Update case status
router.put(
    "/:id/status",
    adminOnly,
    updateCaseStatus
);

// Delete case
router.delete(
    "/:id",
    adminOnly,
    deleteCase
);

module.exports = router;