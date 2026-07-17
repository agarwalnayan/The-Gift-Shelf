import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import ScrollToTop from '../components/common/ScrollToTop.jsx';
import HomePage from '../pages/HomePage.jsx';
import ProductListingPage from '../pages/ProductListingPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import AccountPage from '../pages/AccountPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import WishlistPage from '../pages/WishlistPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SavedAddressesPage from '../pages/SavedAddressesPage.jsx';
import CouponsPage from '../pages/CouponsPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import HelpSupportPage from '../pages/HelpSupportPage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import StaticInfoPage from '../pages/StaticInfoPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { useEffect } from 'react';
import { trackPageView } from '../services/analytics';

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListingPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<StaticInfoPage slug="contact" />} />
          <Route path="privacy-policy" element={<StaticInfoPage slug="privacy-policy" />} />
          <Route path="shipping-policy" element={<StaticInfoPage slug="shipping-policy" />} />
          <Route path="returns" element={<StaticInfoPage slug="returns" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/profile" element={<ProfilePage />} />
            <Route path="account/addresses" element={<SavedAddressesPage />} />
            <Route path="account/coupons" element={<CouponsPage />} />
            <Route path="account/notifications" element={<NotificationsPage />} />
            <Route path="account/help" element={<HelpSupportPage />} />
            <Route path="account/orders" element={<OrdersPage />} />
            <Route path="account/orders/:id" element={<OrderDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;