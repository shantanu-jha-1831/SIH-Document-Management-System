import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    FolderOpen,
    CheckCircle,
    FileText,
    Users
} from "lucide-react";

function Dashboard() {

    return (
        <DashboardLayout role="officer">

            {/* Page Heading */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Overview of your assigned cases and recent activities.
                </p>
            </div>


            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                {/* Ongoing Cases */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Ongoing Cases
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                3
                            </p>
                        </div>

                        <div className="text-gray-500">
                            <FolderOpen size={22} strokeWidth={1.7} />
                        </div>

                    </div>

                </div>


                {/* Completed Cases */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Completed Cases
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                12
                            </p>
                        </div>

                        <div className="text-gray-500">
                            <CheckCircle size={22} strokeWidth={1.7} />
                        </div>

                    </div>

                </div>


                {/* Documents */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Related Documents
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                28
                            </p>
                        </div>

                        <div className="text-gray-500">
                            <FileText size={22} strokeWidth={1.7} />
                        </div>

                    </div>

                </div>


                {/* Team Members */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Team Members
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                4
                            </p>
                        </div>

                        <div className="text-gray-500">
                            <Users size={22} strokeWidth={1.7} />
                        </div>

                    </div>

                </div>

            </div>


            {/* Current Case */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Current Case
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Case currently assigned to you.
                        </p>
                    </div>

                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        Ongoing
                    </span>

                </div>


                <div className="border border-gray-200 rounded-md p-4">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>

                            <p className="text-xs text-gray-500">
                                Case ID
                            </p>

                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                CASE-2026-0042
                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-gray-500">
                                FIR Number
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                FIR-2026-0187
                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-gray-500">
                                Assigned
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                18 August 2026
                            </p>

                        </div>

                    </div>


                    <div className="mt-5">

                        <h3 className="text-sm font-medium text-gray-900">
                            Investigation of reported property theft
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 leading-6">
                            Investigation and evidence collection related
                            to the reported incident.
                        </p>

                    </div>


                    <div className="mt-5">

                        <button
                            className="px-4 py-2 text-sm font-medium
                                       bg-gray-900 text-white rounded-md
                                       hover:bg-gray-800 transition"
                        >
                            View Case
                        </button>

                    </div>

                </div>

            </div>


            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                {/* Officer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-5">

                        <h2 className="text-base font-semibold text-gray-900">
                            Officer Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Your registered information.
                        </p>

                    </div>


                    <div className="space-y-4">

                        <div>
                            <p className="text-xs text-gray-500">
                                Full Name
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                Rahul Sharma
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-gray-500">
                                Police Registration Number
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                POL-1024
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-gray-500">
                                Rank
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                Sub-Inspector
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-gray-500">
                                Department
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                Investigation
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-gray-500">
                                Official Email
                            </p>

                            <p className="text-sm font-medium text-gray-900 mt-1">
                                rahul.sharma@police.gov
                            </p>
                        </div>

                    </div>

                </div>


                {/* Team Members */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-5">

                        <h2 className="text-base font-semibold text-gray-900">
                            Current Team
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Officers assigned to your current case.
                        </p>

                    </div>


                    <div className="space-y-3">


                        {/* Officer 1 */}
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">

                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">

                                    <span className="text-xs font-medium text-gray-700">
                                        AS
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-medium text-gray-900">
                                        Amit Singh
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Inspector
                                    </p>

                                </div>

                            </div>

                            <span className="text-xs text-gray-500">
                                POL-1008
                            </span>

                        </div>


                        {/* Officer 2 */}
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">

                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">

                                    <span className="text-xs font-medium text-gray-700">
                                        RK
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-medium text-gray-900">
                                        Ravi Kumar
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Head Constable
                                    </p>

                                </div>

                            </div>

                            <span className="text-xs text-gray-500">
                                POL-1016
                            </span>

                        </div>


                        {/* Officer 3 */}
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">

                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">

                                    <span className="text-xs font-medium text-gray-700">
                                        VM
                                    </span>

                                </div>

                                <div>

                                    <p className="text-sm font-medium text-gray-900">
                                        Vikram Mehta
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Assistant Sub-Inspector
                                    </p>

                                </div>

                            </div>

                            <span className="text-xs text-gray-500">
                                POL-1031
                            </span>

                        </div>


                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Dashboard;