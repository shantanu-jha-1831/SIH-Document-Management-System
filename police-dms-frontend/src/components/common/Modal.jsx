import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, children }) {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

                    <h2 className="text-base font-semibold text-gray-900">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <X size={19} strokeWidth={1.8} />
                    </button>

                </div>


                {/* Content */}
                <div className="p-5">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default Modal;