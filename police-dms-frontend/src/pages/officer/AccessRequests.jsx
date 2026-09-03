import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import api from "../../services/api";

function AccessRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchRequests = async () => {
            try {

                const response = await api.get(
                    "/access-requests/my-requests"
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

            }
        };

        fetchRequests();

    }, []);


    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const formatPermission = (accessLevel) => {

        if (accessLevel === "READ_WRITE") {
            return "Read + Write";
        }

        return "Read Only";
    };


    return (
        <DashboardLayout role="officer">

            <div className="mb-6">

                <h1 className="text-2xl font-semibold text-gray-900">
                    Access Requests
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Track your requests for restricted case documents.
                </p>

            </div>


            {loading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
                    Loading access requests...
                </div>
            )}


            {error && (
                <div className="bg-white border border-red-200 rounded-lg p-6 text-sm text-red-600">
                    {error}
                </div>
            )}


            {!loading && !error && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                    <div className="px-5 py-4 border-b border-gray-200">

                        <h2 className="font-semibold text-gray-900">
                            My Document Requests
                        </h2>

                    </div>


                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Request ID
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Document
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Case
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Permission
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Requested
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-gray-600">
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {requests.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="px-5 py-8 text-center text-gray-500"
                                        >
                                            No access requests found.
                                        </td>

                                    </tr>

                                ) : (

                                    requests.map((request) => (

                                        <tr
                                            key={request._id}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {request._id.slice(-6).toUpperCase()}
                                            </td>


                                            <td className="px-5 py-4 text-gray-700">
                                                {request.document?.name || "-"}
                                            </td>


                                            <td className="px-5 py-4 text-gray-600">
                                                {request.case?.caseId || "-"}
                                            </td>


                                            <td className="px-5 py-4 text-gray-600">
                                                {formatPermission(
                                                    request.accessLevel
                                                )}
                                            </td>


                                            <td className="px-5 py-4 text-gray-600">
                                                {formatDate(
                                                    request.createdAt
                                                )}
                                            </td>


                                            <td className="px-5 py-4">

                                                {request.status === "PENDING" && (

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">

                                                        <Clock size={14} />

                                                        Pending

                                                    </span>

                                                )}


                                                {request.status === "APPROVED" && (

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">

                                                        <CheckCircle size={14} />

                                                        Approved

                                                    </span>

                                                )}


                                                {request.status === "REJECTED" && (

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">

                                                        <XCircle size={14} />

                                                        Rejected

                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </DashboardLayout>
    );
}

export default AccessRequests;
