// import logo from './logo.svg';
// import './App.css';
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
// export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Home from './pages/Home';
import ReturnPolicy from './pages/Return-exchange';
import AboutPage from './components/About';
import ProductDetails from './pages/ProductDetails';
import CheckoutPage from './pages/CheckoutPage';
import ContactForm from './pages/Contact';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import APITestingPage from './pages/AdminPages/Api';
// import AccountSettings from './components/AccountsSettings';
import NotFound from './pages/Notfound';
import Dashboard from './components/Dashboard';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CategoryListPage from './pages/AdminPages/CategoriesAdminAPI';
import CategoryPage from './components/CategoryPage';
import ProductListingPage from './pages/ProductPage';
import AddProductPage from './pages/AdminPages/AddProduct';


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


