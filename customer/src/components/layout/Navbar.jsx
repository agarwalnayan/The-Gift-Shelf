import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineHeart, HiBars3, HiXMark } from 'react-icons/hi2';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/95 backdrop-blur">
      <div className="container-tgs flex h-16 items-center justify-between sm:h-20">
        <button
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center text-charcoal/70 md:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <HiXMark size={22} /> : <HiBars3 size={22} />}
        </button>

        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
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

        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            to="/wishlist"
            className="hidden text-charcoal/70 transition-colors hover:text-primary-600 sm:block"
            aria-label="Wishlist"
          >
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

      {isMenuOpen && (
        <nav className="border-t border-charcoal/10 bg-cream md:hidden">
          <div className="container-tgs flex flex-col py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `border-b border-charcoal/5 py-3 text-sm font-medium last:border-0 ${
                    isActive ? 'text-primary-600' : 'text-charcoal/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-charcoal/5 py-3 text-sm font-medium text-charcoal/70 last:border-0"
            >
              Wishlist
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
