const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema(
    {
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },

        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        accessLevel: {
            type: String,
            enum: [
                "READ",
                "READ_WRITE"
            ],
            default: "READ"
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING"
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewComment: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const AccessRequest = mongoose.model(
    "AccessRequest",
    accessRequestSchema
);

module.exports = AccessRequest;