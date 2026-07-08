import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { getOrderByIdApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const formatCustomizationValue = (customization) => {
  const { type, value } = customization;

  if (Array.isArray(value)) {
    if (type === 'multi_image_upload') {
      return value;
    }
    return value.join(', ');
  }

  if (type === 'image_upload') {
    return [value];
  }

  return String(value);
};

const CustomizationList = ({ customizations }) => {
  if (!customizations || customizations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg bg-surface p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Personalization</p>
      {customizations.map((customization) => {
        const formatted = formatCustomizationValue(customization);
        const isImageList = Array.isArray(formatted) && (customization.type === 'image_upload' || customization.type === 'multi_image_upload');

        return (
          <div key={customization.key} className="text-sm">
            <span className="font-medium text-ink">{customization.label}: </span>
            {isImageList ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {formatted.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={customization.label} className="h-14 w-14 rounded-lg object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-ink/70">{formatted}</span>
            )}
            {customization.additionalPrice > 0 && (
              <span className="ml-2 text-xs text-primary-600">(+₹{customization.additionalPrice})</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

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
    <div className="mx-auto max-w-4xl">
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
        <HiOutlineArrowLeft size={16} />
        Back to Orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-ink/50">
            Placed {new Date(order.createdAt).toLocaleString()} by {order.user?.name} ({order.user?.email})
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="card space-y-4 p-0">
            {order.orderItems.map((item, index) => (
              <div key={index} className="border-b border-ink/5 p-4 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{item.name}</p>
                    {item.variantSku && <p className="text-xs text-ink/40">Variant: {item.variantSku}</p>}
                    <p className="text-xs text-ink/50">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-ink">₹{item.price}</p>
                    {item.customizationPrice > 0 && <p className="text-xs text-primary-600">+₹{item.customizationPrice} personalization</p>}
                  </div>
                </div>
                <CustomizationList customizations={item.customizations} />
              </div>
            ))}
          </div>
        </div>

        <div className="card h-fit space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Shipping Address</h3>
            <p className="mt-2 text-sm text-ink/70">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>₹{order.shippingPrice}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Tax</span>
              <span>₹{order.taxPrice}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>

          <div className="border-t border-ink/10 pt-4 text-sm text-ink/70">
            <p>Payment: {order.paymentMethod}</p>
            <p>{order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not yet paid'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
