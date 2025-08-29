import React, { useEffect, useRef, useState } from 'react';
import './styles/CustomerGallery.css';

const galleryItems = [
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/118_mens-brown-leather-jacket.webp',
    tag: 'Biker Jacket',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/113_black-motorcycle-leather-jacket.webp',
    tag: 'Moto Jacket',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/105_womens-pink-leather-jacket.webp',
    tag: 'Biker Jacket',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/97_PaulHughes.webp',
    tag: 'Biker Jacket',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/86_Anna%20Kusi.webp',
    tag: 'Bomber',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/83_Mike.webp',
    tag: 'Racer',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/122_133267_IMG_3020.jpeg',
    tag: 'Biker Jacket',
  },
  {
    img: 'https://www.angeljackets.com/images/customer_gallery/dynamic/120_133162_IMG_8297.jpeg',
    tag: 'Classic',
  },
];


const CustomerGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // Number of items to show at once
  const visibleItems = 2;

  // Set up auto-scroll
  useEffect(() => {
    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.ceil(galleryItems.length / visibleItems));
      }, 4000); 
    };

    // Pause on hover
    const container = containerRef.current;
    const pauseAutoScroll = () => clearInterval(intervalRef.current);
    const resumeAutoScroll = () => {
      clearInterval(intervalRef.current);
      startAutoScroll();
    };

    startAutoScroll();
    container.addEventListener('mouseenter', pauseAutoScroll);
    container.addEventListener('mouseleave', resumeAutoScroll);

    return () => {
      clearInterval(intervalRef.current);
      container.removeEventListener('mouseenter', pauseAutoScroll);
      container.removeEventListener('mouseleave', resumeAutoScroll);
    };
  }, [galleryItems.length, visibleItems]);

  // Handle slide movement
  useEffect(() => {
    if (trackRef.current) {
      const itemWidth = trackRef.current.children[0]?.offsetWidth || 0;
      const gap = 20; // Should match your CSS gap
      const offset = -currentIndex * (itemWidth + gap) * visibleItems;
      
      trackRef.current.style.transition = 'transform 0.5s ease-in-out';
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [currentIndex, visibleItems]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (trackRef.current) {
        const itemWidth = trackRef.current.children[0]?.offsetWidth || 0;
        const gap = 20;
        const offset = -currentIndex * (itemWidth + gap) * visibleItems;
        
        // Disable transition during resize for better performance
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(${offset}px)`;
        
        // Re-enable transition after resize
        setTimeout(() => {
          if (trackRef.current) {
            trackRef.current.style.transition = 'transform 0.5s ease-in-out';
          }
        }, 50);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, visibleItems]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % Math.ceil(galleryItems.length / visibleItems));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.ceil(galleryItems.length / visibleItems) - 1 : prev - 1
    );
  };

  return (
    <section className="customer-gallery-section" ref={containerRef}>
      <div className="customer-gallery-title">
        <h2>Customer Gallery</h2>
        <p>See how our customers are using our products in their daily lives</p>
      </div>

      <div className="customer-gallery-container">
        <button
          className="customer-gallery-nav-arrow left"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="customer-gallery-track-container">
          <div className="customer-gallery-track" ref={trackRef}>
            {galleryItems.map((item, index) => (
              <div className="customer-gallery-item" key={index}>
                <img 
                  src={item.img} 
                  alt={`Customer wearing ${item.tag}`} 
                  loading="lazy"
                />
                <div className="customer-gallery-product-tag">{item.tag}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="customer-gallery-nav-arrow right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="customer-gallery-nav-dots">
        {Array.from({ length: Math.ceil(galleryItems.length / visibleItems) }).map((_, idx) => (
          <button
            key={idx}
            className={`customer-gallery-nav-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default CustomerGallery;