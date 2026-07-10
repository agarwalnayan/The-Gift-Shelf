import { NavLink } from 'react-router-dom';
import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiXMark,
} from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard', to: '/', icon: HiOutlineSquares2X2 },
  { label: 'Products', to: '/products', icon: HiOutlineShoppingBag },
  { label: 'Categories', to: '/categories', icon: HiOutlineTag },
  { label: 'Orders', to: '/orders', icon: HiOutlineClipboardDocumentList },
  { label: 'Users', to: '/users', icon: HiOutlineUsers },
];

const NavItems = ({ onNavigate }) => (
  <nav className="space-y-1 px-3">
    {navItems.map(({ label, to, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive ? 'bg-primary-50 text-primary-700' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
          }`
        }
      >
        <Icon size={19} />
        {label}
      </NavLink>
    ))}
  </nav>
);

// Sidebar previously had no mobile presentation at all (`hidden md:block`),
// meaning admins on a phone/tablet had no way to navigate between pages.
// This adds a slide-in drawer for small screens while leaving the existing
// desktop layout untouched.
const Sidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-ink/10 bg-white md:block">
        <div className="flex h-20 items-center px-6">
          <p className="text-lg font-semibold text-ink">TGS Admin</p>
        </div>
        <NavItems />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={onMobileClose} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-white shadow-xl">
            <div className="flex h-20 items-center justify-between px-6">
              <p className="text-lg font-semibold text-ink">TGS Admin</p>
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5"
                aria-label="Close menu"
              >
                <HiXMark size={20} />
              </button>
            </div>
            <NavItems onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
