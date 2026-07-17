import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { getAllOrdersApi } from '../api/orderApi.js';
import { getProductsApi } from '../api/productApi.js';
import { getAllUsersApi } from '../api/userApi.js';
import Loader from '../components/common/Loader.jsx';

const StatCard = ({ label, value, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-ink/60">{label}</p>
        <p className="truncate text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
};

const QuickLink = ({ to, label, icon: Icon }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-xl border border-ink/10 px-4 py-3 text-sm font-medium text-ink/70 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
  >
    <Icon size={18} />
    {label}
  </Link>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [draftCount, setDraftCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const firstPage = await getAllOrdersApi({ limit: 1 });
        const totalOrders = firstPage.data.data.total;

        const [ordersRes, productsRes, usersRes, draftRes, productsListRes] = await Promise.all([
          getAllOrdersApi({ limit: Math.max(totalOrders, 1) }),
          getProductsApi({ limit: 1 }),
          getAllUsersApi(),
          getProductsApi({ limit: 1, publishStatus: 'draft' }),
          getProductsApi({ limit: 100 }),
        ]);

        const orders = ordersRes.data.data.orders;
        const products = productsListRes.data.data.products || [];
        
        const revenue = orders.filter((order) => order.isPaid).reduce((sum, order) => sum + order.totalPrice, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
        const todayRevenue = todayOrders.filter((order) => order.isPaid).reduce((sum, order) => sum + order.totalPrice, 0);
        
        const pendingOrders = orders.filter(order => order.orderStatus === 'pending' || order.orderStatus === 'confirmed').length;
        
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
        const outOfStock = products.filter(p => p.stock === 0).length;

        setStats({
          totalOrders,
          totalProducts: productsRes.data.data.total,
          totalUsers: usersRes.data.data.count,
          revenue,
          todayOrders: todayOrders.length,
          todayRevenue,
          pendingOrders,
        });
        setDraftCount(draftRes.data.data.total);
        setLowStockCount(lowStock);
        setOutOfStockCount(outOfStockCount);
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="card flex items-center gap-3 text-red-600">
        <HiOutlineExclamationTriangle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <Link to="/products/new" className="btn-primary inline-flex items-center gap-1.5">
          <HiOutlinePlus size={16} />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={HiOutlineClipboardDocumentList} color="primary" />
        <StatCard label="Today's Revenue" value={`₹${stats.todayRevenue.toFixed(2)}`} icon={HiOutlineCurrencyRupee} color="green" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={HiOutlineClock} color="amber" />
        <StatCard label="Low Stock" value={lowStockCount} icon={HiOutlineCube} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={HiOutlineClipboardDocumentList} color="primary" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={HiOutlineShoppingBag} color="primary" />
        <StatCard label="Total Users" value={stats.totalUsers} icon={HiOutlineUsers} color="primary" />
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toFixed(2)}`} icon={HiOutlineCurrencyRupee} color="green" />
      </div>

      {outOfStockCount > 0 && (
        <div className="card flex items-center gap-3 !bg-red-50 text-red-800">
          <HiOutlineExclamationTriangle size={18} />
          <p className="text-sm">
            {outOfStockCount} product{outOfStockCount === 1 ? ' is' : 's are'} out of stock.{' '}
            <Link to="/products?stock=0" className="font-medium underline">
              View out of stock
            </Link>
          </p>
        </div>
      )}

      {lowStockCount > 0 && (
        <div className="card flex items-center gap-3 !bg-amber-50 text-amber-800">
          <HiOutlineExclamationTriangle size={18} />
          <p className="text-sm">
            {lowStockCount} product{lowStockCount === 1 ? ' has' : 's have'} low stock (≤10 units).{' '}
            <Link to="/products?stock=low" className="font-medium underline">
              View low stock
            </Link>
          </p>
        </div>
      )}

      {draftCount > 0 && (
        <div className="card flex items-center gap-3 !bg-amber-50 text-amber-800">
          <HiOutlineExclamationTriangle size={18} />
          <p className="text-sm">
            {draftCount} product{draftCount === 1 ? ' is' : 's are'} still in Draft and not visible to customers.{' '}
            <Link to="/products?publishStatus=draft" className="font-medium underline">
              Review drafts
            </Link>
          </p>
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-ink/60">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="flex items-center justify-between rounded-lg border border-ink/10 px-4 py-3 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <div className="flex items-center gap-3">
                  <HiOutlineTruck size={16} className="text-ink/40" />
                  <div>
                    <p className="font-medium text-ink">{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">₹{order.totalPrice}</p>
                  <p className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink/60">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickLink to="/products/new" label="Add a Product" icon={HiOutlineShoppingBag} />
          <QuickLink to="/categories" label="Manage Categories" icon={HiOutlineClipboardDocumentList} />
          <QuickLink to="/orders" label="Review Orders" icon={HiOutlineUsers} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
