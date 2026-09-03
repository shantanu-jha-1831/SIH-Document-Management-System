function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false
}) {

    return (
        <div className="mb-4">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 border border-gray-300
                           rounded-md text-sm outline-none
                           focus:border-gray-500
                           focus:ring-1 focus:ring-gray-300"
            />

        </div>
    );
}

export default Input;