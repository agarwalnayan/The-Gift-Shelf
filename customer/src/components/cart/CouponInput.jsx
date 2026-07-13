import { useState } from 'react';
import { HiOutlineTag, HiOutlineXMark } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';

const CouponInput = ({ couponCode }) => {
    const { applyCoupon, removeCoupon } = useCart();
    const [code, setCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async (event) => {
        event.preventDefault();
        if (!code.trim()) return;
        setIsApplying(true);
        setError('');
        try {
            await applyCoupon(code.trim());
            setCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid coupon code');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await removeCoupon();
        } finally {
            setIsRemoving(false);
        }
    };

    if (couponCode) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-primary-700">
                    <HiOutlineTag size={16} />
                    {couponCode} applied
                </span>
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="flex items-center gap-1 text-xs font-medium text-primary-700/70 transition-colors hover:text-red-600 disabled:opacity-50"
                >
                    <HiOutlineXMark size={14} />
                    Remove
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleApply} className="space-y-1.5">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input-field flex-1"
                />
                <button
                    type="submit"
                    disabled={isApplying || !code.trim()}
                    className="btn-secondary shrink-0 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isApplying ? 'Applying…' : 'Apply'}
                </button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
    );
};

export default CouponInput;