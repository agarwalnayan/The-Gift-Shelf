import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineShieldCheck } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useMarketing } from '../context/MarketingContext.jsx';
import { createOrderApi, verifyPaymentApi } from '../api/orderApi.js';
import { deleteAddressApi } from '../api/authApi.js';
import AddressCard from '../components/checkout/AddressCard.jsx';
import AddressFormModal from '../components/checkout/AddressFormModal.jsx';
import CouponInput from '../components/cart/CouponInput.jsx';
import FreeShippingBar from '../components/cart/FreeShippingBar.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import CustomizationValue from '../components/common/CustomizationValue.jsx';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const { user, setUser } = useAuth();
  const { cart, discount, isLoading: isCartLoading } = useCart();
  const { commerce } = useMarketing();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const addresses = user?.addresses || [];
  const items = cart.items || [];

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length]);

  const paymentOptions = commerce?.paymentOptions ?? { razorpay: true, whatsapp: true };
  const whatsappCharge = commerce?.whatsappCharge ?? 50;

  useEffect(() => {
    if (paymentMethod === 'razorpay' && !paymentOptions.razorpay && paymentOptions.whatsapp) {
      setPaymentMethod('whatsapp');
    } else if (paymentMethod === 'whatsapp' && !paymentOptions.whatsapp && paymentOptions.razorpay) {
      setPaymentMethod('razorpay');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentOptions.razorpay, paymentOptions.whatsapp]);

  const itemsPrice = useMemo(
    () => items.reduce((sum, item) => sum + (item.priceAtAddition + (item.customizationPrice || 0)) * item.quantity, 0),
    [items]
  );
  const discountedSubtotal = Math.max(0, itemsPrice - discount);
  const shippingThreshold = commerce?.freeShippingThreshold ?? 999;
  const shippingCharge = commerce?.shippingCharge ?? 49;
  const shipping = discountedSubtotal >= shippingThreshold ? 0 : shippingCharge;
  const surcharge = paymentMethod === 'whatsapp' ? whatsappCharge : 0;
  const total = Number((discountedSubtotal + shipping + surcharge).toFixed(2));

  const personalizedItems = items.filter((item) => item.customizations?.length > 0);

  const handleAddressSaved = (updatedAddresses) => {
    setUser((prev) => ({ ...prev, addresses: updatedAddresses }));
    if (!selectedAddressId && updatedAddresses.length > 0) {
      setSelectedAddressId(updatedAddresses[updatedAddresses.length - 1]._id);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await deleteAddressApi(addressId);
      setUser((prev) => ({ ...prev, addresses: data.data.addresses }));
      if (selectedAddressId === addressId) setSelectedAddressId(null);
      toast.success('Address removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove address');
    }
  };

  const buildShippingAddress = () => {
    const address = addresses.find((a) => a._id === selectedAddressId);
    if (!address) return null;
    const { fullName, phone, line1, line2, city, state, postalCode, country } = address;
    return { fullName, phone, line1, line2, city, state, postalCode, country };
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }
    const shippingAddress = buildShippingAddress();

    setIsPlacingOrder(true);
    try {
      const { data } = await createOrderApi({
        shippingAddress,
        paymentMethod,
        giftMessage,
        orderNotes,
      });
      const { order } = data.data;

      if (paymentMethod === 'whatsapp') {
        toast.success('Order placed! Confirm it on WhatsApp to finish up.');
        if (data.data.whatsappLink) window.open(data.data.whatsappLink, '_blank', 'noopener,noreferrer');
        navigate(`/account/orders/${order._id}`);
        return;
      }

      const { razorpayOrder } = data.data;
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Unable to load payment gateway. Please try again.');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'The Gift Shelf',
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! Your order is confirmed.');
            navigate(`/account/orders/${order._id}`);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: shippingAddress.phone },
        theme: { color: '#a9743d' },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.on('payment.failed', () => {
        toast.error('Payment failed. Your cart has been preserved — please try again.');
      });
      razorpayCheckout.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="container-tgs py-16 text-center">
        <p className="font-display text-xl font-semibold text-charcoal">Your cart is empty</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tgs py-8 sm:py-12">
      <h1 className="mb-8 font-display text-2xl font-semibold text-charcoal sm:text-3xl">Checkout</h1>

      {commerce?.checkoutMessage && (
        <div className="mb-6 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {commerce.checkoutMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3 lg:items-start lg:gap-10">
        {/* Left column */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-charcoal">Delivery Address</h2>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <HiOutlinePlus size={16} />
                Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-charcoal/20 p-6 text-center text-sm text-charcoal/60">
                No saved addresses yet. Add one to continue.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    isSelected={selectedAddressId === address._id}
                    onSelect={setSelectedAddressId}
                    onEdit={(addr) => {
                      setEditingAddress(addr);
                      setIsAddressModalOpen(true);
                    }}
                    onDelete={handleDeleteAddress}
                  />
                ))}
              </div>
            )}
          </section>

          {personalizedItems.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-charcoal">Personalization Summary</h2>
              <div className="space-y-3 rounded-2xl border border-charcoal/10 bg-white p-4">
                {personalizedItems.map((item) => (
                  <div key={item._id} className="border-b border-charcoal/5 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-charcoal">{item.product.name}</p>
                    <div className="mt-1.5 space-y-1">
                      {item.customizations.map((c) => (
                        <div key={c.key} className="text-xs text-charcoal/60">
                          <span className="font-medium text-charcoal/80">{c.label}: </span>
                          <CustomizationValue customization={c} thumbSize="h-10 w-10" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-charcoal">Gift Message (optional)</h2>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Write a little note for the recipient…"
              className="input-field w-full"
            />
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-charcoal">Order Notes (optional)</h2>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Delivery instructions, preferences, anything we should know…"
              className="input-field w-full"
            />
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-charcoal">Shipping Method</h2>
            <div className="rounded-2xl border border-primary-500 bg-primary-50/50 p-4 text-sm">
              <p className="font-medium text-charcoal">
                {shipping === 0 ? 'Free Shipping' : `Standard Shipping — ₹${shipping}`}
              </p>
              <p className="mt-1 text-charcoal/60">Delivered in 4–7 business days</p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-charcoal">Payment Method</h2>
            <div className="space-y-3">
              {paymentOptions.razorpay && (
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${paymentMethod === 'razorpay' ? 'border-primary-500 bg-primary-50/50' : 'border-charcoal/10 bg-white'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-charcoal">
                        <HiOutlineShieldCheck size={17} /> Pay Online (Razorpay)
                      </span>
                      <span className="mt-0.5 block text-xs text-charcoal/50">Cards, UPI, Netbanking & Wallets</span>
                    </span>
                  </span>
                </label>
              )}

              {paymentOptions.whatsapp && (
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${paymentMethod === 'whatsapp' ? 'border-primary-500 bg-primary-50/50' : 'border-charcoal/10 bg-white'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-charcoal">
                        <FaWhatsapp size={17} /> Order via WhatsApp
                      </span>
                      <span className="mt-0.5 block text-xs text-charcoal/50">
                        Confirm your order over chat (+₹{whatsappCharge})
                      </span>
                    </span>
                  </span>
                </label>
              )}
            </div>
          </section>
        </div>

        {/* Right column — sticky order summary */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 lg:sticky lg:top-28">
          <h3 className="font-display text-lg font-semibold text-charcoal">Order Summary</h3>

          <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={item.product.images?.[0]?.url} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-[10px] font-semibold text-cream">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-charcoal">{item.product.name}</p>
                  {item.customizations?.length > 0 && (
                    <p className="text-xs text-primary-600">Personalized</p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-semibold text-charcoal">
                  ₹{((item.priceAtAddition + (item.customizationPrice || 0)) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-charcoal/10 pt-4">
            <FreeShippingBar subtotal={discountedSubtotal} />
          </div>

          <div className="mt-5">
            <CouponInput couponCode={cart.couponCode} />
          </div>

          <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>Subtotal</span>
              <span>₹{itemsPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            {surcharge > 0 && (
              <div className="flex justify-between text-charcoal/70">
                <span>WhatsApp Order Charge</span>
                <span>₹{surcharge}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button onClick={placeOrder} isLoading={isPlacingOrder} className="mt-6 w-full">
            {paymentMethod === 'whatsapp' ? 'Place Order via WhatsApp' : `Pay ₹${total}`}
          </Button>

          {(commerce?.returnPolicy || commerce?.replacementPolicy) && (
            <p className="mt-4 text-center text-xs text-charcoal/40">
              Read our{' '}
              <a href="/returns" className="underline hover:text-primary-600">
                return &amp; replacement policy
              </a>
            </p>
          )}
        </div>
      </div>

      <AddressFormModal
        isOpen={isAddressModalOpen}
        address={editingAddress}
        onClose={() => setIsAddressModalOpen(false)}
        onSaved={handleAddressSaved}
      />
    </div>
  );
};

export default CheckoutPage;