import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineUser, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineMapPin, HiOutlineTicket, HiOutlineBell, HiOutlineQuestionMarkCircle, HiOutlineInformationCircle, HiOutlineArrowRight } from 'react-icons/hi2';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    {
      icon: HiOutlineUser,
      label: 'Profile',
      description: 'Manage your account details',
      action: () => navigate('/account/profile')
    },
    {
      icon: HiOutlineShoppingBag,
      label: 'Orders',
      description: 'View your order history',
      action: () => navigate('/account/orders')
    },
    {
      icon: HiOutlineHeart,
      label: 'Wishlist',
      description: 'View saved items',
      action: () => navigate('/wishlist')
    },
    {
      icon: HiOutlineMapPin,
      label: 'Saved Addresses',
      description: 'Manage delivery addresses',
      action: () => navigate('/account/addresses')
    },
    {
      icon: HiOutlineTicket,
      label: 'Coupons',
      description: 'View available coupons',
      action: () => navigate('/account/coupons')
    },
    {
      icon: HiOutlineBell,
      label: 'Notifications',
      description: 'Manage notifications',
      action: () => navigate('/account/notifications')
    },
    {
      icon: HiOutlineQuestionMarkCircle,
      label: 'Help & Support',
      description: 'Get help with your orders',
      action: () => navigate('/account/help')
    },
    {
      icon: HiOutlineInformationCircle,
      label: 'About TGS',
      description: 'Learn about The Gift Shelf',
      action: () => navigate('/about')
    }
  ];

  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">My Account</h1>
        <p className="mt-2 text-sm text-charcoal/60">Welcome back, {user?.name?.split(' ')[0]}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="group flex items-start gap-4 rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-all duration-300 hover:border-primary-500 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
              <item.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-charcoal">{item.label}</p>
              <p className="mt-1 text-sm text-charcoal/60">{item.description}</p>
            </div>
            <HiOutlineArrowRight size={20} className="shrink-0 text-charcoal/30 transition-colors duration-300 group-hover:text-primary-600" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="group flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-left transition-all duration-300 hover:border-red-500 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
            <HiOutlineArrowRight size={24} className="rotate-180" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-red-600">Logout</p>
            <p className="mt-1 text-sm text-red-400">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
