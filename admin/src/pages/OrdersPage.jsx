import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlinePlus } from 'react-icons/hi2';
import { getAllOrdersApi, updateOrderStatusApi, deleteOrderApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Input from '../components/common/Input.jsx';
import TableCard from '../components/common/TableCard.jsx';

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

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Groups orders into Today / Yesterday / Older buckets based on createdAt,
// preserving the newest-first order already returned by the API.
const groupOrdersByDate = (orders) => {
  const today = startOfDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;

  const groups = { Today: [], Yesterday: [], Older: [] };

  orders.forEach((order) => {
    const orderDay = startOfDay(order.createdAt);
    if (orderDay === today) groups.Today.push(order);
    else if (orderDay === yesterday) groups.Yesterday.push(order);
    else groups.Older.push(order);
  });

  return groups;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderPendingDelete, setOrderPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllOrdersApi({ limit: 100 });
      setOrders(data.data.orders);
      setFilteredOrders(data.data.orders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredOrders(
        orders.filter(
          (order) =>
            order._id?.toLowerCase().includes(query) ||
            order.user?.name?.toLowerCase().includes(query) ||
            order.user?.email?.toLowerCase().includes(query) ||
            order.orderStatus?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, orders]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      const { data } = await updateOrderStatusApi(orderId, orderStatus);
      if (data.data?.emailSent === false) {
        toast.error('Status updated, but the notification email could not be sent');
      } else {
        toast.success('Order status updated');
      }
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  const handleDelete = async () => {
    if (!orderPendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrderApi(orderPendingDelete._id);
      toast.success('Order deleted');
      setOrderPendingDelete(null);
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const groupedOrders = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders]);

  const orderColumns = [
    { header: 'Order ID', width: '100px' },
    { header: 'Customer', width: '150px' },
    { header: 'Items', width: '64px' },
    { header: 'Total', width: '96px' },
    { header: 'Paid', width: '80px' },
    { header: 'Status', width: '128px' },
    { header: '', width: '64px' },
  ];

  const renderOrderRow = (order) => [
    <td key="id" className="font-mono text-xs">
      <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline">
        {order._id.slice(-8).toUpperCase()}
      </Link>
    </td>,
    <td key="customer" className="truncate">{order.user?.name}</td>,
    <td key="items">{order.orderItems.length}</td>,
    <td key="total">₹{order.totalPrice}</td>,
    <td key="paid">
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
          }`}
      >
        {order.isPaid ? 'Paid' : 'Unpaid'}
      </span>
    </td>,
    <td key="status">
      <select
        value={order.orderStatus}
        onChange={(e) => handleStatusChange(order._id, e.target.value)}
        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${statusStyles[order.orderStatus] || statusStyles['pending']}`}
      >
        {statusOptions.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </td>,
    <td key="actions">
      <button
        onClick={() => setOrderPendingDelete(order)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label="Delete order"
      >
        <HiOutlineTrash size={16} />
      </button>
    </td>,
  ];

  const renderOrderCard = (order) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link to={`/orders/${order._id}`} className="font-mono text-sm font-semibold text-primary-600 hover:underline">
            {order._id.slice(-8).toUpperCase()}
          </Link>
          <p className="text-sm text-ink/60 mt-1">{order.user?.name}</p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
            }`}
        >
          {order.isPaid ? 'Paid' : 'Unpaid'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Items</span>
          <p className="text-sm text-ink mt-1">{order.orderItems.length}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Total</span>
          <p className="text-sm font-medium text-ink mt-1">₹{order.totalPrice}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-ink/10">
        <div className="flex-1">
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Status</span>
          <select
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
            className={`mt-1 w-full rounded-full border-0 px-2.5 py-1 text-xs font-medium ${statusStyles[order.orderStatus] || statusStyles['pending']}`}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setOrderPendingDelete(order)}
          className="p-2 text-ink/40 hover:text-red-600 rounded hover:bg-red-50"
          aria-label="Delete order"
        >
          <HiOutlineTrash size={18} />
        </button>
      </div>
    </div>
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Orders"
          description="Manage customer orders"
        />
        <Link
          to="/orders/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700"
        >
          <HiOutlinePlus size={18} />
          Create Manual Order
        </Link>
      </div>

      <div>
        <Input
          type="text"
          placeholder="Search by Order ID, customer name, email, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<HiOutlineMagnifyingGlass size={18} />}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState title="No orders found" description={searchQuery ? `No orders matching "${searchQuery}"` : "Orders placed by customers will show up here."} />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOrders).map(([groupLabel, groupOrders]) => {
            if (groupOrders.length === 0) return null;

            return (
              <div key={groupLabel}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {groupLabel} <span className="text-ink/30">({groupOrders.length})</span>
                </h2>

                <TableCard
                  columns={orderColumns}
                  data={groupOrders}
                  renderRow={renderOrderRow}
                  renderCard={renderOrderCard}
                />
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!orderPendingDelete}
        title="Delete this order?"
        description={
          orderPendingDelete
            ? `Order #${orderPendingDelete._id.slice(-8).toUpperCase()} will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete Order"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setOrderPendingDelete(null)}
      />
    </div>
  );
};

export default OrdersPage;