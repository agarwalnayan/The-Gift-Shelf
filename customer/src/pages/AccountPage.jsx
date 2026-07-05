import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="container-tgs py-12">
      <h1 className="font-display text-3xl font-semibold text-charcoal">My Account</h1>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-6">
        <p className="text-sm text-charcoal/60">Name</p>
        <p className="font-medium text-charcoal">{user?.name}</p>

        <p className="mt-4 text-sm text-charcoal/60">Email</p>
        <p className="font-medium text-charcoal">{user?.email}</p>

        <div className="mt-8 flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/account/orders')}>
            View Orders
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
