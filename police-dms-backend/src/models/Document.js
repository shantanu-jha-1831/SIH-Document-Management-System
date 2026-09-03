const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        documentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true
        },

        type: {
            type: String,
            enum: [
                "FIR",
                "WITNESS_STATEMENT",
                "EVIDENCE_REPORT",
                "FORENSIC_REPORT",
                "CHARGE_SHEET",
                "COURT_DOCUMENT",
                "OTHER"
            ],
            required: true
        },

        version: {
            type: Number,
            default: 1
        },

        fileUrl: {
            type: String,
            required: true
        },

        fileHash: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        accessLevel: {
            type: String,
            enum: [
                "RESTRICTED",
                "READ",
                "READ_WRITE"
            ],
            default: "RESTRICTED"
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "PENDING",
                "ARCHIVED"
            ],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Document = mongoose.model(
    "Document",
    documentSchema
);

module.exports = Document;