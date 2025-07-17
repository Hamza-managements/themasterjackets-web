import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/Cart';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <CartSidebar />
    
      <main className="main-content">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
