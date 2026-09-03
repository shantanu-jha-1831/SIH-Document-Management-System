import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    Users,
    FolderOpen,
    FileText,
    ShieldAlert,
    Clock,
    AlertTriangle
} from "lucide-react";
import api from "../../services/api";

function Dashboard() {

    const [stats, setStats] = useState({
        registeredOfficers: 0,
        ongoingCases: 0,
        protectedDocuments: 0,
        securityAlerts: 0,
        pendingOfficerRequests: 0,
        pendingDocumentRequests: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ===============================
    // FETCH DASHBOARD STATISTICS
    // ===============================
    const fetchDashboardStats = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/dashboard"
            );

            setStats(response.data.stats);

        } catch (error) {

            console.error(
                "Error fetching dashboard statistics:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard statistics"
            );

        } finally {

            setLoading(false);

        }
    };


    // ===============================
    // LOAD DASHBOARD
    // ===============================
    useEffect(() => {

        fetchDashboardStats();

    }, []);


    return (
        <DashboardLayout role="admin">

            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Station-wide overview of cases, officers and security events.
                </p>

            </div>


            {/* Error */}

            {error && (

                <div className="mb-5 border border-red-200
                                bg-red-50 rounded-md p-3">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            )}


            {/* Statistics */}

            <div className="grid grid-cols-1 sm:grid-cols-2
                            lg:grid-cols-4 gap-4 mb-6">

                <Stat
                    title="Registered Officers"
                    value={
                        loading
                            ? "..."
                            : stats.registeredOfficers
                    }
                    icon={Users}
                />

                <Stat
                    title="Ongoing Cases"
                    value={
                        loading
                            ? "..."
                            : stats.ongoingCases
                    }
                    icon={FolderOpen}
                />

                <Stat
                    title="Protected Documents"
                    value={
                        loading
                            ? "..."
                            : stats.protectedDocuments
                    }
                    icon={FileText}
                />

                <Stat
                    title="Security Alerts"
                    value={
                        loading
                            ? "..."
                            : stats.securityAlerts
                    }
                    icon={ShieldAlert}
                />

            </div>


            {/* Requests */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white border border-gray-200
                                rounded-lg p-6">

                    <div className="flex items-center gap-2 mb-5">

                        <Clock size={19} />

                        <h2 className="text-base font-semibold">
                            Pending Requests
                        </h2>

                    </div>


                    <div className="space-y-4">

                        <Request
                            title="Officer registration"
                            count={
                                loading
                                    ? "..."
                                    : `${stats.pendingOfficerRequests} pending`
                            }
                        />

                        <Request
                            title="Document access"
                            count={
                                loading
                                    ? "..."
                                    : `${stats.pendingDocumentRequests} pending`
                            }
                        />

                    </div>

                </div>


                <div className="bg-white border border-gray-200
                                rounded-lg p-6">

                    <div className="flex items-center gap-2 mb-5">

                        <AlertTriangle size={19} />

                        <h2 className="text-base font-semibold">
                            Recent Security Events
                        </h2>

                    </div>


                    <div className="space-y-4">

                        <p className="text-sm text-gray-600">
                            No security events recorded yet.
                        </p>

                        <p className="text-sm text-gray-600">
                            Security monitoring will appear here
                            when the security module is implemented.
                        </p>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}


// ===============================
// STAT COMPONENT
// ===============================

function Stat({ title, value, icon: Icon }) {

    return (
        <div className="bg-white border border-gray-200
                        rounded-lg p-5">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="text-2xl font-semibold
                                  text-gray-900 mt-2">
                        {value}
                    </p>

                </div>

                <Icon
                    size={22}
                    strokeWidth={1.7}
                    className="text-gray-500"
                />

            </div>

        </div>
    );
}


// ===============================
// REQUEST COMPONENT
// ===============================

function Request({ title, count }) {

    return (
        <div className="flex items-center justify-between
                        border border-gray-200 rounded-md p-4">

            <p className="text-sm text-gray-700">
                {title}
            </p>

            <span className="text-xs text-gray-500">
                {count}
            </span>

        </div>
    );
}


export default Dashboard;