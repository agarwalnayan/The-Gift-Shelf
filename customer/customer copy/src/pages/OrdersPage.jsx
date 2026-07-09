import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi()
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="container-tgs py-16">
        <EmptyState title="No orders yet" description="Your order history will appear here once you place an order." />
      </div>
    );
  }

  return (
    <div className="container-tgs py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-charcoal">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/account/orders/${order._id}`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-charcoal">Order #{order._id.slice(-8).toUpperCase()}</p>
              <p className="mt-1 text-xs text-charcoal/50">
                {new Date(order.createdAt).toLocaleDateString()} &middot; {order.orderItems.length} items
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-charcoal">₹{order.totalPrice}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
