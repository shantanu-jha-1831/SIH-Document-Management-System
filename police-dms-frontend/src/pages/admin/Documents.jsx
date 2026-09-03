import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    FileText,
    ShieldCheck,
    ShieldAlert,
    Upload,
    X,
    Loader2,
    ExternalLink
} from "lucide-react";
import api from "../../services/api";

function Documents() {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [cases, setCases] = useState([]);

    // =========================
    // VERIFICATION STATUS
    // =========================

    const [verificationStatus, setVerificationStatus] = useState({});


    const [formData, setFormData] = useState({
        name: "",
        case: "",
        type: "OTHER",
        accessLevel: "RESTRICTED",
        file: null
    });


    // =========================
    // OPEN DOCUMENT
    // =========================

    const openDocument = async (documentId) => {

        try {

            const response = await api.get(
                `/documents/${documentId}/file`,
                {
                    responseType: "blob"
                }
            );


            // Create a temporary URL for the PDF
            const fileBlob = new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );


            const fileUrl =
                URL.createObjectURL(fileBlob);


            // Open PDF in a new browser tab
            window.open(
                fileUrl,
                "_blank"
            );


            // Clean up temporary URL later
            setTimeout(() => {

                URL.revokeObjectURL(fileUrl);

            }, 60000);


        } catch (error) {

            console.error(
                "Error opening document:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Unable to open document."
            );

        }

    };


    // =========================
    // VERIFY DOCUMENT
    // =========================

    const verifyDocument = async (documentId) => {

        try {

            // Set checking status
            setVerificationStatus((prev) => ({
                ...prev,
                [documentId]: "CHECKING"
            }));


            const response = await api.get(
                `/documents/${documentId}/verify`
            );


            const result = response.data;


            console.log(
                `Verification result for ${documentId}:`,
                result
            );


            // Check all verification conditions
            if (
                result.verified === true &&
                result.mongoVerified === true &&
                result.blockchainVerified === true
            ) {

                setVerificationStatus((prev) => ({
                    ...prev,
                    [documentId]: "VERIFIED"
                }));

            } else {

                setVerificationStatus((prev) => ({
                    ...prev,
                    [documentId]: "TAMPERED"
                }));

            }

        } catch (error) {

            console.error(
                `Verification error for ${documentId}:`,
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            setVerificationStatus((prev) => ({
                ...prev,
                [documentId]: "ERROR"
            }));

        }

    };


    // =========================
    // FETCH DOCUMENTS
    // =========================

    const fetchDocuments = async () => {

        try {

            setLoading(true);


            const response = await api.get(
                "/documents"
            );


            const docs =
                response.data.documents || [];


            setDocuments(docs);


            // Reset previous verification states
            setVerificationStatus({});


            // Verify every document
            for (const doc of docs) {

                if (doc._id) {

                    await verifyDocument(
                        doc._id
                    );

                }

            }

        } catch (error) {

            console.error(
                "Error fetching documents:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // FETCH CASES
    // =========================

    const fetchCases = async () => {

        try {

            const response = await api.get(
                "/cases"
            );


            setCases(
                response.data.cases || []
            );

        } catch (error) {

            console.error(
                "Error fetching cases:",
                error
            );

        }

    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchDocuments();
        fetchCases();

    }, []);


    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // =========================
    // FILE CHANGE
    // =========================

    const handleFileChange = (e) => {

        const file =
            e.target.files[0];


        if (!file) return;


        setFormData((prev) => ({
            ...prev,
            file,
            name:
                prev.name ||
                file.name
        }));

    };


    // =========================
    // UPLOAD DOCUMENT
    // =========================

    const handleUpload = async (e) => {

        e.preventDefault();


        // =========================
        // VALIDATION
        // =========================

        if (!formData.name.trim()) {

            alert(
                "Please enter document name."
            );

            return;

        }


        if (!formData.case) {

            alert(
                "Please select a case."
            );

            return;

        }


        if (!formData.type) {

            alert(
                "Please select document type."
            );

            return;

        }


        if (!formData.file) {

            alert(
                "Please select a file."
            );

            return;

        }


        try {

            setUploading(true);


            // =========================
            // CREATE FORM DATA
            // =========================

            const data = new FormData();


            // Backend expects "name"
            data.append(
                "name",
                formData.name.trim()
            );


            // Backend expects "caseId"
            data.append(
                "caseId",
                formData.case
            );


            data.append(
                "type",
                formData.type
            );


            data.append(
                "accessLevel",
                formData.accessLevel
            );


            data.append(
                "file",
                formData.file
            );


            // =========================
            // DEBUG
            // =========================

            console.log(
                "Uploading document:"
            );


            console.log(
                "Name:",
                formData.name
            );


            console.log(
                "Case ID:",
                formData.case
            );


            console.log(
                "Type:",
                formData.type
            );


            console.log(
                "Access Level:",
                formData.accessLevel
            );


            console.log(
                "File:",
                formData.file
            );


            // =========================
            // API REQUEST
            // =========================

            const response =
                await api.post(
                    "/documents",
                    data,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );


            console.log(
                "Upload response:",
                response.data
            );


            // =========================
            // SUCCESS MESSAGE
            // =========================

            alert(
                "Document uploaded successfully!"
            );


            // =========================
            // RESET FORM
            // =========================

            setFormData({
                name: "",
                case: "",
                type: "OTHER",
                accessLevel: "RESTRICTED",
                file: null
            });


            // =========================
            // CLOSE MODAL
            // =========================

            setShowUploadModal(false);


            // =========================
            // REFRESH DOCUMENTS
            // =========================

            fetchDocuments();

        } catch (error) {

            console.error(
                "Document upload error:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to upload document."
            );

        } finally {

            setUploading(false);

        }

    };


    // =========================
    // INTEGRITY DISPLAY
    // =========================

    const renderIntegrityStatus = (
        documentId
    ) => {

        const status =
            verificationStatus[
                documentId
            ];


        // Checking
        if (status === "CHECKING") {

            return (

                <span className="inline-flex items-center gap-1.5 text-xs text-yellow-600">

                    <Loader2
                        size={14}
                        className="animate-spin"
                    />

                    Checking...

                </span>

            );

        }


        // Verified
        if (status === "VERIFIED") {

            return (

                <span className="inline-flex items-center gap-1.5 text-xs text-green-700">

                    <ShieldCheck
                        size={14}
                    />

                    Verified

                </span>

            );

        }


        // Tampered
        if (status === "TAMPERED") {

            return (

                <span className="inline-flex items-center gap-1.5 text-xs text-red-700">

                    <ShieldAlert
                        size={14}
                    />

                    Tampered

                </span>

            );

        }


        // Error
        if (status === "ERROR") {

            return (

                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">

                    <ShieldAlert
                        size={14}
                    />

                    Verification Failed

                </span>

            );

        }


        // Default
        return (

            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">

                Not Verified

            </span>

        );

    };


    return (

        <DashboardLayout role="admin">


            {/* =========================
                HEADER
            ========================= */}

            <div className="mb-6 flex items-start justify-between">

                <div>

                    <h1 className="text-xl font-semibold">

                        Documents

                    </h1>


                    <p className="text-sm text-gray-500 mt-1">

                        Monitor protected case documents
                        and their integrity.

                    </p>

                </div>


                <button
                    onClick={() =>
                        setShowUploadModal(true)
                    }
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                >

                    <Upload
                        size={16}
                    />

                    Upload Document

                </button>

            </div>


            {/* =========================
                DOCUMENT TABLE
            ========================= */}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                <table className="w-full text-sm">

                    <thead className="bg-gray-50 border-b">

                        <tr>

                            <th className="text-left px-5 py-3">

                                Document

                            </th>


                            <th className="text-left px-5 py-3">

                                Case

                            </th>


                            <th className="text-left px-5 py-3">

                                Uploaded By

                            </th>


                            <th className="text-left px-5 py-3">

                                Version

                            </th>


                            <th className="text-left px-5 py-3">

                                Integrity

                            </th>


                            <th className="text-left px-5 py-3">

                                Action

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-5 py-8 text-center text-gray-500"
                                >

                                    Loading documents...

                                </td>

                            </tr>

                        ) : documents.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-5 py-8 text-center text-gray-500"
                                >

                                    No documents found.

                                </td>

                            </tr>

                        ) : (

                            documents.map(
                                (doc) => (

                                    <tr
                                        key={
                                            doc._id ||
                                            doc.documentId
                                        }
                                        className="border-b border-gray-100"
                                    >

                                        {/* =========================
                                            DOCUMENT
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                <FileText
                                                    size={18}
                                                />


                                                <div>

                                                    <p className="font-medium">

                                                        {doc.name}

                                                    </p>


                                                    <p className="text-xs text-gray-500">

                                                        {
                                                            doc.documentId
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =========================
                                            CASE
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            {
                                                doc.case?.caseId ||
                                                doc.case ||
                                                "-"
                                            }

                                        </td>


                                        {/* =========================
                                            UPLOADED BY
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            {
                                                doc.uploadedBy?.fullName ||
                                                "-"
                                            }

                                        </td>


                                        {/* =========================
                                            VERSION
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            v
                                            {doc.version || 1}

                                        </td>


                                        {/* =========================
                                            INTEGRITY
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            {renderIntegrityStatus(
                                                doc._id
                                            )}

                                        </td>


                                        {/* =========================
                                            ACTION
                                        ========================= */}

                                        <td className="px-5 py-4">

                                            <button
                                                onClick={() =>
                                                    openDocument(
                                                        doc._id
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                                            >

                                                <ExternalLink
                                                    size={14}
                                                />

                                                Open

                                            </button>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* =========================
                UPLOAD MODAL
            ========================= */}

            {showUploadModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

                        {/* =========================
                            MODAL HEADER
                        ========================= */}

                        <div className="flex items-center justify-between px-6 py-4 border-b">

                            <div>

                                <h2 className="text-lg font-semibold">

                                    Upload Document

                                </h2>


                                <p className="text-xs text-gray-500 mt-1">

                                    The document will be securely
                                    registered and its hash stored
                                    on the blockchain.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowUploadModal(false)
                                }
                                className="text-gray-500 hover:text-black"
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        {/* =========================
                            FORM
                        ========================= */}

                        <form
                            onSubmit={
                                handleUpload
                            }
                            className="p-6 space-y-4"
                        >

                            {/* =========================
                                DOCUMENT NAME
                            ========================= */}

                            <div>

                                <label className="block text-sm font-medium mb-1">

                                    Document Name

                                </label>


                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter document name"
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />

                            </div>


                            {/* =========================
                                CASE
                            ========================= */}

                            <div>

                                <label className="block text-sm font-medium mb-1">

                                    Case

                                </label>


                                <select
                                    name="case"
                                    value={
                                        formData.case
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                >

                                    <option value="">

                                        Select Case

                                    </option>


                                    {cases.map(
                                        (caseItem) => (

                                            <option
                                                key={
                                                    caseItem._id
                                                }
                                                value={
                                                    caseItem.caseId
                                                }
                                            >

                                                {
                                                    caseItem.caseId
                                                }

                                                {" - "}

                                                {
                                                    caseItem.title
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* =========================
                                DOCUMENT TYPE
                            ========================= */}

                            <div>

                                <label className="block text-sm font-medium mb-1">

                                    Document Type

                                </label>


                                <select
                                    name="type"
                                    value={
                                        formData.type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                >

                                    <option value="FIR">

                                        FIR

                                    </option>


                                    <option value="WITNESS_STATEMENT">

                                        Witness Statement

                                    </option>


                                    <option value="EVIDENCE_REPORT">

                                        Evidence Report

                                    </option>


                                    <option value="FORENSIC_REPORT">

                                        Forensic Report

                                    </option>


                                    <option value="CHARGE_SHEET">

                                        Charge Sheet

                                    </option>


                                    <option value="COURT_DOCUMENT">

                                        Court Document

                                    </option>


                                    <option value="OTHER">

                                        Other

                                    </option>

                                </select>

                            </div>


                            {/* =========================
                                ACCESS LEVEL
                            ========================= */}

                            <div>

                                <label className="block text-sm font-medium mb-1">

                                    Access Level

                                </label>


                                <select
                                    name="accessLevel"
                                    value={
                                        formData.accessLevel
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                >

                                    <option value="RESTRICTED">

                                        Restricted

                                    </option>


                                    <option value="READ">

                                        Read

                                    </option>


                                    <option value="READ_WRITE">

                                        Read & Write

                                    </option>

                                </select>

                            </div>


                            {/* =========================
                                FILE
                            ========================= */}

                            <div>

                                <label className="block text-sm font-medium mb-1">

                                    Select File

                                </label>


                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={
                                        handleFileChange
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />


                                {formData.file && (

                                    <p className="text-xs text-gray-500 mt-2">

                                        Selected:
                                        {" "}
                                        {
                                            formData.file.name
                                        }

                                    </p>

                                )}

                            </div>


                            {/* =========================
                                BUTTONS
                            ========================= */}

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowUploadModal(
                                            false
                                        )
                                    }
                                    className="px-4 py-2 border rounded-lg text-sm"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        uploading
                                    }
                                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                >

                                    {uploading && (

                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />

                                    )}


                                    {uploading
                                        ? "Uploading..."
                                        : "Upload Document"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

}

export default Documents;