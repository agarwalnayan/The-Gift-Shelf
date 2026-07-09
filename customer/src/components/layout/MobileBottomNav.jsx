import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSquares2X2, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const navItemClass = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
    isActive ? 'text-primary-600' : 'text-charcoal/50'
  }`;

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        <NavLink to="/" end className={navItemClass}>
          <HiOutlineHome size={20} />
          Home
        </NavLink>

        <NavLink to="/products" className={navItemClass}>
          <HiOutlineSquares2X2 size={20} />
          Shop
        </NavLink>

        <NavLink to="/wishlist" className={navItemClass}>
          <HiOutlineHeart size={20} />
          Wishlist
        </NavLink>

        <NavLink to="/cart" className={navItemClass}>
          <span className="relative">
            <HiOutlineShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-semibold text-cream">
                {itemCount}
              </span>
            )}
          </span>
          Cart
        </NavLink>

        <NavLink to={user ? '/account' : '/login'} className={navItemClass}>
          <HiOutlineUser size={20} />
          Account
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
