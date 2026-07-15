import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../common/AnnouncementBar.jsx';
import LaunchPopup from '../common/LaunchPopup.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import FirstVisitWelcomeScreen from './FirstVisitWelcomeScreen.jsx';
import WelcomePopup from './WelcomePopup.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const FIRST_NAME_KEY = 'tgs_first_name';

/**
 * Sequencing for the first-visit experience:
 * 1. Wait for auth to resolve (avoids a flash of the name screen for
 *    already-logged-in customers).
 * 2. If logged in, use the account name — never ask.
 * 3. Else, if a name was already saved locally, use it — never ask again.
 * 4. Otherwise show the fullscreen FirstVisitWelcomeScreen exactly once;
 *    only after it completes does the Launch Popup ever mount.
 */
const MainLayout = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [firstName, setFirstName] = useState(null);
  const [isNameReady, setIsNameReady] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user?.name) {
      setFirstName(user.name.trim().split(' ')[0]);
      setIsNameReady(true);
      return;
    }

    const savedName = localStorage.getItem(FIRST_NAME_KEY);
    if (savedName) {
      setFirstName(savedName);
      setIsNameReady(true);
    }
  }, [user, isAuthLoading]);

  const handleNameCaptured = (name) => {
    localStorage.setItem(FIRST_NAME_KEY, name);
    setFirstName(name);
    setIsNameReady(true);
  };

  const showFirstVisitScreen = !isAuthLoading && !isNameReady;

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

      {showFirstVisitScreen && <FirstVisitWelcomeScreen onComplete={handleNameCaptured} />}
      {isNameReady && <WelcomePopup firstName={firstName} />}
      <LaunchPopup />
    </div>
  );
};

export default MainLayout;