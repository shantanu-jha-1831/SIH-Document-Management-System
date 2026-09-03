import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    Check,
    X,
    RefreshCw,
    ShieldCheck,
    ShieldAlert,
    Clock,
    User,
    FileText
} from "lucide-react";
import api from "../../services/api";

function AccessRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const [selectedRequest, setSelectedRequest] =
        useState(null);


    // ===============================
    // FETCH REQUESTS
    // ===============================

    const fetchRequests = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/access-requests"
            );

            setRequests(
                response.data.requests || []
            );

        } catch (error) {

            console.error(
                "Error fetching access requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load access requests"
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

        fetchRequests();

    }, []);


    // ===============================
    // APPROVE REQUEST
    // ===============================

    const approveRequest = async (requestId) => {

        const confirmed = window.confirm(
            "Are you sure you want to approve this access request?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setProcessingId(requestId);

            await api.put(
                `/access-requests/${requestId}/approve`
            );

            await fetchRequests();

            setSelectedRequest(null);

        } catch (error) {

            console.error(
                "Approve request error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to approve access request"
            );

        } finally {

            setProcessingId(null);

        }
    };


    // ===============================
    // REJECT REQUEST
    // ===============================

    const rejectRequest = async (requestId) => {

        const confirmed = window.confirm(
            "Are you sure you want to reject this access request?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setProcessingId(requestId);

            await api.put(
                `/access-requests/${requestId}/reject`,
                {
                    reviewComment:
                        "Access request rejected by administrator."
                }
            );

            await fetchRequests();

            setSelectedRequest(null);

        } catch (error) {

            console.error(
                "Reject request error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to reject access request"
            );

        } finally {

            setProcessingId(null);

        }
    };


    // ===============================
    // FORMAT PERMISSION
    // ===============================

    const formatPermission = (accessLevel) => {

        if (accessLevel === "READ_WRITE") {
            return "Read + Write";
        }

        return "Read Only";
    };


    // ===============================
    // FORMAT STATUS
    // ===============================

    const formatStatus = (status) => {

        if (status === "APPROVED") {
            return "Approved";
        }

        if (status === "REJECTED") {
            return "Rejected";
        }

        return "Pending";
    };


    // ===============================
    // FORMAT DATE
    // ===============================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
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
    // STATUS STYLE
    // ===============================

    const getStatusStyle = (status) => {

        if (status === "APPROVED") {
            return "bg-green-100 text-green-700";
        }

        if (status === "REJECTED") {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };


    // ===============================
    // STATUS ICON
    // ===============================

    const getStatusIcon = (status) => {

        if (status === "APPROVED") {
            return (
                <ShieldCheck size={13} />
            );
        }

        if (status === "REJECTED") {
            return (
                <ShieldAlert size={13} />
            );
        }

        return (
            <Clock size={13} />
        );
    };


    // ===============================
    // COUNTS
    // ===============================

    const pendingCount =
        requests.filter(
            (request) =>
                request.status === "PENDING"
        ).length;

    const approvedCount =
        requests.filter(
            (request) =>
                request.status === "APPROVED"
        ).length;

    const rejectedCount =
        requests.filter(
            (request) =>
                request.status === "REJECTED"
        ).length;


    return (

        <DashboardLayout role="admin">

            {/* ===============================
                HEADER
            =============================== */}

            <div
                className="flex
                           items-start
                           justify-between
                           gap-4
                           mb-6"
            >

                <div>

                    <h1
                        className="text-xl
                                   font-semibold"
                    >
                        Access Requests
                    </h1>

                    <p
                        className="text-sm
                                   text-gray-500
                                   mt-1"
                    >
                        Review requests for protected
                        document access.
                    </p>

                </div>


                {/* REFRESH */}

                <button
                    onClick={() =>
                        fetchRequests(true)
                    }
                    disabled={refreshing}
                    className="inline-flex
                               items-center
                               gap-2
                               px-3
                               py-2
                               border
                               border-gray-300
                               rounded-md
                               text-xs
                               hover:bg-gray-50
                               disabled:opacity-50"
                >

                    <RefreshCw
                        size={14}
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
                SUMMARY
            =============================== */}

            {!loading && !error && (

                <div
                    className="grid
                               grid-cols-1
                               md:grid-cols-3
                               gap-4
                               mb-6"
                >

                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <p
                            className="text-xs
                                       text-gray-500"
                        >
                            Pending Requests
                        </p>

                        <p
                            className="text-xl
                                       font-semibold
                                       mt-1"
                        >
                            {pendingCount}
                        </p>

                    </div>


                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <p
                            className="text-xs
                                       text-gray-500"
                        >
                            Approved
                        </p>

                        <p
                            className="text-xl
                                       font-semibold
                                       text-green-600
                                       mt-1"
                        >
                            {approvedCount}
                        </p>

                    </div>


                    <div
                        className="bg-white
                                   border
                                   border-gray-200
                                   rounded-lg
                                   p-4"
                    >

                        <p
                            className="text-xs
                                       text-gray-500"
                        >
                            Rejected
                        </p>

                        <p
                            className="text-xl
                                       font-semibold
                                       text-red-600
                                       mt-1"
                        >
                            {rejectedCount}
                        </p>

                    </div>

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

                    Loading access requests...

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
                REQUEST LIST
            =============================== */}

            {!loading &&
                !error && (

                <div className="space-y-4">

                    {requests.length === 0 ? (

                        <div
                            className="bg-white
                                       border
                                       border-gray-200
                                       rounded-lg
                                       p-8
                                       text-center
                                       text-sm
                                       text-gray-500"
                        >

                            No access requests found.

                        </div>

                    ) : (

                        requests.map(
                            (request) => (

                                <div
                                    key={request._id}
                                    className={`bg-white
                                        border
                                        rounded-lg
                                        p-5
                                        ${
                                            request.status ===
                                            "PENDING"
                                                ? "border-yellow-200"
                                                : "border-gray-200"
                                        }`}
                                >

                                    <div
                                        className="flex
                                                   flex-col
                                                   lg:flex-row
                                                   lg:items-center
                                                   lg:justify-between
                                                   gap-5"
                                    >

                                        {/* REQUEST INFO */}

                                        <div className="min-w-0">

                                            <p
                                                className="text-xs
                                                           text-gray-500"
                                            >

                                                Request #
                                                {request._id
                                                    .slice(-6)
                                                    .toUpperCase()}

                                            </p>


                                            <div
                                                className="flex
                                                           items-center
                                                           gap-2
                                                           mt-1"
                                            >

                                                <FileText
                                                    size={16}
                                                    className="text-gray-500"
                                                />

                                                <h2
                                                    className="text-sm
                                                               font-semibold"
                                                >

                                                    {request.document?.name ||
                                                        "Unknown document"}

                                                </h2>

                                            </div>


                                            {/* DOCUMENT ID */}

                                            <p
                                                className="text-xs
                                                           text-gray-500
                                                           mt-1"
                                            >

                                                Document:{" "}
                                                {request.document?.documentId ||
                                                    "Not available"}

                                            </p>


                                            {/* CASE */}

                                            <p
                                                className="text-xs
                                                           text-gray-500
                                                           mt-1"
                                            >

                                                Case:{" "}
                                                {request.case?.caseId ||
                                                    "-"}{" "}

                                                {request.case?.title
                                                    ? `• ${request.case.title}`
                                                    : ""}

                                            </p>


                                            {/* USER */}

                                            <div
                                                className="flex
                                                           items-center
                                                           gap-2
                                                           mt-3"
                                            >

                                                <User
                                                    size={14}
                                                    className="text-gray-400"
                                                />

                                                <p
                                                    className="text-sm
                                                               text-gray-600"
                                                >

                                                    Requested by{" "}

                                                    <span
                                                        className="font-medium
                                                                   text-gray-900"
                                                    >

                                                        {request.requestedBy?.fullName ||
                                                            "Unknown officer"}

                                                    </span>

                                                </p>

                                            </div>


                                            {/* USER DETAILS */}

                                            <p
                                                className="text-xs
                                                           text-gray-500
                                                           mt-1
                                                           ml-6"
                                            >

                                                {request.requestedBy?.policeNumber ||
                                                    "No police number"}

                                                {request.requestedBy?.rank
                                                    ? ` • ${request.requestedBy.rank}`
                                                    : ""}

                                                {request.requestedBy?.role
                                                    ? ` • ${request.requestedBy.role}`
                                                    : ""}

                                            </p>


                                            {/* PERMISSION */}

                                            <p
                                                className="text-sm
                                                           text-gray-600
                                                           mt-3"
                                            >

                                                Permission:{" "}

                                                <span
                                                    className="font-medium
                                                               text-gray-900"
                                                >

                                                    {formatPermission(
                                                        request.accessLevel
                                                    )}

                                                </span>

                                            </p>


                                            {/* REASON */}

                                            <p
                                                className="text-sm
                                                           text-gray-600
                                                           mt-2"
                                            >

                                                Reason:{" "}

                                                {request.reason}

                                            </p>


                                            {/* REQUEST DATE */}

                                            <p
                                                className="text-xs
                                                           text-gray-500
                                                           mt-2"
                                            >

                                                Requested:{" "}

                                                {formatDate(
                                                    request.createdAt
                                                )}

                                            </p>


                                            {/* STATUS */}

                                            <div className="mt-3">

                                                <span
                                                    className={`inline-flex
                                                        items-center
                                                        gap-1.5
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-medium
                                                        ${getStatusStyle(
                                                            request.status
                                                        )}`}
                                                >

                                                    {getStatusIcon(
                                                        request.status
                                                    )}

                                                    {formatStatus(
                                                        request.status
                                                    )}

                                                </span>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            className="flex
                                                       items-center
                                                       gap-2
                                                       flex-shrink-0"
                                        >

                                            <button
                                                onClick={() =>
                                                    setSelectedRequest(
                                                        request
                                                    )
                                                }
                                                className="px-3
                                                           py-2
                                                           border
                                                           border-gray-300
                                                           rounded-md
                                                           text-xs
                                                           hover:bg-gray-50"
                                            >

                                                Review Details

                                            </button>


                                            {request.status ===
                                                "PENDING" && (

                                                <>

                                                    <button
                                                        onClick={() =>
                                                            approveRequest(
                                                                request._id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            request._id
                                                        }
                                                        className="inline-flex
                                                                   items-center
                                                                   gap-1.5
                                                                   px-3
                                                                   py-2
                                                                   bg-gray-900
                                                                   text-white
                                                                   rounded-md
                                                                   text-xs
                                                                   disabled:opacity-50"
                                                    >

                                                        <Check
                                                            size={14}
                                                        />

                                                        {processingId ===
                                                        request._id
                                                            ? "Processing..."
                                                            : "Approve"}

                                                    </button>


                                                    <button
                                                        onClick={() =>
                                                            rejectRequest(
                                                                request._id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            request._id
                                                        }
                                                        className="inline-flex
                                                                   items-center
                                                                   gap-1.5
                                                                   px-3
                                                                   py-2
                                                                   border
                                                                   border-gray-300
                                                                   rounded-md
                                                                   text-xs
                                                                   disabled:opacity-50"
                                                    >

                                                        <X
                                                            size={14}
                                                        />

                                                        Reject

                                                    </button>

                                                </>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            )}


            {/* =====================================================
                REVIEW DETAILS MODAL
            ===================================================== */}

            {selectedRequest && (

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
                                       px-6
                                       py-4"
                        >

                            <div>

                                <h2
                                    className="text-lg
                                               font-semibold"
                                >
                                    Access Request Details
                                </h2>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mt-1"
                                >

                                    Review protected document access

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedRequest(null)
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

                            {/* STATUS */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Status
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
                                        ${getStatusStyle(
                                            selectedRequest.status
                                        )}`}
                                >

                                    {getStatusIcon(
                                        selectedRequest.status
                                    )}

                                    {formatStatus(
                                        selectedRequest.status
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
                                    Requesting Officer
                                </p>

                                {selectedRequest.requestedBy ? (

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-4"
                                    >

                                        <p
                                            className="text-sm
                                                       font-semibold"
                                        >

                                            {selectedRequest.requestedBy.fullName ||
                                                "Unknown"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-2"
                                        >

                                            Police Number:{" "}

                                            {selectedRequest.requestedBy.policeNumber ||
                                                "Not available"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            Rank:{" "}

                                            {selectedRequest.requestedBy.rank ||
                                                "Not available"}

                                        </p>

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            Role:{" "}

                                            {selectedRequest.requestedBy.role ||
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

                                <div
                                    className="border
                                               border-gray-200
                                               rounded-md
                                               p-4"
                                >

                                    <p
                                        className="text-sm
                                                   font-medium"
                                    >

                                        {selectedRequest.document?.name ||
                                            "Unknown document"}

                                    </p>

                                    <p
                                        className="text-xs
                                                   text-gray-500
                                                   mt-1"
                                    >

                                        ID:{" "}

                                        {selectedRequest.document?.documentId ||
                                            "Not available"}

                                    </p>

                                </div>

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

                                <div
                                    className="border
                                               border-gray-200
                                               rounded-md
                                               p-4"
                                >

                                    <p
                                        className="text-sm
                                                   font-medium"
                                    >

                                        {selectedRequest.case?.caseId ||
                                            "Not available"}

                                    </p>

                                    {selectedRequest.case?.title && (

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mt-1"
                                        >

                                            {selectedRequest.case.title}

                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* PERMISSION */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Requested Permission
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {formatPermission(
                                        selectedRequest.accessLevel
                                    )}

                                </p>

                            </div>


                            {/* REASON */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mb-2"
                                >
                                    Reason
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

                                        {selectedRequest.reason ||
                                            "No reason provided."}

                                    </p>

                                </div>

                            </div>


                            {/* DATES */}

                            <div
                                className="grid
                                           grid-cols-1
                                           md:grid-cols-2
                                           gap-4"
                            >

                                <div>

                                    <p
                                        className="text-xs
                                                   text-gray-500"
                                    >
                                        Requested At
                                    </p>

                                    <p
                                        className="text-sm
                                                   mt-1"
                                    >

                                        {formatDate(
                                            selectedRequest.createdAt
                                        )}

                                    </p>

                                </div>


                                <div>

                                    <p
                                        className="text-xs
                                                   text-gray-500"
                                    >
                                        Reviewed At
                                    </p>

                                    <p
                                        className="text-sm
                                                   mt-1"
                                    >

                                        {formatDate(
                                            selectedRequest.reviewedAt
                                        )}

                                    </p>

                                </div>

                            </div>


                            {/* REVIEW COMMENT */}

                            {selectedRequest.status !==
                                "PENDING" && (

                                <div>

                                    <p
                                        className="text-xs
                                                   text-gray-500
                                                   mb-2"
                                    >
                                        Review Comment
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
                                                       text-gray-700"
                                        >

                                            {selectedRequest.reviewComment ||
                                                "No review comment available."}

                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* FOOTER */}

                        <div
                            className="border-t
                                       border-gray-200
                                       px-6
                                       py-4
                                       flex
                                       justify-end
                                       gap-2"
                        >

                            {selectedRequest.status ===
                                "PENDING" && (

                                <>

                                    <button
                                        onClick={() =>
                                            rejectRequest(
                                                selectedRequest._id
                                            )
                                        }
                                        disabled={
                                            processingId ===
                                            selectedRequest._id
                                        }
                                        className="inline-flex
                                                   items-center
                                                   gap-1.5
                                                   px-3
                                                   py-2
                                                   border
                                                   border-gray-300
                                                   rounded-md
                                                   text-xs
                                                   disabled:opacity-50"
                                    >

                                        <X size={14} />

                                        Reject

                                    </button>


                                    <button
                                        onClick={() =>
                                            approveRequest(
                                                selectedRequest._id
                                            )
                                        }
                                        disabled={
                                            processingId ===
                                            selectedRequest._id
                                        }
                                        className="inline-flex
                                                   items-center
                                                   gap-1.5
                                                   px-3
                                                   py-2
                                                   bg-gray-900
                                                   text-white
                                                   rounded-md
                                                   text-xs
                                                   disabled:opacity-50"
                                    >

                                        <Check size={14} />

                                        Approve

                                    </button>

                                </>

                            )}


                            <button
                                onClick={() =>
                                    setSelectedRequest(null)
                                }
                                className="px-3
                                           py-2
                                           border
                                           border-gray-300
                                           rounded-md
                                           text-xs
                                           hover:bg-gray-50"
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

export default AccessRequests;