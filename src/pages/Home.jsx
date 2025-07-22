import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import productsData from '../data/products.json';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FeaturedProducts from '../components/FeaturedProducts';
import StatsSection from '../components/StatsSection';
import DualHeroSection from '../components/DualHeroSection';
import CustomerGallery from '../components/CustomerGallery';
import BlogSlider from '../components/BlogSlider';

export default function Home() {
  const cartItems = [
    {
      id: 1,
      name: 'Premium Headphones',
      size: 'Large',
      price: 199.99,
      quantity: 1,
      image: 'https://example.com/headphones.jpg'
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      size: 'Medium',
      price: 29.99,
      quantity: 2,
      image: 'https://example.com/mouse.jpg'
    }
  ];
  localStorage.setItem('cartsItems', JSON.stringify(cartItems));
  useEffect(() => {
    const alreadySet = localStorage.getItem('products');
    if (!alreadySet) {
      localStorage.setItem('products', JSON.stringify(productsData));
    }

    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <>
      <main>
        <Hero />
        <CategoriesSection />
        <FeaturedProducts />
        <StatsSection />
        <DualHeroSection />
        <CustomerGallery />
        <BlogSlider />
      </main>
    </>
  );
}
