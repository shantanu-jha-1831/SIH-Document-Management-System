import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children, allowedRole }) {

    const { user, isAuthenticated } = useAuth();


    // ===============================
    // NOT LOGGED IN
    // ===============================
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }


    // ===============================
    // WRONG ROLE
    // ===============================
    if (
        allowedRole &&
        user?.role !== allowedRole
    ) {
        if (user?.role === "ADMIN") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        if (user?.role === "OFFICER") {
            return (
                <Navigate
                    to="/officer/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/" replace />;
    }


    // ===============================
    // AUTHORIZED
    // ===============================
    return children;
}


export default ProtectedRoute;

