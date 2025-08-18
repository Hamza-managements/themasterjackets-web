import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CategoryPage.css";
import { Link } from "react-router-dom";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://themasterjacketsbackend-production.up.railway.app/api/category/fetch-all/68762589a469c496106e01d4"
      );
      // ensure array
      setCategories(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading categories...</div>;
  }

  return (
    <div className="category-page">
      {categories.map((cat, index) => (
        <div key={cat._id} className="category-section">
          {/* Main Category Banner */}
          <div className="position-relative text-white text-center py-5 men-banner">
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1 }}
            ></div>
            <div className="position-relative men-header-content" style={{ zIndex: 2 }}>
              <h1>{cat.mainCategoryName}</h1>
              <p>
                Explore our exclusive{" "}
                <strong>{cat.mainCategoryName}&apos;s collection</strong>. Premium designs
                crafted for style, durability, and timeless character.
              </p>
            </div>
          </div>

          <hr className="custom-hr" />

          {/* Render Subcategories */}
          {cat.subCategories?.map((sub, subIndex) => (
            <div
              key={sub._id}
              className="banner-container"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {/* Alternate layout left/right */}
              {subIndex % 2 === 0 ? (
                <>
                  <div
                    className="banner-image"
                    style={{
                      backgroundImage: `url('/assets/images/${sub.categoryName
                        .replace(/\s+/g, "-")
                        .toLowerCase()}.jpg')`,
                    }}
                  ></div>

                  <div className="banner-text" data-aos="fade-up" data-aos-delay="300">
                    <h2>{sub.categoryName}</h2>
                    <p>
                      Discover the best of {sub.categoryName}. Limited edition pieces
                      designed for comfort and style.
                    </p>
                    <Link href={`/products/${sub._id}`} className="banner-btn">
                      Shop Now
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="banner-text" data-aos="fade-up" data-aos-delay="300">
                    <h2>{sub.categoryName}</h2>
                    <p>
                      Explore our {sub.categoryName} collection for premium quality and
                      timeless fashion.
                    </p>
                    <Link href={`/products/${sub._id}`} className="banner-btn">
                      Explore
                    </Link>
                  </div>
                  <div
                    className="banner-image"
                    style={{
                      backgroundImage: `url('/assets/images/${sub.categoryName
                        .replace(/\s+/g, "-")
                        .toLowerCase()}.jpg')`,
                    }}
                  ></div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CategoryPage;
