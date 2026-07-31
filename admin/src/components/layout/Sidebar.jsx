import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineMegaphone,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiXMark,
  HiOutlineCube,
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArchiveBox,
  HiOutlinePhoto,
} from 'react-icons/hi2';

const navGroups = [
  {
    label: 'Dashboard',
    items: [{ label: 'Dashboard', to: '/', icon: HiOutlineSquares2X2 }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', to: '/products', icon: HiOutlineShoppingBag },
      { label: 'Categories', to: '/categories', icon: HiOutlineTag },
      { label: 'Catalog Masters', to: '/catalog-masters', icon: HiOutlineArchiveBox },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Homepage', to: '/homepage', icon: HiOutlineMegaphone },
      { label: 'Festivals', to: '/festivals', icon: HiOutlineGift },
      { label: 'Promotions', to: '/promotions', icon: HiOutlineStar },
    ],
  },
  {
    label: 'Orders',
    items: [
      { label: 'Orders', to: '/orders', icon: HiOutlineClipboardDocumentList },
      { label: 'Customers', to: '/customers', icon: HiOutlineUsers },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'CMS', to: '/cms', icon: HiOutlineDocumentText },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Site Settings', to: '/settings', icon: HiOutlineCog6Tooth },
      { label: 'Admin Users', to: '/users', icon: HiOutlineUsers },
    ],
  },
];

const NavItems = ({ onNavigate, isCollapsed = false }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (isCollapsed) {
    return (
      <nav className="space-y-1 px-2">
        {navGroups.flatMap((group) =>
          group.items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center justify-center rounded-lg px-3 py-2.5 text-ink/60 transition-colors hover:bg-ink/5 ${
                  isActive ? 'bg-primary-50 text-primary-700' : ''
                }`
              }
              title={label}
            >
              <Icon size={20} />
            </NavLink>
          ))
        )}
      </nav>
    );
  }

  return (
    <nav className="space-y-1 px-3">
      {navGroups.map((group) => (
        <div key={group.label}>
          <button
            onClick={() => toggleGroup(group.label)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <span>{group.label}</span>
            {expandedGroups[group.label] ? (
              <HiOutlineChevronDown size={16} />
            ) : (
              <HiOutlineChevronRight size={16} />
            )}
          </button>
          {expandedGroups[group.label] && (
            <div className="ml-4 mt-1 space-y-1">
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

// Sidebar previously had no mobile presentation at all (`hidden md:block`),
// meaning admins on a phone/tablet had no way to navigate between pages.
// This adds a slide-in drawer for small screens while leaving the existing
// desktop layout untouched. Now also supports collapsible desktop sidebar.
// On mobile, sidebar is always drawer-only (no 256px sidebar).
const Sidebar = ({ isMobileOpen = false, onMobileClose = () => {}, isCollapsed = false, onToggleCollapse = () => {} }) => {
  return (
    <>
      {/* Desktop Sidebar - hidden on mobile, visible on md+ */}
      <aside
        className={`hidden shrink-0 border-r border-ink/10 bg-white transition-all duration-300 md:block ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-20 items-center px-6">
          {!isCollapsed && <p className="text-lg font-semibold text-ink">TGS Admin</p>}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 hover:bg-ink/5"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <HiOutlineChevronRight size={18} /> : <HiOutlineChevronLeft size={18} />}
          </button>
        </div>
        <NavItems isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile Drawer - only on mobile, slides in when menu is opened */}
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
