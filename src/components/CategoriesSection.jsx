import React from 'react';
import { Link } from 'react-router-dom';
import './styles/CategoriesSection.css';

const categories = [
  {
    title: 'Men',
    image: 'https://res.cloudinary.com/dekf5dyng/image/upload/v1762170209/800X800_hvyrfm.jpg',
    count: 42,
    link: 'men'
  },
  {
    title: 'Women',
    image: 'https://res.cloudinary.com/dekf5dyng/image/upload/v1762171039/2400x2400_emliwd.jpg',
    count: 156,
    link: 'women'
  }
];

export default function CategoriesSection() {
  return (
    <div className="categories-section" data-aos="fade-up" data-aos-duration="500">
      <div className="container-categories">
        <div className="categories-section-header text-center my-4">
          <h2>Shop by Categories</h2>
          <p>Discover our carefully curated collections for every taste and occasion</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <Link to={`/category/${cat.link}`} key={idx} >
              <div className="category-card">
                <div className="category-img position-relative">
                  <img src={cat.image} alt={cat.title} />
                </div>
                <div className="category-content text-center">
                  <h3>{cat.title}</h3>
                  <button className="shop-now-btn">Shop Now</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
