import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    ArrowLeft,
    FolderOpen,
    FileText,
    ExternalLink,
    Loader2,
    ShieldCheck,
    ShieldAlert,
    X
} from "lucide-react";

import api from "../../services/api";

function CaseDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [caseData, setCaseData] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [error, setError] = useState("");

    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // ===============================
    // INTEGRITY STATE
    // ===============================

    const [integrityStatus, setIntegrityStatus] = useState({});
    const [checkingIntegrity, setCheckingIntegrity] = useState({});
    const [selectedIntegrityDocument, setSelectedIntegrityDocument] =
        useState(null);
    const [showIntegrityModal, setShowIntegrityModal] = useState(false);


    // ===============================
    // FETCH CASE
    // ===============================

    const fetchCase = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/cases/${id}`
            );

            setCaseData(response.data.case);

        } catch (error) {

            console.error(
                "Error fetching case:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load case"
            );

        } finally {

            setLoading(false);

        }
    };


    // ===============================
    // FETCH DOCUMENTS
    // ===============================

    const fetchDocuments = async () => {

        try {

            setDocumentsLoading(true);

            const response = await api.get(
                "/documents"
            );

            const allDocuments =
                response.data.documents || [];

            const caseDocuments = allDocuments.filter(
                (document) => {

                    const documentCase =
                        document.case;

                    if (!documentCase) {
                        return false;
                    }

                    if (typeof documentCase === "object") {
                        return documentCase._id === id;
                    }

                    return documentCase === id;
                }
            );

            setDocuments(caseDocuments);

        } catch (error) {

            console.error(
                "Error fetching documents:",
                error
            );

        } finally {

            setDocumentsLoading(false);

        }
    };


    // ===============================
    // VERIFY DOCUMENT INTEGRITY
    // ===============================

    const verifyDocument = async (document) => {

        if (!document?._id) {
            return;
        }

        if (checkingIntegrity[document._id]) {
            return;
        }

        try {

            setCheckingIntegrity((prev) => ({
                ...prev,
                [document._id]: true
            }));

            const response = await api.get(
                `/documents/${document._id}/verify`
            );

            const data = response.data;

            console.log(
                "Admin integrity verification:",
                data
            );

            const status =
                data.verified === true
                    ? "VERIFIED"
                    : data.verified === false
                        ? "TAMPERED"
                        : "UNKNOWN";

            setIntegrityStatus((prev) => ({
                ...prev,
                [document._id]: {
                    status,
                    currentHash: data.currentHash || null,
                    mongoHash: data.mongoHash || null,
                    blockchainHash:
                        data.blockchainHash || null,
                    mongoVerified:
                        data.mongoVerified ?? null,
                    blockchainVerified:
                        data.blockchainVerified ?? null,
                    blockchainTimestamp:
                        data.blockchainTimestamp || null,
                    blockchainRegisteredBy:
                        data.blockchainRegisteredBy || null,
                    audit: data.audit || null
                }
            }));

            // If investigation modal is open for this document,
            // update the modal with the latest verification data.
            if (
                selectedIntegrityDocument?._id ===
                document._id
            ) {

                setSelectedIntegrityDocument((prev) => ({
                    ...prev,
                    integrity: {
                        status,
                        currentHash:
                            data.currentHash || null,
                        mongoHash:
                            data.mongoHash || null,
                        blockchainHash:
                            data.blockchainHash || null,
                        mongoVerified:
                            data.mongoVerified ?? null,
                        blockchainVerified:
                            data.blockchainVerified ?? null,
                        blockchainTimestamp:
                            data.blockchainTimestamp || null,
                        blockchainRegisteredBy:
                            data.blockchainRegisteredBy || null,
                        audit:
                            data.audit || null
                    }
                }));

            }

        } catch (error) {

            console.error(
                "Admin integrity verification error:",
                error
            );

            setIntegrityStatus((prev) => ({
                ...prev,
                [document._id]: {
                    status: "UNKNOWN",
                    currentHash: null,
                    mongoHash: null,
                    blockchainHash: null,
                    mongoVerified: null,
                    blockchainVerified: null,
                    blockchainTimestamp: null,
                    blockchainRegisteredBy: null,
                    audit: null
                }
            }));

        } finally {

            setCheckingIntegrity((prev) => ({
                ...prev,
                [document._id]: false
            }));

        }
    };


    // ===============================
    // VERIFY ALL DOCUMENTS
    // ===============================

    useEffect(() => {

        if (
            documentsLoading ||
            documents.length === 0
        ) {
            return;
        }

        documents.forEach((document) => {
            verifyDocument(document);
        });

    }, [documents, documentsLoading]);


    // ===============================
    // OPEN DOCUMENT
    // ===============================

    const openDocument = async (documentId) => {

        try {

            const integrity =
                integrityStatus[documentId];

            // Do not allow opening a tampered document.
            if (
                integrity &&
                integrity.status === "TAMPERED"
            ) {

                alert(
                    "This document has been tampered with and cannot be opened."
                );

                return;
            }

            const response = await api.get(
                `/documents/${documentId}/file`,
                {
                    responseType: "blob"
                }
            );

            const fileBlob = new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );

            const fileUrl =
                URL.createObjectURL(fileBlob);

            window.open(
                fileUrl,
                "_blank"
            );

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
                "Unable to open document"
            );

        }
    };


    // ===============================
    // INVESTIGATE DOCUMENT
    // ===============================

    const investigateDocument = async (document) => {

        setSelectedIntegrityDocument({
            ...document,
            integrity:
                integrityStatus[document._id] || null
        });

        setShowIntegrityModal(true);

        // Perform a fresh verification when investigation starts.
        await verifyDocument(document);

    };


    // ===============================
    // CLOSE INVESTIGATION MODAL
    // ===============================

    const closeIntegrityModal = () => {

        setShowIntegrityModal(false);
        setSelectedIntegrityDocument(null);

    };


    // ===============================
    // UPDATE CASE STATUS
    // ===============================

    const handleStatusUpdate = async () => {

        if (!newStatus) {
            return;
        }

        try {

            setUpdatingStatus(true);
            setError("");

            const response = await api.put(
                `/cases/${id}/status`,
                {
                    status: newStatus
                }
            );

            setCaseData(
                response.data.case
            );

            setNewStatus("");

        } catch (error) {

            console.error(
                "Error updating case status:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update case status"
            );

        } finally {

            setUpdatingStatus(false);

        }
    };


    // ===============================
    // LOAD DATA
    // ===============================

    useEffect(() => {

        fetchCase();
        fetchDocuments();

    }, [id]);


    // ===============================
    // FORMAT TIMESTAMP
    // ===============================

    const formatTimestamp = (timestamp) => {

        if (!timestamp) {
            return "Not available";
        }

        try {

            return new Date(
                timestamp
            ).toLocaleString();

        } catch {

            return "Not available";

        }
    };


    // ===============================
    // GET CURRENT INTEGRITY
    // ===============================

    const selectedIntegrity =
        selectedIntegrityDocument
            ? integrityStatus[
                selectedIntegrityDocument._id
            ]
            : null;


    return (

        <DashboardLayout role="admin">

            {/* ===============================
                BACK BUTTON
            =============================== */}

            <button
                onClick={() =>
                    navigate("/admin/cases")
                }
                className="flex items-center gap-2
                           text-sm text-gray-600
                           hover:text-gray-900 mb-6"
            >

                <ArrowLeft size={16} />

                Back to Cases

            </button>


            {/* ===============================
                LOADING
            =============================== */}

            {loading && (

                <div
                    className="bg-white border
                               border-gray-200
                               rounded-lg p-8
                               text-center"
                >

                    <p className="text-sm text-gray-500">

                        Loading case...

                    </p>

                </div>

            )}


            {/* ===============================
                ERROR
            =============================== */}

            {!loading && error && (

                <div
                    className="bg-red-50 border
                               border-red-200
                               rounded-lg p-4"
                >

                    <p className="text-sm text-red-700">

                        {error}

                    </p>

                </div>

            )}


            {/* ===============================
                CASE DETAILS
            =============================== */}

            {!loading &&
                !error &&
                caseData && (

                <div>

                    {/* ===============================
                        CASE HEADER
                    =============================== */}

                    <div className="mb-6">

                        <div className="flex items-center gap-3">

                            <FolderOpen
                                size={22}
                                className="text-gray-500"
                            />

                            <div>

                                <h1
                                    className="text-xl
                                               font-semibold"
                                >

                                    {caseData.caseId}

                                </h1>

                                <p
                                    className="text-sm
                                               text-gray-500"
                                >

                                    {caseData.title}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ===============================
                        CASE INFORMATION
                    =============================== */}

                    <div
                        className="bg-white border
                                   border-gray-200
                                   rounded-lg p-6"
                    >

                        <div
                            className="grid grid-cols-1
                                       md:grid-cols-2
                                       gap-6"
                        >

                            {/* CASE ID */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    Case ID
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >
                                    {caseData.caseId}
                                </p>

                            </div>


                            {/* FIR */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    FIR Number
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >
                                    {caseData.firNumber}
                                </p>

                            </div>


                            {/* STATUS */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-2"
                                >
                                    Status
                                </p>

                                <div
                                    className="flex items-center
                                               gap-3"
                                >

                                    <span
                                        className="text-sm
                                                   font-medium"
                                    >
                                        {caseData.status}
                                    </span>

                                    <select
                                        value={newStatus}
                                        onChange={(e) =>
                                            setNewStatus(
                                                e.target.value
                                            )
                                        }
                                        className="border
                                                   border-gray-300
                                                   rounded-md
                                                   px-2 py-1
                                                   text-xs
                                                   bg-white"
                                    >

                                        <option value="">
                                            Change status
                                        </option>

                                        <option value="ONGOING">
                                            Ongoing
                                        </option>

                                        <option value="COMPLETED">
                                            Completed
                                        </option>

                                        <option value="CLOSED">
                                            Closed
                                        </option>

                                    </select>

                                    <button
                                        onClick={
                                            handleStatusUpdate
                                        }
                                        disabled={
                                            !newStatus ||
                                            updatingStatus
                                        }
                                        className="px-3 py-1.5
                                                   bg-gray-900
                                                   text-white
                                                   rounded-md
                                                   text-xs
                                                   disabled:opacity-50"
                                    >

                                        {updatingStatus
                                            ? "Updating..."
                                            : "Update"}

                                    </button>

                                </div>

                            </div>


                            {/* INCIDENT DATE */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    Incident Date
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {new Date(
                                        caseData.incidentDate
                                    ).toLocaleDateString()}

                                </p>

                            </div>


                            {/* LEAD OFFICER */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    Lead Officer
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {caseData.leadOfficer?.fullName ||
                                        "Not assigned"}

                                </p>

                                <p
                                    className="text-xs
                                               text-gray-500"
                                >

                                    {caseData.leadOfficer?.policeNumber}

                                </p>

                            </div>


                            {/* DEPARTMENT */}

                            <div>

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    Department
                                </p>

                                <p
                                    className="text-sm
                                               font-medium"
                                >

                                    {caseData.leadOfficer?.department ||
                                        "N/A"}

                                </p>

                            </div>

                        </div>


                        {/* ===============================
                            DESCRIPTION
                        =============================== */}

                        <div
                            className="border-t
                                       border-gray-100
                                       mt-6 pt-6"
                        >

                            <p
                                className="text-xs
                                           text-gray-500 mb-2"
                            >
                                Description
                            </p>

                            <p
                                className="text-sm
                                           text-gray-700
                                           leading-6"
                            >

                                {caseData.description}

                            </p>

                        </div>


                        {/* ===============================
                            ASSIGNED OFFICERS
                        =============================== */}

                        <div
                            className="border-t
                                       border-gray-100
                                       mt-6 pt-6"
                        >

                            <p
                                className="text-xs
                                           text-gray-500 mb-3"
                            >
                                Assigned Officers
                            </p>

                            {caseData.assignedOfficers?.length > 0 ? (

                                <div className="space-y-2">

                                    {caseData.assignedOfficers.map(
                                        (officer) => (

                                            <div
                                                key={officer._id}
                                                className="border
                                                           border-gray-200
                                                           rounded-md p-3"
                                            >

                                                <p
                                                    className="text-sm
                                                               font-medium"
                                                >

                                                    {officer.fullName}

                                                </p>

                                                <p
                                                    className="text-xs
                                                               text-gray-500"
                                                >

                                                    {officer.policeNumber}

                                                    {" • "}

                                                    {officer.rank}

                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p
                                    className="text-sm
                                               text-gray-500"
                                >

                                    No additional officers assigned.

                                </p>

                            )}

                        </div>

                    </div>


                    {/* ===============================
                        DOCUMENTS
                    =============================== */}

                    <div
                        className="bg-white border
                                   border-gray-200
                                   rounded-lg p-6
                                   mt-6"
                    >

                        <div
                            className="flex items-center
                                       justify-between mb-4"
                        >

                            <div>

                                <h2
                                    className="text-sm
                                               font-semibold"
                                >

                                    Documents

                                </h2>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mt-1"
                                >

                                    Documents associated
                                    with this case.

                                </p>

                            </div>

                            <span
                                className="text-xs
                                           text-gray-500"
                            >

                                {documents.length}{" "}
                                {documents.length === 1
                                    ? "document"
                                    : "documents"}

                            </span>

                        </div>


                        {/* DOCUMENT LOADING */}

                        {documentsLoading ? (

                            <div
                                className="py-8
                                           flex items-center
                                           justify-center
                                           gap-2
                                           text-sm
                                           text-gray-500"
                            >

                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />

                                Loading documents...

                            </div>

                        ) : documents.length === 0 ? (

                            <div
                                className="border
                                           border-dashed
                                           border-gray-300
                                           rounded-lg
                                           p-8
                                           text-center"
                            >

                                <FileText
                                    size={30}
                                    className="mx-auto
                                               text-gray-300
                                               mb-2"
                                />

                                <p
                                    className="text-sm
                                               text-gray-500"
                                >

                                    No documents have been
                                    uploaded for this case.

                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {documents.map(
                                    (document) => {

                                        const integrity =
                                            integrityStatus[
                                                document._id
                                            ];

                                        const isChecking =
                                            checkingIntegrity[
                                                document._id
                                            ];

                                        const isTampered =
                                            integrity?.status ===
                                            "TAMPERED";

                                        const isVerified =
                                            integrity?.status ===
                                            "VERIFIED";

                                        return (

                                            <div
                                                key={document._id}
                                                className={`border
                                                    rounded-lg
                                                    p-4
                                                    ${
                                                        isTampered
                                                            ? "border-red-300 bg-red-50"
                                                            : "border-gray-200"
                                                    }`}
                                            >

                                                <div
                                                    className="flex
                                                               items-center
                                                               justify-between
                                                               gap-4"
                                                >

                                                    {/* DOCUMENT INFO */}

                                                    <div
                                                        className="flex
                                                                   items-center
                                                                   gap-3
                                                                   min-w-0"
                                                    >

                                                        <div
                                                            className={`w-9 h-9
                                                                rounded-md
                                                                flex
                                                                items-center
                                                                justify-center
                                                                flex-shrink-0
                                                                ${
                                                                    isTampered
                                                                        ? "bg-red-100"
                                                                        : "bg-gray-100"
                                                                }`}
                                                        >

                                                            {isTampered ? (

                                                                <ShieldAlert
                                                                    size={18}
                                                                    className="text-red-600"
                                                                />

                                                            ) : (

                                                                <FileText
                                                                    size={18}
                                                                    className="text-gray-500"
                                                                />

                                                            )}

                                                        </div>


                                                        <div
                                                            className="min-w-0"
                                                        >

                                                            <p
                                                                className="text-sm
                                                                           font-medium
                                                                           truncate"
                                                            >

                                                                {document.name}

                                                            </p>

                                                            <div
                                                                className="flex
                                                                           flex-wrap
                                                                           gap-3
                                                                           mt-1"
                                                            >

                                                                <span
                                                                    className="text-xs
                                                                               text-gray-500"
                                                                >

                                                                    {document.documentId}

                                                                </span>

                                                                <span
                                                                    className="text-xs
                                                                               text-gray-500"
                                                                >

                                                                    {document.type}

                                                                </span>

                                                                <span
                                                                    className="text-xs
                                                                               text-gray-500"
                                                                >

                                                                    Version{" "}
                                                                    {document.version}

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* ACTIONS */}

                                                    <div
                                                        className="flex
                                                                   items-center
                                                                   gap-2
                                                                   flex-shrink-0"
                                                    >

                                                        {/* INTEGRITY BADGE */}

                                                        {isChecking ? (

                                                            <span
                                                                className="flex
                                                                           items-center
                                                                           gap-1.5
                                                                           px-2.5
                                                                           py-1
                                                                           rounded-full
                                                                           text-xs
                                                                           bg-gray-100
                                                                           text-gray-600"
                                                            >

                                                                <Loader2
                                                                    size={12}
                                                                    className="animate-spin"
                                                                />

                                                                Checking

                                                            </span>

                                                        ) : isVerified ? (

                                                            <span
                                                                className="flex
                                                                           items-center
                                                                           gap-1.5
                                                                           px-2.5
                                                                           py-1
                                                                           rounded-full
                                                                           text-xs
                                                                           bg-green-100
                                                                           text-green-700"
                                                            >

                                                                <ShieldCheck
                                                                    size={12}
                                                                />

                                                                Verified

                                                            </span>

                                                        ) : isTampered ? (

                                                            <span
                                                                className="flex
                                                                           items-center
                                                                           gap-1.5
                                                                           px-2.5
                                                                           py-1
                                                                           rounded-full
                                                                           text-xs
                                                                           bg-red-100
                                                                           text-red-700"
                                                            >

                                                                <ShieldAlert
                                                                    size={12}
                                                                />

                                                                Tampered

                                                            </span>

                                                        ) : (

                                                            <span
                                                                className="px-2.5
                                                                           py-1
                                                                           rounded-full
                                                                           text-xs
                                                                           bg-gray-100
                                                                           text-gray-500"
                                                            >

                                                                Verification
                                                                unavailable

                                                            </span>

                                                        )}


                                                        {/* INVESTIGATE */}

                                                        {isTampered && (

                                                            <button
                                                                onClick={() =>
                                                                    investigateDocument(
                                                                        document
                                                                    )
                                                                }
                                                                className="flex
                                                                           items-center
                                                                           gap-1.5
                                                                           px-3
                                                                           py-1.5
                                                                           bg-red-600
                                                                           text-white
                                                                           rounded-md
                                                                           text-xs
                                                                           hover:bg-red-700"
                                                            >

                                                                <ShieldAlert
                                                                    size={14}
                                                                />

                                                                Investigate

                                                            </button>

                                                        )}


                                                        {/* OPEN */}

                                                        <button
                                                            onClick={() =>
                                                                openDocument(
                                                                    document._id
                                                                )
                                                            }
                                                            disabled={
                                                                !isVerified
                                                            }
                                                            className={`flex
                                                                items-center
                                                                gap-2
                                                                px-3
                                                                py-1.5
                                                                border
                                                                rounded-md
                                                                text-xs
                                                                flex-shrink-0
                                                                ${
                                                                    isVerified
                                                                        ? "border-gray-300 hover:bg-gray-50"
                                                                        : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                                                }`}
                                                        >

                                                            <ExternalLink
                                                                size={14}
                                                            />

                                                            Open

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* =====================================================
                DOCUMENT INTEGRITY INVESTIGATION MODAL
            ===================================================== */}

            {showIntegrityModal && (

                <div
                    className="fixed inset-0 z-50
                               flex items-center
                               justify-center
                               bg-black/50
                               p-4"
                >

                    <div
                        className="bg-white
                                   rounded-xl
                                   shadow-xl
                                   w-full
                                   max-w-2xl
                                   max-h-[90vh]
                                   overflow-y-auto"
                    >

                        {/* MODAL HEADER */}

                        <div
                            className="flex
                                       items-center
                                       justify-between
                                       border-b
                                       border-gray-200
                                       px-6 py-4"
                        >

                            <div>

                                <h2
                                    className="text-lg
                                               font-semibold
                                               text-gray-900"
                                >

                                    Document Integrity Investigation

                                </h2>

                                <p
                                    className="text-xs
                                               text-gray-500
                                               mt-1"
                                >

                                    Security and integrity details

                                </p>

                            </div>

                            <button
                                onClick={
                                    closeIntegrityModal
                                }
                                className="p-2
                                           rounded-md
                                           hover:bg-gray-100"
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* MODAL CONTENT */}

                        <div className="p-6 space-y-5">

                            {/* STATUS */}

                            <div
                                className={`rounded-lg
                                    border
                                    p-4
                                    ${
                                        selectedIntegrity?.status ===
                                        "TAMPERED"
                                            ? "bg-red-50 border-red-200"
                                            : "bg-green-50 border-green-200"
                                    }`}
                            >

                                <div
                                    className="flex
                                               items-center
                                               gap-2"
                                >

                                    {selectedIntegrity?.status ===
                                    "TAMPERED" ? (

                                        <ShieldAlert
                                            size={20}
                                            className="text-red-600"
                                        />

                                    ) : (

                                        <ShieldCheck
                                            size={20}
                                            className="text-green-600"
                                        />

                                    )}

                                    <div>

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Integrity Status
                                        </p>

                                        <p
                                            className={`text-sm
                                                font-semibold
                                                ${
                                                    selectedIntegrity?.status ===
                                                    "TAMPERED"
                                                        ? "text-red-700"
                                                        : "text-green-700"
                                                }`}
                                        >

                                            {selectedIntegrity?.status ||
                                                "Checking..."}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* DOCUMENT INFORMATION */}

                            <div>

                                <h3
                                    className="text-sm
                                               font-semibold
                                               mb-3"
                                >

                                    Document Information

                                </h3>

                                <div
                                    className="grid
                                               grid-cols-1
                                               md:grid-cols-2
                                               gap-4"
                                >

                                    <div>

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Document Name
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {selectedIntegrityDocument?.name ||
                                                "Not available"}

                                        </p>

                                    </div>

                                    <div>

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Document ID
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {selectedIntegrityDocument?.documentId ||
                                                "Not available"}

                                        </p>

                                    </div>

                                    <div>

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Document Type
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {selectedIntegrityDocument?.type ||
                                                "Not available"}

                                        </p>

                                    </div>

                                    <div>

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Version
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {selectedIntegrityDocument?.version ??
                                                "Not available"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* HASH INFORMATION */}

                            <div>

                                <h3
                                    className="text-sm
                                               font-semibold
                                               mb-3"
                                >

                                    Hash Verification

                                </h3>

                                <div className="space-y-3">

                                    <div
                                        className="bg-gray-50
                                                   border
                                                   border-gray-200
                                                   rounded-lg
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mb-1"
                                        >
                                            MongoDB Hash
                                        </p>

                                        <p
                                            className="text-xs
                                                       font-mono
                                                       break-all"
                                        >

                                            {selectedIntegrity?.mongoHash ||
                                                "Not available"}

                                        </p>

                                    </div>

                                    <div
                                        className="bg-gray-50
                                                   border
                                                   border-gray-200
                                                   rounded-lg
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mb-1"
                                        >
                                            Current File Hash
                                        </p>

                                        <p
                                            className="text-xs
                                                       font-mono
                                                       break-all"
                                        >

                                            {selectedIntegrity?.currentHash ||
                                                "Not available"}

                                        </p>

                                    </div>

                                    <div
                                        className="bg-gray-50
                                                   border
                                                   border-gray-200
                                                   rounded-lg
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500
                                                       mb-1"
                                        >
                                            Blockchain Hash
                                        </p>

                                        <p
                                            className="text-xs
                                                       font-mono
                                                       break-all"
                                        >

                                            {selectedIntegrity?.blockchainHash ||
                                                "Not available"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* VERIFICATION RESULTS */}

                            <div>

                                <h3
                                    className="text-sm
                                               font-semibold
                                               mb-3"
                                >

                                    Verification Results

                                </h3>

                                <div className="space-y-2">

                                    <div
                                        className="flex
                                                   items-center
                                                   justify-between
                                                   border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <span
                                            className="text-sm"
                                        >
                                            MongoDB Verification
                                        </span>

                                        <span
                                            className={`text-xs
                                                font-semibold
                                                ${
                                                    selectedIntegrity?.mongoVerified
                                                        ? "text-green-700"
                                                        : "text-red-700"
                                                }`}
                                        >

                                            {selectedIntegrity?.mongoVerified
                                                ? "PASSED"
                                                : "FAILED"}

                                        </span>

                                    </div>

                                    <div
                                        className="flex
                                                   items-center
                                                   justify-between
                                                   border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <span
                                            className="text-sm"
                                        >
                                            Blockchain Verification
                                        </span>

                                        <span
                                            className={`text-xs
                                                font-semibold
                                                ${
                                                    selectedIntegrity?.blockchainVerified
                                                        ? "text-green-700"
                                                        : "text-red-700"
                                                }`}
                                        >

                                            {selectedIntegrity?.blockchainVerified
                                                ? "PASSED"
                                                : "FAILED"}

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* BLOCKCHAIN INFORMATION */}

                            <div>

                                <h3
                                    className="text-sm
                                               font-semibold
                                               mb-3"
                                >

                                    Blockchain Information

                                </h3>

                                <div
                                    className="grid
                                               grid-cols-1
                                               md:grid-cols-2
                                               gap-4"
                                >

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Blockchain Timestamp
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {formatTimestamp(
                                                selectedIntegrity?.blockchainTimestamp
                                            )}

                                        </p>

                                    </div>

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Registered By
                                        </p>

                                        <p
                                            className="text-xs
                                                       font-mono
                                                       break-all
                                                       mt-1"
                                        >

                                            {selectedIntegrity?.blockchainRegisteredBy ||
                                                "Not available"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                INVESTIGATION DETAILS
                            ================================================= */}

                            <div>

                                <h3
                                    className="text-sm
                                               font-semibold
                                               mb-3"
                                >

                                    Investigation Details

                                </h3>

                                <div
                                    className="grid
                                               grid-cols-1
                                               md:grid-cols-2
                                               gap-4"
                                >

                                    {/* IP ADDRESS */}

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            IP Address
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1
                                                       font-mono"
                                        >

                                            {selectedIntegrity?.audit
                                                ?.ipAddress ||
                                                "Not available"}

                                        </p>

                                    </div>


                                    {/* TIMESTAMP */}

                                    <div
                                        className="border
                                                   border-gray-200
                                                   rounded-md
                                                   p-3"
                                    >

                                        <p
                                            className="text-xs
                                                       text-gray-500"
                                        >
                                            Verification Timestamp
                                        </p>

                                        <p
                                            className="text-sm
                                                       font-medium
                                                       mt-1"
                                        >

                                            {formatTimestamp(
                                                selectedIntegrity?.audit
                                                    ?.timestamp
                                            )}

                                        </p>

                                    </div>

                                </div>


                                {/* USER DETAILS */}

                                <div
                                    className="border
                                               border-gray-200
                                               rounded-md
                                               p-4
                                               mt-4"
                                >

                                    <p
                                        className="text-xs
                                                   text-gray-500
                                                   mb-3"
                                    >
                                        User Details
                                    </p>

                                    {selectedIntegrity?.audit?.user ? (

                                        <div
                                            className="grid
                                                       grid-cols-1
                                                       md:grid-cols-2
                                                       gap-4"
                                        >

                                            <div>

                                                <p
                                                    className="text-xs
                                                               text-gray-500"
                                                >
                                                    Name
                                                </p>

                                                <p
                                                    className="text-sm
                                                               font-medium
                                                               mt-1"
                                                >

                                                    {selectedIntegrity.audit.user.fullName ||
                                                        "Not available"}

                                                </p>

                                            </div>


                                            <div>

                                                <p
                                                    className="text-xs
                                                               text-gray-500"
                                                >
                                                    Police Number
                                                </p>

                                                <p
                                                    className="text-sm
                                                               font-medium
                                                               mt-1"
                                                >

                                                    {selectedIntegrity.audit.user.policeNumber ||
                                                        "Not available"}

                                                </p>

                                            </div>


                                            <div>

                                                <p
                                                    className="text-xs
                                                               text-gray-500"
                                                >
                                                    Rank
                                                </p>

                                                <p
                                                    className="text-sm
                                                               font-medium
                                                               mt-1"
                                                >

                                                    {selectedIntegrity.audit.user.rank ||
                                                        "Not available"}

                                                </p>

                                            </div>


                                            <div>

                                                <p
                                                    className="text-xs
                                                               text-gray-500"
                                                >
                                                    Department
                                                </p>

                                                <p
                                                    className="text-sm
                                                               font-medium
                                                               mt-1"
                                                >

                                                    {selectedIntegrity.audit.user.department ||
                                                        "Not available"}

                                                </p>

                                            </div>

                                        </div>

                                    ) : (

                                        <p
                                            className="text-sm
                                                       text-gray-500"
                                        >

                                            User details not available

                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* MESSAGE */}

                            <div
                                className="border-t
                                           border-gray-200
                                           pt-4"
                            >

                                <p
                                    className="text-xs
                                               text-gray-500 mb-1"
                                >
                                    Message
                                </p>

                                <p
                                    className={`text-sm
                                        ${
                                            selectedIntegrity?.status ===
                                            "TAMPERED"
                                                ? "text-red-700"
                                                : "text-green-700"
                                        }`}
                                >

                                    {selectedIntegrity?.status ===
                                    "TAMPERED"
                                        ? "Document integrity verification failed. Possible tampering or blockchain mismatch detected."
                                        : "Document integrity verified successfully against MongoDB and blockchain."}

                                </p>

                            </div>

                        </div>


                        {/* MODAL FOOTER */}

                        <div
                            className="border-t
                                       border-gray-200
                                       px-6 py-4
                                       flex
                                       justify-end"
                        >

                            <button
                                onClick={
                                    closeIntegrityModal
                                }
                                className="px-4 py-2
                                           bg-gray-900
                                           text-white
                                           rounded-md
                                           text-sm
                                           hover:bg-gray-800"
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );
}

export default CaseDetails;