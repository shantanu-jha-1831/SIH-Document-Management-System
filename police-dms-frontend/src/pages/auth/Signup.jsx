
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

function Signup() {

    const [formData, setFormData] = useState({
        fullName: "",
        policeNumber: "",
        rank: "",
        department: "",
        email: "",
        mobile: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/register",
                formData
            );

            setMessage(response.data.message);

            setFormData({
                fullName: "",
                policeNumber: "",
                rank: "",
                department: "",
                email: "",
                mobile: "",
                password: ""
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-lg">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Police Digital Record System
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Officer registration
                    </p>
                </div>

                {/* Registration Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-7">

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Request an account
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Provide your official details to request access.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Registration Number */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Police Registration Number
                            </label>

                            <input
                                type="text"
                                name="policeNumber"
                                value={formData.policeNumber}
                                onChange={handleChange}
                                placeholder="e.g. POL-1024"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Rank */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Rank
                            </label>

                            <select
                                name="rank"
                                value={formData.rank}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            >
                                <option value="">Select rank</option>
                                <option>Constable</option>
                                <option>Head Constable</option>
                                <option>Assistant Sub-Inspector</option>
                                <option>Sub-Inspector</option>
                                <option>Inspector</option>
                            </select>
                        </div>

                        {/* Department */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g. Investigation"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Official Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter official email"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Mobile */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        {/* Success Message */}
                        {message && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-5">
                                <p className="text-sm text-green-700">
                                    {message}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-5">
                            <p className="text-xs leading-5 text-gray-600">
                                Your account will remain pending after registration.
                                Access will be enabled only after approval by the
                                station administrator.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit Registration"
                            }
                        </button>

                    </form>

                    {/* Login */}
                    <div className="text-center mt-5">
                        <p className="text-sm text-gray-500">
                            Already registered?
                            <Link
                                to="/"
                                className="ml-1 text-gray-900 font-medium hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Signup;
