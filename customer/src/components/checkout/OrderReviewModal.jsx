import { HiOutlineXMark, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineGiftTop } from 'react-icons/hi2';
import CustomizationValue from '../common/CustomizationValue.jsx';

const OrderReviewModal = ({ isOpen, onClose, onConfirm, addresses, selectedAddressId, items, paymentMethod, giftMessage, orderNotes, shipping, total, isPlacingOrder }) => {
  if (!isOpen) return null;

  const address = addresses.find((a) => a._id === selectedAddressId);
  const itemsPrice = items.reduce((sum, item) => sum + (item.priceAtAddition + (item.customizationPrice || 0)) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-charcoal/10 bg-white px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-charcoal">Review Your Order</h3>
          <button
            onClick={onClose}
            disabled={isPlacingOrder}
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-charcoal/5 disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Delivering to</h4>
            {address ? (
              <div className="rounded-xl border border-charcoal/10 bg-surface/60 p-4 text-sm text-charcoal/80">
                <p className="font-medium text-charcoal">{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="mt-1 text-charcoal/60">{address.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Please select a delivery address</p>
            )}
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Items</h4>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3 rounded-xl border border-charcoal/10 p-3">
                  <img
                    src={item.product.images?.[0]?.url}
                    alt={item.product.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal">{item.product.name}</p>
                    {item.variantSku && (
                      <p className="mt-0.5 text-xs text-charcoal/50">
                        {item.product.variants?.find((v) => v.sku === item.variantSku)?.attributes?.map((a) => a.value).join(' · ')}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-charcoal/50">Qty: {item.quantity}</p>
                    {item.customizations?.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {item.customizations.map((c) => (
                          <div key={c.key} className="text-xs text-charcoal/60">
                            <span className="font-medium text-charcoal/80">{c.label}: </span>
                            <CustomizationValue customization={c} thumbSize="h-8 w-8" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-charcoal">
                    ₹{((item.priceAtAddition + (item.customizationPrice || 0)) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {(giftMessage || orderNotes) && (
            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Notes</h4>
              <div className="rounded-xl border border-charcoal/10 bg-surface/60 p-4 text-sm text-charcoal/80">
                {giftMessage && (
                  <div className="mb-2">
                    <span className="font-medium text-charcoal/60">Gift message: </span>
                    {giftMessage}
                  </div>
                )}
                {orderNotes && (
                  <div>
                    <span className="font-medium text-charcoal/60">Order notes: </span>
                    {orderNotes}
                  </div>
                )}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Payment</h4>
            <div className="flex items-center gap-2 rounded-xl border border-charcoal/10 bg-surface/60 p-4 text-sm text-charcoal/80">
              {paymentMethod === 'razorpay' ? (
                <>
                  <HiOutlineShieldCheck size={18} className="text-primary-600" />
                  <span>Pay Online Securely — Cards, UPI, Netbanking & Wallets</span>
                </>
              ) : (
                <>
                  <HiOutlineTruck size={18} className="text-green-600" />
                  <span>Order via WhatsApp — Personal assistance via chat</span>
                </>
              )}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Total</h4>
            <div className="rounded-xl border border-charcoal/10 bg-surface/60 p-4">
              <div className="flex justify-between text-sm text-charcoal/70">
                <span>Subtotal</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-charcoal/10 pt-2 text-base font-semibold text-charcoal">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              {shipping === 0 && (
                <p className="mt-1 text-xs text-green-600">You have free shipping</p>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={onConfirm}
              disabled={isPlacingOrder || !address}
              className="btn-primary w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlacingOrder ? 'Processing…' : `Confirm & Pay ₹${total}`}
            </button>
            <button
              onClick={onClose}
              disabled={isPlacingOrder}
              className="w-full py-3 text-sm font-medium text-charcoal/60 transition-colors hover:text-charcoal disabled:opacity-50"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewModal;
