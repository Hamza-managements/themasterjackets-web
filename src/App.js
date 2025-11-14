import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ContactForm from './pages/Contact';
import ReturnPolicy from './pages/Return-exchange';
import AboutPage from './pages/About';
import ProductListingPage from './pages/ProductPage';
import SubCategoryProductPage from './pages/SubCategoryProducts';
import ProductDetails from './pages/ProductDetails';
// import CheckoutPage from './pages/CheckoutPage';
import NotFound from './pages/Notfound';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CategoryListPage from './pages/AdminPages/CategoriesAdminAPI';
import UpdateProductPage from './pages/AdminPages/UpdateSingleProduct';
import ProductManagementPage from './pages/AdminPages/ManageProduct';
import APITestingPage from './pages/AdminPages/Api-auth-testing';
import AmazonStyleProductPage from './pages/AdminPages/AddProduct';
import AllProductManagementPage from './pages/AdminPages/ManageAllProducts';

import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './components/auth/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import CategoryPage from './pages/CategoryPage';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import SearchResults from './pages/SearchResults';
import { useEffect } from 'react';
import { setFullFaviconSet } from './utils/setFullFaviconSet';
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
        <ProductProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/return-exchange" element={<ReturnPolicy />} />
              <Route path="/contact-us" element={<ContactForm />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/products/:slug/all" element={<ProductListingPage />} />
              <Route path="/products/:categorySlug/:slug" element={<SubCategoryProductPage />} />
              <Route path="/products-details/:productId" element={<ProductDetails />} />
            </Route>

            <Route path="auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* <Route path="/checkout" element={ <PrivateRoute> <CheckoutPage /> </PrivateRoute>}/>  */}

            {/* admin routes */}
            {/* <Route path="/account/settings" element={<PrivateRoute> <AccountSettings /> </PrivateRoute> } /> */}
            <Route path="/admin/api-testing" element={<APITestingPage />} />
            <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/categories" element={<CategoryListPage />} />
            <Route path="/admin/add-product" element={<AmazonStyleProductPage />} />
            <Route path="/admin/manage-all-products" element={<AllProductManagementPage />} />
            <Route path="/admin/edit-product/:productId" element={<UpdateProductPage />} />
            <Route path="/admin/manage-single-product/:productId" element={<ProductManagementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </>
  );
}

export default App;
