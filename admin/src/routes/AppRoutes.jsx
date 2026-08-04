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
import CustomersPage from '../pages/CustomersPage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import MarketingPage from '../pages/MarketingPage.jsx';
import GlobalSettingsPage from '../pages/GlobalSettingsPage.jsx';
import CMSPage from '../pages/CMSPage.jsx';
import PromotionsPage from '../pages/PromotionsPage.jsx';
import PromotionFormPage from '../pages/PromotionFormPage.jsx';
import FestivalPage from '../pages/FestivalPage.jsx';
import FestivalFormPage from '../pages/FestivalFormPage.jsx';
import HomepageManagementPage from '../pages/HomepageManagementPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import CatalogMastersPage from "../pages/CatalogMastersPage";
import CatalogMasterFormPage from "../pages/CatalogMasterFormPage";
import BadgesPage from "../pages/BadgesPage";
import BadgeFormPage from "../pages/BadgeFormPage";

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
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="promotions/new" element={<PromotionFormPage />} />
          <Route path="promotions/:id" element={<PromotionFormPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="badges/create" element={<BadgeFormPage />} />
          <Route path="badges/:id/edit" element={<BadgeFormPage />} />
          <Route path="festivals" element={<FestivalPage />} />
          <Route path="festivals/new" element={<FestivalFormPage />} />
          <Route path="festivals/:id" element={<FestivalFormPage />} />
          <Route path="homepage" element={<HomepageManagementPage />} />
          <Route path="/catalog-masters" element={<CatalogMastersPage />} />
          <Route path="/catalog-masters/new" element={<CatalogMasterFormPage />} />
          <Route path="/catalog-masters/:id/edit" element={<CatalogMasterFormPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
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
