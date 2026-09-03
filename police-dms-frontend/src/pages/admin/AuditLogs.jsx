import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    ShieldCheck,
    ShieldAlert,
    Eye,
    Upload,
    Trash2,
    CheckCircle,
    RefreshCw,
    X
} from "lucide-react";
import api from "../../services/api";

function AuditLogs() {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState("ALL");
    const [selectedLog, setSelectedLog] = useState(null);


    // ===============================
    // FETCH AUDIT LOGS
    // ===============================

    const fetchAuditLogs = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/audit-logs"
            );

            setLogs(
                response.data.logs || []
            );

        } catch (error) {

            console.error(
                "Error fetching audit logs:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load audit logs"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    // ===============================
    // INITIAL LOAD
    // ===============================

    useEffect(() => {

        fetchAuditLogs();

    }, []);


    // ===============================
    // FORMAT TIME
    // ===============================

    const formatTime = (date) => {

        if (!date) {
            return "-";
        }

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


    // ===============================
    // FORMAT ACTION
    // ===============================

    const formatAction = (action) => {

        return action
            ?.replace(
                "DOCUMENT_",
                ""
            )
            .replace(
                "_",
                " "
            )
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase()
            );
    };


    // ===============================
    // ACTION ICON
    // ===============================

    const getActionIcon = (action) => {

        switch (action) {

            case "DOCUMENT_UPLOAD":
                return (
                    <Upload
                        size={14}
                    />
                );

            case "DOCUMENT_VIEW":
                return (
                    <Eye
                        size={14}
                    />
                );

            case "DOCUMENT_VERIFY":
                return (
                    <ShieldCheck
                        size={14}
                    />
                );

            case "DOCUMENT_TAMPERED":
                return (
                    <ShieldAlert
                        size={14}
                    />
                );

            case "DOCUMENT_DELETE":
                return (
                    <Trash2
                        size={14}
                    />
                );

            default:
                return (
                    <ShieldCheck
                        size={14}
                    />
                );
        }
    };


    // ===============================
    // ACTION STYLE
    // ===============================

    const getActionStyle = (action) => {

        switch (action) {

            case "DOCUMENT_TAMPERED":
                return "bg-red-100 text-red-700";

            case "DOCUMENT_DELETE":
                return "bg-red-100 text-red-700";

            case "DOCUMENT_VERIFY":
                return "bg-green-100 text-green-700";

            case "DOCUMENT_UPLOAD":
                return "bg-yellow-100 text-yellow-700";

            case "DOCUMENT_VIEW":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };


    // ===============================
    // RESULT STYLE
    // ===============================

    const getResultStyle = (result) => {

        switch (result) {

            case "SUCCESS":
                return "bg-green-100 text-green-700";

            case "BLOCKED":
                return "bg-red-100 text-red-700";

            case "FAILED":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };


    // ===============================
    // FILTER LOGS
    // ===============================

    const filteredLogs = logs.filter(
        (log) => {

            if (filter === "ALL") {
                return true;
            }

            return log.action === filter;
        }
    );


    // ===============================
    // COUNT ACTIONS
    // ===============================

    const tamperedCount =
        logs.filter(
            (log) =>
                log.action ===
                "DOCUMENT_TAMPERED"
        ).length;

    const verifiedCount =
        logs.filter(
            (log) =>
                log.action ===
                "DOCUMENT_VERIFY"
        ).length;

    const uploadCount =
        logs.filter(
            (log) =>
                log.action ===
                "DOCUMENT_UPLOAD"
        ).length;

    const viewCount =
        logs.filter(
            (log) =>
                log.action ===
                "DOCUMENT_VIEW"
        ).length;


    return (

        <DashboardLayout role="admin">

            {/* ===============================
                HEADER
            =============================== */}

            <div
                className="flex
                           items-center
                           justify-between
                           mb-6"
            >

                <div>

                    <h1
                        className="text-xl
                                   font-semibold"
                    >
                        Audit Logs
                    </h1>

                    <p
                        className="text-sm
                                   text-gray-500
                                   mt-1"
                    >
                        Recorded activities across
                        the document management system.
                    </p>

                </div>


                {/* REFRESH */}

                <button
                    onClick={() =>
                        fetchAuditLogs(true)
                    }
                    disabled={refreshing}
                    className="flex
                               items-center
                               gap-2
                               px-3
                               py-2
                               border
                               border-gray-300
                               rounded-md
                               text-sm
                               hover:bg-gray-50
                               disabled:opacity-50"
                >

                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* ===============================
                SUMMARY CARDS
            =============================== */}

            {!loading && !error && (

                <div
                    className="grid
                               grid-cols-1
                               sm:grid-cols-2
                               lg:grid-cols-4
                               gap-4
                               mb-6"
                >

                    {/* VERIFIED */}

                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <div
                            className="flex
                                       items-center
                                       justify-between"
                        >

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500"
                                >
                                    Verifications
                                </p>

                                <p
                                    className="text-xl
                                               font-semibold
                                               mt-1"
                                >
                                    {verifiedCount}
                                </p>

                            </div>

                            <div
                                className="w-9 h-9
                                           rounded-md
                                           bg-green-100
                                           flex
                                           items-center
                                           justify-center"
                            >

                                <CheckCircle
                                    size={18}
                                    className="text-green-600"
                                />

                            </div>

                        </div>

                    </div>


                    {/* TAMPERED */}

                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <div
                            className="flex
                                       items-center
                                       justify-between"
                        >

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500"
                                >
                                    Tamper Alerts
                                </p>

                                <p
                                    className="text-xl
                                               font-semibold
                                               mt-1
                                               text-red-600"
                                >
                                    {tamperedCount}
                                </p>

                            </div>

                            <div
                                className="w-9 h-9
                                           rounded-md
                                           bg-red-100
                                           flex
                                           items-center
                                           justify-center"
                            >

                                <ShieldAlert
                                    size={18}
                                    className="text-red-600"
                                />

                            </div>

                        </div>

                    </div>


                    {/* UPLOADS */}

                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <div
                            className="flex
                                       items-center
                                       justify-between"
                        >

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500"
                                >
                                    Uploads
                                </p>

                                <p
                                    className="text-xl
                                               font-semibold
                                               mt-1"
                                >
                                    {uploadCount}
                                </p>

                            </div>

                            <div
                                className="w-9 h-9
                                           rounded-md
                                           bg-yellow-100
                                           flex
                                           items-center
                                           justify-center"
                            >

                                <Upload
                                    size={18}
                                    className="text-yellow-600"
                                />

                            </div>

                        </div>

                    </div>


                    {/* VIEWS */}

                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <div
                            className="flex
                                       items-center
                                       justify-between"
                        >

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500"
                                >
                                    Document Views
                                </p>

                                <p
                                    className="text-xl
                                               font-semibold
                                               mt-1"
                                >
                                    {viewCount}
                                </p>

                            </div>

                            <div
                                className="w-9 h-9
                                           rounded-md
                                           bg-blue-100
                                           flex
                                           items-center
                                           justify-center"
                            >

                                <Eye
                                    size={18}
                                    className="text-blue-600"
                                />

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ===============================
                FILTERS
            =============================== */}

            {!loading && !error && (

                <div
                    className="flex
                               flex-wrap
                               gap-2
                               mb-4"
                >

                    {[
                        ["ALL", "All"],
                        [
                            "DOCUMENT_UPLOAD",
                            "Uploads"
                        ],
                        [
                            "DOCUMENT_VIEW",
                            "Views"
                        ],
                        [
                            "DOCUMENT_VERIFY",
                            "Verifications"
                        ],
                        [
                            "DOCUMENT_TAMPERED",
                            "Tampered"
                        ],
                        [
                            "DOCUMENT_DELETE",
                            "Deletions"
                        ]
                    ].map(
                        ([value, label]) => (

                            <button
                                key={value}
                                onClick={() =>
                                    setFilter(value)
                                }
                                className={`px-3
                                    py-1.5
                                    rounded-md
                                    text-xs
                                    border
                                    ${
                                        filter === value
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >

                                {label}

                            </button>

                        )
                    )}

                </div>

            )}


            {/* ===============================
                LOADING
            =============================== */}

            {loading && (

                <div
                    className="bg-white
                               border
                               border-gray-200
                               rounded-lg
                               p-6
                               text-sm
                               text-gray-500"
                >

                    Loading audit logs...

                </div>

            )}


            {/* ===============================
                ERROR
            =============================== */}

            {error && (

                <div
                    className="bg-white
                               border
                               border-red-200
                               rounded-lg
                               p-6
                               text-sm
                               text-red-600"
                >

                    {error}

                </div>

            )}


            {/* ===============================
                TABLE
            =============================== */}

            {!loading && !error && (

                <div
                    className="bg-white
                               border
                               border-gray-200
                               rounded-lg
                               overflow-x-auto"
                >

                    <table
                        className="w-full
                                   text-sm"
                    >

                        <thead
                            className="bg-gray-50
                                       border-b"
                        >

                            <tr>

                                <th
                                    className="text-left
                                               px-5 py-3
                                               whitespace-nowrap"
                                >
                                    Time
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    User
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    Action
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    Document
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    Case
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    IP Address
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    Result
                                </th>

                                <th
                                    className="text-left
                                               px-5 py-3"
                                >
                                    Details
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredLogs.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="px-5
                                                   py-8
                                                   text-center
                                                   text-gray-500"
                                    >

                                        No audit logs found.

                                    </td>

                                </tr>

                            ) : (

                                filteredLogs.map(
                                    (log) => (

                                        <tr
                                            key={log._id}
                                            className={`border-b
                                                border-gray-100
                                                ${
                                                    log.action ===
                                                    "DOCUMENT_TAMPERED"
                                                        ? "bg-red-50/50"
                                                        : ""
                                                }`}
                                        >

                                            {/* TIME */}

                                            <td
                                                className="px-5
                                                           py-4
                                                           text-gray-600
                                                           whitespace-nowrap"
                                            >

                                                {formatTime(
                                                    log.createdAt
                                                )}

                                            </td>


                                            {/* USER */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                <div>

                                                    <p
                                                        className="font-medium"
                                                    >

                                                        {log.user?.fullName ||
                                                            "Unknown"}

                                                    </p>

                                                    <p
                                                        className="text-xs
                                                                   text-gray-500
                                                                   mt-0.5"
                                                    >

                                                        {log.user?.policeNumber ||
                                                            "No police number"}

                                                        {log.user?.rank
                                                            ? ` • ${log.user.rank}`
                                                            : ""}

                                                    </p>

                                                </div>

                                            </td>


                                            {/* ACTION */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                <span
                                                    className={`inline-flex
                                                        items-center
                                                        gap-1.5
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        ${getActionStyle(
                                                            log.action
                                                        )}`}
                                                >

                                                    {getActionIcon(
                                                        log.action
                                                    )}

                                                    {formatAction(
                                                        log.action
                                                    )}

                                                </span>

                                            </td>


                                            {/* DOCUMENT */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                <div>

                                                    <p
                                                        className="font-medium"
                                                    >

                                                        {log.document?.name ||
                                                            "-"}

                                                    </p>

                                                    {log.document?.documentId && (

                                                        <p
                                                            className="text-xs
                                                                       text-gray-500
                                                                       mt-0.5"
                                                        >

                                                            {log.document.documentId}

                                                        </p>

                                                    )}

                                                </div>

                                            </td>


                                            {/* CASE */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                {log.case?.caseId || "-"}

                                            </td>


                                            {/* IP */}

                                            <td
                                                className="px-5
                                                           py-4
                                                           text-gray-600
                                                           font-mono
                                                           text-xs"
                                            >

                                                {log.ipAddress || "-"}

                                            </td>


                                            {/* RESULT */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                <span
                                                    className={`inline-flex
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        ${getResultStyle(
                                                            log.result
                                                        )}`}
                                                >

                                                    {log.result}

                                                </span>

                                            </td>


                                            {/* DETAILS */}

                                            <td
                                                className="px-5
                                                           py-4"
                                            >

                                                <button
                                                    onClick={() =>
                                                        setSelectedLog(
                                                            log
                                                        )
                                                    }
                                                    className="text-xs
                                                               text-gray-700
                                                               underline
                                                               hover:text-black"
                                                >

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            {selectedLog && (

                <div
                    className="fixed
                               inset-0
                               z-50
                               flex
                               items-center
                               justify-center
                               bg-black/50
                               p-4"
                >

                    <div
                        className="bg-white
                                   rounded-xl
                                   shadow-xl
                                   w-full
                                   max-w-lg
                                   max-h-[90vh]
                                   overflow-y-auto"
                    >

                        {/* HEADER */}

                        <div
                            className="flex
                                       items-center
                                       justify-between
                                       border-b
                                       border-gray-200
                                       px-6 py-4"
                        >

                            <div>

                                <h2
                                    className="text-lg
                                               font-semibold"
                                >

                                    Audit Log Details

                                </h2>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mt-1"
                                >

                                    Complete security event information

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedLog(null)
                                }
                                className="p-2
                                           rounded-md
                                           hover:bg-gray-100"
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* CONTENT */}

                        <div className="p-6 space-y-5">

                            {/* ACTION */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Action
                                </p>

                                <span
                                    className={`inline-flex
                                        items-center
                                        gap-1.5
                                        px-2.5
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-medium
                                        ${getActionStyle(
                                            selectedLog.action
                                        )}`}
                                >

                                    {getActionIcon(
                                        selectedLog.action
                                    )}

                                    {formatAction(
                                        selectedLog.action
                                    )}

                                </span>

                            </div>


                            {/* USER */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    User
                                </p>

                                {selectedLog.user ? (

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <p
                                            className="text-sm
                                                       font-medium"
                                        >

                                            {selectedLog.user.fullName ||
                                                "Unknown"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            Police Number:{" "}
                                            {selectedLog.user.policeNumber ||
                                                "Not available"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            Rank:{" "}
                                            {selectedLog.user.rank ||
                                                "Not available"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            Role:{" "}
                                            {selectedLog.user.role ||
                                                "Not available"}

                                        </p>

                                    </div>

                                ) : (

                                    <p
                                        className="text-sm
                                                   text-gray-500"
                                    >

                                        User details not available

                                    </p>

                                )}

                            </div>


                            {/* DOCUMENT */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Document
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {selectedLog.document?.name ||
                                        "Not available"}

                                </p>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mt-1"
                                >

                                    {selectedLog.document?.documentId ||
                                        "Document ID not available"}

                                </p>

                            </div>


                            {/* CASE */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Case
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {selectedLog.case?.caseId ||
                                        "Not available"}

                                </p>

                                {selectedLog.case?.title && (

                                    <p
                                        className="text-xs
                                                   text-gray-500
                                                   mt-1"
                                    >

                                        {selectedLog.case.title}

                                    </p>

                                )}

                            </div>


                            {/* IP + TIME */}

                            <div
                                className="grid
                                           grid-cols-1
                                           md:grid-cols-2
                                           gap-4"
                            >

                                <div
                                    className="border
                                               border-gray-200
                                               rounded-md
                                               p-3"
                                >

                                    <p
                                        className="text-xs
                                                   text-gray-500"
                                    >
                                        IP Address
                                    </p>

                                    <p
                                        className="text-sm
                                                   font-mono
                                                   mt-1"
                                    >

                                        {selectedLog.ipAddress ||
                                            "Not available"}

                                    </p>

                                </div>


                                <div
                                    className="border
                                               border-gray-200
                                               rounded-md
                                               p-3"
                                >

                                    <p
                                        className="text-xs
                                                   text-gray-500"
                                    >
                                        Timestamp
                                    </p>

                                    <p
                                        className="text-sm
                                                   mt-1"
                                    >

                                        {formatTime(
                                            selectedLog.createdAt
                                        )}

                                    </p>

                                </div>

                            </div>


                            {/* RESULT */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Result
                                </p>

                                <span
                                    className={`inline-flex
                                        px-2.5
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-medium
                                        ${getResultStyle(
                                            selectedLog.result
                                        )}`}
                                >

                                    {selectedLog.result ||
                                        "UNKNOWN"}

                                </span>

                            </div>


                            {/* DETAILS */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Details
                                </p>

                                <div
                                    className="bg-gray-50
                                               border
                                               border-gray-200
                                               rounded-md
                                               p-3"
                                >

                                    <p
                                        className="text-sm
                                                   text-gray-700
                                                   leading-6"
                                    >

                                        {selectedLog.details ||
                                            "No additional details available."}

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div
                            className="border-t
                                       border-gray-200
                                       px-6 py-4
                                       flex
                                       justify-end"
                        >

                            <button
                                onClick={() =>
                                    setSelectedLog(null)
                                }
                                className="px-4
                                           py-2
                                           bg-gray-900
                                           text-white
                                           rounded-md
                                           text-sm
                                           hover:bg-gray-800"
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
}

export default AuditLogs;