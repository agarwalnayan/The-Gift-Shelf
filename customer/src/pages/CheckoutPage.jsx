import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { createOrderApi, verifyPaymentApi } from '../api/orderApi.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';

const initialAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(initialAddress);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const { data } = await createOrderApi({ shippingAddress: address, paymentMethod: 'razorpay' });
      const { order, razorpayOrder } = data.data;

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Unable to load payment gateway');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'The Gift Shelf',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          await verifyPaymentApi({
            orderId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          await clearCart();
          toast.success('Payment successful');
          navigate('/account/orders');
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: { color: '#d15a30' },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container-tgs py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-charcoal">Checkout</h1>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="font-display text-xl font-semibold text-charcoal">Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" name="fullName" value={address.fullName} onChange={handleChange} />
            <Input label="Phone" name="phone" value={address.phone} onChange={handleChange} />
            <Input label="Address Line 1" name="line1" value={address.line1} onChange={handleChange} className="sm:col-span-2" />
            <Input label="Address Line 2" name="line2" value={address.line2} onChange={handleChange} className="sm:col-span-2" />
            <Input label="City" name="city" value={address.city} onChange={handleChange} />
            <Input label="State" name="state" value={address.state} onChange={handleChange} />
            <Input label="Postal Code" name="postalCode" value={address.postalCode} onChange={handleChange} />
            <Input label="Country" name="country" value={address.country} onChange={handleChange} />
          </div>
        </div>

        <div>
          <CartSummary items={cart.items} onCheckout={handlePlaceOrder} isLoading={isPlacingOrder} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
