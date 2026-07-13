import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderByIdApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrderByIdApi(id)
      .then(({ data }) => setOrder(data.data.order))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <Loader fullScreen />;
  if (!order) return null;

  return (
    <div className="container-tgs py-12">
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-1 text-sm text-charcoal/60">Status: {order.orderStatus}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.product} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-charcoal">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6">
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
    </div>
  );
};

export default OrderDetailPage;