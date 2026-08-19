import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import WelcomePopup from './WelcomePopup.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const FIRST_NAME_KEY = 'tgs_first_name';

/**
 * First-visit experience:
 * - Logged-in customers are greeted by account name.
 * - Returning guests use a locally saved name when available.
 * - Browsing is never blocked for name collection — premium brands
 *   let customers explore before asking for personal details.
 */
const MainLayout = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user?.name) {
      setFirstName(user.name.trim().split(' ')[0]);
      setIsReady(true);
      return;
    }

    const savedName = localStorage.getItem(FIRST_NAME_KEY);
    setFirstName(savedName || '');
    setIsReady(true);
  }, [user, isAuthLoading]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />

      {isReady && <WelcomePopup firstName={firstName} />}
    </div>
  );
};

export default MainLayout;