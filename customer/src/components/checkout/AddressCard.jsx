import { HiOutlinePencil, HiOutlineTrash, HiCheckCircle } from 'react-icons/hi2';

const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(address._id)}
            className={`relative w-full rounded-2xl border p-4 text-left transition-colors ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-charcoal/10 bg-white hover:border-charcoal/20'
                }`}
        >
            {isSelected && (
                <HiCheckCircle className="absolute right-4 top-4 text-primary-600" size={20} aria-hidden="true" />
            )}
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-charcoal/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-charcoal/60">
                    {address.label}
                </span>
                {address.isDefault && (
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
                        Default
                    </span>
                )}
            </div>

            <p className="mt-2 text-sm font-medium text-charcoal">{address.fullName}</p>
            <p className="mt-0.5 text-sm text-charcoal/60">
                {address.line1}
                {address.line2 && `, ${address.line2}`}, {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="mt-0.5 text-sm text-charcoal/60">Phone: {address.phone}</p>

            <div className="mt-3 flex gap-4 border-t border-charcoal/10 pt-3">
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(address);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-primary-600"
                >
                    <HiOutlinePencil size={14} />
                    Edit
                </span>
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(address._id);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-red-600"
                >
                    <HiOutlineTrash size={14} />
                    Delete
                </span>
            </div>
        </button>
    );
};

export default AddressCard;