import React from 'react';
import { Link } from 'react-router-dom';
import './styles/CategoriesSection.css';

const categories = [
  {
    title: 'Men',
    image: 'https://res.cloudinary.com/dekf5dyng/image/upload/v1749721392/download_gol87o.webp', // Put inside public/ or adjust import path
    count: 42,
    link: 'men'
  },
  {
    title: 'Women',
    image: 'https://res.cloudinary.com/dekf5dyng/image/upload/v1751527118/Leather-Jaxcket-Women_9ed03401-9be1-43e0-8dcd-eaaf09912f2a_1350x1350_f73rhr.webp',
    count: 156,
    link: 'women'
  }
];

export default function CategoriesSection() {
  return (
    <div className="categories-section" data-aos="fade-up" data-aos-duration="500">
      <div className="container-categories">
        {/* <div className="categories-section-header text-center mb-4">
          <h2>Shop by Categories</h2>
          <p>Discover our carefully curated collections for every taste and occasion</p>
        </div> */}
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div className="category-card" key={idx}>
              <div className="category-img position-relative">
                <img src={cat.image} alt={cat.title} />
                <span className="items-count">{cat.count} items</span>
              </div>
              <div className="category-content text-center">
                <h3>{cat.title}</h3>
                <Link to={`/category/${cat.link}`} className="shop-now-btn">Shop Now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
