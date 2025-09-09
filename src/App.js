import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ContactForm from './pages/Contact';
import ReturnPolicy from './pages/Return-exchange';
import ProductListingPage from './pages/ProductPage';
import ProductDetails from './pages/ProductDetails';
// import CheckoutPage from './pages/CheckoutPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import CategoryListPage from './pages/AdminPages/CategoriesAdminAPI';
import AddProductPage from './pages/AdminPages/AddProduct';
import APITestingPage from './pages/AdminPages/Api-auth-testing';
import NotFound from './pages/Notfound';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AboutPage from './components/About';
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
// import AccountSettings from './components/AccountsSettings';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/return-exchange" element={<ReturnPolicy />} />
            <Route path="/contact-us" element={<ContactForm />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>}/>
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/products/:id" element={<ProductListingPage />} />
            <Route path="/products-details/:id" element={<ProductDetails />} />
          </Route>

          {/* Auth routes with auth layout */}
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

        {/* Dynamic products route */}
          {/* <Route path="/products/:subcategoryId" element={<ProductListingPage />} /> */}

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/checkout" element={ <PrivateRoute> <CheckoutPage /> </PrivateRoute>}/>  */}

          {/* admin routes */}
          {/* <Route path="/account/settings" element={<PrivateRoute> <AccountSettings /> </PrivateRoute> } /> */}
          <Route path="/api-testing" element={<APITestingPage />} />
          <Route path="/api-categories" element={<CategoryListPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


