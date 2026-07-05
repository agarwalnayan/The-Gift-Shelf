import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllOrdersApi, updateOrderStatusApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Orders</h1>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed by customers will show up here." />
      ) : (
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
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td>{order.user?.name}</td>
                  <td>{order.orderItems.length}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
