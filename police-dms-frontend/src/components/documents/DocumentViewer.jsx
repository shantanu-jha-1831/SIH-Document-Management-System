import { useEffect, useState } from "react";
import {
    X,
    ShieldCheck,
    Clock,
    User,
    FileText,
    FolderOpen,
    Lock,
    Calendar
} from "lucide-react";
import api from "../../services/api";

function DocumentViewer({ document, onClose }) {

    const [fileUrl, setFileUrl] = useState("");
    const [loadingFile, setLoadingFile] = useState(true);
    const [fileError, setFileError] = useState("");

    useEffect(() => {

        if (!document) return;

        let objectUrl = null;

        const loadDocument = async () => {

            try {

                setLoadingFile(true);
                setFileError("");

                const response = await api.get(
                    `/documents/${document._id}/file`,
                    {
                        responseType: "blob"
                    }
                );

                objectUrl = URL.createObjectURL(response.data);

                setFileUrl(objectUrl);

            } catch (error) {

                console.error(
                    "Error loading document:",
                    error
                );

                setFileError(
                    error.response?.data?.message ||
                    "Unable to load document"
                );

            } finally {

                setLoadingFile(false);

            }
        };

        loadDocument();

        return () => {

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }

        };

    }, [document]);


    const formatText = (text) => {

        if (!text) return "—";

        return text
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };


    const formatDate = (date) => {

        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    if (!document) {
        return null;
    }


    return (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-lg shadow-xl overflow-hidden flex flex-col">


                {/* Header */}

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">

                            <FileText
                                size={20}
                                className="text-gray-700"
                            />

                        </div>

                        <div>

                            <h2 className="text-base font-semibold text-gray-900">

                                {document.name}

                            </h2>

                            <p className="text-xs text-gray-500 mt-0.5">

                                {document.documentId}

                            </p>

                        </div>

                    </div>


                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                    >

                        <X
                            size={20}
                            className="text-gray-500"
                        />

                    </button>

                </div>


                {/* Security Information */}

                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">

                    <div className="flex flex-wrap items-center gap-5 text-xs text-gray-600">

                        <span className="inline-flex items-center gap-1.5">

                            <ShieldCheck size={15} />

                            Secure Document

                        </span>


                        <span className="inline-flex items-center gap-1.5">

                            <Lock size={15} />

                            Protected Access

                        </span>


                        <span className="inline-flex items-center gap-1.5">

                            <Clock size={15} />

                            Version {document.version}

                        </span>

                    </div>

                </div>


                {/* Document Content */}

                <div className="flex-1 overflow-auto bg-gray-100 p-5">

                    {loadingFile && (

                        <div className="h-[60vh] flex items-center justify-center">

                            <div className="text-center">

                                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-3"></div>

                                <p className="text-sm text-gray-500">

                                    Loading secure document...

                                </p>

                            </div>

                        </div>

                    )}


                    {fileError && (

                        <div className="h-[60vh] flex items-center justify-center">

                            <div className="text-center">

                                <ShieldCheck
                                    size={32}
                                    className="mx-auto mb-3 text-red-500"
                                />

                                <p className="text-sm text-red-600">

                                    {fileError}

                                </p>

                            </div>

                        </div>

                    )}


                    {!loadingFile &&
                        !fileError &&
                        fileUrl && (

                            <div className="bg-white max-w-5xl mx-auto border border-gray-200 rounded-md overflow-hidden shadow-sm">

                                <iframe
                                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                    title={document.name}
                                    className="w-full h-[70vh]"
                                />

                            </div>

                        )}

                </div>


                {/* Metadata */}

                <div className="px-6 py-4 border-t border-gray-200 bg-white">

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">


                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                                <FolderOpen size={13} />

                                Case

                            </div>

                            <p className="text-sm font-medium text-gray-900">

                                {document.case?.caseId || "—"}

                            </p>

                        </div>


                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                                <FileText size={13} />

                                Type

                            </div>

                            <p className="text-sm font-medium text-gray-900">

                                {formatText(document.type)}

                            </p>

                        </div>


                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                                <User size={13} />

                                Uploaded By

                            </div>

                            <p className="text-sm font-medium text-gray-900">

                                {document.uploadedBy?.fullName || "—"}

                            </p>

                        </div>


                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                                <Calendar size={13} />

                                Uploaded On

                            </div>

                            <p className="text-sm font-medium text-gray-900">

                                {formatDate(document.createdAt)}

                            </p>

                        </div>

                    </div>

                </div>


                {/* Security Notice */}

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">

                    <p className="text-xs text-gray-500 text-center">

                        This document is protected by the Secure Digital Case
                        and Document Management System. Access is restricted
                        to authorized personnel.

                    </p>

                </div>

            </div>

        </div>

    );
}

export default DocumentViewer;