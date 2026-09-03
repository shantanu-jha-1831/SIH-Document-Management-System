const mongoose = require("mongoose");


const auditLogSchema = new mongoose.Schema(
    {
        // =====================================================
        // USER WHO PERFORMED THE ACTION
        // =====================================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // =====================================================
        // ACTION
        // =====================================================

        action: {
            type: String,

            enum: [

                // Document actions
                "DOCUMENT_VIEW",
                "DOCUMENT_UPLOAD",
                "DOCUMENT_DELETE",
                "DOCUMENT_VERIFY",
                "DOCUMENT_TAMPERED",

                // Access request actions
                "ACCESS_REQUEST_CREATED",
                "ACCESS_REQUEST_APPROVED",
                "ACCESS_REQUEST_REJECTED"

            ],

            required: true
        },


        // =====================================================
        // DOCUMENT
        // =====================================================

        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            default: null
        },


        // =====================================================
        // CASE
        // =====================================================

        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            default: null
        },


        // =====================================================
        // RESULT
        // =====================================================

        result: {
            type: String,

            enum: [
                "SUCCESS",
                "BLOCKED",
                "FAILED"
            ],

            default: "SUCCESS"
        },


        // =====================================================
        // IP ADDRESS
        // =====================================================

        ipAddress: {
            type: String,
            default: null
        },


        // =====================================================
        // DETAILS
        // =====================================================

        details: {
            type: String,
            default: ""
        }

    },

    {
        timestamps: true
    }
);


const AuditLog = mongoose.model(
    "AuditLog",
    auditLogSchema
);


module.exports = AuditLog;