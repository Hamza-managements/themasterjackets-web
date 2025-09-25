import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import { getProducts } from "../utils/ProductServices";

const FeaturedProductsCarousel = ({ title = "Featured Products"}) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const product = async () => {
      const data = await getProducts();
      const featured = data.slice(0, 8);
      setProducts(featured);
    }
    product();
  }, []);

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
        {products?.map((product) => (
          <SwiperSlide key={product._id || product.id}>
            <div className="product-card">
              <div className="product-image">
                {product.badge && (
                  <div className="product-badge">{product.badge}</div>
                )}
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <div className="product-page-price">
                  ${Number(product.price).toFixed(2)}
                  {product.originalPrice && (
                    <span className="product-page-original-price">
                      ${Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx>{`
        /* Featured Products */
.featured-products {
  margin: 60px 0;
  padding: 0 20px;
}

.category-section-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 30px;
  font-weight: 700;
  position: relative;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 250px;
  background: #f5f5f5;
  position: relative;
}

.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff0000be;
  color: white;
  padding: 5px 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

      `}</style>
    </div>
  );
};

export default FeaturedProductsCarousel;
