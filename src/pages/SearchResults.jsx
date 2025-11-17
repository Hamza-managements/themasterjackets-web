import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const SearchResults = () => {
    const { query, searchResults } = useProducts();

    return (
        <div className="search-results container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">
                {query ? `Results for "${query}"` : "Search Products"}
            </h2>

            {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((product) => (
                        <Link
                            key={product._id}
                            to={`/products-details/${product._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="featured-product-card">
                                <div className="featured-product-image">
                                    {product.attributes.badge && (
                                        <div className="featured-product-badge">{product.attributes.badge}</div>
                                    )}
                                    <img
                                        src={
                                            product.productImages?.[0] ||
                                            product.variations?.[0]?.productImages?.[0]
                                        }
                                        alt={product.productName}
                                        className="main-image"
                                    />
                                    <img
                                        src={
                                            product.productImages?.[1] ||
                                            product.variations?.[0]?.productImages?.[1] ||
                                            product.productImages?.[0]
                                        }
                                        alt={`${product.productName} - hover`}
                                        className="hover-image"
                                    />
                                </div>
                                <div className="featured-product-info">
                                    <h3>{product.productName}</h3>
                                    <div className="featured-product-price">
                                        ${Number(product.variations[0].productPrice.discountedPrice).toFixed(2)}
                                        {product.variations[0].productPrice.originalPrice && (
                                            <span className="featured-product-original-price">
                                                ${Number(product.variations[0].productPrice.originalPrice).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 mt-6">
                    {query ? "No matching products found." : "Start typing to search."}
                </p>
            )}
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
  object-fit: cover;
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
  color: #999;  
  font-weight: 400;
  margin-left: 10px;
  font-size: 0.9rem;
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

export default SearchResults;
