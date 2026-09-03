import ProtectedRoute from "./ProtectedRoute";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import OfficerProfile from "../pages/officer/Profile";

import AdminProfile from "../pages/admin/Profile";

import OfficerDashboard from "../pages/officer/Dashboard";
import OngoingCases from "../pages/officer/OngoingCases";
import CompletedCases from "../pages/officer/CompletedCases";
import MyCases from "../pages/officer/MyCases";
import Officers from "../pages/officer/Officers";
import CaseDetails from "../pages/officer/CaseDetails";
import Documents from "../pages/officer/Documents";
import AccessRequests from "../pages/officer/AccessRequests";

import AdminDashboard from "../pages/admin/Dashboard";
import OfficerRequests from "../pages/admin/OfficerRequests";
import AdminOfficers from "../pages/admin/Officers";
import AdminCases from "../pages/admin/Cases";
import AdminDocuments from "../pages/admin/Documents";
import AdminAccessRequests from "../pages/admin/AccessRequests";
import AuditLogs from "../pages/admin/AuditLogs";
import SecurityAlerts from "../pages/admin/SecurityAlerts";
import AdminCaseDetails from "../pages/admin/CaseDetails";


function AppRoutes() {

    return (
        <BrowserRouter>

            <Routes>

                {/* ===============================
                    AUTHENTICATION
                =============================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* ===============================
                    OFFICER ROUTES
                =============================== */}

                <Route
                    path="/officer/profile"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <OfficerProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/dashboard"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <OfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/cases/ongoing"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <OngoingCases />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/cases/completed"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <CompletedCases />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/my-cases"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <MyCases />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/officers"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <Officers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/cases/:caseId"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <CaseDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/documents"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <Documents />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/access-requests"
                    element={
                        <ProtectedRoute allowedRole="OFFICER">
                            <AccessRequests />
                        </ProtectedRoute>
                    }
                />


                {/* ===============================
                    ADMIN ROUTES
                =============================== */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/officer-requests"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <OfficerRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/officers"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminOfficers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/cases"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminCases />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/documents"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminDocuments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/access-requests"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminAccessRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/audit-logs"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AuditLogs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/security-alerts"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <SecurityAlerts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/cases/:id"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminCaseDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />


                {/* ===============================
                    UNKNOWN ROUTES
                =============================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;