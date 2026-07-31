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
import { getDashboardStatsApi } from '../api/statsApi.js';
import Loader from '../components/common/Loader.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';

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
        const { data } = await getDashboardStatsApi();
        const s = data.data;

        setStats({
          totalOrders: s.totalOrders,
          totalProducts: s.totalProducts,
          totalUsers: s.totalUsers,
          revenue: s.revenue,
          todayOrders: s.todayOrders,
          todayRevenue: s.todayRevenue,
          pendingOrders: s.pendingOrders,
        });
        setDraftCount(s.draftProducts);
        setLowStockCount(s.lowStockCount);
        setOutOfStockCount(s.outOfStockCount);
        setRecentOrders(s.recentOrders || []);
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
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance"
        actions={
          <Link to="/products/new">
            <Button>
              <HiOutlinePlus size={16} className="mr-1.5" />
              Add Product
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={HiOutlineClipboardDocumentList} color="primary" />
        <StatCard label="Today's Revenue" value={`₹${stats.todayRevenue.toFixed(2)}`} icon={HiOutlineCurrencyRupee} color="green" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={HiOutlineClock} color="amber" />
        <StatCard label="Low Stock" value={lowStockCount} icon={HiOutlineCube} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineTruck size={16} className="text-ink/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink to="/products/new" label="Add a Product" icon={HiOutlineShoppingBag} />
          <QuickLink to="/categories" label="Manage Categories" icon={HiOutlineClipboardDocumentList} />
          <QuickLink to="/orders" label="Review Orders" icon={HiOutlineUsers} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;