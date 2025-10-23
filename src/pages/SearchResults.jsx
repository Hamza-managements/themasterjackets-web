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
                            key={product.id}
                            to={`/products-details/${product._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="bj-product">
                                <div className="bj-product-badge">Sale</div>
                                <div className="bj-product-image">
                                    <img src={product.image || product.productImages[0]} alt={product.title || product.productName} />
                                </div>
                                <h4 className="bj-product-title">
                                    <span className="bj-product-title">{product.title || product.productName}</span>
                                </h4>
                                <div className="bj-product-price">
                                    <span className="sale">${product.price || product.variations[0].productPrice.originalPrice}</span>
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
        </div>
    );
};

export default SearchResults;
