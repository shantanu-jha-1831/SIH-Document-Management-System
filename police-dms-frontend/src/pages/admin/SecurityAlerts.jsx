import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    AlertTriangle,
    ShieldAlert,
    Loader2,
    FileWarning
} from "lucide-react";
import api from "../../services/api";

function SecurityAlerts() {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // FETCH SECURITY ALERTS
    // =========================

    const fetchSecurityAlerts = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/audit-logs"
            );

            const logs =
                response.data.logs || [];

            // Only show security-related events
            const securityLogs = logs.filter(
                (log) =>
                    log.action === "DOCUMENT_TAMPERED"
            );

            setAlerts(securityLogs);

        } catch (error) {

            console.error(
                "Error fetching security alerts:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchSecurityAlerts();

    }, []);


    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================
    // GET USER NAME
    // =========================

    const getUserName = (log) => {

        if (log.user?.fullName) {

            return log.user.fullName;

        }

        return "Unknown";

    };


    return (

        <DashboardLayout role="admin">

            {/* =========================
                HEADER
            ========================= */}

            <div className="mb-6">

                <h1 className="text-xl font-semibold">

                    Security Alerts

                </h1>


                <p className="text-sm text-gray-500 mt-1">

                    Review suspicious activities and
                    document security events.

                </p>

            </div>


            {/* =========================
                LOADING
            ========================= */}

            {loading ? (

                <div className="bg-white border border-gray-200 rounded-lg p-10">

                    <div className="flex items-center justify-center gap-2 text-gray-500">

                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        Loading security alerts...

                    </div>

                </div>

            ) : alerts.length === 0 ? (

                /* =========================
                    NO ALERTS
                ========================= */

                <div className="bg-white border border-gray-200 rounded-lg p-10">

                    <div className="flex flex-col items-center justify-center text-center">

                        <ShieldAlert
                            size={36}
                            className="text-gray-300 mb-3"
                        />

                        <h2 className="text-sm font-semibold">

                            No Security Alerts

                        </h2>

                        <p className="text-sm text-gray-500 mt-1">

                            No document tampering events
                            have been detected.

                        </p>

                    </div>

                </div>

            ) : (

                /* =========================
                    ALERT LIST
                ========================= */

                <div className="space-y-4">

                    {alerts.map(
                        (alert, index) => (

                            <div
                                key={
                                    alert._id ||
                                    index
                                }
                                className="bg-white border border-red-200 rounded-lg p-5"
                            >

                                <div className="flex gap-4">

                                    {/* =========================
                                        ICON
                                    ========================= */}

                                    <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center flex-shrink-0">

                                        <ShieldAlert
                                            size={20}
                                            className="text-red-600"
                                        />

                                    </div>


                                    {/* =========================
                                        CONTENT
                                    ========================= */}

                                    <div className="flex-1">

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                            <div className="flex items-center gap-2">

                                                <FileWarning
                                                    size={16}
                                                    className="text-red-600"
                                                />

                                                <h2 className="text-sm font-semibold">

                                                    Document Integrity Violation

                                                </h2>

                                            </div>


                                            <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">

                                                High severity

                                            </span>

                                        </div>


                                        {/* =========================
                                            DESCRIPTION
                                        ========================= */}

                                        <p className="text-sm text-gray-600 mt-2">

                                            A hash mismatch was detected
                                            while verifying a protected
                                            document.

                                        </p>


                                        {/* =========================
                                            DOCUMENT DETAILS
                                        ========================= */}

                                        {alert.document && (

                                            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">

                                                <p className="text-xs text-gray-500">

                                                    Document

                                                </p>

                                                <p className="text-sm font-medium mt-1">

                                                    {
                                                        alert.document.name ||
                                                        "Unknown document"
                                                    }

                                                </p>


                                                <p className="text-xs text-gray-500 mt-1">

                                                    Document ID:{" "}

                                                    {
                                                        alert.document.documentId ||
                                                        "-"
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* =========================
                                            CASE DETAILS
                                        ========================= */}

                                        {alert.case && (

                                            <p className="text-xs text-gray-500 mt-3">

                                                Case:{" "}

                                                <span className="font-medium text-gray-700">

                                                    {
                                                        alert.case.caseId ||
                                                        "-"
                                                    }

                                                </span>

                                            </p>

                                        )}


                                        {/* =========================
                                            AUDIT DETAILS
                                        ========================= */}

                                        {alert.details && (

                                            <p className="text-xs text-gray-500 mt-2">

                                                Details:{" "}

                                                <span className="text-gray-700">

                                                    {
                                                        alert.details
                                                    }

                                                </span>

                                            </p>

                                        )}


                                        {/* =========================
                                            FOOTER
                                        ========================= */}

                                        <div className="flex flex-wrap gap-5 mt-4 text-xs text-gray-500">

                                            <span>

                                                User:{" "}

                                                <span className="text-gray-700">

                                                    {
                                                        getUserName(
                                                            alert
                                                        )
                                                    }

                                                </span>

                                            </span>


                                            <span>

                                                Result:{" "}

                                                <span className="text-red-600 font-medium">

                                                    {
                                                        alert.result ||
                                                        "FAILED"
                                                    }

                                                </span>

                                            </span>


                                            <span>

                                                Detected:{" "}

                                                <span className="text-gray-700">

                                                    {
                                                        formatDate(
                                                            alert.createdAt
                                                        )
                                                    }

                                                </span>

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </DashboardLayout>

    );

}

export default SecurityAlerts;