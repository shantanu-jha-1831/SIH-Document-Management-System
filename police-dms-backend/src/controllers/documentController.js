const Document = require("../models/Document");
const Case = require("../models/Case");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const AccessRequest = require("../models/AccessRequest");

const {
    registerDocumentOnBlockchain,
    getDocumentFromBlockchain
} = require("../utils/blockchain");

const {
    createAuditLog
} = require("./auditController");


// =====================================================
// GET ALL DOCUMENTS
// =====================================================

const getAllDocuments = async (req, res) => {
    try {

        const documents = await Document.find()
            .populate(
                "case",
                "caseId firNumber title"
            )
            .populate(
                "uploadedBy",
                "fullName policeNumber rank"
            )
            .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            documents
        });

    } catch (error) {

        console.error(
            "Get all documents error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching documents"
        });
    }
};


// =====================================================
// GET DOCUMENTS FOR LOGGED-IN OFFICER
// =====================================================

const getMyDocuments = async (req, res) => {
    try {

        const myCases = await Case.find({
            $or: [
                {
                    leadOfficer: req.user._id
                },
                {
                    assignedOfficers: req.user._id
                }
            ]
        }).select("_id");


        const caseIds = myCases.map(
            item => item._id
        );


        const documents = await Document.find({
            case: {
                $in: caseIds
            }
        })
            .populate(
                "case",
                "caseId firNumber title"
            )
            .populate(
                "uploadedBy",
                "fullName policeNumber rank"
            )
            .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            documents
        });

    } catch (error) {

        console.error(
            "Get my documents error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching assigned documents"
        });
    }
};


// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

const getDocumentById = async (req, res) => {
    try {

        const { id } = req.params;


        const document =
            await Document.findById(id)
                .populate(
                    "case",
                    "caseId firNumber title"
                )
                .populate(
                    "uploadedBy",
                    "fullName policeNumber rank"
                );


        if (!document) {

            return res.status(404).json({
                success: false,
                message:
                    "Document not found"
            });

        }


        res.status(200).json({
            success: true,
            document
        });

    } catch (error) {

        console.error(
            "Get document error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching document"
        });
    }
};


// =====================================================
// CREATE DOCUMENT
// =====================================================

const createDocument = async (req, res) => {
    try {

        const {
            name,
            caseId,
            type,
            accessLevel
        } = req.body;


        // -------------------------------------------------
        // VALIDATE REQUIRED FIELDS
        // -------------------------------------------------

        if (
            !name ||
            !caseId ||
            !type
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, case ID and document type are required"
            });

        }


        // -------------------------------------------------
        // CHECK FILE
        // -------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "Please upload a document file"
            });

        }


        // -------------------------------------------------
        // FIND CASE
        // -------------------------------------------------

        const caseData =
            await Case.findOne({
                caseId: caseId.trim()
            });


        if (!caseData) {

            return res.status(404).json({
                success: false,
                message:
                    `Case not found: ${caseId}`
            });

        }


        // -------------------------------------------------
        // GENERATE UNIQUE DOCUMENT ID
        // -------------------------------------------------

        const year =
            new Date().getFullYear();


        const lastDocument =
            await Document.findOne({
                documentId: {
                    $regex: `^DOC-${year}-`
                }
            }).sort({
                documentId: -1
            });


        let nextNumber = 1;


        if (lastDocument) {

            const parts =
                lastDocument.documentId.split("-");


            const lastNumber =
                parseInt(
                    parts[2],
                    10
                );


            if (!isNaN(lastNumber)) {

                nextNumber =
                    lastNumber + 1;

            }

        }


        let documentId =
            `DOC-${year}-${String(
                nextNumber
            ).padStart(4, "0")}`;


        // -------------------------------------------------
        // EXTRA SAFETY CHECK
        // -------------------------------------------------

        let existingDocument =
            await Document.findOne({
                documentId
            });


        while (existingDocument) {

            nextNumber++;


            documentId =
                `DOC-${year}-${String(
                    nextNumber
                ).padStart(4, "0")}`;


            existingDocument =
                await Document.findOne({
                    documentId
                });

        }


        console.log(
            "Generated Document ID:",
            documentId
        );


        // -------------------------------------------------
        // FILE URL
        // -------------------------------------------------

        const fileUrl =
            `/uploads/${req.file.filename}`;


        // -------------------------------------------------
        // GENERATE SHA-256 HASH
        // -------------------------------------------------

        const fileHash =
            crypto
                .createHash("sha256")
                .update(
                    fs.readFileSync(
                        req.file.path
                    )
                )
                .digest("hex");


        console.log(
            "Generated SHA-256 Hash:",
            fileHash
        );


        // -------------------------------------------------
        // CREATE DOCUMENT IN MONGODB
        // -------------------------------------------------

        const document =
            await Document.create({

                documentId,

                name:
                    name.trim(),

                case:
                    caseData._id,

                type,

                version:
                    1,

                fileUrl,

                fileHash,

                uploadedBy:
                    req.user._id,

                accessLevel:
                    accessLevel ||
                    "RESTRICTED",

                status:
                    "ACTIVE"

            });


        console.log(
            "Document saved in MongoDB:",
            document.documentId
        );


        // -------------------------------------------------
        // REGISTER DOCUMENT ON BLOCKCHAIN
        // -------------------------------------------------

        let blockchainTxHash = null;


        try {

            blockchainTxHash =
                await registerDocumentOnBlockchain(
                    document.documentId,
                    document.fileHash
                );


            console.log(
                "Document registered on blockchain:",
                blockchainTxHash
            );

        } catch (blockchainError) {

            console.error(
                "Blockchain registration failed:",
                blockchainError.message
            );

        }


        // -------------------------------------------------
        // POPULATE DOCUMENT
        // -------------------------------------------------

        const populatedDocument =
            await Document.findById(
                document._id
            )
                .populate(
                    "case",
                    "caseId firNumber title"
                )
                .populate(
                    "uploadedBy",
                    "fullName policeNumber rank"
                );


        // -------------------------------------------------
        // CREATE AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "DOCUMENT_UPLOAD",

            document:
                document._id,

            case:
                caseData._id,

            result:
                "SUCCESS",

            ipAddress:
                req.ip,

            details:
                blockchainTxHash
                    ? `Document uploaded and registered on blockchain. Transaction: ${blockchainTxHash}`
                    : "Document uploaded successfully but blockchain registration failed"

        });


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        res.status(201).json({

            success:
                true,

            message:
                "Document uploaded successfully",

            document:
                populatedDocument,

            blockchainTxHash

        });


    } catch (error) {

        console.error(
            "Create document error:",
            error
        );


        // -------------------------------------------------
        // HANDLE DUPLICATE DOCUMENT ID
        // -------------------------------------------------

        if (
            error.code === 11000 &&
            error.keyPattern &&
            error.keyPattern.documentId
        ) {

            return res.status(409).json({

                success:
                    false,

                message:
                    "Document ID already exists. Please try uploading again."

            });

        }


        res.status(500).json({

            success:
                false,

            message:
                "Server error while uploading document"

        });

    }
};


// =====================================================
// GET SECURE DOCUMENT FILE
// =====================================================

const getDocumentFile = async (req, res) => {
    try {

        const { id } = req.params;


        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document =
            await Document.findById(id)
                .populate("case");


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found"

            });

        }


        // -------------------------------------------------
        // GET CASE
        // -------------------------------------------------

        const caseData =
            document.case;


        if (!caseData) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Associated case not found"

            });

        }


        // -------------------------------------------------
        // CHECK AUTHORIZATION
        // -------------------------------------------------

        const isAdmin =
            req.user.role === "ADMIN";


        const isLeadOfficer =
            caseData.leadOfficer &&
            caseData.leadOfficer.toString() ===
                req.user._id.toString();


        const isAssignedOfficer =
            caseData.assignedOfficers &&
            caseData.assignedOfficers.some(
                officerId =>
                    officerId.toString() ===
                    req.user._id.toString()
            );


        let isAuthorized =
            isAdmin ||
            isLeadOfficer ||
            isAssignedOfficer;


        // -------------------------------------------------
        // CHECK APPROVED ACCESS REQUEST
        // -------------------------------------------------

        if (!isAuthorized) {

            const approvedRequest =
                await AccessRequest.findOne({

                    requestedBy:
                        req.user._id,

                    document:
                        document._id,

                    status:
                        "APPROVED"

                });


            if (approvedRequest) {

                isAuthorized = true;

            }

        }


        if (!isAuthorized) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not authorized to access this document"

            });

        }


        // -------------------------------------------------
        // BUILD FILE PATH
        // -------------------------------------------------

        const filePath =
            path.join(
                __dirname,
                "../../",
                document.fileUrl
            );


        // -------------------------------------------------
        // CHECK PHYSICAL FILE
        // -------------------------------------------------

        if (!fs.existsSync(filePath)) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Physical file not found"

            });

        }


        // -------------------------------------------------
        // AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "DOCUMENT_VIEW",

            document:
                document._id,

            case:
                caseData._id,

            result:
                "SUCCESS",

            ipAddress:
                req.ip,

            details:
                "Document accessed successfully"

        });


        // -------------------------------------------------
        // SEND FILE
        // -------------------------------------------------

        res.sendFile(filePath);


    } catch (error) {

        console.error(
            "Get document file error:",
            error
        );

        res.status(500).json({

            success:
                false,

            message:
                "Server error while accessing document"

        });

    }
};


// =====================================================
// CHECK DOCUMENT INTEGRITY
// =====================================================
// This endpoint is used for automatic/background checks.
//
// IMPORTANT:
// It DOES NOT create an audit log.
//
// This prevents Audit Logs from being filled every time
// a Documents page or Case Details page is opened.
// =====================================================

const checkDocumentIntegrity = async (req, res) => {

    try {

        const { id } = req.params;


        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document =
            await Document.findById(id)
                .populate("case");


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found"

            });

        }


        // -------------------------------------------------
        // GET CASE
        // -------------------------------------------------

        const caseData =
            document.case;


        if (!caseData) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Associated case not found"

            });

        }


        // -------------------------------------------------
        // CHECK NORMAL CASE ACCESS
        // -------------------------------------------------

        const isAdmin =
            req.user.role === "ADMIN";


        const isLeadOfficer =
            caseData.leadOfficer &&
            caseData.leadOfficer.toString() ===
                req.user._id.toString();


        const isAssignedOfficer =
            caseData.assignedOfficers &&
            caseData.assignedOfficers.some(
                officerId =>
                    officerId.toString() ===
                    req.user._id.toString()
            );


        let isAuthorized =
            isAdmin ||
            isLeadOfficer ||
            isAssignedOfficer;


        // -------------------------------------------------
        // CHECK APPROVED ACCESS REQUEST
        // -------------------------------------------------

        if (!isAuthorized) {

            const approvedRequest =
                await AccessRequest.findOne({

                    requestedBy:
                        req.user._id,

                    document:
                        document._id,

                    status:
                        "APPROVED"

                });


            if (approvedRequest) {

                isAuthorized = true;

            }

        }


        if (!isAuthorized) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not authorized to check this document"

            });

        }


        // -------------------------------------------------
        // BUILD FILE PATH
        // -------------------------------------------------

        const filePath =
            path.join(
                __dirname,
                "../../",
                document.fileUrl
            );


        // -------------------------------------------------
        // CHECK PHYSICAL FILE
        // -------------------------------------------------

        if (!fs.existsSync(filePath)) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Physical document file not found"

            });

        }


        // -------------------------------------------------
        // CALCULATE CURRENT FILE HASH
        // -------------------------------------------------

        const fileBuffer =
            fs.readFileSync(filePath);


        const currentHash =
            crypto
                .createHash("sha256")
                .update(fileBuffer)
                .digest("hex");


        console.log(
            "Integrity check - current hash:",
            currentHash
        );


        // -------------------------------------------------
        // COMPARE WITH MONGODB HASH
        // -------------------------------------------------

        const mongoVerified =
            currentHash ===
            document.fileHash;


        // -------------------------------------------------
        // BLOCKCHAIN VERIFICATION
        // -------------------------------------------------

        let blockchainDocument =
            null;

        let blockchainVerified =
            false;


        try {

            blockchainDocument =
                await getDocumentFromBlockchain(
                    document.documentId
                );


            if (
                blockchainDocument &&
                blockchainDocument.fileHash
            ) {

                blockchainVerified =
                    currentHash ===
                    blockchainDocument.fileHash;

            }

        } catch (blockchainError) {

            console.error(
                "Blockchain integrity check error:",
                blockchainError
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to verify document against blockchain",

                mongoVerified,

                currentHash,

                mongoHash:
                    document.fileHash

            });

        }


        // -------------------------------------------------
        // FINAL VERIFICATION
        // -------------------------------------------------

        const verified =
            mongoVerified &&
            blockchainVerified;


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success:
                true,

            verified,

            documentId:
                document.documentId,

            currentHash,

            mongoHash:
                document.fileHash,

            blockchainHash:
                blockchainDocument
                    ? blockchainDocument.fileHash
                    : null,

            mongoVerified,

            blockchainVerified,

            blockchainTimestamp:
                blockchainDocument
                    ? blockchainDocument.timestamp
                    : null,

            blockchainRegisteredBy:
                blockchainDocument
                    ? blockchainDocument.registeredBy
                    : null

        });

    } catch (error) {

        console.error(
            "Check document integrity error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error while checking document integrity"

        });

    }

};


// =====================================================
// VERIFY DOCUMENT INTEGRITY
// =====================================================
// This endpoint is for EXPLICIT verification/investigation.
//
// IMPORTANT:
// Unlike /integrity, this endpoint CREATES an audit log.
// =====================================================

const verifyDocumentIntegrity = async (req, res) => {

    try {

        const { id } = req.params;


        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document =
            await Document.findById(id)
                .populate("case");


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found"

            });

        }


        // -------------------------------------------------
        // GET CASE
        // -------------------------------------------------

        const caseData =
            document.case;


        if (!caseData) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Associated case not found"

            });

        }


        // -------------------------------------------------
        // CHECK AUTHORIZATION
        // -------------------------------------------------

        const isAdmin =
            req.user.role === "ADMIN";


        const isLeadOfficer =
            caseData.leadOfficer &&
            caseData.leadOfficer.toString() ===
                req.user._id.toString();


        const isAssignedOfficer =
            caseData.assignedOfficers &&
            caseData.assignedOfficers.some(
                officerId =>
                    officerId.toString() ===
                    req.user._id.toString()
            );


        // -------------------------------------------------
        // CHECK APPROVED ACCESS REQUEST
        // -------------------------------------------------

        const approvedRequest =
            await AccessRequest.findOne({

                requestedBy:
                    req.user._id,

                document:
                    document._id,

                status:
                    "APPROVED"

            });


        const hasApprovedAccess =
            !!approvedRequest;


        // -------------------------------------------------
        // FINAL AUTHORIZATION
        // -------------------------------------------------

        if (
            !isAdmin &&
            !isLeadOfficer &&
            !isAssignedOfficer &&
            !hasApprovedAccess
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not authorized to verify this document"

            });

        }


        // -------------------------------------------------
        // BUILD FILE PATH
        // -------------------------------------------------

        const filePath =
            path.join(
                __dirname,
                "../../",
                document.fileUrl
            );


        // -------------------------------------------------
        // CHECK PHYSICAL FILE
        // -------------------------------------------------

        if (!fs.existsSync(filePath)) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Physical document file not found"

            });

        }


        // -------------------------------------------------
        // CALCULATE CURRENT FILE HASH
        // -------------------------------------------------

        const fileBuffer =
            fs.readFileSync(filePath);


        const currentHash =
            crypto
                .createHash("sha256")
                .update(fileBuffer)
                .digest("hex");


        console.log(
            "Current file hash:",
            currentHash
        );


        // -------------------------------------------------
        // COMPARE WITH MONGODB HASH
        // -------------------------------------------------

        const mongoVerified =
            currentHash ===
            document.fileHash;


        console.log(
            "MongoDB verification:",
            mongoVerified
        );


        // -------------------------------------------------
        // BLOCKCHAIN VERIFICATION
        // -------------------------------------------------

        let blockchainDocument =
            null;

        let blockchainVerified =
            false;


        try {

            blockchainDocument =
                await getDocumentFromBlockchain(
                    document.documentId
                );


            if (
                blockchainDocument &&
                blockchainDocument.fileHash
            ) {

                blockchainVerified =
                    currentHash ===
                    blockchainDocument.fileHash;

            }

        } catch (blockchainError) {

            console.error(
                "Blockchain verification error:",
                blockchainError
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to verify document against blockchain",

                mongoVerified,

                currentHash,

                mongoHash:
                    document.fileHash

            });

        }


        console.log(
            "Blockchain verification:",
            blockchainVerified
        );


        // -------------------------------------------------
        // FINAL VERIFICATION
        // -------------------------------------------------

        const verified =
            mongoVerified &&
            blockchainVerified;


        console.log(
            "Final verification:",
            verified
        );


        // -------------------------------------------------
        // CREATE AUDIT INFORMATION
        // -------------------------------------------------

        const clientIp =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            req.connection?.remoteAddress ||
            null;


        // -------------------------------------------------
        // CREATE AUDIT LOG
        // -------------------------------------------------

        const auditLog =
            await createAuditLog({

                user:
                    req.user._id,

                action:
                    verified
                        ? "DOCUMENT_VERIFY"
                        : "DOCUMENT_TAMPERED",

                document:
                    document._id,

                case:
                    caseData._id,

                result:
                    verified
                        ? "SUCCESS"
                        : "BLOCKED",

                ipAddress:
                    clientIp,

                details:
                    verified
                        ? "Document integrity verified successfully against MongoDB and blockchain"
                        : "Document integrity verification failed. Possible tampering or blockchain mismatch detected."

            });


        // -------------------------------------------------
        // GET EXACT AUDIT TIMESTAMP
        // -------------------------------------------------

        const verificationTimestamp =
            auditLog?.createdAt ||
            new Date();


        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success:
                true,

            verified,

            documentId:
                document.documentId,

            currentHash,

            mongoHash:
                document.fileHash,

            blockchainHash:
                blockchainDocument
                    ? blockchainDocument.fileHash
                    : null,

            mongoVerified,

            blockchainVerified,

            blockchainTimestamp:
                blockchainDocument
                    ? blockchainDocument.timestamp
                    : null,

            blockchainRegisteredBy:
                blockchainDocument
                    ? blockchainDocument.registeredBy
                    : null,


            // =================================================
            // INVESTIGATION DETAILS
            // =================================================

            audit: {

                // IP address of the user
                // who performed verification
                ipAddress:
                    clientIp,


                // Exact AuditLog creation time
                timestamp:
                    verificationTimestamp,


                // Authenticated user details
                user:
                    req.user
                        ? {

                            fullName:
                                req.user.fullName ||
                                null,

                            policeNumber:
                                req.user.policeNumber ||
                                null,

                            rank:
                                req.user.rank ||
                                null,

                            department:
                                req.user.department ||
                                null

                        }
                        : null

            }

        });


    } catch (error) {

        console.error(
            "Verify document integrity error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error while verifying document integrity"

        });

    }

};


// =====================================================
// DELETE DOCUMENT
// =====================================================

const deleteDocument = async (req, res) => {

    try {

        const { id } = req.params;


        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document =
            await Document.findById(id);


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found"

            });

        }


        // -------------------------------------------------
        // SAVE FILE PATH
        // -------------------------------------------------

        const filePath =
            path.join(
                __dirname,
                "../../",
                document.fileUrl
            );


        // -------------------------------------------------
        // DELETE PHYSICAL FILE
        // -------------------------------------------------

        if (fs.existsSync(filePath)) {

            fs.unlinkSync(filePath);

        }


        // -------------------------------------------------
        // DELETE MONGODB RECORD
        // -------------------------------------------------

        await document.deleteOne();


        // -------------------------------------------------
        // AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "DOCUMENT_DELETE",

            document:
                document._id,

            case:
                document.case,

            result:
                "SUCCESS",

            ipAddress:
                req.ip,

            details:
                "Document and physical file deleted successfully"

        });


        res.status(200).json({

            success:
                true,

            message:
                "Document deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete document error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Server error while deleting document"

        });

    }

};



// =====================================================
// CHECK DOCUMENT FILE - DIAGNOSTIC
// =====================================================

const checkDocumentFile = async (req, res) => {
    try {

        const { id } = req.params;

        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document = await Document.findById(id);

        if (!document) {

            return res.status(404).json({
                success: false,
                message: "Document not found"
            });

        }

        // -------------------------------------------------
        // BUILD FILE PATH
        // -------------------------------------------------

        const filePath = path.join(
            __dirname,
            "../../",
            document.fileUrl
        );

        // -------------------------------------------------
        // UPLOADS DIRECTORY
        // -------------------------------------------------

        const uploadsDirectory = path.join(
            __dirname,
            "../../uploads"
        );

        // -------------------------------------------------
        // CHECK UPLOADS DIRECTORY
        // -------------------------------------------------

        let uploadFiles = [];

        if (fs.existsSync(uploadsDirectory)) {

            uploadFiles = fs.readdirSync(
                uploadsDirectory
            );

        }

        // -------------------------------------------------
        // CHECK FILE
        // -------------------------------------------------

        const fileExists =
            fs.existsSync(filePath);

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            documentId:
                document.documentId,

            fileUrl:
                document.fileUrl,

            resolvedPath:
                filePath,

            fileExists,

            uploadsDirectory,

            uploadFiles

        });

    } catch (error) {

        console.error(
            "Check document file error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }
};






// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getAllDocuments,
    getMyDocuments,
    getDocumentById,
    createDocument,
    getDocumentFile,
    checkDocumentIntegrity,
    verifyDocumentIntegrity,
    deleteDocument,
    checkDocumentFile
};