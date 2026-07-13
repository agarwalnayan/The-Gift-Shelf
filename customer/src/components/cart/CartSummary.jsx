import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';
import { useMarketing } from '../../context/MarketingContext.jsx';
import FreeShippingBar from './FreeShippingBar.jsx';
import CouponInput from './CouponInput.jsx';

/**
 * Order summary used on the Cart page (and, via the `sticky` prop, pinned
 * alongside the page while scrolling). GST/tax has been removed entirely
 * per the store's pricing model — totals are subtotal, discount, shipping.
 */
const CartSummary = ({ items, onCheckout, isLoading, sticky = false, showCoupon = true }) => {
  const { cart, discount } = useCart();
  const { commerce } = useMarketing();

  const itemsPrice = items.reduce((sum, item) => {
    const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const discountedSubtotal = Math.max(0, itemsPrice - discount);
  const shippingThreshold = commerce?.freeShippingThreshold ?? 999;
  const shippingCharge = commerce?.shippingCharge ?? 49;
  const shipping = discountedSubtotal >= shippingThreshold ? 0 : shippingCharge;
  const total = Number((discountedSubtotal + shipping).toFixed(2));

  return (
    <div className={`rounded-2xl border border-charcoal/10 bg-white p-6 ${sticky ? 'sm:sticky sm:top-28' : ''}`}>
      <h3 className="font-display text-lg font-semibold text-charcoal">Order Summary</h3>

      <div className="mt-4">
        <FreeShippingBar subtotal={discountedSubtotal} />
      </div>

      {showCoupon && (
        <div className="mt-5">
          <CouponInput couponCode={cart.couponCode} />
        </div>
      )}

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-charcoal/70">
          <span>Subtotal</span>
          <span>₹{itemsPrice.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount {cart.couponCode ? `(${cart.couponCode})` : ''}</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-charcoal/70">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-semibold text-charcoal">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {onCheckout && (
        <button onClick={onCheckout} disabled={isLoading || items.length === 0} className="btn-primary mt-6 w-full">
          {isLoading ? 'Processing…' : 'Proceed to Checkout'}
        </button>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-charcoal/50">
        <HiOutlineShieldCheck size={16} />
        Secure checkout · Razorpay & WhatsApp
      </p>
    </div>
  );
};

export default CartSummary;