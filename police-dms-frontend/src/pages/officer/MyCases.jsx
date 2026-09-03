import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    FolderOpen,
    CheckCircle,
    Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MyCases() {

    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Cases");

    // ===============================
    // FETCH MY CASES
    // ===============================
    const fetchMyCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/cases/my-cases"
            );

            setCases(response.data.cases || []);

        } catch (error) {

            console.error(
                "Error fetching my cases:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load your cases"
            );

        } finally {

            setLoading(false);

        }
    };

    // ===============================
    // LOAD CASES
    // ===============================
    useEffect(() => {
        fetchMyCases();
    }, []);


    // ===============================
    // FILTER CASES
    // ===============================
    const filteredCases = cases.filter((item) => {

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            item.caseId?.toLowerCase().includes(search) ||
            item.firNumber?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "All Cases" ||
            item.status === statusFilter.toUpperCase();

        return matchesSearch && matchesStatus;
    });


    return (
        <DashboardLayout role="officer">

            {/* Page Heading */}
            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    My Cases
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Cases assigned to you as an investigating officer or team member.
                </p>

            </div>


            {/* Filters */}
            <div className="flex flex-col sm:flex-row
                            sm:items-center sm:justify-between
                            gap-4 mb-5">

                <div className="relative w-full sm:w-80">

                    <Search
                        size={17}
                        strokeWidth={1.8}
                        className="absolute left-3 top-1/2
                                   -translate-y-1/2
                                   text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        className="w-full pl-9 pr-3 py-2.5
                                   border border-gray-300
                                   rounded-md text-sm outline-none
                                   focus:border-gray-500
                                   focus:ring-1
                                   focus:ring-gray-300"
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                    className="px-3 py-2.5
                               border border-gray-300
                               rounded-md text-sm
                               bg-white text-gray-700
                               outline-none
                               focus:border-gray-500
                               focus:ring-1
                               focus:ring-gray-300"
                >

                    <option>All Cases</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Closed</option>

                </select>

            </div>


            {/* Error */}
            {error && (

                <div className="bg-red-50
                                border border-red-200
                                rounded-lg p-4 mb-5">

                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                </div>

            )}


            {/* Cases */}
            <div className="bg-white
                            border border-gray-200
                            rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50
                                         border-b border-gray-200">

                            <tr>

                                <th className="text-left px-5 py-3
                                               font-medium text-gray-600">
                                    Case
                                </th>

                                <th className="text-left px-5 py-3
                                               font-medium text-gray-600">
                                    FIR Number
                                </th>

                                <th className="text-left px-5 py-3
                                               font-medium text-gray-600">
                                    My Role
                                </th>

                                <th className="text-left px-5 py-3
                                               font-medium text-gray-600">
                                    Assigned Date
                                </th>

                                <th className="text-left px-5 py-3
                                               font-medium text-gray-600">
                                    Status
                                </th>

                                <th className="text-right px-5 py-3
                                               font-medium text-gray-600">
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
                                        className="px-5 py-10
                                                   text-center
                                                   text-sm
                                                   text-gray-500"
                                    >
                                        Loading your cases...
                                    </td>

                                </tr>

                            )}


                            {/* Empty */}
                            {!loading &&
                                !error &&
                                filteredCases.length === 0 && (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-5 py-10
                                                   text-center
                                                   text-sm
                                                   text-gray-500"
                                    >
                                        No cases found.
                                    </td>

                                </tr>

                            )}


                            {/* Cases */}
                            {!loading &&
                                filteredCases.map((item) => {

                                    const displayStatus =
                                        item.status === "ONGOING"
                                            ? "Ongoing"
                                            : item.status === "COMPLETED"
                                                ? "Completed"
                                                : "Closed";

                                    const isOngoing =
                                        item.status === "ONGOING";

                                    return (

                                        <tr
                                            key={item._id}
                                            className="border-b
                                                       border-gray-100
                                                       last:border-b-0
                                                       hover:bg-gray-50"
                                        >

                                            {/* Case */}
                                            <td className="px-5 py-4">

                                                <div className="flex
                                                                items-center
                                                                gap-3">

                                                    <div
                                                        className="w-9 h-9
                                                                   rounded-md
                                                                   bg-gray-100
                                                                   flex
                                                                   items-center
                                                                   justify-center"
                                                    >

                                                        {isOngoing ? (

                                                            <FolderOpen
                                                                size={18}
                                                                strokeWidth={1.7}
                                                                className="text-gray-600"
                                                            />

                                                        ) : (

                                                            <CheckCircle
                                                                size={18}
                                                                strokeWidth={1.7}
                                                                className="text-gray-600"
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <p className="font-medium
                                                                      text-gray-900">
                                                            {item.caseId}
                                                        </p>

                                                        <p className="text-xs
                                                                      text-gray-500
                                                                      mt-0.5">
                                                            {item.title}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* FIR */}
                                            <td className="px-5 py-4
                                                           text-gray-700">
                                                {item.firNumber}
                                            </td>


                                            {/* Role */}
                                            <td className="px-5 py-4
                                                           text-gray-700">

                                                {item.leadOfficer?._id ===
                                                item.assignedOfficers?.find(
                                                    officer =>
                                                        officer._id ===
                                                        item.leadOfficer?._id
                                                )?._id
                                                    ? "Investigating Officer"
                                                    : "Team Member"}

                                            </td>


                                            {/* Assigned Date */}
                                            <td className="px-5 py-4
                                                           text-gray-600">

                                                {item.createdAt
                                                    ? new Date(
                                                        item.createdAt
                                                    ).toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric"
                                                        }
                                                    )
                                                    : "N/A"}

                                            </td>


                                            {/* Status */}
                                            <td className="px-5 py-4">

                                                <span
                                                    className="inline-flex
                                                               px-2.5 py-1
                                                               rounded
                                                               text-xs
                                                               font-medium
                                                               bg-gray-100
                                                               text-gray-700"
                                                >
                                                    {displayStatus}
                                                </span>

                                            </td>


                                            {/* Action */}
                                            <td className="px-5 py-4
                                                           text-right">

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/officer/cases/${item._id}`
                                                        )
                                                    }
                                                    className="px-3 py-1.5
                                                               border
                                                               border-gray-300
                                                               rounded-md
                                                               text-xs
                                                               font-medium
                                                               text-gray-700
                                                               hover:bg-gray-100
                                                               transition"
                                                >
                                                    View Case
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                })}

                        </tbody>

                    </table>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default MyCases;