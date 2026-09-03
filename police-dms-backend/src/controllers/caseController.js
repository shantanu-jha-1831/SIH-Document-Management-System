const Case = require("../models/Case");
const User = require("../models/User");

// ===============================
// CREATE CASE
// ===============================
const createCase = async (req, res) => {
    try {

        const {
            caseId,
            firNumber,
            title,
            description,
            leadOfficer,
            assignedOfficers,
            incidentDate
        } = req.body;

        if (
            !caseId ||
            !firNumber ||
            !title ||
            !description ||
            !leadOfficer ||
            !incidentDate
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Check duplicate Case ID
        const existingCase = await Case.findOne({
            caseId
        });

        if (existingCase) {
            return res.status(400).json({
                success: false,
                message: "Case ID already exists"
            });
        }

        // Check lead officer
        const officer = await User.findOne({
            _id: leadOfficer,
            role: "OFFICER",
            status: "ACTIVE"
        });

        if (!officer) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive lead officer"
            });
        }

        // Check assigned officers
        let validAssignedOfficers = [];

        if (
            assignedOfficers &&
            assignedOfficers.length > 0
        ) {

            validAssignedOfficers =
                await User.find({
                    _id: { $in: assignedOfficers },
                    role: "OFFICER",
                    status: "ACTIVE"
                }).select("_id");
        }

        // Create case
        const newCase = await Case.create({
            caseId,
            firNumber,
            title,
            description,
            status: "ONGOING",
            leadOfficer,
            assignedOfficers:
                validAssignedOfficers.map(
                    officer => officer._id
                ),
            incidentDate,
            createdBy: req.user._id
        });

        // Populate case details
        const populatedCase = await Case.findById(
            newCase._id
        )
            .populate(
                "leadOfficer",
                "fullName policeNumber rank department"
            )
            .populate(
                "assignedOfficers",
                "fullName policeNumber rank department"
            )
            .populate(
                "createdBy",
                "fullName policeNumber"
            );

        res.status(201).json({
            success: true,
            message: "Case created successfully",
            case: populatedCase
        });

    } catch (error) {

        console.error(
            "Create case error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while creating case"
        });
    }
};


// ===============================
// GET ALL CASES
// ===============================
const getAllCases = async (req, res) => {
    try {

        const cases = await Case.find()
            .populate(
                "leadOfficer",
                "fullName policeNumber rank department"
            )
            .populate(
                "assignedOfficers",
                "fullName policeNumber rank department"
            )
            .populate(
                "createdBy",
                "fullName policeNumber"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            cases
        });

    } catch (error) {

        console.error(
            "Get all cases error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while fetching cases"
        });
    }
};


// ===============================
// GET SINGLE CASE
// ===============================
const getCaseById = async (req, res) => {
    try {

        const { id } = req.params;

        const caseData = await Case.findById(id)
            .populate(
                "leadOfficer",
                "fullName policeNumber rank department"
            )
            .populate(
                "assignedOfficers",
                "fullName policeNumber rank department"
            )
            .populate(
                "createdBy",
                "fullName policeNumber"
            );

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        res.status(200).json({
            success: true,
            case: caseData
        });

    } catch (error) {

        console.error(
            "Get case error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while fetching case"
        });
    }
};


// ===============================
// UPDATE CASE STATUS
// ===============================
const updateCaseStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "ONGOING",
            "COMPLETED",
            "CLOSED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid case status"
            });
        }

        const caseData = await Case.findById(id);

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        caseData.status = status;

        await caseData.save();

        res.status(200).json({
            success: true,
            message: "Case status updated successfully",
            case: caseData
        });

    } catch (error) {

        console.error(
            "Update case status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating case status"
        });
    }
};


// ===============================
// DELETE CASE
// ===============================
const deleteCase = async (req, res) => {
    try {

        const { id } = req.params;

        const caseData = await Case.findById(id);

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        await Case.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Case deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete case error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while deleting case"
        });
    }
};


// ===============================
// GET MY CASES
// Lead Officer OR Team Member
// ===============================
const getMyCases = async (req, res) => {
    try {

        const cases = await Case.find({
            $or: [
                {
                    leadOfficer: req.user._id
                },
                {
                    assignedOfficers: req.user._id
                }
            ]
        })
            .populate(
                "leadOfficer",
                "fullName policeNumber rank department"
            )
            .populate(
                "assignedOfficers",
                "fullName policeNumber rank department"
            )
            .populate(
                "createdBy",
                "fullName policeNumber"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            cases
        });

    } catch (error) {

        console.error(
            "Get my cases error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching assigned cases"
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
    createCase,
    getAllCases,
    getCaseById,
    getMyCases,
    updateCaseStatus,
    deleteCase
};