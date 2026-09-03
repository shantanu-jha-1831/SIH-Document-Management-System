import DashboardLayout from "../../components/layout/DashboardLayout";
import { Search, User } from "lucide-react";

function Officers() {

    const officers = [
        {
            name: "Amit Singh",
            badgeNumber: "POL-1008",
            rank: "Inspector",
            department: "Investigation",
            status: "Active"
        },
        {
            name: "Ravi Kumar",
            badgeNumber: "POL-1016",
            rank: "Head Constable",
            department: "Investigation",
            status: "Active"
        },
        {
            name: "Vikram Mehta",
            badgeNumber: "POL-1031",
            rank: "Assistant Sub-Inspector",
            department: "Crime Branch",
            status: "Active"
        },
        {
            name: "Neha Verma",
            badgeNumber: "POL-1045",
            rank: "Sub-Inspector",
            department: "Cyber Crime",
            status: "Active"
        },
        {
            name: "Sanjay Rao",
            badgeNumber: "POL-1052",
            rank: "Constable",
            department: "Investigation",
            status: "Active"
        },
        {
            name: "Priya Sharma",
            badgeNumber: "POL-1061",
            rank: "Sub-Inspector",
            department: "Women's Cell",
            status: "Active"
        }
    ];

    return (
        <DashboardLayout role="officer">

            {/* Page Heading */}
            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    Officers
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    View authorized officers registered with the station.
                </p>

            </div>


            {/* Search and Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <div className="relative w-full sm:w-80">

                    <Search
                        size={17}
                        strokeWidth={1.8}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search officers..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300
                                   rounded-md text-sm outline-none
                                   focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                    />

                </div>


                <div className="text-sm text-gray-500">

                    Total officers:{" "}

                    <span className="font-medium text-gray-900">
                        {officers.length}
                    </span>

                </div>

            </div>


            {/* Officers Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b border-gray-200">

                            <tr>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Officer
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Police Number
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Rank
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Department
                                </th>

                                <th className="text-left px-5 py-3 font-medium text-gray-600">
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {officers.map((officer) => (

                                <tr
                                    key={officer.badgeNumber}
                                    className="border-b border-gray-100 last:border-b-0
                                               hover:bg-gray-50"
                                >

                                    {/* Officer */}
                                    <td className="px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-9 h-9 rounded-full bg-gray-100
                                                            flex items-center justify-center">

                                                <User
                                                    size={17}
                                                    strokeWidth={1.7}
                                                    className="text-gray-600"
                                                />

                                            </div>

                                            <div>

                                                <p className="font-medium text-gray-900">
                                                    {officer.name}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Authorized Officer
                                                </p>

                                            </div>

                                        </div>

                                    </td>


                                    {/* Police Number */}
                                    <td className="px-5 py-4 text-gray-700">
                                        {officer.badgeNumber}
                                    </td>


                                    {/* Rank */}
                                    <td className="px-5 py-4 text-gray-700">
                                        {officer.rank}
                                    </td>


                                    {/* Department */}
                                    <td className="px-5 py-4 text-gray-700">
                                        {officer.department}
                                    </td>


                                    {/* Status */}
                                    <td className="px-5 py-4">

                                        <span className="inline-flex items-center gap-1.5
                                                         px-2.5 py-1 rounded
                                                         text-xs font-medium
                                                         bg-gray-100 text-gray-700">

                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>

                                            {officer.status}

                                        </span>

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

export default Officers;