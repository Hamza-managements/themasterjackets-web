import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles/CategoryPage.css";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import FeaturedProductsCarousel from "./FeaturedProductsCarousel";

const CategoryPage = () => {
  const categoryMap = {
    "men": "68ac23c0146f4993994f41b2",
    "women": "68ad7a27010f07c1100d3e56",
    "new-in": "68ad9ab6010f07c1100d3f1e",
    "halloween": "68da47a52dd010a7a0b6cf3f",
  };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const categoryId = categoryMap[slug];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
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
        if (!categoryId) return;
        const response = await api.get(`/api/category/fetchById?categoryId=${categoryId}`);
        setCategories([response.data.data]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchCategories();
    }
  }, [slug, categoryId]);




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
      {/* <section className="category-hero" data-aos="fade-in">
        <div className="category-hero-content">
          <h1>Explore Our Collections</h1>
          <p>Discover premium designs crafted for style, durability, and timeless character</p>
        </div>
        <div className="category-hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section> */}
      {categories?.map((cat, index) => (
        <div key={cat._id} className="category-section">
          <div className="parallax-banner" data-aos="zoom-out">
            <div className="parallax-content">
              <h1 className="main-category-title">
                {cat.mainCategoryName === "New In"
                  ? `${cat.mainCategoryName} Leather Jackets`
                  : `${cat.mainCategoryName}'s Leather Jackets`}
              </h1>

              <p className="main-category-subtitle mb-3">{cat.description ||"Discover premium designs crafted for style, durability, and timeless character"}</p>
            </div>
          </div>
          <hr class="border border-dark border-1 w-100 mx-auto" />

          {/* Subcategory Navigation */}
          {/* <div className="subcategory-nav" data-aos="fade-up">
            {cat.subCategories?.map((sub) => (
              <button
                key={sub._id}
                className={`subcategory-nav-item ${activeSubcategory === sub._id ? 'active' : ''}`}
                onClick={() =>
                  setActiveSubcategory(activeSubcategory === sub._id ? null : sub._id)
                }
              >
                {sub.categoryName}
              </button>
            ))}
          </div> */}
          <div className="subcategories-grid">
            {cat.subCategories?.map((sub, subIndex) => (
              <div
                key={sub._id}
                className="subcategory-card"
                data-aos="fade-up"
                data-aos-delay={subIndex * 75}
              >
                <div
                  className="subcategory-image"
                  style={{
                    backgroundImage: `url(/images/${cat.mainCategoryName.replace(/\s+/g, "-").toLowerCase()}/${sub.categoryName.replace(/\s+/g, "-").toLowerCase()}.jpg)`,
                  }}
                >
                  <div className="image-overlay">
                  </div>
                </div>

                <div className="subcategory-info">
                  <h2>{sub.categoryName}</h2>
                  <div className="subcategory-actions">
                    <Link to={`/products/${sub._id}`} className="category-primary-btn">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subcategory Content */}
          {/* <div className="subcategories-container">
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
                        backgroundImage: `url(/images/${cat.mainCategoryName.replace(/\s+/g, "-").toLowerCase()}/${sub.categoryName.replace(/\s+/g, "-").toLowerCase()}.jpg)`,
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
                      <Link to={`/products/${sub._id}`} className="category-primary-btn">
                        Shop Collection
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
          <FeaturedProductsCarousel title="Customer Favorites" />
        </div>
      ))}
    </div>
  );
};

export default CategoryPage;