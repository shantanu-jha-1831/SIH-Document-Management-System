const User = require("../models/User");

// ===============================
// GET PENDING OFFICER REQUESTS
// ===============================
const getPendingOfficers = async (req, res) => {
    try {

        const officers = await User.find({
            role: "OFFICER",
            status: "PENDING"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            officers
        });

    } catch (error) {

        console.error(
            "Get pending officers error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching officer requests"
        });
    }
};


// ===============================
// APPROVE OFFICER
// ===============================
const approveOfficer = async (req, res) => {
    try {

        const { id } = req.params;

        const officer = await User.findOne({
            _id: id,
            role: "OFFICER"
        });

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Officer not found"
            });
        }

        if (officer.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "This officer request has already been processed"
            });
        }

        officer.status = "ACTIVE";

        await officer.save();

        res.status(200).json({
            success: true,
            message: "Officer approved successfully",
            officer: {
                id: officer._id,
                fullName: officer.fullName,
                policeNumber: officer.policeNumber,
                rank: officer.rank,
                department: officer.department,
                email: officer.email,
                mobile: officer.mobile,
                role: officer.role,
                status: officer.status
            }
        });

    } catch (error) {

        console.error(
            "Approve officer error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while approving officer"
        });
    }
};


// ===============================
// REJECT OFFICER
// ===============================
const rejectOfficer = async (req, res) => {
    try {

        const { id } = req.params;

        const officer = await User.findOne({
            _id: id,
            role: "OFFICER"
        });

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Officer not found"
            });
        }

        if (officer.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "This officer request has already been processed"
            });
        }

        officer.status = "REJECTED";

        await officer.save();

        res.status(200).json({
            success: true,
            message:
                "Officer request rejected successfully",
            officer: {
                id: officer._id,
                fullName: officer.fullName,
                policeNumber: officer.policeNumber,
                rank: officer.rank,
                department: officer.department,
                email: officer.email,
                mobile: officer.mobile,
                role: officer.role,
                status: officer.status
            }
        });

    } catch (error) {

        console.error(
            "Reject officer error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while rejecting officer"
        });
    }
};


// ===============================
// GET ALL OFFICERS
// ===============================
const getAllOfficers = async (req, res) => {
    try {

        const officers = await User.find({
            role: "OFFICER"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            officers
        });

    } catch (error) {

        console.error(
            "Get all officers error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching officers"
        });
    }
};


// ===============================
// GET ADMIN DASHBOARD STATISTICS
// ===============================
const getDashboardStats = async (req, res) => {
    try {

        // Count ACTIVE officers
        const registeredOfficers =
            await User.countDocuments({
                role: "OFFICER",
                status: "ACTIVE"
            });


        // Count PENDING officer registrations
        const pendingOfficerRequests =
            await User.countDocuments({
                role: "OFFICER",
                status: "PENDING"
            });


        res.status(200).json({
            success: true,

            stats: {
                registeredOfficers,

                // These modules will be connected
                // when Cases, Documents and Alerts
                // are implemented.
                ongoingCases: 0,
                protectedDocuments: 0,
                securityAlerts: 0,

                pendingOfficerRequests,

                // Document access requests
                // will be connected later.
                pendingDocumentRequests: 0
            }
        });

    } catch (error) {

        console.error(
            "Get dashboard statistics error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching dashboard statistics"
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
    getPendingOfficers,
    approveOfficer,
    rejectOfficer,
    getAllOfficers,
    getDashboardStats
};