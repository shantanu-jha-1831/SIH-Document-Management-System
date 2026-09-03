import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Check, X } from "lucide-react";
import api from "../../services/api";

function OfficerRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");


    // ===============================
    // FETCH PENDING OFFICER REQUESTS
    // ===============================
    const fetchRequests = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/officers/pending"
            );

            setRequests(response.data.officers);

        } catch (error) {

            console.error(
                "Error fetching officer requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load officer requests"
            );

        } finally {

            setLoading(false);

        }
    };


    // ===============================
    // LOAD REQUESTS WHEN PAGE OPENS
    // ===============================
    useEffect(() => {

        fetchRequests();

    }, []);


    // ===============================
    // APPROVE OFFICER
    // ===============================
    const handleApprove = async (id) => {

        try {

            setProcessingId(id);

            await api.put(
                `/admin/officers/${id}/approve`
            );

            // Remove approved officer from the list
            setRequests((currentRequests) =>
                currentRequests.filter(
                    (request) => request._id !== id
                )
            );

        } catch (error) {

            console.error(
                "Error approving officer:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to approve officer"
            );

        } finally {

            setProcessingId(null);

        }
    };


    // ===============================
    // REJECT OFFICER
    // ===============================
    const handleReject = async (id) => {

        try {

            setProcessingId(id);

            await api.put(
                `/admin/officers/${id}/reject`
            );

            // Remove rejected officer from the list
            setRequests((currentRequests) =>
                currentRequests.filter(
                    (request) => request._id !== id
                )
            );

        } catch (error) {

            console.error(
                "Error rejecting officer:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to reject officer"
            );

        } finally {

            setProcessingId(null);

        }
    };


    return (
        <DashboardLayout role="admin">

            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    Officer Requests
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Review and approve new officer registration requests.
                </p>

            </div>


            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b">

                            <tr>

                                <th className="text-left px-5 py-3">
                                    Officer
                                </th>

                                <th className="text-left px-5 py-3">
                                    Police Number
                                </th>

                                <th className="text-left px-5 py-3">
                                    Rank
                                </th>

                                <th className="text-left px-5 py-3">
                                    Department
                                </th>

                                <th className="text-left px-5 py-3">
                                    Requested
                                </th>

                                <th className="text-right px-5 py-3">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {/* Loading */}
                            {loading && (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-5 py-10 text-center text-gray-500"
                                    >
                                        Loading officer requests...
                                    </td>

                                </tr>

                            )}


                            {/* Error */}
                            {!loading && error && (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-5 py-10 text-center text-red-500"
                                    >
                                        {error}
                                    </td>

                                </tr>

                            )}


                            {/* No requests */}
                            {!loading &&
                                !error &&
                                requests.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            No pending officer requests.
                                        </td>

                                    </tr>

                                )}


                            {/* Requests */}
                            {!loading &&
                                !error &&
                                requests.map((request) => (

                                    <tr
                                        key={request._id}
                                        className="border-b border-gray-100 last:border-0"
                                    >

                                        <td className="px-5 py-4">

                                            <p className="font-medium text-gray-900">
                                                {request.fullName}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {request._id}
                                            </p>

                                        </td>


                                        <td className="px-5 py-4">
                                            {request.policeNumber}
                                        </td>


                                        <td className="px-5 py-4">
                                            {request.rank}
                                        </td>


                                        <td className="px-5 py-4">
                                            {request.department}
                                        </td>


                                        <td className="px-5 py-4 text-gray-600">

                                            {request.createdAt
                                                ? new Date(
                                                    request.createdAt
                                                ).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric"
                                                    }
                                                )
                                                : "-"
                                            }

                                        </td>


                                        <td className="px-5 py-4">

                                            <div className="flex justify-end gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleApprove(
                                                            request._id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        request._id
                                                    }
                                                    className="inline-flex items-center gap-1.5
                                                               px-3 py-1.5 bg-gray-900
                                                               text-white rounded-md
                                                               text-xs disabled:opacity-50
                                                               disabled:cursor-not-allowed"
                                                >

                                                    <Check size={14} />

                                                    {processingId === request._id
                                                        ? "Processing..."
                                                        : "Approve"
                                                    }

                                                </button>


                                                <button
                                                    onClick={() =>
                                                        handleReject(
                                                            request._id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        request._id
                                                    }
                                                    className="inline-flex items-center gap-1.5
                                                               px-3 py-1.5 border
                                                               border-gray-300 rounded-md
                                                               text-xs text-gray-700
                                                               disabled:opacity-50
                                                               disabled:cursor-not-allowed"
                                                >

                                                    <X size={14} />

                                                    Reject

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default OfficerRequests;

