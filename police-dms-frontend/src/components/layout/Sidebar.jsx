import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FolderOpen,
    CheckSquare,
    Users,
    FileText,
    LogOut
} from "lucide-react";

function Sidebar({ role = "officer" }) {

    const officerLinks = [
        {
            name: "Documents",
            path: "/officer/documents",
            icon: FileText
        },
        {
            name: "Access Requests",
            path: "/officer/access-requests",
            icon: CheckSquare
        },
        {
            name: "Dashboard",
            path: "/officer/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Ongoing Cases",
            path: "/officer/cases/ongoing",
            icon: FolderOpen
        },
        {
            name: "Completed Cases",
            path: "/officer/cases/completed",
            icon: CheckSquare
        },
        {
            name: "My Cases",
            path: "/officer/my-cases",
            icon: FileText
        },
        {
            name: "Officers",
            path: "/officer/officers",
            icon: Users
        }
    ];

    const adminLinks = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Officer Requests",
            path: "/admin/officer-requests",
            icon: Users
        },
        {
            name: "Cases",
            path: "/admin/cases",
            icon: FolderOpen
        },
        {
            name: "Documents",
            path: "/admin/documents",
            icon: FileText
        },
        {
            name: "Access Requests",
            path: "/admin/access-requests",
            icon: CheckSquare
        },
        {
            name: "Audit Logs",
            path: "/admin/audit-logs",
            icon: FileText
        },
        {
            name: "Security Alerts",
            path: "/admin/security-alerts",
            icon: CheckSquare
        }
        ,
        {
            name: "Officers",
            path: "/admin/officers",
            icon: Users
        }
    ];

    const links = role === "admin" ? adminLinks : officerLinks;

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

            {/* Logo / System Name */}
            <div className="h-16 px-5 flex items-center border-b border-gray-200">
                <div>
                    <h1 className="text-sm font-semibold text-gray-900">
                        Police Digital Records
                    </h1>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Secure Management System
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5">

                <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Main Menu
                </p>

                <div className="space-y-1">

                    {links.map((link) => {

                        const Icon = link.icon;

                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                                    transition
                                    ${
                                        isActive
                                            ? "bg-gray-100 text-gray-900 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Icon size={18} strokeWidth={1.8} />

                                <span>{link.name}</span>
                            </NavLink>
                        );
                    })}

                </div>

            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200 p-3">

                <button
                    className="w-full flex items-center gap-3 px-3 py-2.5
                               text-sm text-gray-600 rounded-md
                               hover:bg-gray-50 hover:text-gray-900"
                >
                    <LogOut size={18} strokeWidth={1.8} />

                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;