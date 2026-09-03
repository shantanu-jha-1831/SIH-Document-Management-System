import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Profile() {

    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return "O";

        return name
            .split(" ")
            .map(word => word.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <DashboardLayout role="officer">

            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="mb-6">

                    <h1 className="text-2xl font-semibold text-gray-900">
                        My Profile
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        View your registered officer information
                    </p>

                </div>


                {/* Profile Header Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <div className="flex items-center gap-5">

                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gray-200
                                        flex items-center justify-center">

                            <span className="text-xl font-semibold text-gray-700">
                                {getInitials(user?.fullName)}
                            </span>

                        </div>


                        {/* Name */}
                        <div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                {user?.fullName || "N/A"}
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {user?.rank || "Police Officer"}
                            </p>

                            <span className="inline-block mt-2 px-3 py-1
                                             text-xs font-medium
                                             bg-green-50 text-green-700
                                             rounded-full">
                                {user?.status || "ACTIVE"}
                            </span>

                        </div>

                    </div>

                </div>


                {/* Personal Information */}
                <div className="mt-6 bg-white border border-gray-200 rounded-xl">

                    <div className="px-6 py-4 border-b border-gray-200">

                        <h2 className="text-base font-semibold text-gray-900">
                            Personal Information
                        </h2>

                    </div>


                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Full Name */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Full Name
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.fullName || "N/A"}
                            </p>
                        </div>


                        {/* Police Number */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Police Number
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.policeNumber || "N/A"}
                            </p>
                        </div>


                        {/* Rank */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Rank
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.rank || "N/A"}
                            </p>
                        </div>


                        {/* Department */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Department
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.department || "N/A"}
                            </p>
                        </div>


                        {/* Email */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Email Address
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.email || "N/A"}
                            </p>
                        </div>


                        {/* Mobile */}
                        <div>
                            <p className="text-xs text-gray-500">
                                Mobile Number
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {user?.mobile || "N/A"}
                            </p>
                        </div>

                    </div>

                </div>


                {/* Account Information */}
                <div className="mt-6 bg-white border border-gray-200 rounded-xl">

                    <div className="px-6 py-4 border-b border-gray-200">

                        <h2 className="text-base font-semibold text-gray-900">
                            Account Information
                        </h2>

                    </div>


                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <p className="text-xs text-gray-500">
                                Account Role
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                Police Officer
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-gray-500">
                                Account Status
                            </p>

                            <p className="mt-1 text-sm font-medium text-green-600">
                                {user?.status || "ACTIVE"}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Profile;