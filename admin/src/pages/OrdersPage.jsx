import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi2';
import { getAllOrdersApi, updateOrderStatusApi, deleteOrderApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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
  const [isLoading, setIsLoading] = useState(true);
  const [orderPendingDelete, setOrderPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllOrdersApi({ limit: 100 });
      setOrders(data.data.orders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await updateOrderStatusApi(orderId, orderStatus);
      toast.success('Order status updated');
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

  const groupedOrders = useMemo(() => groupOrdersByDate(orders), [orders]);

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Orders</h1>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed by customers will show up here." />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOrders).map(([groupLabel, groupOrders]) => {
            if (groupOrders.length === 0) return null;

            return (
              <div key={groupLabel}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {groupLabel} <span className="text-ink/30">({groupOrders.length})</span>
                </h2>

                <div className="card overflow-x-auto p-0">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-xs">
                            <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline">
                              {order._id.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td>{order.user?.name}</td>
                          <td>{order.orderItems.length}</td>
                          <td>₹{order.totalPrice}</td>
                          <td>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                                }`}
                            >
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${statusStyles[order.orderStatus]}`}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => setOrderPendingDelete(order)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete order"
                            >
                              <HiOutlineTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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