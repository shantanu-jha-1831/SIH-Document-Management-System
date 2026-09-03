import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

function CreateCaseModal({ onClose, onCreated }) {

    const [officers, setOfficers] = useState([]);

    const [formData, setFormData] = useState({
        caseId: "",
        firNumber: "",
        title: "",
        description: "",
        leadOfficer: "",
        incidentDate: ""
    });

    const [assignedOfficers, setAssignedOfficers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingOfficers, setLoadingOfficers] = useState(true);
    const [error, setError] = useState("");

    // ===============================
    // FETCH ACTIVE OFFICERS
    // ===============================
    useEffect(() => {

        const fetchOfficers = async () => {

            try {

                const response =
                    await api.get("/admin/officers");

                const activeOfficers =
                    response.data.officers.filter(
                        officer =>
                            officer.status === "ACTIVE"
                    );

                setOfficers(activeOfficers);

            } catch (error) {

                console.error(
                    "Error fetching officers:",
                    error
                );

                setError(
                    "Failed to load active officers"
                );

            } finally {

                setLoadingOfficers(false);

            }
        };

        fetchOfficers();

    }, []);


    // ===============================
    // HANDLE INPUT
    // ===============================
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ===============================
    // HANDLE TEAM MEMBER SELECTION
    // ===============================
    const handleOfficerSelection = (e) => {

        const selectedOptions =
            Array.from(e.target.selectedOptions);

        const selectedIds =
            selectedOptions.map(
                option => option.value
            );

        setAssignedOfficers(selectedIds);

    };


    // ===============================
    // CREATE CASE
    // ===============================
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/cases",
                {
                    ...formData,
                    assignedOfficers
                }
            );

            onCreated(response.data.case);

            onClose();

        } catch (error) {

            console.error(
                "Create case error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create case"
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="fixed inset-0 bg-black/40
                        flex items-center justify-center
                        z-50 px-4">

            <div className="bg-white w-full max-w-lg
                            rounded-lg shadow-lg
                            max-h-[90vh] overflow-y-auto">

                {/* Header */}

                <div className="flex items-center
                                justify-between
                                px-6 py-4
                                border-b">

                    <div>

                        <h2 className="text-lg font-semibold">
                            Create New Case
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            Register a new case in the system.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500
                                   hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6"
                >

                    {error && (

                        <div className="bg-red-50
                                        border border-red-200
                                        rounded-md p-3 mb-4">

                            <p className="text-sm text-red-700">
                                {error}
                            </p>

                        </div>

                    )}


                    <div className="grid grid-cols-1
                                    md:grid-cols-2 gap-4">

                        {/* Case ID */}

                        <div>

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Case ID
                            </label>

                            <input
                                type="text"
                                name="caseId"
                                value={formData.caseId}
                                onChange={handleChange}
                                placeholder="CASE-2026-0001"
                                required
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none"
                            />

                        </div>


                        {/* FIR Number */}

                        <div>

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                FIR Number
                            </label>

                            <input
                                type="text"
                                name="firNumber"
                                value={formData.firNumber}
                                onChange={handleChange}
                                placeholder="FIR-2026-0001"
                                required
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none"
                            />

                        </div>


                        {/* Title */}

                        <div className="md:col-span-2">

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Case Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter case title"
                                required
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none"
                            />

                        </div>


                        {/* Description */}

                        <div className="md:col-span-2">

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the case..."
                                rows="4"
                                required
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none
                                           resize-none"
                            />

                        </div>


                        {/* Lead Officer */}

                        <div>

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Lead Officer
                            </label>

                            <select
                                name="leadOfficer"
                                value={formData.leadOfficer}
                                onChange={handleChange}
                                required
                                disabled={loadingOfficers}
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none
                                           bg-white"
                            >

                                <option value="">
                                    {loadingOfficers
                                        ? "Loading officers..."
                                        : "Select officer"}
                                </option>

                                {officers.map((officer) => (

                                    <option
                                        key={officer._id}
                                        value={officer._id}
                                    >
                                        {officer.fullName}
                                        {" - "}
                                        {officer.policeNumber}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* Incident Date */}

                        <div>

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Incident Date
                            </label>

                            <input
                                type="date"
                                name="incidentDate"
                                value={formData.incidentDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none"
                            />

                        </div>


                        {/* Assigned Officers */}

                        <div className="md:col-span-2">

                            <label className="block text-sm
                                              font-medium
                                              text-gray-700 mb-1">
                                Assign Team Members
                            </label>

                            <select
                                multiple
                                value={assignedOfficers}
                                onChange={handleOfficerSelection}
                                disabled={loadingOfficers}
                                className="w-full px-3 py-2
                                           border border-gray-300
                                           rounded-md text-sm
                                           outline-none
                                           bg-white
                                           min-h-[110px]"
                            >

                                {officers
                                    .filter(
                                        officer =>
                                            officer._id !==
                                            formData.leadOfficer
                                    )
                                    .map((officer) => (

                                        <option
                                            key={officer._id}
                                            value={officer._id}
                                        >
                                            {officer.fullName}
                                            {" - "}
                                            {officer.policeNumber}
                                        </option>

                                    ))}

                            </select>

                            <p className="text-xs text-gray-500 mt-1">
                                Hold Ctrl (Windows) or Command (Mac)
                                to select multiple officers.
                            </p>

                        </div>

                    </div>


                    {/* Buttons */}

                    <div className="flex justify-end
                                    gap-3 mt-6">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2
                                       border border-gray-300
                                       rounded-md text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2
                                       bg-gray-900
                                       text-white
                                       rounded-md text-sm
                                       disabled:opacity-50"
                        >
                            {loading
                                ? "Creating..."
                                : "Create Case"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default CreateCaseModal;