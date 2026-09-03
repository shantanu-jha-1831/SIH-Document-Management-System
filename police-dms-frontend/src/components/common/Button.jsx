function Button({
    children,
    type = "button",
    onClick,
    variant = "primary",
    disabled = false
}) {

    const styles = {
        primary:
            "bg-gray-900 text-white hover:bg-gray-800",
        secondary:
            "border border-gray-300 text-gray-700 hover:bg-gray-50",
        danger:
            "bg-red-700 text-white hover:bg-red-800"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-medium
                        transition disabled:opacity-50
                        disabled:cursor-not-allowed ${styles[variant]}`}
        >
            {children}
        </button>
    );
}

export default Button;