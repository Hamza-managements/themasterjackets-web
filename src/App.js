import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContactForm from './pages/Contact';
import ReturnPolicy from './pages/Return-exchange';
import ProductListingPage from './pages/ProductPage';
import SubCategoryProductPage from './pages/SubCategoryProducts';
import ProductDetails from './pages/ProductDetails';
// import CheckoutPage from './pages/CheckoutPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import CategoryListPage from './pages/AdminPages/CategoriesAdminAPI';
import UpdateProductPage from './pages/AdminPages/UpdateSingleProduct';
import ProductManagementPage from './pages/AdminPages/ManageProduct';
import APITestingPage from './pages/AdminPages/Api-auth-testing';
import AmazonStyleProductPage from './pages/AdminPages/AddProduct';
import AllProductManagementPage from './pages/AdminPages/ManageAllProducts';
import NotFound from './pages/Notfound';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProductProvider } from './context/ProductContext';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AboutPage from './components/About';
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ScrollToTop from './components/ScrollToTop';
// import AccountSettings from './components/AccountsSettings';

function App() {
  return (
    <Router>
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
              <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/category/:slug" element={<CategoryPage />} />
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
            <Route path="/api-testing" element={<APITestingPage />} />
            <Route path="/api-categories" element={<CategoryListPage />} />
            <Route path="/add-product" element={<AmazonStyleProductPage />} />
            <Route path="/manage-all-products" element={<AllProductManagementPage />} />
            <Route path="/edit-product/:productId" element={<UpdateProductPage />} />
            <Route path="/manage-single-product/:productId" element={<ProductManagementPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
