import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatsSection from '../components/StatsSection';
import "./styles/ProductDetails.css";
import Aos from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SizeChartOverlay from '../components/SizeChart';
import { getProductBySubCategoryId, getSingleProduct } from '../utils/ProductServices';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null); // ✅ fixed
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [isZoomActive, setIsZoomActive] = useState(false);

  const imageContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const zoomPreviewRef = useRef(null);
  const zoomLevel = 2;

  const handleProductFetch = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      const fetchedProduct = await getSingleProduct(productId);
      console.log("Fetched product details:", fetchedProduct);

      if (fetchedProduct) {
        setProduct(fetchedProduct);
        const res = await getProductBySubCategoryId(fetchedProduct.categoryId._id, fetchedProduct.subCategoryId)
        setRelatedProducts(res?.data);
        console.log("Related products data:", relatedProducts);
        setSelectedVariation(fetchedProduct.variations?.[0] || null);
        setActiveImage(
          fetchedProduct.variations?.[0]?.productImages?.[0] ||
          fetchedProduct.productImages?.[0] ||
          ''
        );
      } else {
        setError("Product not found");
        navigate('/');
      }
    } catch (err) {
      setError("Failed to fetch product details. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const fetchRelatedProducts = (categoryId) => {
    console.log("fetchID" + categoryId);
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleSizeSelect = (size) => setSelectedSize(size);

  const handleColorSelect = (variation) => {
    setSelectedColor(variation.attributes.color);
    setSelectedVariation(variation);
    setActiveImage(variation.productImages?.[0]);
  };

  const handleThumbnailClick = (src) => setActiveImage(src);

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
    if (!product || !selectedVariation || !selectedVariation.attributes.color) return;

    const cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];
    const productIndex = cartItems.findIndex(
      item => item.id === product._id && item.variation === selectedVariation.variationName
    );

    if (productIndex !== -1) {
      cartItems[productIndex].quantity += quantity;
    } else {
      cartItems.push({
        id: product._id,
        name: product.productName,
        variation: selectedVariation.variationName,
        color: selectedColor,
        size: selectedSize,
        quantity,
        image: selectedVariation.productImages?.[0],
        price: selectedVariation.productPrice.discountedPrice,
      });
    }

    localStorage.setItem('cartsItems', JSON.stringify(cartItems));
  };

  const directCheckout = () => {
    addToCart();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/checkout');
    }, 2000);
  };

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    if (productId) handleProductFetch(productId);
  }, [productId, handleProductFetch]);

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

  const currentImages = selectedVariation?.productImages?.length
    ? selectedVariation.productImages
    : product.productImages;

  return (
    <div className="product-main-container">
      <main className="product-main-container">
        <section className="product-section">
          <div className="product-container">
            <div className="thumbnail-container">
              {currentImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumbnail-${i}`}
                  className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(img)}
                />
              ))}
            </div>
            {/* ✅ Product Gallery */}
            <div className="product-gallery">
              <div
                className="product-image-container"
                ref={imageContainerRef}
                onMouseEnter={activateZoom}
                onMouseLeave={deactivateZoom}
                onMouseMove={handleZoomMove}
              >
                <img
                  src={activeImage}
                  alt={product.productName}
                  className="main-image"
                  ref={mainImageRef}
                />
              </div>

              <div
                className="zoom-preview"
                ref={zoomPreviewRef}
                style={{
                  backgroundImage: `url('${activeImage}')`,
                  backgroundSize: `${zoomLevel * 100}%`,
                  opacity: isZoomActive ? 1 : 0
                }}
              />
            </div>

            {/* ✅ Product Details */}
            <div className="product-details">
              <h1 className="product-title">{product.productName}</h1>

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

              {/* Price */}
              {selectedVariation && (
                <div className="price-container">
                  <span className="current-price">
                    {formatPrice(selectedVariation.productPrice.discountedPrice)}
                  </span>
                  {selectedVariation.productPrice.originalPrice >
                    selectedVariation.productPrice.discountedPrice && (
                      <>
                        <span className="original-price">
                          {formatPrice(selectedVariation.productPrice.originalPrice)}
                        </span>
                        <span className="discount">
                          {Math.round(
                            ((selectedVariation.productPrice.originalPrice -
                              selectedVariation.productPrice.discountedPrice) /
                              selectedVariation.productPrice.originalPrice) * 100
                          )}% OFF
                        </span>
                      </>
                    )}
                </div>
              )}

              {/* ✅ Color Variations */}
              {product.variations?.length > 0 && (
                <div className="color-variant-selector">
                  <span className="variant-title">Color:</span>
                  <div className="variant-options">
                    {product.variations.map((variation, i) => (
                      <img
                        key={i}
                        src={variation.productImages[i]}
                        onClick={() => handleColorSelect(variation)}
                        className={`color-circle ${selectedVariation?.variationName === variation.variationName
                          ? 'active'
                          : ''
                          }`}
                        style={{
                          backgroundColor: variation.attributes.color.toLowerCase(),
                          width: '70px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '10%',
                          border: '1px solid #ccc',
                          marginRight: '8px'
                        }}
                        title={variation.attributes.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ Sizes */}
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
              </div>

              {/* Quantity */}
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

              {/* Buttons */}
              <div className="action-buttons">
                <button className="detail-btn btn-addtocart" onClick={addToCart}>
                  <i className="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
              </div>
              <div className="action-buttons">
                <button className="detail-btn btn-checkout" onClick={directCheckout}>
                  <i className="fas fa-credit-card payment-icon"></i>
                  <span className="checkout-text">Proceed to check out</span>
                </button>
              </div>
              <div className="highlight-list">
                <span className="variant-title"> Specifications</span>
                {product?.specifications.map((spec, index) => (
                  <div key={index} className="highlight-item">
                    <i className="fas fa-check-circle highlight-icon"></i>
                    <span>{spec}</span>
                  </div>))}
              </div>
              <div className="accordion">
                <div className="accordion-item">
                  <input type="checkbox" id="accordion-1" className="accordion-toggle" />
                  <label htmlFor="accordion-1" className="accordion-title">Product Features</label>
                  <div className="accordion-content">
                    <p>{product.productDescription}</p>
                    <br />
                    <h3 className="fs-6 mb-2"><strong>What's Included</strong></h3>
                    {product?.attributes && (
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(product.attributes)
                          .filter(([key]) => !["weight", "season", "badge"].includes(key)) // 👈 filter out unwanted keys
                          .map(([key, value]) => (
                            <li key={key} className="text-secondary">
                              <strong className="capitalize">
                                {key.replace(/([A-Z])/g, " $1")}:
                              </strong>{" "}
                              {Array.isArray(value) ? value.join(", ") : value || "N/A"}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="accordion-item">
                  <input type="checkbox" id="accordion-2" className="accordion-toggle" />
                  <label htmlFor="accordion-2" className="accordion-title">Shipping & Returns</label>
                  <div className="accordion-content">
                    <h6>Shipping Information:</h6>
                    <p style={{ padding: "5px", color: "#666666ff" }}>
                      We offer worldwide shipping via DHL Express. Orders placed before 2pm EST
                      are processed the same business day. Delivery times vary by destination:
                    </p>
                    <ul style={{ padding: "5px", color: "#666666ff" }}>
                      <li>USA: 5-7 business days</li>
                      <li>Europe: 4-5 business days</li>
                      <li>Other regions: 5-10 business days</li>
                    </ul>
                    <h6>Returns Policy:</h6>
                    <p style={{ padding: "5px", color: "#666666ff" }}>
                      {`We offer a ${product.refundPolicy} for unworn jackets in original condition
                      with all packaging and documentation. Please contact our customer service
                      to initiate a return. Return shipping is the responsibility of the customer
                      unless the item is faulty.`}
                    </p>
                  </div>
                </div>

                <div className="accordion-item">
                  <input type="checkbox" id="accordion-3" className="accordion-toggle" />
                  <label htmlFor="accordion-3" className="accordion-title">Size & fit</label>
                  <div className="accordion-content">
                    <p>Our jackets are true to size. If you're between sizes or prefer a looser fit for
                      layering, we suggest sizing up.</p>
                    <p style={{ padding: "5px" }}><strong><SizeChartOverlay /></strong></p>
                    <div className="product-meta">
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span>{product.categoryId.mainCategoryName || "Watches, Limited Edition"}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Availability:</span>
                        <span style={{ color: 'green' }}>{`${selectedVariation.inventoryStatus} (Only ${selectedVariation.stockQuantity} left)` || "In Stock (Only 5 left)"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <StatsSection />

          {/* Related Products */}
          <div className="related-products">
            <h3 className="section-title">You May Also Like</h3>
            <div className="related-grid">
              {relatedProducts.slice(0, 8).map(product => (
                <div key={product._id} className="related-item">
                  <Link
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    to={`/products-details/${product._id}`}
                    target='blank'
                  >
                    <div className="related-product-image" >
                      <img
                        src={
                          product.productImages?.[0] ||
                          product.variations?.[0]?.productImages?.[0]
                        }
                        alt={product.productName}
                        className="related-main-image"
                      />
                      <img
                        src={
                          product.productImages?.[1] ||
                          product.variations?.[0]?.productImages?.[1] ||
                          product.productImages?.[0]
                        }
                        alt={`${product.productName} - hover`}
                        className="related-hover-image"
                      />
                    </div>
                    <div className="related-info">
                      <h3 className="related-title">{product.productName}</h3>
                      <div className='related-price-container'>
                        <p className="related-price">${product.variations[0].productPrice.discountedPrice.toFixed(2)}</p>
                        <span className="related-original-price">${product.variations[0].productPrice.originalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
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