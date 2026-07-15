import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderByIdApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineDocumentText, HiOutlineTruck, HiOutlineCube, HiOutlineHome, HiOutlineArrowPath } from 'react-icons/hi2';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrderByIdApi(id)
      .then(({ data }) => setOrder(data.data.order))
      .finally(() => setIsLoading(false));
  }, [id]);

  const getTrackingStatus = (orderStatus) => {
    const statusMap = {
      'Pending': 0,
      'Confirmed': 1,
      'Processing': 2,
      'Packed': 3,
      'Shipped': 4,
      'Out For Delivery': 5,
      'Delivered': 6
    };
    return statusMap[orderStatus] || 0;
  };

  const trackingSteps = [
    { icon: HiOutlineDocumentText, label: 'Order Placed' },
    { icon: HiOutlineCheckCircle, label: 'Confirmed' },
    { icon: HiOutlineClock, label: 'Processing' },
    { icon: HiOutlineCube, label: 'Packed' },
    { icon: HiOutlineTruck, label: 'Shipped' },
    { icon: HiOutlineHome, label: 'Out For Delivery' },
    { icon: HiOutlineCheckCircle, label: 'Delivered' }
  ];

  const currentStep = getTrackingStatus(order?.orderStatus);

  if (isLoading) return <Loader fullScreen />;
  if (!order) return null;

  return (
    <div className="container-tgs py-12">
      <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-2 text-sm text-charcoal/60">Status: {order.orderStatus}</p>

      <div className="mt-6 rounded-lg bg-primary-50 border border-primary-100 px-4 py-3">
        <p className="text-sm font-medium text-primary-600">🎉 Thank you for your order!</p>
        <p className="text-xs text-charcoal/60 mt-1">Use code <span className="font-semibold">LAUNCH20</span> on your next order for 20% OFF</p>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-display text-lg font-semibold text-charcoal">Order Tracking</h2>
        <div className="space-y-0">
          {trackingSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;
            
            return (
              <div key={index} className="flex items-start gap-4 pb-6 last:pb-0">
                <div className="relative flex shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-primary-600 text-white' : 'bg-charcoal/10 text-charcoal/40'
                  }`}>
                    <Icon size={20} />
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div className={`absolute left-5 top-10 h-12 w-0.5 -translate-x-1/2 transition-colors duration-300 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-charcoal/10'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-charcoal' : 'text-charcoal/40'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="mt-1 text-sm text-primary-600">In Progress</p>
                  )}
                  {isCompleted && index < currentStep && (
                    <p className="mt-1 text-sm text-green-600">Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.product} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-xs text-primary-600 mt-1">Personalised</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-charcoal">₹{item.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 px-4 py-3 text-sm font-medium text-charcoal transition-colors duration-300 hover:border-primary-500 hover:text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 px-4 py-3 text-sm font-medium text-charcoal transition-colors duration-300 hover:border-primary-500 hover:text-primary-600">
              <HiOutlineArrowPath size={18} />
              Reorder
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-charcoal">Shipping Address</h2>
          <p className="mt-3 text-sm text-charcoal/70">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>

          <div className="mt-6 border-t border-charcoal/10 pt-4 text-sm">
            <div className="flex justify-between text-charcoal/70">
              <span>Subtotal</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>-₹{order.discountPrice}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal/70">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
            </div>
            {order.whatsappCharge > 0 && (
              <div className="flex justify-between text-charcoal/70">
                <span>WhatsApp Order Charge</span>
                <span>₹{order.whatsappCharge}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-charcoal/10 pt-2 font-semibold text-charcoal">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>

          {(order.giftMessage || order.orderNotes) && (
            <div className="mt-6 border-t border-charcoal/10 pt-4 text-sm">
              {order.giftMessage && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Gift Message</p>
                  <p className="mt-1 text-charcoal/70">{order.giftMessage}</p>
                </div>
              )}
              {order.orderNotes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Order Notes</p>
                  <p className="mt-1 text-charcoal/70">{order.orderNotes}</p>
                </div>
              )}
            </div>
          )}

          {(order.courier?.name || order.courier?.trackingId || order.courier?.trackingUrl) && (
            <div className="mt-6 border-t border-charcoal/10 pt-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Shipment</p>
              <div className="mt-2 space-y-1 text-charcoal/70">
                {order.courier?.name && (
                  <p>
                    <span className="font-medium text-charcoal">Courier: </span>
                    {order.courier.name}
                  </p>
                )}
                {order.courier?.trackingId && (
                  <p>
                    <span className="font-medium text-charcoal">Tracking ID: </span>
                    {order.courier.trackingId}
                  </p>
                )}
              </div>
              {order.courier?.trackingUrl && (
                <a
                  href={order.courier.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-4 inline-flex w-full items-center justify-center"
                >
                  Track Order
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Need Help?</h2>
        <p className="text-sm text-charcoal/60 mb-4">
          If you have any questions about your order, please reach out to our support team.
        </p>
        <button className="inline-flex items-center gap-2 rounded-xl border-2 border-charcoal/20 px-6 py-3 text-sm font-medium text-charcoal transition-colors duration-300 hover:border-primary-500 hover:text-primary-600">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;