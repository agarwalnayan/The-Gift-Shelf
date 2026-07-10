import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRightOnRectangle, HiBars3 } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';

const Topbar = ({ onMenuClick = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-ink/10 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 md:hidden"
        aria-label="Open menu"
      >
        <HiBars3 size={22} />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{user?.name}</p>
          <p className="text-xs capitalize text-ink/50">{user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Log out"
        >
          <HiOutlineArrowRightOnRectangle size={19} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
