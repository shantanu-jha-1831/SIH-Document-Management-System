const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        policeNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        rank: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["OFFICER", "ADMIN"],
            default: "OFFICER"
        },

        status: {
            type: String,
            enum: ["PENDING", "ACTIVE", "REJECTED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;