import { useEffect } from 'react';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FeaturedProducts from '../components/FeaturedProducts';
import StatsSection from '../components/StatsSection';
import DualHeroSection from '../components/DualHeroSection';
import CustomerGallery from '../components/CustomerGallery';
import BlogSlider from '../components/BlogSlider';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';

export default function Home() {
  useEffect(() => {
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
        <FeaturedProducts title="Best Sellers" />
        <StatsSection />
        <FeaturedProductsCarousel title="New Arrivals" />
        <DualHeroSection />
        <CustomerGallery />
        <BlogSlider />
      </main>
    </>
  );
}
