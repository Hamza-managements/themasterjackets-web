import React, { useRef, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './styles/BlogSlider.css';

const blogItems = [
  {
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    title: 'Perfect for Our Team',
    text: 'These products have transformed our workflow and improved our productivity significantly.'
  },
  {
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    title: 'Exceeded Expectations',
    text: "The quality and durability are unmatched. We've been using them daily for months."
  },
  {
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    title: 'Game Changer',
    text: 'These products have helped us streamline our processes and save countless hours.'
  },
  {
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    title: 'Highly Recommend',
    text: 'The customer service is exceptional and the products are built to last.'
  },
  {
    img: 'https://images.unsplash.com/photo-1543269664-7eef42226a21?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    title: 'Beautiful Design',
    text: 'Not only functional but also aesthetically pleasing. Our clients love them!'
  },
  {
    img: 'https://res.cloudinary.com/dekf5dyng/image/upload/v1752220390/3091aa5cf2093da30d0568956f8f3671_ahnryy.jpg',
    title: 'Beautiful Design',
    text: 'Not only functional but also aesthetically pleasing. Our clients love them!'
  },
  {
    img:'https://res.cloudinary.com/dekf5dyng/image/upload/v1752220390/151c6affc3f19cb879433216bfcf8f0b_qjd46w.jpg',
    title: 'Beautiful Design',
    text: 'Not only functional but also aesthetically pleasing. Our clients love them!'
  }
];

export default function BlogGallery() {
  const trackRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideTo = (index) => {
    const items = trackRef.current?.children;
    if (!items || !items[index]) return;
    const itemWidth = items[index].offsetWidth + 16; // including gap
    trackRef.current.style.transform = `translateX(-${index * itemWidth}px)`;
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < blogItems.length - 1) {
      slideTo(currentSlide + 1);
    } else {
      slideTo(0);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      slideTo(currentSlide - 1);
    } else {
      slideTo(blogItems.length - 1);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      slideTo(currentSlide);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSlide]);

  return (
    <section className="blog-gallery-section" data-aos="fade-in" data-aos-duration="500">
      <div className="container">
        <div className="blog-gallery-title">
          <h2>Blog Section</h2>
          <p>How to Store Your Leather Jacket (So It Lasts Forever)</p>
        </div>
        <div className="blog-gallery-container">
          <div className="blog-gallery-slider">
            <div className="blog-gallery-track" ref={trackRef}>
              {blogItems.map((item, index) => (
                <div className="blog-gallery-item" key={index}>
                  <div className="blog-gallery-img">
                    <img src={item.img} alt="Customer Image" loading="lazy" />
                  </div>
                  <div className="blog-gallery-content">
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="blog-gallery-arrows">
              <button className="blog-gallery-arrow prev" onClick={handlePrev}><FaChevronLeft /></button>
              <button className="blog-gallery-arrow next" onClick={handleNext}><FaChevronRight /></button>
            </div>
          </div>

          <div className="blog-gallery-nav">
            <div className="blog-gallery-dots">
              {blogItems.map((_, index) => (
                <div
                  key={index}
                  className={`blog-gallery-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => slideTo(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
