import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    FileText,
    Search,
    Lock,
    ShieldCheck
} from "lucide-react";
import api from "../../services/api";

function Documents() {

    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/documents/my-documents"
            );

            setDocuments(response.data.documents);

        } catch (error) {

            console.error(
                "Error fetching documents:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load documents"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchDocuments();
    }, []);


    const filteredDocuments = documents.filter(
        (document) => {

            const searchText =
                search.toLowerCase();

            return (
                document.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                document.documentId
                    ?.toLowerCase()
                    .includes(searchText) ||

                document.case?.caseId
                    ?.toLowerCase()
                    .includes(searchText) ||

                document.type
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );


    const formatType = (type) => {

        if (!type) return "N/A";

        return type
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            );
    };


    const getAccessText = (accessLevel) => {

        switch (accessLevel) {

            case "READ_WRITE":
                return "Read + Write";

            case "READ":
                return "Read";

            case "RESTRICTED":
                return "Restricted";

            default:
                return accessLevel || "Restricted";
        }
    };


    if (loading) {
        return (
            <DashboardLayout role="officer">

                <div className="flex items-center justify-center h-64">

                    <p className="text-sm text-gray-500">
                        Loading documents...
                    </p>

                </div>

            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout role="officer">

            {/* Page Header */}
            <div className="mb-6">

                <h1 className="text-xl font-semibold text-gray-900">
                    Documents
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Documents associated with your assigned cases.
                </p>

            </div>


            {/* Search */}
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
                    placeholder="Search documents..."
                    className="w-full pl-9 pr-3 py-2.5
                               border border-gray-300
                               rounded-md text-sm
                               outline-none
                               focus:border-gray-500"
                />

            </div>


            {/* Error */}
            {error && (
                <div className="mb-5 p-4 bg-red-50
                                border border-red-200
                                rounded-md">

                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                </div>
            )}


            {/* Documents Table */}
            <div className="bg-white border border-gray-200
                            rounded-lg overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

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


                        <tbody>

                            {filteredDocuments.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center"
                                    >

                                        <FileText
                                            size={30}
                                            className="mx-auto
                                                       text-gray-300
                                                       mb-3"
                                        />

                                        <p className="text-sm
                                                      text-gray-500">

                                            {search
                                                ? "No documents match your search."
                                                : "No documents available for your assigned cases."
                                            }

                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                filteredDocuments.map(
                                    (document) => (

                                        <tr
                                            key={document._id}
                                            className="border-b
                                                       border-gray-100
                                                       last:border-0
                                                       hover:bg-gray-50"
                                        >

                                            {/* Document */}
                                            <td className="px-5 py-4">

                                                <div className="flex
                                                                items-center
                                                                gap-3">

                                                    <FileText
                                                        size={18}
                                                        className="text-gray-500"
                                                    />

                                                    <div>

                                                        <p className="font-medium
                                                                      text-gray-900">

                                                            {document.name}

                                                        </p>

                                                        <p className="text-xs
                                                                      text-gray-500">

                                                            {document.documentId}

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Case */}
                                            <td className="px-5 py-4">

                                                {document.case?.caseId || "N/A"}

                                            </td>


                                            {/* Type */}
                                            <td className="px-5 py-4">

                                                {formatType(
                                                    document.type
                                                )}

                                            </td>


                                            {/* Version */}
                                            <td className="px-5 py-4">

                                                v{document.version}

                                            </td>


                                            {/* Access */}
                                            <td className="px-5 py-4">

                                                {document.accessLevel ===
                                                "RESTRICTED" ? (

                                                    <span className="inline-flex
                                                                     items-center
                                                                     gap-1.5
                                                                     text-xs
                                                                     text-gray-500">

                                                        <Lock size={14} />

                                                        Restricted

                                                    </span>

                                                ) : (

                                                    <span className="text-xs
                                                                     text-gray-700">

                                                        {getAccessText(
                                                            document.accessLevel
                                                        )}

                                                    </span>

                                                )}

                                            </td>


                                            {/* Integrity */}
                                            <td className="px-5 py-4">

                                                <span className="inline-flex
                                                                 items-center
                                                                 gap-1.5
                                                                 text-xs
                                                                 text-gray-700">

                                                    <ShieldCheck size={14} />

                                                    Verified

                                                </span>

                                            </td>


                                            {/* Action */}
                                            <td className="px-5 py-4 text-right">

                                                {document.accessLevel ===
                                                "RESTRICTED" ? (

                                                    <span className="text-xs
                                                                     text-gray-500">

                                                        No access

                                                    </span>

                                                ) : (

                                                    <button
                                                        className="px-3 py-1.5
                                                                   bg-gray-900
                                                                   text-white
                                                                   rounded-md
                                                                   text-xs
                                                                   hover:bg-gray-800"
                                                    >
                                                        Open
                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Documents;