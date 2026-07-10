import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { getAllOrdersApi } from '../api/orderApi.js';
import { getProductsApi } from '../api/productApi.js';
import { getAllUsersApi } from '../api/userApi.js';
import Loader from '../components/common/Loader.jsx';

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="card flex items-center gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="truncate text-xl font-semibold text-ink">{value}</p>
    </div>
  </div>
);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Previous implementation capped orders at `limit: 100` and summed
        // totalPrice client-side, silently under-reporting revenue once the
        // store passed 100 orders. We first ask for the true order count,
        // then fetch exactly that many (still the existing /orders endpoint,
        // no new API) so the revenue figure is always accurate.
        const firstPage = await getAllOrdersApi({ limit: 1 });
        const totalOrders = firstPage.data.data.total;

        const [ordersRes, productsRes, usersRes, draftRes] = await Promise.all([
          getAllOrdersApi({ limit: Math.max(totalOrders, 1) }),
          getProductsApi({ limit: 1 }),
          getAllUsersApi(),
          getProductsApi({ limit: 1, publishStatus: 'draft' }),
        ]);

        const orders = ordersRes.data.data.orders;
        const revenue = orders.filter((order) => order.isPaid).reduce((sum, order) => sum + order.totalPrice, 0);

        setStats({
          totalOrders,
          totalProducts: productsRes.data.data.total,
          totalUsers: usersRes.data.data.count,
          revenue,
        });
        setDraftCount(draftRes.data.data.total);
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
        <StatCard label="Total Orders" value={stats.totalOrders} icon={HiOutlineClipboardDocumentList} />
        <StatCard label="Total Products" value={stats.totalProducts} icon={HiOutlineShoppingBag} />
        <StatCard label="Total Users" value={stats.totalUsers} icon={HiOutlineUsers} />
        <StatCard label="Revenue (Paid Orders)" value={`₹${stats.revenue.toFixed(2)}`} icon={HiOutlineCurrencyRupee} />
      </div>

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
