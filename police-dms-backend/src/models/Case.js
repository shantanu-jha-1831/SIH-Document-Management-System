const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
    {
        caseId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        firNumber: {
            type: String,
            required: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "ONGOING",
                "COMPLETED",
                "CLOSED"
            ],
            default: "ONGOING"
        },

        leadOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedOfficers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        incidentDate: {
            type: Date,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;