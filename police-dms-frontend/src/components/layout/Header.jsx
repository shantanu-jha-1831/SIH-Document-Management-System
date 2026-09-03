import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header({ role = "officer" }) {

    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdmin = role === "admin";

    const userName = user?.fullName ||
        (isAdmin ? "Station Administrator" : "Officer");

    const userRole = user?.role === "ADMIN"
        ? "Administrator"
        : user?.rank || "Police Officer";

    // Get first letter for avatar
    const avatarLetter = userName
        ? userName.charAt(0).toUpperCase()
        : isAdmin
            ? "A"
            : "O";

    return (
        <header className="h-16 bg-white border-b border-gray-200
                           flex items-center justify-between px-6">

            {/* Page title */}
            <div>
                <h2 className="text-base font-semibold text-gray-900">
                    {isAdmin
                        ? "Admin Portal"
                        : "Officer Portal"}
                </h2>
            </div>


            {/* Right side */}
            <div className="flex items-center gap-5">

                {/* Notification */}
                <button
                    className="relative text-gray-500
                               hover:text-gray-900"
                >
                    <Bell
                        size={19}
                        strokeWidth={1.8}
                    />

                    <span className="absolute -top-1 -right-1
                                     w-2 h-2
                                     bg-red-500
                                     rounded-full">
                    </span>
                </button>


                {/* User / Profile */}
                <button
                    onClick={() =>
                        navigate(
                            isAdmin
                                ? "/admin/profile"
                                : "/officer/profile"
                        )
                    }
                    className="flex items-center gap-3
                               text-left
                               rounded-md
                               px-2 py-1
                               hover:bg-gray-50
                               transition"
                >

                    {/* Avatar */}
                    <div className="w-8 h-8
                                    rounded-full
                                    bg-gray-200
                                    flex items-center
                                    justify-center">

                        <span className="text-xs
                                         font-medium
                                         text-gray-700">
                            {avatarLetter}
                        </span>

                    </div>


                    {/* User information */}
                    <div className="hidden sm:block">

                        <p className="text-sm
                                      font-medium
                                      text-gray-900">

                            {userName}

                        </p>

                        <p className="text-xs
                                      text-gray-500">

                            {userRole}

                        </p>

                    </div>

                </button>

            </div>

        </header>
    );
}

export default Header;