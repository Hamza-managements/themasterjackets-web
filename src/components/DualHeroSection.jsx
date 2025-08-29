import React from 'react';
import { Link } from 'react-router-dom';
import 'aos/dist/aos.css';
import './styles/style.css'; // optional if using separate CSS

export default function DualHeroSection() {
  return (
    <section className="rj-dual-hero d-flex flex-wrap align-items-stretch" data-aos="fade-in" data-aos-duration="500">
      {/* Left Side */}
      <div className="rj-banner-2 col-12 col-md-6"></div>

      {/* Right Side */}
      <div
        className="rj-hero-right col-12 col-md-6 d-flex align-items-center justify-content-center p-4 p-md-5 text-white"
        data-aos="fade-up"
        data-aos-duration="500"
      >
        <div className="rj-hero-content text-center text-md-start">
          <h1 className="rj-hero-title">Five Years of Proven Craftsmanship</h1>
          <p className="rj-hero-text">
            With over five years in the market, we fuse Southern heritage with Western grit to create uncompromising
            leather goods and apparel. Designed for those who move with purpose, our pieces are made to endure—season
            after season, wherever the road leads.
          </p>
          <Link to="/about" className="rj-hero-btn rj-btn-light">About us</Link>
        </div>
      </div>
    </section>
  );
}
