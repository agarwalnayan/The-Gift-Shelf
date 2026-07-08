import { HiOutlineShieldCheck } from 'react-icons/hi2';

const CartSummary = ({ items, onCheckout, isLoading }) => {
  const itemsPrice = items.reduce((sum, item) => {
    const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const shipping = itemsPrice > 999 ? 0 : 49;
  const tax = Number((itemsPrice * 0.05).toFixed(2));
  const total = Number((itemsPrice + shipping + tax).toFixed(2));
  const amountToFreeShipping = Math.max(0, 999 - itemsPrice);

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-6 sm:sticky sm:top-28">
      <h3 className="font-display text-lg font-semibold text-charcoal">Order Summary</h3>

      {amountToFreeShipping > 0 && (
        <p className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
          Add ₹{amountToFreeShipping.toFixed(2)} more for free shipping
        </p>
      )}

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-charcoal/70">
          <span>Subtotal</span>
          <span>₹{itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-charcoal/70">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between text-charcoal/70">
          <span>Tax</span>
          <span>₹{tax}</span>
        </div>
        <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-semibold text-charcoal">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button onClick={onCheckout} disabled={isLoading || items.length === 0} className="btn-primary mt-6 w-full">
        {isLoading ? 'Processing…' : 'Proceed to Checkout'}
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-charcoal/50">
        <HiOutlineShieldCheck size={16} />
        Secure checkout powered by Razorpay
      </p>
    </div>
  );
};

export default CartSummary;
