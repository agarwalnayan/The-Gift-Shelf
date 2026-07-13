import { HiOutlineTruck } from 'react-icons/hi2';
import { useMarketing } from '../../context/MarketingContext.jsx';

/**
 * Progress bar toward the Admin-configured free shipping threshold.
 * `subtotal` should be the discount-adjusted amount so the bar reflects
 * what actually counts toward free shipping.
 */
const FreeShippingBar = ({ subtotal }) => {
    const { commerce } = useMarketing();
    const threshold = commerce?.freeShippingThreshold ?? 999;

    const remaining = Math.max(0, threshold - subtotal);
    const progress = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;
    const isUnlocked = remaining === 0;

    return (
        <div className="rounded-xl bg-primary-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <HiOutlineTruck size={18} />
                {isUnlocked ? (
                    <span>You've unlocked free shipping!</span>
                ) : (
                    <span>
                        Add <strong>₹{remaining.toFixed(0)}</strong> more for free shipping
                    </span>
                )}
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
                <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default FreeShippingBar;