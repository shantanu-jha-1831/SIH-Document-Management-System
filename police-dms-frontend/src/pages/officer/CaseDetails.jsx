import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";

import {
    ArrowLeft,
    FileText,
    Lock,
    Users,
    ShieldCheck,
    ShieldAlert,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Loader2
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";


function CaseDetails() {

    const navigate = useNavigate();
    const { caseId } = useParams();


    // =====================================================
    // CASE / DOCUMENT STATE
    // =====================================================

    const [caseData, setCaseData] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // ACCESS REQUEST STATE
    // =====================================================

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const [permission, setPermission] = useState("READ");
    const [reason, setReason] = useState("");
    const [requestingAccess, setRequestingAccess] = useState(false);


    // =====================================================
    // DOCUMENT OPENING STATE
    // =====================================================

    const [openingDocument, setOpeningDocument] = useState(null);


    // =====================================================
    // INTEGRITY STATE
    // =====================================================

    const [integrityStatus, setIntegrityStatus] = useState({});
    const [checkingIntegrity, setCheckingIntegrity] = useState({});

    const verificationInProgress = useRef({});

    const [selectedIntegrityDocument, setSelectedIntegrityDocument] =
        useState(null);

    const [showIntegrityModal, setShowIntegrityModal] = useState(false);


    // =====================================================
    // FETCH CASE DETAILS
    // =====================================================

    useEffect(() => {

        const fetchCaseDetails = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/cases/${caseId}`
                );

                setCaseData(
                    response.data.case
                );

            } catch (error) {

                console.error(
                    "Error fetching case details:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load case details"
                );

            } finally {

                setLoading(false);

            }

        };


        if (caseId) {
            fetchCaseDetails();
        }

    }, [caseId]);


    // =====================================================
    // FETCH CASE DOCUMENTS
    // =====================================================

    useEffect(() => {

        const fetchDocuments = async () => {

            try {

                setDocumentsLoading(true);

                const response = await api.get(
                    "/documents"
                );

                const allDocuments =
                    response.data.documents || [];


                const caseDocuments =
                    allDocuments.filter(
                        (document) => {

                            if (!document.case) {
                                return false;
                            }


                            if (
                                typeof document.case ===
                                "object"
                            ) {

                                return (
                                    document.case._id ===
                                    caseData?._id
                                );

                            }


                            return (
                                document.case ===
                                caseData?._id
                            );

                        }
                    );


                setDocuments(
                    caseDocuments
                );

            } catch (error) {

                console.error(
                    "Error fetching case documents:",
                    error
                );

            } finally {

                setDocumentsLoading(false);

            }

        };


        if (caseData?._id) {
            fetchDocuments();
        }

    }, [caseData]);


    // =====================================================
    // VERIFY DOCUMENT INTEGRITY
    // =====================================================

    const verifyDocument = async (document) => {

        if (!document?._id) {
            return;
        }


        const documentId = document._id;


        if (
            verificationInProgress.current[
                documentId
            ]
        ) {
            return;
        }


        verificationInProgress.current[
            documentId
        ] = true;


        try {

            setCheckingIntegrity((previous) => ({
                ...previous,
                [documentId]: true
            }));


            const response = await api.get(
                `/documents/${documentId}/verify`
            );


            console.log(
                "Integrity verification response:",
                response.data
            );


            const data = response.data;


            const status =
                data.verified === true
                    ? "VERIFIED"
                    : data.verified === false
                        ? "TAMPERED"
                        : "UNKNOWN";


            console.log(
                "Setting integrity status:",
                document.documentId,
                status
            );


            setIntegrityStatus((previous) => ({

                ...previous,

                [documentId]: {

                    status,

                    mongoHash:
                        data.mongoHash ||
                        document.fileHash ||
                        "N/A",

                    currentHash:
                        data.currentHash ||
                        "N/A",

                    blockchainHash:
                        data.blockchainHash ||
                        "N/A",

                    mongoVerified:
                        data.mongoVerified ?? false,

                    blockchainVerified:
                        data.blockchainVerified ?? false,

                    blockchainTimestamp:
                        data.blockchainTimestamp ||
                        null,

                    blockchainRegisteredBy:
                        data.blockchainRegisteredBy ||
                        null,

                    blockchainStatus:
                        data.blockchainVerified
                            ? "Verified"
                            : "Hash mismatch",

                    message:
                        data.verified
                            ? "Document integrity verified successfully against MongoDB and blockchain."
                            : "Document integrity verification failed. Possible tampering or blockchain mismatch detected.",

                    // =========================================
                    // NEW INVESTIGATION INFORMATION
                    // =========================================

                    audit:
                        data.audit || null

                }

            }));


        } catch (error) {

            console.error(
                "Error verifying document:",
                error
            );


            setIntegrityStatus((previous) => ({

                ...previous,

                [documentId]: {

                    status: "UNKNOWN",

                    mongoHash:
                        document.fileHash ||
                        "N/A",

                    currentHash:
                        "N/A",

                    blockchainHash:
                        "N/A",

                    mongoVerified: false,

                    blockchainVerified: false,

                    blockchainTimestamp: null,

                    blockchainRegisteredBy: null,

                    blockchainStatus:
                        "Unable to verify",

                    message:
                        error.response?.data?.message ||
                        "Unable to verify document integrity.",

                    // No audit information
                    audit: null

                }

            }));

        } finally {

            verificationInProgress.current[
                documentId
            ] = false;


            setCheckingIntegrity((previous) => ({

                ...previous,

                [documentId]: false

            }));

        }

    };


    // =====================================================
    // VERIFY ALL DOCUMENTS WHEN LOADED
    // =====================================================

    useEffect(() => {

        if (!documents.length) {
            return;
        }


        const verifyAllDocuments = async () => {

            await Promise.all(
                documents.map(
                    (document) =>
                        verifyDocument(document)
                )
            );

        };


        verifyAllDocuments();

    }, [documents]);


    // =====================================================
    // GET INTEGRITY INFORMATION
    // =====================================================

    const getIntegrity = (document) => {

        return (
            integrityStatus[document._id] || {

                status: "UNKNOWN",

                mongoHash:
                    document.fileHash ||
                    "N/A",

                currentHash:
                    "N/A",

                blockchainHash:
                    "N/A",

                mongoVerified: false,

                blockchainVerified: false,

                blockchainTimestamp: null,

                blockchainRegisteredBy: null,

                blockchainStatus:
                    "Checking...",

                message: "",

                audit: null

            }
        );

    };


    // =====================================================
    // OPEN DOCUMENT
    // =====================================================

    const openDocument = async (documentId) => {

        let newWindow = null;


        try {

            setOpeningDocument(documentId);


            // -------------------------------------------------
            // OPEN NEW TAB IMMEDIATELY
            // -------------------------------------------------

            newWindow = window.open(
                "",
                "_blank"
            );


            if (!newWindow) {

                alert(
                    "Please allow pop-ups for this application."
                );

                return;

            }


            // -------------------------------------------------
            // LOADING PAGE
            // -------------------------------------------------

            newWindow.document.write(`
                <!DOCTYPE html>

                <html>

                    <head>
                        <title>Opening Document...</title>
                    </head>

                    <body style="
                        margin: 0;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        font-family: Arial, sans-serif;
                        background: #f9fafb;
                    ">

                        <div style="
                            text-align: center;
                            color: #6b7280;
                        ">

                            <p style="
                                font-size: 14px;
                                margin-bottom: 8px;
                            ">
                                Loading document...
                            </p>

                            <p style="
                                font-size: 12px;
                            ">
                                Please wait
                            </p>

                        </div>

                    </body>

                </html>
            `);


            // -------------------------------------------------
            // GET PDF
            // -------------------------------------------------

            const response = await api.get(
                `/documents/${documentId}/file`,
                {
                    responseType: "blob"
                }
            );


            console.log(
                "Document response status:",
                response.status
            );


            console.log(
                "Document content type:",
                response.headers["content-type"]
            );


            console.log(
                "Document size:",
                response.data?.size
            );


            // -------------------------------------------------
            // CHECK CONTENT TYPE
            // -------------------------------------------------

            const contentType =
                response.headers["content-type"] || "";


            if (
                !contentType
                    .toLowerCase()
                    .includes("application/pdf")
            ) {

                let serverMessage =
                    "Server did not return a PDF file.";


                try {

                    const text =
                        await response.data.text();


                    try {

                        const json =
                            JSON.parse(text);


                        serverMessage =
                            json.message ||
                            serverMessage;

                    } catch {

                        if (text) {
                            serverMessage = text;
                        }

                    }

                } catch {
                    // Ignore parsing error
                }


                throw new Error(
                    serverMessage
                );

            }


            // -------------------------------------------------
            // CHECK EMPTY FILE
            // -------------------------------------------------

            if (
                !response.data ||
                response.data.size === 0
            ) {

                throw new Error(
                    "The server returned an empty PDF file."
                );

            }


            // -------------------------------------------------
            // CREATE OBJECT URL
            // -------------------------------------------------

            const fileUrl =
                URL.createObjectURL(
                    response.data
                );


            console.log(
                "PDF Blob URL:",
                fileUrl
            );


            // -------------------------------------------------
            // OPEN PDF
            // -------------------------------------------------

            newWindow.location.href =
                fileUrl;


            // -------------------------------------------------
            // CLEANUP
            // -------------------------------------------------

            setTimeout(() => {

                URL.revokeObjectURL(
                    fileUrl
                );

            }, 120000);


        } catch (error) {

            console.error(
                "Error opening document:",
                error
            );


            console.error(
                "Status:",
                error.response?.status
            );


            console.error(
                "Response headers:",
                error.response?.headers
            );


            let errorMessage =
                "Unable to open document.";


            if (
                error.response?.data instanceof Blob
            ) {

                try {

                    const text =
                        await error.response.data.text();


                    try {

                        const json =
                            JSON.parse(text);


                        errorMessage =
                            json.message ||
                            errorMessage;

                    } catch {

                        if (text) {
                            errorMessage = text;
                        }

                    }

                } catch {
                    // Ignore blob parsing error
                }

            } else {

                errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    errorMessage;

            }


            if (
                newWindow &&
                !newWindow.closed
            ) {

                newWindow.close();

            }


            alert(
                errorMessage
            );

        } finally {

            setOpeningDocument(null);

        }

    };


    // =====================================================
    // INVESTIGATE TAMPERED DOCUMENT
    // =====================================================

    const investigateDocument = async (document) => {

        setSelectedIntegrityDocument(
            document
        );


        setShowIntegrityModal(true);


        /*
         * Run verification again so the
         * investigation always displays
         * fresh audit information.
         */

        await verifyDocument(document);

    };


    // =====================================================
    // CLOSE INTEGRITY MODAL
    // =====================================================

    const closeIntegrityModal = () => {

        setShowIntegrityModal(false);

        setSelectedIntegrityDocument(null);

    };


    // =====================================================
    // OPEN REQUEST MODAL
    // =====================================================

    const openRequestModal = (document) => {

        setSelectedDocument(
            document
        );

        setPermission("READ");

        setReason("");

        setShowRequestModal(true);

    };


    // =====================================================
    // CLOSE REQUEST MODAL
    // =====================================================

    const closeRequestModal = () => {

        if (requestingAccess) {
            return;
        }


        setShowRequestModal(false);

        setSelectedDocument(null);

        setReason("");

        setPermission("READ");

    };


    // =====================================================
    // REQUEST DOCUMENT ACCESS
    // =====================================================

    const handleRequestAccess = async () => {

        if (!selectedDocument) {

            alert(
                "Please select a document."
            );

            return;

        }


        if (!reason.trim()) {

            alert(
                "Please provide a reason for requesting access."
            );

            return;

        }


        try {

            setRequestingAccess(true);


            const response =
                await api.post(
                    "/access-requests",
                    {
                        documentId:
                            selectedDocument._id,

                        reason:
                            reason.trim(),

                        accessLevel:
                            permission
                    }
                );


            console.log(
                "Access request response:",
                response.data
            );


            alert(
                response.data?.message ||
                "Access request submitted successfully."
            );


            closeRequestModal();


        } catch (error) {

            console.error(
                "Error requesting document access:",
                error
            );


            const message =
                error.response?.data?.message ||
                "Failed to submit access request.";


            if (
                message
                    .toLowerCase()
                    .includes("already have access")
            ) {

                alert(
                    "You already have access to this case. Please use the Open button to access the document."
                );

            } else {

                alert(
                    message
                );

            }

        } finally {

            setRequestingAccess(false);

        }

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }


        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // FORMAT TIMESTAMP
    // =====================================================

    const formatTimestamp = (timestamp) => {

        if (!timestamp) {
            return "Not available";
        }


        try {

            return new Date(
                timestamp
            ).toLocaleString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

        } catch {

            return "Not available";

        }

    };


    // =====================================================
    // INTEGRITY BADGE
    // =====================================================

    const IntegrityBadge = ({ document }) => {

        const integrity =
            getIntegrity(document);


        const isChecking =
            checkingIntegrity[
                document._id
            ];


        if (isChecking) {

            return (

                <span
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        rounded-full
                        bg-gray-100
                        text-gray-600
                    "
                >

                    <Loader2
                        size={13}
                        className="animate-spin"
                    />

                    Checking...

                </span>

            );

        }


        if (
            integrity.status ===
            "VERIFIED"
        ) {

            return (

                <span
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        rounded-full
                        bg-green-50
                        text-green-700
                        border
                        border-green-200
                    "
                >

                    <CheckCircle
                        size={13}
                    />

                    Verified

                </span>

            );

        }


        if (
            integrity.status ===
            "TAMPERED"
        ) {

            return (

                <span
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        rounded-full
                        bg-red-50
                        text-red-700
                        border
                        border-red-200
                    "
                >

                    <ShieldAlert
                        size={13}
                    />

                    Tampered

                </span>

            );

        }


        return (

            <span
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    text-xs
                    font-medium
                    rounded-full
                    bg-yellow-50
                    text-yellow-700
                    border
                    border-yellow-200
                "
            >

                <AlertTriangle
                    size={13}
                />

                Verification error

            </span>

        );

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <DashboardLayout role="officer">

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        py-20
                    "
                >

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Loading case details...
                    </p>

                </div>

            </DashboardLayout>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !caseData) {

        return (

            <DashboardLayout role="officer">

                <button
                    onClick={() =>
                        navigate(-1)
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-600
                        hover:text-gray-900
                        mb-5
                    "
                >

                    <ArrowLeft
                        size={17}
                        strokeWidth={1.8}
                    />

                    Back

                </button>


                <div
                    className="
                        bg-red-50
                        border
                        border-red-200
                        rounded-lg
                        p-4
                    "
                >

                    <p
                        className="
                            text-sm
                            text-red-700
                        "
                    >

                        {error ||
                            "Case not found"}

                    </p>

                </div>

            </DashboardLayout>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DashboardLayout role="officer">


            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
                onClick={() =>
                    navigate(-1)
                }
                className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-gray-600
                    hover:text-gray-900
                    mb-5
                "
            >

                <ArrowLeft
                    size={17}
                    strokeWidth={1.8}
                />

                Back

            </button>


            {/* =================================================
                PAGE HEADING
            ================================================= */}

            <div className="mb-6">

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                        gap-4
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <h1
                                className="
                                    text-xl
                                    font-semibold
                                    text-gray-900
                                "
                            >

                                {caseData.caseId}

                            </h1>


                            <span
                                className="
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    bg-gray-100
                                    text-gray-700
                                    rounded
                                "
                            >

                                {caseData.status}

                            </span>

                        </div>


                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-2
                            "
                        >

                            {caseData.title}

                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                CASE INFORMATION
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-lg
                    p-6
                    mb-6
                "
            >

                <div className="mb-5">

                    <h2
                        className="
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        Case Information
                    </h2>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >
                        Basic information associated with this case.
                    </p>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-5
                    "
                >

                    <div>

                        <p className="text-xs text-gray-500">
                            Case ID
                        </p>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                                mt-1
                            "
                        >
                            {caseData.caseId}
                        </p>

                    </div>


                    <div>

                        <p className="text-xs text-gray-500">
                            FIR Number
                        </p>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                                mt-1
                            "
                        >
                            {caseData.firNumber}
                        </p>

                    </div>


                    <div>

                        <p className="text-xs text-gray-500">
                            Incident Date
                        </p>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                                mt-1
                            "
                        >
                            {formatDate(
                                caseData.incidentDate
                            )}
                        </p>

                    </div>


                    <div>

                        <p className="text-xs text-gray-500">
                            Registered Date
                        </p>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                                mt-1
                            "
                        >
                            {formatDate(
                                caseData.createdAt
                            )}
                        </p>

                    </div>

                </div>


                {/* DESCRIPTION */}

                <div
                    className="
                        border-t
                        border-gray-200
                        mt-6
                        pt-5
                    "
                >

                    <p className="text-xs text-gray-500">
                        Case Description
                    </p>

                    <p
                        className="
                            text-sm
                            text-gray-700
                            mt-1
                            leading-6
                        "
                    >
                        {caseData.description}
                    </p>

                </div>


                {/* LEAD OFFICER */}

                <div
                    className="
                        border-t
                        border-gray-200
                        mt-5
                        pt-5
                    "
                >

                    <p className="text-xs text-gray-500">
                        Lead Officer
                    </p>

                    <div className="mt-1">

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                            "
                        >

                            {caseData.leadOfficer?.fullName ||
                                "Not assigned"}

                        </p>


                        {caseData.leadOfficer && (

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                            >

                                {caseData.leadOfficer.rank}

                                {" • "}

                                {caseData.leadOfficer.policeNumber}

                                {" • "}

                                {caseData.leadOfficer.department}

                            </p>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                SECURITY NOTICE
            ================================================= */}

            <div
                className="
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-lg
                    p-4
                    mb-6
                "
            >

                <div
                    className="
                        flex
                        items-start
                        gap-3
                    "
                >

                    <ShieldCheck
                        size={19}
                        strokeWidth={1.8}
                        className="
                            text-gray-600
                            mt-0.5
                        "
                    />


                    <div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-900
                            "
                        >
                            Secure document access
                        </p>


                        <p
                            className="
                                text-xs
                                text-gray-600
                                mt-1
                                leading-5
                            "
                        >

                            Case documents are protected using
                            access control and integrity verification.
                            Document hashes are compared with their
                            registered blockchain records. All document
                            access and integrity checks are recorded
                            in the audit system.

                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                CASE DOCUMENTS
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-lg
                    overflow-hidden
                    mb-6
                "
            >

                {/* HEADER */}

                <div
                    className="
                        p-6
                        border-b
                        border-gray-200
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <FileText
                                size={19}
                                strokeWidth={1.8}
                                className="text-gray-600"
                            />


                            <div>

                                <h2
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    Case Documents
                                </h2>


                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Documents associated with this case.
                                </p>

                            </div>

                        </div>


                        <span
                            className="
                                text-xs
                                text-gray-500
                            "
                        >

                            {documents.length}{" "}

                            {documents.length === 1
                                ? "document"
                                : "documents"}

                        </span>

                    </div>

                </div>


                {/* DOCUMENT LOADING */}

                {documentsLoading ? (

                    <div
                        className="
                            px-6
                            py-10
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            text-gray-500
                        "
                    >

                        <Loader2
                            size={17}
                            className="animate-spin"
                        />

                        Loading documents...

                    </div>

                ) : documents.length === 0 ? (

                    <div
                        className="
                            px-6
                            py-10
                            text-center
                        "
                    >

                        <FileText
                            size={30}
                            strokeWidth={1.5}
                            className="
                                mx-auto
                                text-gray-400
                                mb-3
                            "
                        />


                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-700
                            "
                        >
                            No documents available
                        </p>


                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-1
                            "
                        >
                            Documents will appear here once
                            they are uploaded to this case.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            divide-y
                            divide-gray-100
                        "
                    >

                        {documents.map(
                            (document) => {

                                const integrity =
                                    getIntegrity(
                                        document
                                    );


                                const isTampered =
                                    integrity.status ===
                                    "TAMPERED";


                                return (

                                    <div
                                        key={document._id}
                                        className={`
                                            p-5
                                            ${
                                                isTampered
                                                    ? "bg-red-50/40"
                                                    : ""
                                            }
                                        `}
                                    >

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                lg:flex-row
                                                lg:items-center
                                                lg:justify-between
                                                gap-4
                                            "
                                        >

                                            {/* DOCUMENT INFO */}

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    gap-3
                                                    min-w-0
                                                "
                                            >

                                                <div
                                                    className={`
                                                        w-10
                                                        h-10
                                                        rounded-md
                                                        flex
                                                        items-center
                                                        justify-center
                                                        flex-shrink-0
                                                        ${
                                                            isTampered
                                                                ? "bg-red-100"
                                                                : "bg-gray-100"
                                                        }
                                                    `}
                                                >

                                                    {isTampered ? (

                                                        <ShieldAlert
                                                            size={19}
                                                            className="text-red-600"
                                                        />

                                                    ) : (

                                                        <FileText
                                                            size={19}
                                                            className="text-gray-500"
                                                        />

                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-gray-900
                                                            truncate
                                                        "
                                                    >
                                                        {document.name}
                                                    </p>


                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            gap-3
                                                            mt-1
                                                        "
                                                    >

                                                        <span className="text-xs text-gray-500">
                                                            {document.documentId}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            {document.type}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            Version{" "}
                                                            {document.version}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            {document.accessLevel}
                                                        </span>

                                                    </div>


                                                    {/* INTEGRITY STATUS */}

                                                    <div className="mt-3">

                                                        <IntegrityBadge
                                                            document={
                                                                document
                                                            }
                                                        />

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    flex-shrink-0
                                                "
                                            >

                                                {isTampered ? (

                                                    <button
                                                        onClick={() =>
                                                            investigateDocument(
                                                                document
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            px-3
                                                            py-1.5
                                                            bg-red-600
                                                            text-white
                                                            rounded-md
                                                            text-xs
                                                            font-medium
                                                            hover:bg-red-700
                                                        "
                                                    >

                                                        <ShieldAlert
                                                            size={14}
                                                        />

                                                        Investigate

                                                    </button>

                                                ) : (

                                                    <button
                                                        onClick={() =>
                                                            openDocument(
                                                                document._id
                                                            )
                                                        }
                                                        disabled={
                                                            openingDocument ===
                                                                document._id ||
                                                            integrity.status !==
                                                                "VERIFIED"
                                                        }
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            px-3
                                                            py-1.5
                                                            border
                                                            border-gray-300
                                                            rounded-md
                                                            text-xs
                                                            font-medium
                                                            text-gray-700
                                                            hover:bg-gray-50
                                                            disabled:opacity-50
                                                            disabled:cursor-not-allowed
                                                        "
                                                    >

                                                        {openingDocument ===
                                                        document._id ? (

                                                            <Loader2
                                                                size={14}
                                                                className="
                                                                    animate-spin
                                                                "
                                                            />

                                                        ) : (

                                                            <ExternalLink
                                                                size={14}
                                                            />

                                                        )}


                                                        {openingDocument ===
                                                        document._id
                                                            ? "Opening..."
                                                            : "Open"}

                                                    </button>

                                                )}


                                                {/* REQUEST ACCESS */}

                                                <button
                                                    onClick={() =>
                                                        openRequestModal(
                                                            document
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        px-3
                                                        py-1.5
                                                        bg-gray-900
                                                        text-white
                                                        rounded-md
                                                        text-xs
                                                        font-medium
                                                        hover:bg-gray-800
                                                    "
                                                >

                                                    <Lock
                                                        size={14}
                                                    />

                                                    Request Access

                                                </button>

                                            </div>

                                        </div>


                                        {/* TAMPER WARNING */}

                                        {isTampered && (

                                            <div
                                                className="
                                                    mt-4
                                                    bg-red-100
                                                    border
                                                    border-red-200
                                                    rounded-md
                                                    p-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        gap-2
                                                    "
                                                >

                                                    <AlertTriangle
                                                        size={16}
                                                        className="
                                                            text-red-600
                                                            mt-0.5
                                                            flex-shrink-0
                                                        "
                                                    />


                                                    <div>

                                                        <p
                                                            className="
                                                                text-xs
                                                                font-semibold
                                                                text-red-800
                                                            "
                                                        >
                                                            Document integrity compromised
                                                        </p>


                                                        <p
                                                            className="
                                                                text-xs
                                                                text-red-700
                                                                mt-1
                                                                leading-5
                                                            "
                                                        >
                                                            The current document hash does not
                                                            match the registered integrity record.
                                                            This document has been flagged for
                                                            investigation and should not be treated
                                                            as an unmodified original.
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* =================================================
                ASSIGNED TEAM
            ================================================= */}

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-lg
                    p-6
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        mb-5
                    "
                >

                    <Users
                        size={19}
                        strokeWidth={1.8}
                        className="text-gray-600"
                    />


                    <div>

                        <h2
                            className="
                                text-base
                                font-semibold
                                text-gray-900
                            "
                        >
                            Assigned Team
                        </h2>


                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-1
                            "
                        >
                            Officers currently assigned to this case.
                        </p>

                    </div>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-3
                    "
                >

                    {/* LEAD OFFICER */}

                    {caseData.leadOfficer && (

                        <div
                            className="
                                border
                                border-gray-200
                                rounded-md
                                p-4
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-900
                                    "
                                >
                                    {caseData.leadOfficer.fullName}
                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >

                                    {caseData.leadOfficer.rank}

                                    {" • Lead Officer"}

                                </p>

                            </div>


                            <span
                                className="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                {caseData.leadOfficer.policeNumber}
                            </span>

                        </div>

                    )}


                    {/* ASSIGNED OFFICERS */}

                    {caseData.assignedOfficers?.map(
                        (member) => (

                            <div
                                key={member._id}
                                className="
                                    border
                                    border-gray-200
                                    rounded-md
                                    p-4
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-gray-900
                                        "
                                    >
                                        {member.fullName}
                                    </p>


                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >

                                        {member.rank}

                                        {" • Team Member"}

                                    </p>

                                </div>


                                <span
                                    className="
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    {member.policeNumber}
                                </span>

                            </div>

                        )
                    )}

                </div>


                {!caseData.leadOfficer &&
                    (!caseData.assignedOfficers ||
                        caseData.assignedOfficers.length === 0) && (

                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            No officers assigned to this case.
                        </p>

                    )}

            </div>


            {/* =================================================
                REQUEST ACCESS MODAL
            ================================================= */}

            <Modal
                isOpen={showRequestModal}
                onClose={closeRequestModal}
                title="Request Document Access"
            >

                {selectedDocument && (

                    <div>

                        {/* DOCUMENT */}

                        <div
                            className="
                                bg-gray-50
                                border
                                border-gray-200
                                rounded-md
                                p-3
                                mb-5
                            "
                        >

                            <p className="text-xs text-gray-500">
                                Document
                            </p>


                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-900
                                    mt-1
                                "
                            >
                                {selectedDocument.name}
                            </p>


                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                            >
                                {selectedDocument.documentId}
                            </p>

                        </div>


                        {/* PERMISSION */}

                        <div className="mb-4">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-1.5
                                "
                            >
                                Requested Permission
                            </label>


                            <select
                                value={permission}
                                onChange={(e) =>
                                    setPermission(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    requestingAccess
                                }
                                className="
                                    w-full
                                    px-3
                                    py-2.5
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    bg-white
                                    outline-none
                                    disabled:bg-gray-100
                                "
                            >

                                <option value="READ">
                                    Read Only
                                </option>

                                <option value="READ_WRITE">
                                    Read + Write
                                </option>

                            </select>

                        </div>


                        {/* REASON */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-1.5
                                "
                            >
                                Reason for Access
                            </label>


                            <textarea
                                value={reason}
                                onChange={(e) =>
                                    setReason(
                                        e.target.value
                                    )
                                }
                                rows="4"
                                disabled={
                                    requestingAccess
                                }
                                placeholder="Explain why access to this document is required..."
                                className="
                                    w-full
                                    px-3
                                    py-2.5
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    resize-none
                                    disabled:bg-gray-100
                                "
                            />

                        </div>


                        {/* SECURITY NOTICE */}

                        <div
                            className="
                                bg-gray-50
                                border
                                border-gray-200
                                rounded-md
                                p-3
                                mb-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2
                                "
                            >

                                <Lock
                                    size={16}
                                    strokeWidth={1.8}
                                    className="
                                        text-gray-500
                                        mt-0.5
                                    "
                                />


                                <p
                                    className="
                                        text-xs
                                        text-gray-600
                                        leading-5
                                    "
                                >
                                    Access will remain blocked until
                                    the station administrator approves
                                    this request. All approved document
                                    access is recorded in the audit system.
                                </p>

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div
                            className="
                                flex
                                justify-end
                                gap-3
                            "
                        >

                            <button
                                onClick={
                                    closeRequestModal
                                }
                                disabled={
                                    requestingAccess
                                }
                                className="
                                    px-4
                                    py-2
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>


                            <button
                                onClick={
                                    handleRequestAccess
                                }
                                disabled={
                                    requestingAccess ||
                                    !reason.trim()
                                }
                                className="
                                    px-4
                                    py-2
                                    bg-gray-900
                                    text-white
                                    rounded-md
                                    text-sm
                                    font-medium
                                    hover:bg-gray-800
                                    disabled:opacity-50
                                "
                            >

                                {requestingAccess
                                    ? "Submitting..."
                                    : "Submit Request"}

                            </button>

                        </div>

                    </div>

                )}

            </Modal>


            {/* =================================================
                INTEGRITY INVESTIGATION MODAL
            ================================================= */}

            <Modal
                isOpen={showIntegrityModal}
                onClose={closeIntegrityModal}
                title="Document Integrity Investigation"
            >

                {selectedIntegrityDocument && (() => {

                    const integrity =
                        getIntegrity(
                            selectedIntegrityDocument
                        );


                    const isTampered =
                        integrity.status ===
                        "TAMPERED";


                    const audit =
                        integrity.audit;


                    const auditUser =
                        audit?.user;


                    return (

                        <div>

                            {/* =====================================
                                STATUS
                            ===================================== */}

                            <div
                                className={`
                                    rounded-md
                                    p-4
                                    mb-5
                                    border
                                    ${
                                        isTampered
                                            ? "bg-red-50 border-red-200"
                                            : "bg-green-50 border-green-200"
                                    }
                                `}
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >

                                    {isTampered ? (

                                        <ShieldAlert
                                            size={22}
                                            className="
                                                text-red-600
                                                mt-0.5
                                            "
                                        />

                                    ) : (

                                        <CheckCircle
                                            size={22}
                                            className="
                                                text-green-600
                                                mt-0.5
                                            "
                                        />

                                    )}


                                    <div>

                                        <p
                                            className={`
                                                text-sm
                                                font-semibold
                                                ${
                                                    isTampered
                                                        ? "text-red-800"
                                                        : "text-green-800"
                                                }
                                            `}
                                        >

                                            {isTampered
                                                ? "Document integrity compromised"
                                                : "Document integrity verified"}

                                        </p>


                                        <p
                                            className={`
                                                text-xs
                                                mt-1
                                                ${
                                                    isTampered
                                                        ? "text-red-700"
                                                        : "text-green-700"
                                                }
                                            `}
                                        >

                                            {isTampered
                                                ? "The current file does not match its registered integrity record."
                                                : "The current file matches its registered integrity record."}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =====================================
                                DOCUMENT INFORMATION
                            ===================================== */}

                            <div className="mb-5">

                                <p className="text-xs text-gray-500">
                                    Document
                                </p>


                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-900
                                        mt-1
                                    "
                                >
                                    {selectedIntegrityDocument.name}
                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    {selectedIntegrityDocument.documentId}
                                </p>

                            </div>


                            {/* =====================================
                                MONGODB HASH
                            ===================================== */}

                            <div className="mb-4">

                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1
                                    "
                                >
                                    Registered MongoDB Hash
                                </p>


                                <div
                                    className="
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-md
                                        p-3
                                        break-all
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            font-mono
                                            text-gray-700
                                        "
                                    >
                                        {integrity.mongoHash}
                                    </p>

                                </div>

                            </div>


                            {/* =====================================
                                CURRENT HASH
                            ===================================== */}

                            <div className="mb-4">

                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1
                                    "
                                >
                                    Current File Hash
                                </p>


                                <div
                                    className="
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-md
                                        p-3
                                        break-all
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            font-mono
                                            text-gray-700
                                        "
                                    >
                                        {integrity.currentHash}
                                    </p>

                                </div>

                            </div>


                            {/* =====================================
                                BLOCKCHAIN HASH
                            ===================================== */}

                            <div className="mb-4">

                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1
                                    "
                                >
                                    Blockchain Hash
                                </p>


                                <div
                                    className="
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-md
                                        p-3
                                        break-all
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            font-mono
                                            text-gray-700
                                        "
                                    >
                                        {integrity.blockchainHash}
                                    </p>

                                </div>

                            </div>


                            {/* =====================================
                                VERIFICATION RESULTS
                            ===================================== */}

                            <div
                                className="
                                    border-t
                                    border-gray-200
                                    pt-4
                                    space-y-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-gray-600
                                        "
                                    >
                                        MongoDB Hash Match
                                    </span>


                                    <span
                                        className={`
                                            text-xs
                                            font-medium
                                            ${
                                                integrity.mongoVerified
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        `}
                                    >

                                        {integrity.mongoVerified
                                            ? "✓ Match"
                                            : "✕ Mismatch"}

                                    </span>

                                </div>


                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-gray-600
                                        "
                                    >
                                        Blockchain Hash Match
                                    </span>


                                    <span
                                        className={`
                                            text-xs
                                            font-medium
                                            ${
                                                integrity.blockchainVerified
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        `}
                                    >

                                        {integrity.blockchainVerified
                                            ? "✓ Match"
                                            : "✕ Mismatch"}

                                    </span>

                                </div>


                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-gray-600
                                        "
                                    >
                                        Blockchain Verification
                                    </span>


                                    <span
                                        className={`
                                            text-xs
                                            font-medium
                                            ${
                                                integrity.blockchainVerified
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        `}
                                    >
                                        {integrity.blockchainStatus}
                                    </span>

                                </div>

                            </div>


                            {/* =====================================
                                INVESTIGATION DETAILS
                            ===================================== */}

                            <div
                                className="
                                    mt-5
                                    rounded-lg
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    p-4
                                "
                            >

                                <div className="mb-4">

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        Investigation Details
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Details of the authenticated user
                                        who performed this integrity check.
                                    </p>

                                </div>


                                {/* IP ADDRESS */}

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-4
                                    "
                                >

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                font-medium
                                                text-gray-500
                                            "
                                        >
                                            IP Address
                                        </p>


                                        <p
                                            className="
                                                text-sm
                                                font-mono
                                                text-gray-900
                                                mt-1
                                                break-all
                                            "
                                        >
                                            {audit?.ipAddress ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    {/* TIMESTAMP */}

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                font-medium
                                                text-gray-500
                                            "
                                        >
                                            Verification Timestamp
                                        </p>


                                        <p
                                            className="
                                                text-sm
                                                text-gray-900
                                                mt-1
                                            "
                                        >
                                            {formatTimestamp(
                                                audit?.timestamp
                                            )}
                                        </p>

                                    </div>

                                </div>


                                {/* USER DETAILS */}

                                <div className="mt-5">

                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            text-gray-500
                                            mb-3
                                        "
                                    >
                                        User Details
                                    </p>


                                    {auditUser ? (

                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                sm:grid-cols-2
                                                gap-4
                                            "
                                        >

                                            {/* FULL NAME */}

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Full Name
                                                </p>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-900
                                                        mt-1
                                                    "
                                                >
                                                    {auditUser.fullName ||
                                                        "Not available"}
                                                </p>

                                            </div>


                                            {/* POLICE NUMBER */}

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Police Number
                                                </p>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-900
                                                        mt-1
                                                    "
                                                >
                                                    {auditUser.policeNumber ||
                                                        "Not available"}
                                                </p>

                                            </div>


                                            {/* RANK */}

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Rank
                                                </p>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-900
                                                        mt-1
                                                    "
                                                >
                                                    {auditUser.rank ||
                                                        "Not available"}
                                                </p>

                                            </div>


                                            {/* DEPARTMENT */}

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Department
                                                </p>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-900
                                                        mt-1
                                                    "
                                                >
                                                    {auditUser.department ||
                                                        "Not available"}
                                                </p>

                                            </div>

                                        </div>

                                    ) : (

                                        <div
                                            className="
                                                rounded-md
                                                border
                                                border-gray-200
                                                bg-white
                                                p-3
                                            "
                                        >

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                User details not available
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* =====================================
                                BLOCKCHAIN DETAILS
                            ===================================== */}

                            {integrity.blockchainTimestamp && (

                                <div
                                    className="
                                        mt-4
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-md
                                        p-3
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            text-gray-600
                                        "
                                    >
                                        Blockchain Timestamp
                                    </p>


                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >

                                        {new Date(
                                            Number(
                                                integrity.blockchainTimestamp
                                            ) * 1000
                                        ).toLocaleString()}

                                    </p>


                                    {integrity.blockchainRegisteredBy && (

                                        <>

                                            <p
                                                className="
                                                    text-xs
                                                    font-medium
                                                    text-gray-600
                                                    mt-3
                                                "
                                            >
                                                Registered By
                                            </p>


                                            <p
                                                className="
                                                    text-xs
                                                    font-mono
                                                    text-gray-500
                                                    mt-1
                                                    break-all
                                                "
                                            >
                                                {
                                                    integrity.blockchainRegisteredBy
                                                }
                                            </p>

                                        </>

                                    )}

                                </div>

                            )}


                            {/* =====================================
                                MESSAGE
                            ===================================== */}

                            {integrity.message && (

                                <div
                                    className="
                                        mt-4
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-md
                                        p-3
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-gray-600
                                            leading-5
                                        "
                                    >
                                        {integrity.message}
                                    </p>

                                </div>

                            )}


                            {/* =====================================
                                CLOSE
                            ===================================== */}

                            <div
                                className="
                                    flex
                                    justify-end
                                    mt-6
                                "
                            >

                                <button
                                    onClick={
                                        closeIntegrityModal
                                    }
                                    className="
                                        px-4
                                        py-2
                                        border
                                        border-gray-300
                                        rounded-md
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        hover:bg-gray-50
                                    "
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    );

                })()}

            </Modal>


        </DashboardLayout>

    );

}


export default CaseDetails;