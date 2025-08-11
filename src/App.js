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
import AboutPage from './components/About';
import CheckoutPage from './pages/CheckoutPage';
import ReturnPolicy from './pages/Return-exchange';
import ContactForm from './pages/Contact';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import SignupForm from './pages/Api';
// import AccountSettings from './components/AccountsSettings';
import NotFound from './pages/Notfound';
import Dashboard from './components/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
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
          </Route>

          {/* Auth routes with auth layout */}
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/checkout" element={
            // <PrivateRoute>
              <CheckoutPage />
            // </PrivateRoute>
          }/>
          
          {/* <Route path="/account/settings" element={<PrivateRoute> <AccountSettings /> </PrivateRoute> } /> */}
          <Route path="/api-testing" element={<SignupForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


