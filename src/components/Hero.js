import React from 'react';
import { Link } from 'react-router-dom';
import 'aos/dist/aos.css';
import './style.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content" data-aos="fade-up">
        <h1>Nothing Lasts Like Leather</h1>
        <p className="lead">Timeless comfort, rugged elegance. Designed to last a lifetime.</p>
        <Link to="/products" className="btn btn-gold btn-lg mt-3 hero-btn">
          View Collection
        </Link>
      </div>
    </section>
  );
}
