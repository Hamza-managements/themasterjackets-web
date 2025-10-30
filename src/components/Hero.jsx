import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const slides = [
    {
      desktop: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761633364/1920X900_dpvh6j.jpg",
      tablet: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761633364/1000X12000_x0s51z.jpg",
      mobile: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761633364/800X1200_wge46p.jpg",
      link: "/category/men",
    },
    {
      desktop: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761814159/1920X900_WOMEN_oyo4zj.jpg",
      tablet: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761814159/1200X1000_WOMEN_etvlil.jpg",
      mobile: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761814159/750X1200_jhwgyg.jpg",
      link: "/category/women",
    },
    {
      desktop: "https://res.cloudinary.com/dekf5dyng/image/upload/v1749721392/web_page_frrcxu.jpg",
      tablet: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761633364/1000X12000_x0s51z.jpg",
      mobile: "https://res.cloudinary.com/dekf5dyng/image/upload/v1761633364/800X1200_wge46p.jpg",
      link: "/category/new-in",
    },
  ];

  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((prev) => (prev + 1) % slides.length);
      else setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full h-[90vh] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <picture
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 👇 order matters — smallest screen first */}
          <source media="(max-width: 640px)" srcSet={slide.mobile} />
          <source media="(max-width: 1024px)" srcSet={slide.tablet} />
          <img
            src={slide.desktop}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </picture>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="absolute inset-0 flex justify-center items-end pb-16 z-10" data-aos="fade-up">
        <Link
          to={slides[current].link}
          className="hero-banner-btnn px-6 py-3 rounded-full font-semibold uppercase"
        >
          View Collection
        </Link>
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-3xl z-10 opacity-70 hover:opacity-100"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-3xl z-10 opacity-70 hover:opacity-100"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/80"
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
