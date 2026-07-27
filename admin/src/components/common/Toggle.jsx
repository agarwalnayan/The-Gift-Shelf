const Toggle = ({
    checked = false,
    onChange,
    disabled = false,
    label
}) => {
    return (
        <label
            className={`inline-flex items-center gap-2 ${
                disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
            }`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    checked
                        ? "bg-primary-600"
                        : "bg-ink/20"
                }`}
            >
                <span
                    className={`absolute h-4 w-4 rounded-full bg-white transition-transform ${
                        checked
                            ? "translate-x-4"
                            : "translate-x-0.5"
                    }`}
                />
            </button>

            {label && (
                <span className="text-sm text-ink/70">
                    {label}
                </span>
            )}
        </label>
    );
};

export default Toggle;