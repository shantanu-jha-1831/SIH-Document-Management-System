const AuditLog = require("../models/AuditLog");


// =====================================================
// GET ALL AUDIT LOGS
// =====================================================

const getAuditLogs = async (req, res) => {

    try {

        const logs =
            await AuditLog.find()

                .populate(
                    "user",
                    "fullName policeNumber rank role department"
                )

                .populate(
                    "document",
                    "documentId name type version"
                )

                .populate(
                    "case",
                    "caseId title firNumber"
                )

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            logs

        });

    } catch (error) {

        console.error(
            "Get audit logs error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while fetching audit logs"

        });

    }

};


// =====================================================
// CREATE AUDIT LOG
// =====================================================

const createAuditLog = async ({
    user,
    action,
    document = null,
    case: caseId = null,
    result = "SUCCESS",
    ipAddress = null,
    details = ""
}) => {

    try {

        const auditLog =
            await AuditLog.create({

                user,

                action,

                document,

                case: caseId,

                result,

                ipAddress,

                details

            });


        /*
         * Return the created audit record.
         *
         * This is useful when we need the exact
         * database timestamp later.
         */

        return auditLog;

    } catch (error) {

        console.error(
            "Create audit log error:",
            error
        );


        return null;

    }

};


module.exports = {

    getAuditLogs,

    createAuditLog

};