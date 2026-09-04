const upload = require("../middleware/uploadMiddleware");
const express = require("express");

const {
    getMyDocuments,
    getAllDocuments,
    getDocumentById,
    createDocument,
    getDocumentFile,
    checkDocumentIntegrity,
    verifyDocumentIntegrity,
    deleteDocument
} = require("../controllers/documentController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// All document routes require authentication
// ===============================
router.use(protect);

// ===============================
// Get documents for logged-in officer
// ===============================
router.get(
    "/my-documents",
    getMyDocuments
);

// ===============================
// Get document file
// ===============================
router.get(
    "/:id/file",
    getDocumentFile
);

// ===============================
// Check document integrity
// Background verification
// Does NOT create audit log
// ===============================
router.get(
    "/:id/integrity",
    checkDocumentIntegrity
);

// ===============================
// Verify document integrity
// Explicit investigation
// Creates audit log
// ===============================
router.get(
    "/:id/verify",
    verifyDocumentIntegrity
);

// ===============================
// Get all documents
// ===============================
router.get(
    "/",
    getAllDocuments
);

// ===============================
// Get single document
// ===============================
router.get(
    "/:id",
    getDocumentById
);

// ===============================
// Create document
// Currently restricted to ADMIN
// ===============================
router.post(
    "/",
    adminOnly,
    upload.single("file"),
    createDocument
);

// ===============================
// Delete document
// Currently restricted to ADMIN
// ===============================
router.delete(
    "/:id",
    adminOnly,
    deleteDocument
);

module.exports = router;