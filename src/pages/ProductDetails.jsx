import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Modal, Button } from 'react-bootstrap';
// import SocialProof from './components/SocialProof';
import StatsSection from '../components/StatsSection';
import "./styles/ProductDetails.css";
import Aos from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SizeChartOverlay from '../components/SizeChart';
import { getProductDetails, getRelatedProducts } from '../components/ProductServices';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = parseInt(id);

  // State declarations
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Small');
  const [selectedColor, setSelectedColor] = useState('rose-gold');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [show, setShow] = useState(false);


  // Refs for image gallery
  const imageContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const zoomPreviewRef = useRef(null);

  const zoomLevel = 2;

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    if (productId) {
      handleProductFetch(productId);
    } else {
      navigate('/');
    }
  }, [productId, navigate]);

  useEffect(() => {
    if (product && product.image) {
      setActiveImage(product.image);
    }
  }, [product]);


  const handleProductFetch = async (id) => {
    try {
      setIsLoading(true);

      const product = await getProductDetails(id); 

      if (product) {
        setProduct(product);

        if (product.category) {
          const related = await getRelatedProducts(product.category);
          setRelatedProducts(related.slice(0, 8));
        }
      } else {
        setError("Product not found");
        navigate('/');
      }
    } catch (err) {
      setError("Failed to fetch product details. Please try again later.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };


  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleThumbnailClick = (src) => {
    setActiveImage(src);
  };

  const handleZoomMove = (e) => {
    if (!isZoomActive || !imageContainerRef.current || !zoomPreviewRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    if (mainImageRef.current) {
      mainImageRef.current.style.transformOrigin = `${x}% ${y}%`;
      mainImageRef.current.style.transform = `scale(${zoomLevel})`;
    }

    zoomPreviewRef.current.style.backgroundPosition = `${x}% ${y}%`;
  };

  const activateZoom = () => {
    if (window.innerWidth <= 768) return;
    setIsZoomActive(true);
  };

  const deactivateZoom = () => {
    setIsZoomActive(false);
    if (mainImageRef.current) {
      mainImageRef.current.style.transform = 'scale(1)';
    }
  };

  const addToCart = () => {
    if (!product || !selectedSize) return;

    const cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];
    const productIndex = cartItems.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );

    if (productIndex !== -1) {
      cartItems[productIndex].quantity += quantity;
    } else {
      cartItems.push({
        id: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor
      });
    }

    localStorage.setItem('cartsItems', JSON.stringify(cartItems));
    // You would call your cart initialization function here
  };

  const directCheckout = () => {
    if (!product || !selectedSize) return;

    const cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];
    const productIndex = cartItems.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );

    if (productIndex !== -1) {
      cartItems[productIndex].quantity += quantity;
    } else {
      cartItems.push({
        id: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor
      });
    }

    localStorage.setItem('cartsItems', JSON.stringify(cartItems));
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate('/checkout');
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="loading-overlay" id="loading-overlay" style={{ display: 'flex' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-main-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-main-container">
        <div className="error-message">Product not found</div>
      </div>
    );
  }

  return (
    <div className="product-main-container">

      <main className="product-main-container">
        <section className="product-section">
          <div className="product-container">
            {/* Product Gallery */}
            <div className="product-gallery">
              <div
                className="image-container"
                ref={imageContainerRef}
                onMouseEnter={activateZoom}
                onMouseLeave={deactivateZoom}
                onMouseMove={handleZoomMove}
              >
                <img
                  src={activeImage || product.image}
                  alt={product.title}
                  className="main-image"
                  ref={mainImageRef}
                />
              </div>
              <div className="thumbnail-container">
                <img
                  src={product.image}
                  alt={product.title}
                  className={`thumbnail ${activeImage === product.image ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(product.image)}
                />
                <img
                  src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Watch thumbnail 2"
                  className={`thumbnail ${activeImage === "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")}
                />
                <img
                  src="https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Watch thumbnail 3"
                  className={`thumbnail ${activeImage === "https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick("https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")}
                />
                <img
                  src="https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Watch thumbnail 4"
                  className={`thumbnail ${activeImage === "https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick("https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")}
                />
              </div>
              <div
                className="zoom-preview"
                ref={zoomPreviewRef}
                style={{
                  backgroundImage: `url('${activeImage || product.image}')`,
                  backgroundSize: `${zoomLevel * 100}%`,
                  opacity: isZoomActive ? 1 : 0
                }}
              />
            </div>

            {/* Product Details */}
            <div className="product-details">
              <h1 className="product-title">{product.title}</h1>
              <p className="product-subtitle">Limited Edition Automatic Watch</p>

              <div className="rating">
                <div className="stars">
                  <div className="star-rating">
                    <svg className="star" viewBox="0 0 20 20" fill="#de7921">
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                    <svg className="star" viewBox="0 0 20 20" fill="#de7921">
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                    <svg className="star" viewBox="0 0 20 20" fill="#de7921">
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                    <svg className="star" viewBox="0 0 20 20" fill="#de7921">
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                    <svg className="star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="halfGrad">
                          <stop offset="50%" stopColor="#de7921" />
                          <stop offset="50%" stopColor="#acacac" />
                        </linearGradient>
                      </defs>
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.171L12 18.897l-7.334 3.866 1.4-8.171L.132 9.21l8.2-1.192L12 .587z"
                        fill="url(#halfGrad)" />
                    </svg>
                  </div>
                </div>
                <span className="review-count">142 reviews</span>
              </div>

              <div className="price-container">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    <span className="discount">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="color-variant-selector">
                <span className="variant-title">Case Color:</span>
                <div className="variant-options">
                  <label className={`color-variant-option ${selectedColor === 'rose-gold' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="case-color"
                      value="rose-gold"
                      checked={selectedColor === 'rose-gold'}
                      onChange={() => handleColorSelect('rose-gold')}
                    />
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: '#73401c', border: '1px solid #492912' }}
                    ></span>
                    <span className="sr-only">Cognac</span>
                  </label>

                  <label className={`color-variant-option ${selectedColor === 'black-pvd' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="case-color"
                      value="black-pvd"
                      checked={selectedColor === 'black-pvd'}
                      onChange={() => handleColorSelect('black-pvd')}
                    />
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: '#2a2a2a', border: '1px solid #000000' }}
                    ></span>
                    <span className="sr-only">Black PVD</span>
                  </label>
                </div>
              </div>

              <div className="variant-selector">
                <div className="variant-options pt-2">
                  {['XS', 'Small', 'Medium', 'Large', 'XL', '2XL', '3XL', '4XL'].map(size => (
                    <div
                      key={size}
                      className={`variant-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
                <br />

                <SizeChartOverlay />

                {/* <span className="variant-title">
                  <a href="#sizeChartModal" data-bs-toggle="modal" data-bs-target="#sizeChartModal"
                    style={{ textDecoration: 'none', color: 'inherit' }}>
                    <i className="fas fa-ruler-combined"></i> Size chart
                  </a>
                </span>

                <div className="modal fade" id="sizeChartModal" tabIndex="-1" aria-labelledby="sizeChartModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="sizeChartModalLabel">Size Chart</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <img
                          src="https://res.cloudinary.com/dekf5dyng/image/upload/f_webp/v1749721391/chart_vnri1x.png"
                          alt="Size Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>

              <div className="quantity-selector">
                <span className="quantity-title">Quantity:</span>
                <div className="quantity-control">
                  <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    className="quantity-input"
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-addtocart" onClick={addToCart}>
                  <i className="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
                <button className="btn btn-secondary">
                  <i className="far fa-heart"></i>
                  Wishlist
                </button>
              </div>

              <div className="action-buttons">
                <button className="btn btn-checkout" onClick={directCheckout}>
                  <i className="fas fa-credit-card payment-icon"></i>
                  <span className="checkout-text">Proceed to check out</span>
                </button>
              </div>

              <div className="highlight-list">
                <span className="variant-title"> Specifications</span>
                <div className="highlight-item">
                  <i className="fas fa-check-circle highlight-icon"></i>
                  <span>Swiss Automatic Movement (ETA 2894-2)</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-check-circle highlight-icon"></i>
                  <span>42mm Stainless Steel Case with Rose Gold Plating</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-check-circle highlight-icon"></i>
                  <span>Scratch-Resistant Sapphire Crystal</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-check-circle highlight-icon"></i>
                  <span>Water Resistant to 50m (5ATM)</span>
                </div>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span>{product.category || "Watches, Limited Edition"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Availability:</span>
                  <span style={{ color: 'green' }}>In Stock (Only 5 left)</span>
                </div>
              </div>

              <div className="accordion">
                <div className="accordion-item">
                  <input type="checkbox" id="accordion-1" className="accordion-toggle" />
                  <label htmlFor="accordion-1" className="accordion-title">Timeless Craftsmanship</label>
                  <div className="accordion-content">
                    <p>The Heritage Chronograph represents the pinnacle of Swiss watchmaking.
                      Each component is meticulously crafted by master watchmakers with decades
                      of experience. The elegant rose gold plating complements the sunburst
                      champagne dial, creating a sophisticated aesthetic that transitions
                      seamlessly from boardroom to evening wear.</p>
                    <h6 className="title">What's Included</h6>
                    <ul>
                      <li>Heritage Chronograph Watch</li>
                      <li>Genuine Leather Presentation Box</li>
                      <li>Certificate of Authenticity</li>
                      <li>2-Year International Warranty</li>
                      <li>Care Instructions</li>
                    </ul>
                  </div>
                </div>

                <div className="accordion-item">
                  <input type="checkbox" id="accordion-2" className="accordion-toggle" />
                  <label htmlFor="accordion-2" className="accordion-title">Shipping & Returns</label>
                  <div className="accordion-content">
                    <h6>Shipping Information</h6>
                    <p>
                      We offer worldwide shipping via DHL Express. Orders placed before 2pm EST
                      are processed the same business day. Delivery times vary by destination:
                    </p>
                    <ul>
                      <li>USA: 5-7 business days</li>
                      <li>Europe: 4-5 business days</li>
                      <li>Other regions: 5-10 business days</li>
                    </ul>
                    <h6>Returns Policy</h6>
                    <p>
                      We offer a 30-day return policy for unworn watches in original condition
                      with all packaging and documentation. Please contact our customer service
                      to initiate a return. Return shipping is the responsibility of the customer
                      unless the item is faulty.
                    </p>
                  </div>
                </div>

                <div className="accordion-item">
                  <input type="checkbox" id="accordion-3" className="accordion-toggle" />
                  <label htmlFor="accordion-3" className="accordion-title">Size & fit</label>
                  <div className="accordion-content">
                    <p>Our jackets are true to size. If you're between sizes or prefer a looser fit for
                      layering, we suggest sizing up.</p>
                    <p><strong><SizeChartOverlay /></strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <StatsSection />

          {/* <SocialProof /> */}

          {/* Related Products */}
          <div className="related-products">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="related-item">
                  <a
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    href={`/products-details/${product.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/products-details/${product.id}`);
                    }}
                  >
                    <img src={product.image} alt={product.title} className="related-image" />
                    <div className="related-info">
                      <h3 className="related-title">{product.title}</h3>
                      <p className="related-price">${product.price.toFixed(2)}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div
          className="loading-overlay"
          id="loading-overlay"
          style={{ display: isLoading ? 'flex' : 'none' }}
        >
          <div className="spinner"></div>
        </div>
      </main>
    </div >
  );
};

export default ProductDetails;