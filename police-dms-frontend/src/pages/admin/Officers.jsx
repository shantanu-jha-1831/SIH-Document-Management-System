import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { User, Search } from "lucide-react";
import api from "../../services/api";

function Officers() {

    const [officers, setOfficers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ===============================
    // FETCH ALL OFFICERS
    // ===============================
    const fetchOfficers = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/officers"
            );

            setOfficers(response.data.officers);

        } catch (error) {

            console.error(
                "Error fetching officers:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load officers"
            );

        } finally {

            setLoading(false);

        }
    };


    // ===============================
    // LOAD OFFICERS
    // ===============================
    useEffect(() => {

        fetchOfficers();

    }, []);


    // ===============================
    // SEARCH FILTER
    // ===============================
    const filteredOfficers = officers.filter((officer) => {

        const searchValue = search.toLowerCase();

        return (
            officer.fullName
                ?.toLowerCase()
                .includes(searchValue) ||

            officer.policeNumber
                ?.toLowerCase()
                .includes(searchValue) ||

            officer.rank
                ?.toLowerCase()
                .includes(searchValue) ||

            officer.department
                ?.toLowerCase()
                .includes(searchValue)
        );
    });


    return (
        <DashboardLayout role="admin">

            <div className="mb-6">

                <h1 className="text-xl font-semibold">
                    Officers
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Manage authorized officers registered with the station.
                </p>

            </div>


            {/* ===============================
                SEARCH
            =============================== */}

            <div className="relative w-full sm:w-80 mb-5">

                <Search
                    size={17}
                    className="absolute left-3 top-1/2
                               -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search officers..."
                    className="w-full pl-9 pr-3 py-2.5 border
                               border-gray-300 rounded-md text-sm
                               focus:outline-none focus:ring-1
                               focus:ring-gray-400"
                />

            </div>


            {/* ===============================
                TABLE
            =============================== */}

            <div className="bg-white border border-gray-200
                            rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b">

                            <tr>

                                <th className="text-left px-5 py-3">
                                    Officer
                                </th>

                                <th className="text-left px-5 py-3">
                                    Police Number
                                </th>

                                <th className="text-left px-5 py-3">
                                    Rank
                                </th>

                                <th className="text-left px-5 py-3">
                                    Department
                                </th>

                                <th className="text-left px-5 py-3">
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {/* ===============================
                                LOADING
                            =============================== */}

                            {loading && (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="px-5 py-10
                                                   text-center
                                                   text-gray-500"
                                    >
                                        Loading officers...
                                    </td>

                                </tr>

                            )}


                            {/* ===============================
                                ERROR
                            =============================== */}

                            {!loading && error && (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="px-5 py-10
                                                   text-center
                                                   text-red-500"
                                    >
                                        {error}
                                    </td>

                                </tr>

                            )}


                            {/* ===============================
                                NO OFFICERS
                            =============================== */}

                            {!loading &&
                                !error &&
                                filteredOfficers.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="px-5 py-10
                                                       text-center
                                                       text-gray-500"
                                        >
                                            {search
                                                ? "No officers found."
                                                : "No officers registered."
                                            }
                                        </td>

                                    </tr>

                                )}


                            {/* ===============================
                                OFFICERS
                            =============================== */}

                            {!loading &&
                                !error &&
                                filteredOfficers.map((officer) => (

                                    <tr
                                        key={officer._id}
                                        className="border-b
                                                   border-gray-100
                                                   last:border-0"
                                    >

                                        {/* Officer */}

                                        <td className="px-5 py-4">

                                            <div className="flex
                                                            items-center
                                                            gap-3">

                                                <div
                                                    className="w-8 h-8
                                                               bg-gray-100
                                                               rounded-full
                                                               flex
                                                               items-center
                                                               justify-center"
                                                >

                                                    <User size={16} />

                                                </div>

                                                <div>

                                                    <p className="font-medium">
                                                        {officer.fullName}
                                                    </p>

                                                    <p className="text-xs
                                                                  text-gray-500">
                                                        {officer.email}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Police Number */}

                                        <td className="px-5 py-4">
                                            {officer.policeNumber}
                                        </td>


                                        {/* Rank */}

                                        <td className="px-5 py-4">
                                            {officer.rank}
                                        </td>


                                        {/* Department */}

                                        <td className="px-5 py-4">
                                            {officer.department}
                                        </td>


                                        {/* Status */}

                                        <td className="px-5 py-4">

                                            <span
                                                className={`text-xs px-2.5
                                                            py-1 rounded ${
                                                    officer.status === "ACTIVE"
                                                        ? "bg-gray-100 text-gray-800"
                                                        : officer.status === "PENDING"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {officer.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Officers;
