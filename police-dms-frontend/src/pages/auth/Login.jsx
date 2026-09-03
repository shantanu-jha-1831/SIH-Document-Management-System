import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        policeNumber: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ===============================
    // HANDLE INPUT CHANGE
    // ===============================
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ===============================
    // HANDLE LOGIN
    // ===============================
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                formData
            );

            const { token, user } = response.data;

            console.log("BACKEND LOGIN RESPONSE:", response.data);
            console.log("JWT TOKEN RECEIVED:", token);


            // ===============================
            // STORE JWT
            // ===============================

            localStorage.setItem(
                "token",
                token
            );


            // ===============================
            // STORE USER
            // ===============================

            login(user);

            console.log("LOGIN FUNCTION COMPLETED");
console.log("USER ROLE:", user.role);
console.log("ABOUT TO NAVIGATE");


            // ===============================
            // REDIRECT BASED ON ROLE
            // ===============================

            if (user.role === "ADMIN") {

                navigate(
                    "/admin/dashboard",
                    { replace: true }
                );

            } else if (user.role === "OFFICER") {

                navigate(
                    "/officer/dashboard",
                    { replace: true }
                );

            } else {

                setError(
                    "Invalid user role."
                );

            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Header */}

                <div className="text-center mb-6">

                    <h1 className="text-2xl font-semibold text-gray-900">
                        Police Digital Record System
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Secure case and document management
                    </p>

                </div>


                {/* Login Card */}

                <div className="bg-white border border-gray-200
                                rounded-lg p-7">

                    <div className="mb-6">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Sign in
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Enter your registered credentials to continue.
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        {/* Police Number */}

                        <div className="mb-4">

                            <label
                                className="block text-sm font-medium
                                           text-gray-700 mb-1.5"
                            >
                                Police Registration Number
                            </label>

                            <input
                                type="text"
                                name="policeNumber"
                                value={formData.policeNumber}
                                onChange={handleChange}
                                placeholder="e.g. POL-1024"
                                className="w-full px-3 py-2.5
                                           border border-gray-300
                                           rounded-md text-sm outline-none
                                           focus:border-gray-500
                                           focus:ring-1
                                           focus:ring-gray-300"
                                required
                            />

                        </div>


                        {/* Password */}

                        <div className="mb-5">

                            <label
                                className="block text-sm font-medium
                                           text-gray-700 mb-1.5"
                            >
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full px-3 py-2.5
                                           border border-gray-300
                                           rounded-md text-sm outline-none
                                           focus:border-gray-500
                                           focus:ring-1
                                           focus:ring-gray-300"
                                required
                            />

                        </div>


                        {/* Error */}

                        {error && (

                            <div
                                className="bg-red-50 border
                                           border-red-200 rounded-md
                                           p-3 mb-5"
                            >

                                <p className="text-sm text-red-700">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* Login Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900
                                       text-white py-2.5 rounded-md
                                       text-sm font-medium
                                       hover:bg-gray-800 transition
                                       disabled:opacity-50
                                       disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }
                        </button>

                    </form>


                    {/* Signup */}

                    <div className="text-center mt-5">

                        <p className="text-sm text-gray-500">

                            New officer?

                            <Link
                                to="/signup"
                                className="ml-1 text-gray-900
                                           font-medium hover:underline"
                            >
                                Request an account
                            </Link>

                        </p>

                    </div>

                </div>


                {/* Footer */}

                <p className="text-center text-xs text-gray-400 mt-5">
                    Authorized personnel only
                </p>

            </div>

        </div>
    );
}

export default Login;