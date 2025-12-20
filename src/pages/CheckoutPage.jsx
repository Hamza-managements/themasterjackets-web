// pages/CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
// import Checkout from '../components/OldCheckout';
import Checkout from '../components/Checkout';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('allProducts')) || [];
    const cartIds = JSON.parse(localStorage.getItem('cartsItems')) || [];

    const updatedCart = cartIds
      .map(item => {
        const product = storedProducts.find(p => p.id === item.id);
        return product ? { ...product, quantity: item.quantity || 1, size: item.size } : null;
      })
      .filter(Boolean);

    setCartItems(updatedCart);
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = (orderData) => {
    console.log('Order Placed:', orderData);
    // You can add API call here
  };

  return (
    <div>
      <Checkout 
        cartItems={cartItems} 
        totalPrice={totalPrice} 
        onPlaceOrder={handlePlaceOrder} 
      />
    </div>
  );
};

export default CheckoutPage;
