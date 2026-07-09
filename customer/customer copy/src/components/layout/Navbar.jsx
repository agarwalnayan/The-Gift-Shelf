import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineHeart, HiBars3, HiXMark, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const navLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/about' },
];

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-charcoal/70 hover:text-charcoal'}`;

const Navbar = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const submitSearch = (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

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
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={() => setIsSearchOpen((open) => !open)}
            className="text-charcoal/70 transition-colors hover:text-primary-600"
            aria-label="Search"
          >
            <HiOutlineMagnifyingGlass size={22} />
          </button>

          <Link
            to="/wishlist"
            className="hidden text-charcoal/70 transition-colors hover:text-primary-600 md:block"
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
            className="hidden text-charcoal/70 transition-colors hover:text-primary-600 md:block"
            aria-label="Account"
          >
            <HiOutlineUser size={22} />
          </Link>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-charcoal/10 bg-cream">
          <form onSubmit={submitSearch} className="container-tgs flex items-center gap-2 py-3">
            <input
              autoFocus
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for gifts…"
              className="input-field"
            />
            <button type="submit" className="btn-primary shrink-0 px-4 py-2.5">
              Search
            </button>
          </form>
        </div>
      )}

      {isMenuOpen && (
        <nav className="border-t border-charcoal/10 bg-cream md:hidden">
          <div className="container-tgs flex flex-col py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
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
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
