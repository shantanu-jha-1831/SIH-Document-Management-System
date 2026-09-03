import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CreateCaseModal from "../../components/cases/CreateCaseModal";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FolderOpen } from "lucide-react";
import api from "../../services/api";


function Cases() {

    const [showCreateModal, setShowCreateModal] = useState(false);

    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ===============================
    // FETCH CASES
    // ===============================
    const fetchCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/cases");

            setCases(response.data.cases);

        } catch (error) {

            console.error(
                "Error fetching cases:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load cases"
            );

        } finally {

            setLoading(false);

        }
    };

    // ===============================
    // LOAD CASES
    // ===============================
    useEffect(() => {
        fetchCases();
    }, []);


    return (
        <DashboardLayout role="admin">

            <div className="mb-6 flex items-start justify-between">

                <div>

                    <h1 className="text-xl font-semibold">
                        Cases
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage cases registered at the station.
                    </p>

                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2
                            bg-gray-900 text-white
                            px-4 py-2 rounded-md
                            text-sm hover:bg-gray-800"
                >
                    <Plus size={16} />
                    Create Case
                </button>

            </div>


            {error && (
                <div className="bg-red-50 border border-red-200
                                rounded-lg p-4 mb-5">

                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                </div>
            )}


            <div className="bg-white border border-gray-200
                            rounded-lg overflow-hidden">

                <table className="w-full text-sm">

                    <thead className="bg-gray-50 border-b">

                        <tr>

                            <th className="text-left px-5 py-3">
                                Case
                            </th>

                            <th className="text-left px-5 py-3">
                                FIR
                            </th>

                            <th className="text-left px-5 py-3">
                                Lead Officer
                            </th>

                            <th className="text-left px-5 py-3">
                                Status
                            </th>

                            <th className="text-right px-5 py-3">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="px-5 py-10
                                               text-center
                                               text-sm text-gray-500"
                                >
                                    Loading cases...
                                </td>

                            </tr>

                        ) : cases.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="px-5 py-10
                                               text-center
                                               text-sm text-gray-500"
                                >
                                    No cases found.
                                </td>

                            </tr>

                        ) : (

                            cases.map((item) => (

                                <tr
                                    key={item._id}
                                    className="border-b border-gray-100"
                                >

                                    <td className="px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <FolderOpen
                                                size={18}
                                                className="text-gray-500"
                                            />

                                            <div>

                                                <p className="font-medium">
                                                    {item.caseId}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {item.title}
                                                </p>

                                            </div>

                                        </div>

                                    </td>


                                    <td className="px-5 py-4">
                                        {item.firNumber}
                                    </td>


                                    <td className="px-5 py-4">

                                        {item.leadOfficer?.fullName ||
                                            "Not assigned"}

                                    </td>


                                    <td className="px-5 py-4">

                                        {item.status}

                                    </td>


                                    <td className="px-5 py-4 text-right">

                                        <button
                                            onClick={() => navigate(`/admin/cases/${item._id}`)}
                                            className="px-3 py-1.5 border
                                                    border-gray-300 rounded-md
                                                    text-xs hover:bg-gray-50"
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>


        {showCreateModal && (
            <CreateCaseModal
                onClose={() => setShowCreateModal(false)}
                onCreated={(newCase) => {
                    setCases((prevCases) => [
                        newCase,
                        ...prevCases
                    ]);
                }}
            />
        )}


        </DashboardLayout>
    );
}

export default Cases;