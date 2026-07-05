import { Link, NavLink } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineHeart } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const navLinks = [
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/about' },
];

const Navbar = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/95 backdrop-blur">
      <div className="container-tgs flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-charcoal">
          The Gift Shelf
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-charcoal/70 hover:text-charcoal'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/wishlist" className="text-charcoal/70 transition-colors hover:text-primary-600" aria-label="Wishlist">
            <HiOutlineHeart size={22} />
          </Link>

          <Link to="/cart" className="relative text-charcoal/70 transition-colors hover:text-primary-600" aria-label="Cart">
            <HiOutlineShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-cream">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            to={user ? '/account' : '/login'}
            className="text-charcoal/70 transition-colors hover:text-primary-600"
            aria-label="Account"
          >
            <HiOutlineUser size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
