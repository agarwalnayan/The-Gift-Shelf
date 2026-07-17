import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi2';
import {
  getOrderByIdApi,
  updateOrderStatusApi,
  updatePaymentStatusApi,
  updateOrderTrackingApi,
  deleteOrderApi,
} from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];
const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];

const statusStyles = {
  'pending': 'bg-yellow-100 text-yellow-700',
  'confirmed': 'bg-blue-100 text-blue-700',
  'preparing': 'bg-indigo-100 text-indigo-700',
  'packed': 'bg-purple-100 text-purple-700',
  'shipped': 'bg-cyan-100 text-cyan-700',
  'out_for_delivery': 'bg-orange-100 text-orange-700',
  'delivered': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
  'returned': 'bg-gray-100 text-gray-700',
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
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const loadOrder = () => {
    setIsLoading(true);
    return getOrderByIdApi(id)
      .then(({ data }) => {
        const fetched = data.data.order;
        setOrder(fetched);
        setCourierName(fetched.courier?.name || '');
        setTrackingId(fetched.courier?.trackingId || '');
        setTrackingUrl(fetched.courier?.trackingUrl || '');
        setInternalNotes(fetched.internalNotes || '');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (orderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const { data } = await updateOrderStatusApi(order._id, orderStatus);
      setOrder(data.data.order);
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    setIsUpdatingPayment(true);
    try {
      const { data } = await updatePaymentStatusApi(order._id, paymentStatus);
      setOrder(data.data.order);
      toast.success('Payment status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleSaveTracking = async () => {
    setIsSavingTracking(true);
    try {
      const { data } = await updateOrderTrackingApi(order._id, {
        courierName,
        trackingId,
        trackingUrl,
        internalNotes,
      });
      setOrder(data.data.order);
      toast.success('Tracking details saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tracking details');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrderApi(order._id);
      toast.success('Order deleted');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
          <HiOutlineArrowLeft size={16} />
          Back to Orders
        </Link>
        <button
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <HiOutlineTrash size={16} />
          Delete Order
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-ink/50">
            Placed {new Date(order.createdAt).toLocaleString()} by {order.user?.name} ({order.user?.email})
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.orderStatus] || statusStyles['pending']}`}>
          {statusOptions.find((o) => o.value === order.orderStatus)?.label || order.orderStatus}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
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

          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-ink">Fulfillment</h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Courier Name"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g. Delhivery, BlueDart"
              />
              <Input
                label="Tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. 1234567890"
              />
            </div>
            <Input
              label="Tracking URL"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://…"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">Internal Notes</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Notes visible only to the team — not shown to the customer"
                className="input-field w-full"
              />
            </div>

            <Button onClick={handleSaveTracking} isLoading={isSavingTracking}>
              Save Fulfillment Details
            </Button>
          </div>
        </div>

        <div className="card h-fit space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Order Status</h3>
            <select
              value={order.orderStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`mt-2 w-full rounded-lg border-0 px-3 py-2 text-sm font-medium ${statusStyles[order.orderStatus] || statusStyles['pending']}`}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-ink/10 pt-4">
            <h3 className="text-sm font-semibold text-ink">Payment Status</h3>
            <select
              value={order.paymentStatus || (order.isPaid ? 'paid' : 'pending')}
              disabled={isUpdatingPayment}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink"
            >
              {paymentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs capitalize text-ink/50">Payment method: {order.paymentMethod}</p>
          </div>

          <div className="border-t border-ink/10 pt-4">
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
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>-₹{order.discountPrice}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
            </div>
            {order.whatsappCharge > 0 && (
              <div className="flex justify-between text-ink/70">
                <span>WhatsApp Order Charge</span>
                <span>₹{order.whatsappCharge}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>

          {(order.giftMessage || order.orderNotes) && (
            <div className="border-t border-ink/10 pt-4 text-sm">
              {order.giftMessage && (
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Gift Message</p>
                  <p className="mt-1 text-ink/70">{order.giftMessage}</p>
                </div>
              )}
              {order.orderNotes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Order Notes</p>
                  <p className="mt-1 text-ink/70">{order.orderNotes}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-ink/10 pt-4 text-sm text-ink/70">
            <p>{order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not yet paid'}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete this order?"
        description={`Order #${order._id.slice(-8).toUpperCase()} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Order"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default OrderDetailPage;