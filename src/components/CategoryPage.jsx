import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CategoryPage.css";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const { categoryId } = useParams();

  useEffect(() => {
    AOS.init({ 
      duration: 1000, 
      once: true,
      easing: 'ease-out-cubic'
    });
    if (categoryId) {
      fetchCategories();
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const api = axios.create({
        baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
      });

      api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      
      const response = await api.get(`/api/category/fetchById/68762589a469c496106e01d4?categoryId=${categoryId}`);
      // console.log("Fetched categories:", response.data.data);
      setCategories([response.data.data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="category-page-loading">
        <div className="loading-skeleton-header"></div>
        {[1, 2, 3]?.map((item) => (
          <div key={item} className="category-section-loading">
            <Skeleton variant="rectangular" width="100%" height={300} />
            <div className="subcategories-loading">
              {[1, 2, 3, 4]?.map((sub) => (
                <Skeleton key={sub} variant="rectangular" width="100%" height={200} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Hero Section */}
      <section className="category-hero" data-aos="fade-in">
        <div className="category-hero-content">
          <h1>Explore Our Collections</h1>
          <p>Discover premium designs crafted for style, durability, and timeless character</p>
        </div>
        <div className="category-hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {categories?.map((cat, index) => (
        <div key={cat._id} className="category-section">
          {/* Main Category Banner with Parallax Effect */}
          <div 
            className="parallax-banner" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(/images/${cat.mainCategoryName.toLowerCase()}.jpg)`
            }}
            // .replace(/\s+/g, "-")
            // url('https://res.cloudinary.com/dekf5dyng/image/upload/v1749721392/men-leather-jackets_ewghdk.jpg')`
            // }}
            data-aos="zoom-out"
          >
            <div className="parallax-content">
              <h1 className="main-category-title">{cat.mainCategoryName}</h1>
              <p className="main-category-description">
                Explore our exclusive {cat.mainCategoryName}&apos;s collection. Premium designs
                crafted for style, durability, and timeless character.
              </p>
              <div className="category-stats">
                <div className="stat-item">
                  <span className="stat-number">{cat.subCategories?.length || 0}</span>
                  <span className="stat-label">Collections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="stat-item premium">
                  <span className="stat-number">Premium</span>
                  <span className="stat-label">Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subcategory Navigation */}
          <div className="subcategory-nav" data-aos="fade-up">
            {cat.subCategories?.map((sub) => (
              <button
                key={sub._id}
                className={`subcategory-nav-item ${activeSubcategory === sub._id ? 'active' : ''}`}
                onClick={() => setActiveSubcategory(sub._id)}
              >
                {sub.categoryName}
              </button>
            ))}
          </div>

          {/* Subcategory Content */}
          <div className="subcategories-container">
            {cat.subCategories?.map((sub, subIndex) => (
              <div
                key={sub._id}
                className={`subcategory-content ${activeSubcategory && activeSubcategory !== sub._id ? 'hidden' : ''}`}
                data-aos="fade-up"
                data-aos-delay={subIndex * 100}
              >
                <div className={`subcategory-card ${subIndex % 2 === 0 ? '' : 'reverse'}`}>
                  <div className="subcategory-image">
                    <div
                      className="image-container"
                      style={{
                        backgroundImage: `url(/images/${sub.categoryName.replace(/\s+/g, "-").toLowerCase()}.jpg)`,
                      }}
                    >
                      <div className="image-overlay">
                        <Link to={`/products/${sub._id}`} className="quick-view-btn">
                          Quick View
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="subcategory-info">
                    <h2>{sub.categoryName}</h2>
                    <p>
                      Discover the best of {sub.categoryName}. Limited edition pieces
                      designed for comfort and style. Each piece is crafted with attention to detail
                      and premium materials.
                    </p>
                    <ul className="feature-list">
                      <li>Premium Materials</li>
                      <li>Expert Craftsmanship</li>
                      <li>Exclusive Designs</li>
                    </ul>
                    <div className="subcategory-actions">
                      <Link to={`/products/${sub._id}`} className="primary-btn">
                        Shop Collection
                      </Link>
                      <button className="secondary-btn">
                        View Lookbook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Products Carousel */}
          <div className="featured-products" data-aos="fade-up">
            <h2 className="category-section-title">Featured Products</h2>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 }
              }}
            >
              {[1, 2, 3, 4, 5]?.map((item) => (
                <SwiperSlide key={item}>
                  <div className="product-card">
                    <div className="product-image">
                      <div className="product-badge">New</div>
                    </div>
                    <div className="product-info">
                      <h3>Product Name</h3>
                      <p className="product-price">$129.99</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryPage;