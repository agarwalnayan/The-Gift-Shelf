import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ProductFormPage from '../pages/ProductFormPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import MarketingPage from '../pages/MarketingPage.jsx';
import GlobalSettingsPage from '../pages/GlobalSettingsPage.jsx';
import CMSPage from '../pages/CMSPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserProfilePage />} />
          <Route path="settings" element={<GlobalSettingsPage />} />
          <Route path="cms" element={<CMSPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
