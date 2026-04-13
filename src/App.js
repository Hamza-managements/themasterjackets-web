import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ContactForm from './pages/Contact';
import ReturnPolicy from './pages/Return-exchange';
import AboutPage from './pages/About';
import CategoryPage from './pages/CategoryPage';
import AllProductPage from './pages/AllProductPage';
import SubCategoryProductPage from './pages/SubCategoryProducts';
import ProductDetails from './pages/ProductDetails';
import CheckoutPage from './pages/CheckoutPage';
import NotFound from './pages/Notfound';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageCategoryListPage from './pages/AdminPages/CategoriesAdminAPI';
import AllProductManagementPage from './pages/AdminPages/ManageAllProducts';
import ProductManagementPage from './pages/AdminPages/ManageProduct';
import AddProductPage from './pages/AdminPages/AddProduct';
import UpdateProductPage from './pages/AdminPages/UpdateSingleProduct';
import APITestingPage from './pages/AdminPages/Api-auth-testing';

import PrivateRoute from './components/auth/PrivateRoute';
import AuthLayout from './layouts/AuthLayout';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import ScrollToTop from './components/ScrollToTop';
import SearchResults from './pages/SearchResults';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { setFullFaviconSet } from './utils/setFullFaviconSet';
import OrderPage from './pages/UserOrderDetail';
import AdminOrderDetails from './pages/AdminPages/AdminOrderDetails';
import ProductSort from './pages/AdminPages/SortingPage';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
// import AccountSettings from './components/AccountsSettings';

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setFullFaviconSet("/favicons-admin");
    } else {
      setFullFaviconSet("/favicons-user");
    }
  }, [location.pathname]);
  return (
    <>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/return-exchange" element={<ReturnPolicy />} />
                <Route path="/contact-us" element={<ContactForm />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/products/:slug/all" element={<AllProductPage />} />
                <Route path="/products/:categorySlug/:slug" element={<SubCategoryProductPage />} />
                <Route path="/products-details/:productId" element={<ProductDetails />} />
              </Route>

              {/* User routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<SignUp />} />
              </Route>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard/orders/:orderId" element={<PrivateRoute><OrderPage /></PrivateRoute>} />

              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />

              {/* admin routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="add-product" element={<AddProductPage />} />
                <Route path="categories" element={<ManageCategoryListPage />} />
                <Route path="manage-all-products" element={<AllProductManagementPage />} />
                <Route path="edit-product/:productId" element={<UpdateProductPage />} />
                <Route path="manage-single-product/:productId" element={<ProductManagementPage />} />
                <Route path="api-testing" element={<APITestingPage />} />
                <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                <Route path="product-sorting" element={<ProductSort />} />
                {/* <Route path="/account/settings" element={<PrivateRoute> <AccountSettings /> </PrivateRoute> } /> */}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;