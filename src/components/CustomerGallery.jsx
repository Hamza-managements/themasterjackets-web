import React, { useEffect, useRef, useState } from 'react';
import './CustomerGallery.css'; // Your CSS styles

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
  const itemRef = useRef(null);

  const visibleItems = 1;

  const moveToSlide = (index) => {
    const maxIndex = Math.ceil(galleryItems.length / visibleItems) - 1;
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
  };

  useEffect(() => {
    const itemWidth = itemRef.current?.offsetWidth || 0;
    const offset = -currentIndex * (itemWidth + 20) * visibleItems;
    trackRef.current.style.transform = `translateX(${offset}px)`;
  }, [currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      const itemWidth = itemRef.current?.offsetWidth || 0;
      const offset = -currentIndex * (itemWidth + 20) * visibleItems;
      trackRef.current.style.transform = `translateX(${offset}px)`;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  return (
    <section className="customer-gallery-section">
      <div className="customer-gallery-title">
        <h2>Customer Gallery</h2>
        <p>See how our customers are using our products in their daily lives</p>
      </div>

      <div className="customer-gallery-container">
        <div
          className="customer-gallery-nav-arrow left"
          onClick={() => moveToSlide(currentIndex - 1)}
        >
          <i className="fas fa-chevron-left"></i>
        </div>

        <div className="customer-gallery-track" ref={trackRef}>
          {galleryItems.map((item, index) => (
            <div
              className="customer-gallery-item"
              key={index}
              ref={index === 0 ? itemRef : null}
            >
              <img src={item.img} alt={`Customer wearing ${item.tag}`} />
              <div className="customer-gallery-product-tag">{item.tag}</div>
            </div>
          ))}
        </div>

        <div
          className="customer-gallery-nav-arrow right"
          onClick={() => moveToSlide(currentIndex + 1)}
        >
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>

      <div className="customer-gallery-nav-dots">
        {Array.from({ length: Math.ceil(galleryItems.length / visibleItems) }).map((_, idx) => (
          <div
            key={idx}
            className={`customer-gallery-nav-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => moveToSlide(idx)}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default CustomerGallery;
