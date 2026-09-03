const AccessRequest = require("../models/AccessRequest");
const Document = require("../models/Document");
const Case = require("../models/Case");

const {
    createAuditLog
} = require("./auditController");


// =====================================================
// CREATE ACCESS REQUEST
// =====================================================

const createAccessRequest = async (req, res) => {

    try {

        const {
            documentId,
            reason,
            accessLevel
        } = req.body;


        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        if (!documentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Document ID is required"

            });

        }


        if (!reason || !reason.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Reason is required"

            });

        }


        const requestedAccessLevel =
            accessLevel || "READ";


        if (
            !["READ", "READ_WRITE"]
                .includes(requestedAccessLevel)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid access level"

            });

        }


        // -------------------------------------------------
        // FIND DOCUMENT
        // -------------------------------------------------

        const document =
            await Document.findById(documentId);


        if (!document) {

            return res.status(404).json({

                success: false,

                message:
                    "Document not found"

            });

        }


        // -------------------------------------------------
        // FIND CASE
        // -------------------------------------------------

        const caseData =
            await Case.findById(
                document.case
            );


        if (!caseData) {

            return res.status(404).json({

                success: false,

                message:
                    "Associated case not found"

            });

        }


        // -------------------------------------------------
        // CHECK WHETHER OFFICER ALREADY HAS ACCESS
        // -------------------------------------------------

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


        if (
            isLeadOfficer ||
            isAssignedOfficer
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You already have access to this case"

            });

        }


        // -------------------------------------------------
        // CHECK EXISTING PENDING REQUEST
        // -------------------------------------------------

        const existingPendingRequest =
            await AccessRequest.findOne({

                requestedBy:
                    req.user._id,

                document:
                    document._id,

                status:
                    "PENDING"

            });


        if (existingPendingRequest) {

            return res.status(400).json({

                success: false,

                message:
                    "You already have a pending access request for this document"

            });

        }


        // -------------------------------------------------
        // CREATE REQUEST
        // -------------------------------------------------

        const accessRequest =
            await AccessRequest.create({

                requestedBy:
                    req.user._id,

                document:
                    document._id,

                case:
                    caseData._id,

                reason:
                    reason.trim(),

                accessLevel:
                    requestedAccessLevel,

                status:
                    "PENDING"

            });


        // -------------------------------------------------
        // CREATE AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "ACCESS_REQUEST_CREATED",

            document:
                document._id,

            case:
                caseData._id,

            result:
                "SUCCESS",

            ipAddress:
                req.ip || null,

            details:
                `Access request created. Requested permission: ${requestedAccessLevel}. Reason: ${reason.trim()}`

        });


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        res.status(201).json({

            success: true,

            message:
                "Access request submitted successfully",

            accessRequest

        });

    } catch (error) {

        console.error(
            "Create access request error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while creating access request"

        });

    }

};


// =====================================================
// GET MY ACCESS REQUESTS
// =====================================================

const getMyAccessRequests = async (req, res) => {

    try {

        const requests =
            await AccessRequest.find({

                requestedBy:
                    req.user._id

            })

                .populate(
                    "requestedBy",
                    "fullName policeNumber rank department"
                )

                .populate(
                    "document",
                    "documentId name type version"
                )

                .populate(
                    "case",
                    "caseId title firNumber"
                )

                .populate(
                    "reviewedBy",
                    "fullName policeNumber rank"
                )

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            requests

        });

    } catch (error) {

        console.error(
            "Get my access requests error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while fetching access requests"

        });

    }

};


// =====================================================
// GET ALL ACCESS REQUESTS
// ADMIN ONLY
// =====================================================

const getAllAccessRequests = async (req, res) => {

    try {

        const requests =
            await AccessRequest.find()

                .populate(
                    "requestedBy",
                    "fullName policeNumber rank department role"
                )

                .populate(
                    "document",
                    "documentId name type version"
                )

                .populate(
                    "case",
                    "caseId title firNumber"
                )

                .populate(
                    "reviewedBy",
                    "fullName policeNumber rank department"
                )

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            requests

        });

    } catch (error) {

        console.error(
            "Get all access requests error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while fetching access requests"

        });

    }

};


// =====================================================
// APPROVE ACCESS REQUEST
// =====================================================

const approveAccessRequest = async (req, res) => {

    try {

        const { id } =
            req.params;


        // -------------------------------------------------
        // FIND REQUEST
        // -------------------------------------------------

        const accessRequest =
            await AccessRequest.findById(id)
                .populate("document")
                .populate("case")
                .populate(
                    "requestedBy",
                    "fullName policeNumber rank"
                );


        if (!accessRequest) {

            return res.status(404).json({

                success: false,

                message:
                    "Access request not found"

            });

        }


        // -------------------------------------------------
        // CHECK STATUS
        // -------------------------------------------------

        if (
            accessRequest.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Request has already been ${accessRequest.status.toLowerCase()}`

            });

        }


        // -------------------------------------------------
        // REVIEW COMMENT
        // -------------------------------------------------

        const reviewComment =
            req.body?.reviewComment ||
            "Access request approved";


        // -------------------------------------------------
        // UPDATE REQUEST
        // -------------------------------------------------

        accessRequest.status =
            "APPROVED";

        accessRequest.reviewedBy =
            req.user._id;

        accessRequest.reviewedAt =
            new Date();

        accessRequest.reviewComment =
            reviewComment;


        await accessRequest.save();


        // -------------------------------------------------
        // AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "ACCESS_REQUEST_APPROVED",

            document:
                accessRequest.document._id,

            case:
                accessRequest.case._id,

            result:
                "SUCCESS",

            ipAddress:
                req.ip || null,

            details:
                `Access request approved for ${accessRequest.requestedBy?.fullName || "officer"}. Permission: ${accessRequest.accessLevel}. Original reason: ${accessRequest.reason}. Review comment: ${reviewComment}`

        });


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        res.status(200).json({

            success: true,

            message:
                "Access request approved successfully",

            accessRequest

        });

    } catch (error) {

        console.error(
            "Approve access request error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while approving access request"

        });

    }

};


// =====================================================
// REJECT ACCESS REQUEST
// =====================================================

const rejectAccessRequest = async (req, res) => {

    try {

        const { id } =
            req.params;


        // -------------------------------------------------
        // FIND REQUEST
        // -------------------------------------------------

        const accessRequest =
            await AccessRequest.findById(id)
                .populate("document")
                .populate("case")
                .populate(
                    "requestedBy",
                    "fullName policeNumber rank"
                );


        if (!accessRequest) {

            return res.status(404).json({

                success: false,

                message:
                    "Access request not found"

            });

        }


        // -------------------------------------------------
        // CHECK STATUS
        // -------------------------------------------------

        if (
            accessRequest.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Request has already been ${accessRequest.status.toLowerCase()}`

            });

        }


        // -------------------------------------------------
        // REVIEW COMMENT
        // -------------------------------------------------

        const reviewComment =
            req.body?.reviewComment ||
            "Access request rejected";


        // -------------------------------------------------
        // UPDATE REQUEST
        // -------------------------------------------------

        accessRequest.status =
            "REJECTED";

        accessRequest.reviewedBy =
            req.user._id;

        accessRequest.reviewedAt =
            new Date();

        accessRequest.reviewComment =
            reviewComment;


        await accessRequest.save();


        // -------------------------------------------------
        // AUDIT LOG
        // -------------------------------------------------

        await createAuditLog({

            user:
                req.user._id,

            action:
                "ACCESS_REQUEST_REJECTED",

            document:
                accessRequest.document._id,

            case:
                accessRequest.case._id,

            result:
                "BLOCKED",

            ipAddress:
                req.ip || null,

            details:
                `Access request rejected for ${accessRequest.requestedBy?.fullName || "officer"}. Permission requested: ${accessRequest.accessLevel}. Original reason: ${accessRequest.reason}. Review comment: ${reviewComment}`

        });


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        res.status(200).json({

            success: true,

            message:
                "Access request rejected successfully",

            accessRequest

        });

    } catch (error) {

        console.error(
            "Reject access request error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while rejecting access request"

        });

    }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createAccessRequest,

    getMyAccessRequests,

    getAllAccessRequests,

    approveAccessRequest,

    rejectAccessRequest

};