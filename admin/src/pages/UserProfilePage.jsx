import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineKey } from 'react-icons/hi2';
import { getUserByIdApi, updateUserStatusApi, resetUserPasswordApi } from '../api/userApi.js';
import { getAllOrdersApi } from '../api/orderApi.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userRes, ordersRes] = await Promise.all([
          getUserByIdApi(id),
          getAllOrdersApi({ limit: 100 }),
        ]);
        setUser(userRes.data.data.user);
        
        const userOrders = ordersRes.data.data.orders.filter(
          order => order.user?._id === id || order.user === id
        );
        setOrders(userOrders);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setIsUpdatingStatus(true);
    try {
      await updateUserStatusApi(user._id, !user.isActive);
      setUser(prev => ({ ...prev, isActive: !prev.isActive }));
      toast.success('User status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user || !newPassword) return;
    setIsResettingPassword(true);
    try {
      await resetUserPasswordApi(user._id, { password: newPassword });
      toast.success('Password reset successfully');
      setNewPassword('');
      setIsPasswordConfirmOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  if (isLoading) return <Loader fullScreen />;
  if (!user) return null;

  const totalSpent = orders
    .filter(order => order.isPaid)
    .reduce((sum, order) => sum + order.totalPrice, 0);

  const orderCount = orders.length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
          <HiOutlineArrowLeft size={16} />
          Back to Users
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="card space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-ink">{user.name}</h1>
                <p className="mt-1 text-sm text-ink/60">{user.email}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                }`}
              >
                {user.isActive ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div className="grid gap-4 pt-4 border-t border-ink/10">
              <div className="flex items-center gap-3 text-sm">
                <HiOutlineEnvelope size={18} className="text-ink/40" />
                <span className="text-ink/70">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlinePhone size={18} className="text-ink/40" />
                  <span className="text-ink/70">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <HiOutlineCalendar size={18} className="text-ink/40" />
                <span className="text-ink/70">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-ink/10 flex gap-3">
              <Button
                variant="secondary"
                onClick={handleToggleStatus}
                isLoading={isUpdatingStatus}
              >
                {user.isActive ? 'Deactivate User' : 'Activate User'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  generateRandomPassword();
                  setIsPasswordConfirmOpen(true);
                }}
              >
                <HiOutlineKey size={16} className="mr-1.5" />
                Reset Password
              </Button>
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-semibold text-ink">Order History</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-ink/60">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="flex items-center justify-between rounded-lg border border-ink/10 px-4 py-3 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-3">
                      <HiOutlineShoppingBag size={16} className="text-ink/40" />
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
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-semibold text-ink">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/60">Role</span>
                <span className="font-medium text-ink capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Status</span>
                <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Total Orders</span>
                <span className="font-medium text-ink">{orderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Total Spent</span>
                <span className="font-medium text-ink">₹{totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {user.addresses && user.addresses.length > 0 && (
            <div className="card space-y-4 p-6">
              <h3 className="text-sm font-semibold text-ink">Saved Addresses</h3>
              <div className="space-y-3">
                {user.addresses.map((address, index) => (
                  <div key={index} className="rounded-lg bg-surface p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <HiOutlineMapPin size={16} className="mt-0.5 text-ink/40 shrink-0" />
                      <div className="text-ink/70">
                        <p className="font-medium text-ink">{address.fullName}</p>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        <p className="text-xs text-ink/50">{address.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isPasswordConfirmOpen}
        title="Reset User Password"
        description={
          <div className="space-y-3">
            <p className="text-sm text-ink/70">
              This will reset the password for <strong>{user.email}</strong>. Share the new password securely with the user.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Click 'Generate' to create a secure password"
              />
              <button
                type="button"
                onClick={generateRandomPassword}
                className="mt-2 text-sm text-primary-600 hover:underline"
              >
                Generate Random Password
              </button>
            </div>
          </div>
        }
        confirmLabel="Reset Password"
        isLoading={isResettingPassword}
        onConfirm={handleResetPassword}
        onCancel={() => {
          setIsPasswordConfirmOpen(false);
          setNewPassword('');
        }}
      />
    </div>
  );
};

export default UserProfilePage;
