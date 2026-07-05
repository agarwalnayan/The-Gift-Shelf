import { NavLink } from 'react-router-dom';
import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
} from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard', to: '/', icon: HiOutlineSquares2X2 },
  { label: 'Products', to: '/products', icon: HiOutlineShoppingBag },
  { label: 'Categories', to: '/categories', icon: HiOutlineTag },
  { label: 'Orders', to: '/orders', icon: HiOutlineClipboardDocumentList },
  { label: 'Users', to: '/users', icon: HiOutlineUsers },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink/10 bg-white md:block">
      <div className="flex h-20 items-center px-6">
        <p className="text-lg font-semibold text-ink">TGS Admin</p>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
    </aside>
  );
};

export default Sidebar;
