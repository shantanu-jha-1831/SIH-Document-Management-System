import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    FileText,
    Search,
    Lock,
    ShieldCheck,
    AlertTriangle,
    Clock
} from "lucide-react";
import api from "../../services/api";
import DocumentViewer from "../../components/documents/DocumentViewer";

function Documents() {

    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selected document for viewer
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Integrity status of documents
    const [integrityStatus, setIntegrityStatus] = useState({});

    // Access request modal
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedRequestDocument, setSelectedRequestDocument] =
        useState(null);

    const [reason, setReason] = useState("");
    const [accessLevel, setAccessLevel] = useState("READ");

    const [requestLoading, setRequestLoading] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [requestError, setRequestError] = useState("");


    /* =========================================================
       VERIFY DOCUMENT INTEGRITY
    ========================================================= */

    const verifyIntegrity = async (documentId) => {

        try {

            // Show checking status
            setIntegrityStatus((prev) => ({
                ...prev,
                [documentId]: {
                    ...(prev[documentId] || {}),
                    status: "checking"
                }
            }));


            const response = await api.get(
                `/documents/${documentId}/verify`
            );

            const data = response.data;


            // Save complete verification information
            setIntegrityStatus((prev) => ({
                ...prev,

                [documentId]: {

                    status: data.verified
                        ? "verified"
                        : "tampered",

                    currentHash:
                        data.currentHash || null,

                    mongoHash:
                        data.mongoHash || null,

                    blockchainHash:
                        data.blockchainHash || null,

                    mongoVerified:
                        data.mongoVerified ?? false,

                    blockchainVerified:
                        data.blockchainVerified ?? false,

                    blockchainTimestamp:
                        data.blockchainTimestamp || null,

                    blockchainRegisteredBy:
                        data.blockchainRegisteredBy || null,

                    audit:
                        data.audit || null
                }
            }));


            return data.verified;

        } catch (err) {

            console.error(
                "Integrity verification error:",
                err
            );


            setIntegrityStatus((prev) => ({
                ...prev,

                [documentId]: {
                    ...(prev[documentId] || {}),
                    status: "error"
                }
            }));


            return false;
        }
    };


    /* =========================================================
       FETCH DOCUMENTS + AUTOMATIC VERIFICATION
    ========================================================= */

    useEffect(() => {

        let isMounted = true;


        const fetchDocuments = async () => {

            try {

                setLoading(true);
                setError("");


                const response = await api.get(
                    "/documents/my-documents"
                );


                const docs =
                    response.data.documents || [];


                if (!isMounted) {
                    return;
                }


                setDocuments(docs);


                /*
                 * Immediately mark every document as Checking...
                 */

                const checkingState = {};

                docs.forEach((document) => {

                    checkingState[document._id] = {
                        status: "checking"
                    };

                });


                setIntegrityStatus(checkingState);


                /*
                 * Stop page loading.
                 *
                 * The table can now appear while integrity
                 * verification happens in the background.
                 */

                setLoading(false);


                /*
                 * Automatically verify every document.
                 */

                await Promise.all(
                    docs.map((document) =>
                        verifyIntegrity(document._id)
                    )
                );

            } catch (err) {

                console.error(
                    "Error fetching documents:",
                    err
                );


                if (!isMounted) {
                    return;
                }


                setError(
                    err.response?.data?.message ||
                    "Failed to load documents."
                );


                setLoading(false);

            }

        };


        fetchDocuments();


        return () => {
            isMounted = false;
        };

    }, []);


    /* =========================================================
       SEARCH / FILTER
    ========================================================= */

    const filteredDocuments = documents.filter(
        (document) => {

            const searchText =
                search.toLowerCase();


            return (

                document.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                document.documentId
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                document.case?.caseId
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                document.type
                    ?.toLowerCase()
                    .includes(searchText)

            );

        }
    );


    /* =========================================================
       OPEN DOCUMENT
    ========================================================= */

    const handleOpenDocument = async (document) => {

        try {

            setError("");


            /*
             * If the document is already known to be tampered,
             * don't allow it to open.
             */

            const currentIntegrity =
                integrityStatus[document._id];


            if (
                currentIntegrity?.status ===
                "tampered"
            ) {

                alert(
                    "Security Alert: This document may have been modified or tampered with. Access has been blocked."
                );

                return;
            }


            /*
             * If verification has not completed yet,
             * verify it before opening.
             */

            if (
                !currentIntegrity ||
                currentIntegrity.status !== "verified"
            ) {

                const verified =
                    await verifyIntegrity(
                        document._id
                    );


                if (!verified) {

                    alert(
                        "Unable to verify document integrity. Access blocked."
                    );

                    return;
                }

            }


            /*
             * Verify once more immediately before opening.
             *
             * This ensures that the file has not changed
             * between automatic verification and opening.
             */

            const response = await api.get(
                `/documents/${document._id}/verify`
            );


            const data = response.data;


            setIntegrityStatus((prev) => ({
                ...prev,

                [document._id]: {

                    status: data.verified
                        ? "verified"
                        : "tampered",

                    currentHash:
                        data.currentHash || null,

                    mongoHash:
                        data.mongoHash || null,

                    blockchainHash:
                        data.blockchainHash || null,

                    mongoVerified:
                        data.mongoVerified ?? false,

                    blockchainVerified:
                        data.blockchainVerified ?? false,

                    blockchainTimestamp:
                        data.blockchainTimestamp || null,

                    blockchainRegisteredBy:
                        data.blockchainRegisteredBy ||
                        null,

                    audit:
                        data.audit || null
                }

            }));


            /*
             * Integrity failed
             */

            if (!data.verified) {

                alert(
                    "Security Alert: This document may have been modified or tampered with. Access has been blocked."
                );

                return;
            }


            /*
             * Integrity verified.
             * Open DocumentViewer.
             */

            setSelectedDocument(document);

        } catch (err) {

            console.error(
                "Document verification failed:",
                err
            );


            /*
             * Access denied
             */

            if (err.response?.status === 403) {

                alert(
                    err.response?.data?.message ||
                    "You do not have permission to access this document."
                );

                return;
            }


            setIntegrityStatus((prev) => ({
                ...prev,

                [document._id]: {
                    ...(prev[document._id] || {}),
                    status: "error"
                }
            }));


            alert(
                "Unable to verify document integrity. Access blocked."
            );

        }

    };


    /* =========================================================
       ACCESS TEXT
    ========================================================= */

    const getAccessText = (accessLevel) => {

        if (accessLevel === "READ_WRITE") {
            return "Read + Write";
        }

        if (accessLevel === "READ") {
            return "Read";
        }

        return "Restricted";
    };


    /* =========================================================
       OPEN ACCESS REQUEST MODAL
    ========================================================= */

    const openRequestModal = (document) => {

        setSelectedRequestDocument(document);

        setReason("");

        setAccessLevel("READ");

        setRequestMessage("");

        setRequestError("");

        setShowRequestModal(true);
    };


    /* =========================================================
       CLOSE ACCESS REQUEST MODAL
    ========================================================= */

    const closeRequestModal = () => {

        if (requestLoading) {
            return;
        }


        setShowRequestModal(false);

        setSelectedRequestDocument(null);

        setReason("");

        setAccessLevel("READ");

        setRequestMessage("");

        setRequestError("");
    };


    /* =========================================================
       SUBMIT ACCESS REQUEST
    ========================================================= */

    const submitAccessRequest = async () => {

        if (!selectedRequestDocument) {
            return;
        }


        if (!reason.trim()) {

            setRequestError(
                "Please provide a reason for requesting access."
            );

            return;
        }


        try {

            setRequestLoading(true);

            setRequestError("");

            setRequestMessage("");


            await api.post(
                "/access-requests",
                {
                    documentId:
                        selectedRequestDocument._id,

                    reason:
                        reason.trim(),

                    accessLevel
                }
            );


            setRequestMessage(
                "Access request submitted successfully."
            );


            setReason("");

            setAccessLevel("READ");


            /*
             * Close modal after showing success
             */

            setTimeout(() => {

                setShowRequestModal(false);

                setSelectedRequestDocument(null);

                setRequestMessage("");

            }, 1200);

        } catch (err) {

            console.error(
                "Access request error:",
                err
            );


            setRequestError(
                err.response?.data?.message ||
                "Failed to submit access request."
            );

        } finally {

            setRequestLoading(false);

        }

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <DashboardLayout role="officer">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    Documents
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Documents associated with your assigned cases.
                </p>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative w-full sm:w-80 mb-5">

                <Search
                    size={17}
                    className="absolute left-3 top-1/2
                               -translate-y-1/2
                               text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-2.5
                               border border-gray-300
                               rounded-md text-sm
                               outline-none
                               focus:border-gray-500"
                />

            </div>


            {/* =================================================
                DOCUMENT TABLE
            ================================================= */}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                {loading ? (

                    <div className="p-8 text-center text-sm text-gray-500">
                        Loading documents...
                    </div>

                ) : error ? (

                    <div className="p-8 text-center text-sm text-red-500">
                        {error}
                    </div>

                ) : filteredDocuments.length === 0 ? (

                    <div className="p-8 text-center text-sm text-gray-500">
                        No documents found.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            {/* =====================================
                                TABLE HEADER
                            ===================================== */}

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>

                                    <th className="text-left px-5 py-3">
                                        Document
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Case
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Type
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Version
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Access
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Integrity
                                    </th>

                                    <th className="text-right px-5 py-3">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            {/* =====================================
                                TABLE BODY
                            ===================================== */}

                            <tbody>

                                {filteredDocuments.map(
                                    (document) => {

                                        const accessText =
                                            getAccessText(
                                                document.accessLevel
                                            );


                                        const integrity =
                                            integrityStatus[
                                                document._id
                                            ];


                                        return (

                                            <tr
                                                key={document._id}
                                                className={`border-b
                                                    border-gray-100
                                                    last:border-0
                                                    hover:bg-gray-50
                                                    ${
                                                        integrity?.status ===
                                                        "tampered"
                                                            ? "bg-red-50"
                                                            : ""
                                                    }`}
                                            >

                                                {/* =================================
                                                    DOCUMENT
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <FileText
                                                            size={18}
                                                            className="text-gray-500"
                                                        />

                                                        <div>

                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    document.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    document.documentId
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* =================================
                                                    CASE
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <p>
                                                            {
                                                                document.case
                                                                    ?.caseId ||
                                                                "—"
                                                            }
                                                        </p>

                                                        {document.case?.title && (

                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    document.case.title
                                                                }
                                                            </p>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* =================================
                                                    TYPE
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    {document.type}

                                                </td>


                                                {/* =================================
                                                    VERSION
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    v{document.version}

                                                </td>


                                                {/* =================================
                                                    ACCESS
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    {document.accessLevel ===
                                                    "RESTRICTED" ? (

                                                        <span
                                                            className="inline-flex
                                                                       items-center
                                                                       gap-1.5
                                                                       text-xs
                                                                       text-gray-500"
                                                        >

                                                            <Lock
                                                                size={14}
                                                            />

                                                            Restricted

                                                        </span>

                                                    ) : (

                                                        <span
                                                            className="text-xs
                                                                       text-gray-700"
                                                        >
                                                            {accessText}
                                                        </span>

                                                    )}

                                                </td>


                                                {/* =================================
                                                    INTEGRITY
                                                ================================= */}

                                                <td className="px-5 py-4">

                                                    {/* Checking */}

                                                    {integrity?.status ===
                                                    "checking" ? (

                                                        <span
                                                            className="inline-flex
                                                                       items-center
                                                                       gap-1.5
                                                                       text-xs
                                                                       text-gray-500"
                                                        >

                                                            <Clock
                                                                size={14}
                                                            />

                                                            Checking...

                                                        </span>

                                                    ) :


                                                    /* Verified */

                                                    integrity?.status ===
                                                    "verified" ? (

                                                        <span
                                                            className="inline-flex
                                                                       items-center
                                                                       gap-1.5
                                                                       text-xs
                                                                       text-green-600
                                                                       font-medium"
                                                        >

                                                            <ShieldCheck
                                                                size={14}
                                                            />

                                                            Verified

                                                        </span>

                                                    ) :


                                                    /* Tampered */

                                                    integrity?.status ===
                                                    "tampered" ? (

                                                        <div>

                                                            <span
                                                                className="inline-flex
                                                                           items-center
                                                                           gap-1.5
                                                                           text-xs
                                                                           text-red-600
                                                                           font-medium"
                                                            >

                                                                <AlertTriangle
                                                                    size={14}
                                                                />

                                                                Tampered

                                                            </span>

                                                        </div>

                                                    ) :


                                                    /* Error */

                                                    integrity?.status ===
                                                    "error" ? (

                                                        <button
                                                            onClick={() =>
                                                                verifyIntegrity(
                                                                    document._id
                                                                )
                                                            }
                                                            className="text-xs
                                                                       text-red-600
                                                                       hover:text-red-800
                                                                       underline"
                                                        >
                                                            Verification failed
                                                            <br />
                                                            <span className="text-gray-600">
                                                                Retry
                                                            </span>
                                                        </button>

                                                    ) : (

                                                        /*
                                                         * Fallback.
                                                         * Normally this will not
                                                         * appear because automatic
                                                         * verification starts when
                                                         * the page loads.
                                                         */

                                                        <span className="text-xs text-gray-400">
                                                            Waiting...
                                                        </span>

                                                    )}

                                                </td>


                                                {/* =================================
                                                    ACTION
                                                ================================= */}

                                                <td className="px-5 py-4 text-right">

                                                    <div className="flex items-center justify-end gap-2">

                                                        {/* =========================
                                                            RE-VERIFY TAMPERED
                                                        ========================= */}

                                                        {integrity?.status ===
                                                        "tampered" && (

                                                            <button
                                                                onClick={() =>
                                                                    verifyIntegrity(
                                                                        document._id
                                                                    )
                                                                }
                                                                className="px-3
                                                                           py-1.5
                                                                           border
                                                                           border-red-300
                                                                           text-red-600
                                                                           rounded-md
                                                                           text-xs
                                                                           hover:bg-red-50
                                                                           transition"
                                                            >
                                                                Re-verify
                                                            </button>

                                                        )}


                                                        {/* =========================
                                                            OPEN
                                                        ========================= */}

                                                        <button
                                                            onClick={() =>
                                                                handleOpenDocument(
                                                                    document
                                                                )
                                                            }
                                                            disabled={
                                                                integrity?.status ===
                                                                "checking"
                                                            }
                                                            className={`px-3
                                                                       py-1.5
                                                                       rounded-md
                                                                       text-xs
                                                                       transition
                                                                       ${
                                                                           integrity?.status ===
                                                                           "checking"
                                                                               ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                               : integrity?.status ===
                                                                                 "tampered"
                                                                               ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                               : "bg-gray-900 text-white hover:bg-gray-800"
                                                                       }`}
                                                        >
                                                            Open
                                                        </button>


                                                        {/* =========================
                                                            REQUEST ACCESS
                                                        ========================= */}

                                                        {document.accessLevel ===
                                                            "RESTRICTED" && (

                                                            <button
                                                                onClick={() =>
                                                                    openRequestModal(
                                                                        document
                                                                    )
                                                                }
                                                                className="px-3
                                                                           py-1.5
                                                                           border
                                                                           border-gray-300
                                                                           text-gray-700
                                                                           rounded-md
                                                                           text-xs
                                                                           hover:bg-gray-50
                                                                           transition"
                                                            >
                                                                Request Access
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ACCESS REQUEST MODAL
            ================================================= */}

            {showRequestModal && (

                <div
                    className="fixed inset-0 z-50
                               flex items-center justify-center
                               bg-black/40 px-4"
                >

                    <div
                        className="bg-white
                                   w-full max-w-md
                                   rounded-lg
                                   shadow-xl"
                    >

                        {/* =========================================
                            MODAL HEADER
                        ========================================= */}

                        <div
                            className="px-5 py-4
                                       border-b border-gray-200"
                        >

                            <h2 className="text-lg font-semibold text-gray-900">
                                Request Document Access
                            </h2>

                            <p className="text-xs text-gray-500 mt-1">
                                Submit a request to access this restricted document.
                            </p>

                        </div>


                        {/* =========================================
                            MODAL BODY
                        ========================================= */}

                        <div className="p-5 space-y-4">

                            {/* Document */}

                            <div
                                className="bg-gray-50
                                           border border-gray-200
                                           rounded-md
                                           p-3"
                            >

                                <p className="text-xs text-gray-500">
                                    Document
                                </p>

                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {
                                        selectedRequestDocument?.name
                                    }
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    {
                                        selectedRequestDocument?.documentId
                                    }
                                </p>

                            </div>


                            {/* Access Level */}

                            <div>

                                <label
                                    className="block
                                               text-sm
                                               font-medium
                                               text-gray-700
                                               mb-1.5"
                                >
                                    Requested Access
                                </label>

                                <select
                                    value={accessLevel}
                                    onChange={(e) =>
                                        setAccessLevel(
                                            e.target.value
                                        )
                                    }
                                    className="w-full
                                               px-3 py-2
                                               border border-gray-300
                                               rounded-md
                                               text-sm
                                               outline-none
                                               focus:border-gray-500"
                                >

                                    <option value="READ">
                                        Read Only
                                    </option>

                                    <option value="READ_WRITE">
                                        Read + Write
                                    </option>

                                </select>

                            </div>


                            {/* Reason */}

                            <div>

                                <label
                                    className="block
                                               text-sm
                                               font-medium
                                               text-gray-700
                                               mb-1.5"
                                >
                                    Reason
                                </label>

                                <textarea
                                    value={reason}
                                    onChange={(e) =>
                                        setReason(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Explain why you need access..."
                                    className="w-full
                                               px-3 py-2
                                               border border-gray-300
                                               rounded-md
                                               text-sm
                                               outline-none
                                               resize-none
                                               focus:border-gray-500"
                                />

                            </div>


                            {/* Request Error */}

                            {requestError && (

                                <div
                                    className="p-3
                                               bg-red-50
                                               border border-red-200
                                               rounded-md
                                               text-xs
                                               text-red-600"
                                >
                                    {requestError}
                                </div>

                            )}


                            {/* Request Success */}

                            {requestMessage && (

                                <div
                                    className="p-3
                                               bg-green-50
                                               border border-green-200
                                               rounded-md
                                               text-xs
                                               text-green-600"
                                >
                                    {requestMessage}
                                </div>

                            )}

                        </div>


                        {/* =========================================
                            MODAL FOOTER
                        ========================================= */}

                        <div
                            className="px-5 py-4
                                       border-t border-gray-200
                                       flex justify-end gap-2"
                        >

                            <button
                                onClick={closeRequestModal}
                                disabled={requestLoading}
                                className="px-4 py-2
                                           border border-gray-300
                                           text-gray-700
                                           rounded-md
                                           text-sm
                                           hover:bg-gray-50
                                           disabled:opacity-50"
                            >
                                Cancel
                            </button>


                            <button
                                onClick={submitAccessRequest}
                                disabled={requestLoading}
                                className="px-4 py-2
                                           bg-gray-900
                                           text-white
                                           rounded-md
                                           text-sm
                                           hover:bg-gray-800
                                           disabled:opacity-50"
                            >
                                {requestLoading
                                    ? "Submitting..."
                                    : "Submit Request"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                DOCUMENT VIEWER
            ================================================= */}

            <DocumentViewer
                document={selectedDocument}
                onClose={() =>
                    setSelectedDocument(null)
                }
            />

        </DashboardLayout>

    );
}

export default Documents;