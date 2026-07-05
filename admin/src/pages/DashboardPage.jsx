import { useEffect, useState } from 'react';
import { HiOutlineShoppingBag, HiOutlineClipboardDocumentList, HiOutlineUsers, HiOutlineCurrencyRupee } from 'react-icons/hi2';
import { getAllOrdersApi } from '../api/orderApi.js';
import { getProductsApi } from '../api/productApi.js';
import { getAllUsersApi } from '../api/userApi.js';
import Loader from '../components/common/Loader.jsx';

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="card flex items-center gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="text-xl font-semibold text-ink">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          getAllOrdersApi({ limit: 100 }),
          getProductsApi({ limit: 100 }),
          getAllUsersApi(),
        ]);

        const orders = ordersRes.data.data.orders;
        const revenue = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          totalOrders: ordersRes.data.data.total,
          totalProducts: productsRes.data.data.total,
          totalUsers: usersRes.data.data.count,
          revenue,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={HiOutlineClipboardDocumentList} />
        <StatCard label="Total Products" value={stats.totalProducts} icon={HiOutlineShoppingBag} />
        <StatCard label="Total Users" value={stats.totalUsers} icon={HiOutlineUsers} />
        <StatCard label="Revenue" value={`₹${stats.revenue.toFixed(2)}`} icon={HiOutlineCurrencyRupee} />
      </div>
    </div>
  );
};

export default DashboardPage;
