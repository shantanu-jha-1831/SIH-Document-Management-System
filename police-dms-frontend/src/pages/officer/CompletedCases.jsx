import DashboardLayout from "../../components/layout/DashboardLayout";
import { CheckCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CompletedCases() {

    const navigate = useNavigate();

    const cases = [
        {
            caseId: "CASE-2026-0024",
            firNumber: "FIR-2026-0112",
            title: "Investigation of burglary complaint",
            leadOfficer: "Rahul Sharma",
            completedDate: "22 July 2026",
            documents: 9,
            teamMembers: 4
        },
        {
            caseId: "CASE-2026-0019",
            firNumber: "FIR-2026-0098",
            title: "Mobile phone theft investigation",
            leadOfficer: "Amit Singh",
            completedDate: "14 July 2026",
            documents: 6,
            teamMembers: 3
        },
        {
            caseId: "CASE-2026-0011",
            firNumber: "FIR-2026-0064",
            title: "Investigation of public property damage",
            leadOfficer: "Rahul Sharma",
            completedDate: "28 June 2026",
            documents: 7,
            teamMembers: 5
        }
    ];

    return (
        <DashboardLayout role="officer">

            {/* Page Heading */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Completed Cases
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Cases whose investigations have been completed.
                </p>
            </div>


            {/* Search and Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <div className="relative w-full sm:w-80">

                    <Search
                        size={17}
                        strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search cases..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300
                                   rounded-md text-sm outline-none
                                   focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                    />

                </div>

                <div className="text-sm text-gray-500">
                    Total completed cases:{" "}
                    <span className="font-medium text-gray-900">
                        {cases.length}
                    </span>
                </div>

            </div>


            {/* Cases Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b border-gray-200">

                            <tr>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Case
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    FIR Number
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Lead Officer
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Completed Date
                                </th>

                                <th className="text-center px-5 py-3 font-medium text-gray-600">
                                    Documents
                                </th>

                                <th className="text-center px-5 py-3 font-medium text-gray-600">
                                    Team
                                </th>

                                <th className="text-right px-5 py-3 font-medium text-gray-600">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {cases.map((item) => (

                                <tr
                                    key={item.caseId}
                                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                >

                                    {/* Case */}
                                    <td className="px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center">
                                                <CheckCircle
                                                    size={18}
                                                    strokeWidth={1.7}
                                                    className="text-gray-600"
                                                />
                                            </div>

                                            <div>

                                                <p className="font-medium text-gray-900">
                                                    {item.caseId}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.title}
                                                </p>

                                            </div>

                                        </div>

                                    </td>


                                    {/* FIR */}
                                    <td className="px-5 py-4 text-gray-700">
                                        {item.firNumber}
                                    </td>


                                    {/* Lead Officer */}
                                    <td className="px-5 py-4 text-gray-700">
                                        {item.leadOfficer}
                                    </td>


                                    {/* Completed Date */}
                                    <td className="px-5 py-4 text-gray-600">
                                        {item.completedDate}
                                    </td>


                                    {/* Documents */}
                                    <td className="px-5 py-4 text-center text-gray-700">
                                        {item.documents}
                                    </td>


                                    {/* Team */}
                                    <td className="px-5 py-4 text-center text-gray-700">
                                        {item.teamMembers}
                                    </td>


                                    {/* Action */}
                                    <td className="px-5 py-4 text-right">

                                        <button
                                            onClick={() => navigate(`/officer/cases/${item.caseId}`)}
                                            className="px-3 py-1.5 border border-gray-300
                                                    rounded-md text-xs font-medium
                                                    text-gray-700
                                                    hover:bg-gray-100 transition"
                                        >
                                            View Case
                                        </button>
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

export default CompletedCases;