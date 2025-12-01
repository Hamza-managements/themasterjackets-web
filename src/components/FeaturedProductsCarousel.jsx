import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import { getProducts } from "../utils/ProductServices";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const FeaturedProductsCarousel = ({ title = "Featured Products" }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const product = async () => {
      const cachedProducts = localStorage.getItem("allProducts");

      if (cachedProducts) {
        const parsed = JSON.parse(cachedProducts);
        const featured = parsed.slice(0, 8);
        setProducts(featured);
      }

      const data = await getProducts();

      if (data && Array.isArray(data)) {
        const featured = data.slice(0, 8);
        setProducts(featured);

        // Update cache for next time
        localStorage.setItem("allProducts", JSON.stringify(data));
      }
    };

    product();
  }, []);

  const generateStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        size={14}
        className={index < Math.floor(rating) ? "text-orange-600 fill-current" : "text-gray-300"}
      />
    ));
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/products-details/${productId}`);
  };

  return (
    <div className="featured-products" data-aos="fade-up">
      <h2 className="category-section-title">{title}</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
      >
        {products?.map((product) => {
          // Safe max rating
          const rating = Math.max(
            ...(product?.variations?.map(v => v?.ratings?.count || 0) || [0])
          );

          // Safe image fallback
          const mainImage =
            product.productImages?.[0] ||
            product.variations?.[0]?.productImages?.[0] ||
            '';
          const hoverImage =
            product.productImages?.[1] ||
            product.variations?.[0]?.productImages?.[1] ||
            mainImage;

          // Safe price
          const discountedPrice = product.variations?.[0]?.productPrice?.discountedPrice || 0;
          const originalPrice = product.variations?.[0]?.productPrice?.originalPrice;

          return (
            <SwiperSlide key={product._id || product.id}>
              <div
                className="featured-product-card"
                onClick={() => navigateToProductDetail(product._id)}
              >
                <div className="featured-product-image">
                  {product.attributes?.badge && (
                    <div className="featured-product-badge">
                      {product.attributes.badge}
                    </div>
                  )}
                  <img src={mainImage} alt={product.productName} className="main-image" />
                  <img src={hoverImage} alt={`${product.productName} - hover`} className="hover-image" />
                </div>

                <div className="featured-product-info">
                  <h3>{product.productName}</h3>
                  <div className="featured-product-price">
                    ${Number(discountedPrice).toFixed(2)}
                    {originalPrice && (
                      <span className="featured-product-original-price">
                        ${Number(originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="product-rating">
                    <div className="stars">{generateStarRating(rating)}</div>
                    <span className="rating-count">({rating})</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <style>{`
        /* Featured Products */
.featured-products {
  margin: 20px 0;
  padding: 0 20px;
}

.category-section-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 30px;
  font-weight: 700;
  position: relative;
}

.featured-product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.featured-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.featured-product-image {
  position: relative;
  overflow: hidden;
  height: 50vh;
  background: var(--beige);
  cursor: pointer;
  border-radius: 8px;
}

/* Badge */
.featured-product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff0000be;
  color: white;
  padding: 4px 8px;
  font-size: 0.8rem;
  text-transform: uppercase;
  z-index: 2;
  border-radius: 4px;
}

/* Images */
.featured-product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.6s ease, transform 0.4s ease;
  display: block;
}

/* Base states */
.featured-product-image .main-image {
  opacity: 1;
}

.featured-product-image .hover-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

/* Hover behavior */
.featured-product-image:hover .main-image {
  opacity: 0;
  transform: scale(1.05);
}

.featured-product-image:hover .hover-image {
  opacity: 1;
  transform: scale(1.05);
}

/* Optional: card-wide hover scaling */
.featured-product-card:hover .featured-product-image img {
  transform: scale(1.05);
}

.featured-product-info {
  padding: 20px;
  margin-bottom: 10px;
}

.featured-product-info h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.featured-product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}
.featured-product-original-price {
  text-decoration: line-through;
  color: #ba0101ff;  
  font-weight: 400;
  margin-left: 10px;
  font-size: 0.9rem;
}

.product-rating {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.stars {
    display: flex;
    gap: 1px;
}

.rating-count {
    font-size: 14px;
    color: #6b7280;
}

.swiper-button-next,
.swiper-button-prev {
  color: #f60a0aff !important;   /* change arrow color */
}

.swiper-pagination-bullet {
  background: #727272ff !important;   
  opacity: 0.5;                      
}

/* Active dot color */
.swiper-pagination-bullet-active {
  background: #1a1a1aff !important;   /* active color */
  opacity: 1;                        /* optional */
}

      `}</style>
    </div>
  );
};

export default FeaturedProductsCarousel;
