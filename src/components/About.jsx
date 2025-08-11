import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from '../components/Footer';
import CartSidebar from '../components/Cart';
import './About.css';
import { Link } from 'react-router-dom';
import Header from './Header';

export default function AboutPage() {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <div className="about-hero">
        <div className="about-container">
          <h1 className='about-h1'>Our Story</h1>
          <p className='about-p'>
            Founded in 2020, we've been crafting exceptional experiences with passion and dedication, rooted in our
            love for quality and tradition.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission">
        <div className="about-container">
          <div className="mission-content">
            <h2 className='about-h'>Our Mission</h2>
            <p className='about-p'>
              Our mission is to redefine modern luxury through timeless design, ethical craftsmanship, and
                    uncompromising quality. We are dedicated to creating pieces that not only elevate personal style but
                    also reflect a deeper purpose—supporting sustainable practices, empowering skilled artisans, and
                    honoring the heritage behind every material we use. We believe true luxury is built to last, made
                    responsibly, and felt in every detail.
            </p>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="about-container">
          <div className="mission-content-left" >
            <div style={{ textAlign: 'left' }}>
            <h2 className='about-h'> Crafting a Legacy of Luxury.</h2>
            <p className='about-p'>
              At the core of our brand is a relentless pursuit of excellence. We don’t just make products—we
                        shape timeless expressions of style and identity. By fusing the soul of traditional
                        craftsmanship with the precision of modern design, we create more than garments—we create
                        stories.
                        Each piece is thoughtfully made, with every stitch telling a tale of dedication, detail, and
                        distinction.
                        Feel the handmade luxury—in the richness of our textures, in the elegance of our forms, and in
                        the care behind every creation.
                        We’re not just building a brand. We’re creating a legacy—responsibly, sustainably, and
                        beautifully.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="values">
        <div className="about-container">
          <h2 className='about-h'>Our Core Values</h2>
          <p className='about-p'>The principles that guide everything we do</p>
          <div className="values-grid">
            {[
              { icon: "fa-medal", title: "Quality", desc: "We never compromise on quality, using only the finest materials and craftsmanship." },
              { icon: "fa-leaf", title: "Sustainability", desc: "Responsible sourcing and eco-friendly practices are at our core." },
              { icon: "fa-hands-helping", title: "Community", desc: "We support local artisans and give back to our communities." },
              { icon: "fa-lightbulb", title: "Innovation", desc: "We constantly evolve while respecting traditional techniques." }
            ].map((val, index) => (
              <div className="value-card" key={index}>
                <div className="value-icon">
                  <i className={`fas ${val.icon}`}></i>
                </div>
                <h3 className='about-h'>{val.title}</h3>
                <p className='about-p'>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="about-container">
          <h2 className='about-h'>Ready to Experience Our Craft?</h2>
          <p className='about-p'>Discover our collection and join our story</p>
          <Link to="/products" className="cta-btn">Explore Our Products</Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <div className="section-heading" data-aos="fade-up">
        <h2 className='about-h'>Why Choose Us</h2>
        <p className='about-p'>Discover what sets us apart - from our commitment to quality craftsmanship to our dedication to sustainable
            practices and community engagement.</p>
      </div>

      {/* Banners */}
      <section className="banner-section">
        <div className="banner-container">
          {[
            {
              icon: "fa-shipping-fast", title: "Fast Delivery & Exclusive Discounts", text: "Enjoy free express shipping...", link: "#", delay: 0 , class: "promo-banner banner-delivery"
            },
            {
              icon: "fa-hammer", title: "Excellent Craftsmanship", text: "Each piece is handcrafted...", link: "#", delay: 100 , class: "promo-banner banner-craftsmanship"
            },
            {
              icon: "fa-leaf", title: "Sustainability & Quality", text: "We source eco-friendly...", link: "#", delay: 200 , class: "promo-banner banner-sustainability"
            },
            {
              icon: "fa-lightbulb", title: "Community & Innovation", text: "We collaborate with...", link: "#", delay: 300 , class: "promo-banner banner-community"
            }
          ].map((item, index) => (
            <div className={item.class} data-aos="fade-up" data-aos-delay={item.delay} key={index}>
              <div className="banner-content">
                <div className="banner-icon"><i className={`fas ${item.icon}`}></i></div>
                <h3 className="banner-title">{item.title}</h3>
                <p className="banner-text">{item.text}</p>
                <a href={item.link} className="banner-btn">Learn More</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
