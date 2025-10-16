import React, { useEffect, useState } from "react";
import { getProducts } from "../utils/ProductServices";
import { FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductListingPage() {
    const {slug} = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtered, setFiltered] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOption, setSortOption] = useState("latest");
    const [filters, setFilters] = useState({
        price: "",
        category: "",
    });
    const categoryMap = {
        "men": "68ac23c0146f4993994f41b2",
        "women": "68ad7a27010f07c1100d3e56",
        "new-in": "68ad9ab6010f07c1100d3f1e",
        "halloween": "68da47a52dd010a7a0b6cf3f",
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProducts();
                setLoading(false);
                setProducts(res || []);
                setFiltered(res || []);
            } catch (error) {
                console.error("❌ Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let updated = [...products];

        if (filters.category || slug) {
            const selectedCategoryId = categoryMap[filters.category.toLowerCase()] || categoryMap[slug?.toLowerCase()];

            if (selectedCategoryId) {
                updated = updated.filter(
                    (p) => p.categoryId === selectedCategoryId
                );
            } else {
                console.warn("⚠️ No matching category ID found for:", filters.category);
            }
        }

        if (filters.price === "low") {
            updated.sort(
                (a, b) =>
                    a.variations[0]?.productPrice?.discountedPrice -
                    b.variations[0]?.productPrice?.discountedPrice
            );
        } else if (filters.price === "high") {
            updated.sort(
                (a, b) =>
                    b.variations[0]?.productPrice?.discountedPrice -
                    a.variations[0]?.productPrice?.discountedPrice
            );
        }

        setFiltered(updated);
    }, [filters, products, slug]);

    const handleSort = (e) => {
        setSortOption(e.target.value);
        const sorted = [...filtered];
        if (e.target.value === "low") {
            sorted.sort(
                (a, b) =>
                    a.variations[0]?.productPrice?.discountedPrice -
                    b.variations[0]?.productPrice?.discountedPrice
            );
        } else if (e.target.value === "high") {
            sorted.sort(
                (a, b) =>
                    b.variations[0]?.productPrice?.discountedPrice -
                    a.variations[0]?.productPrice?.discountedPrice
            );
        } else {
            sorted.reverse();
        }
        setFiltered(sorted);
    };

    const navigateToProductDetail = (productId) => {
        navigate(`/products-details/${productId}`);
    };

    // ✅ Toggle Filter Panel (Mobile)
    const toggleFilterPanel = () => setShowFilters(!showFilters);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
                Loading products...
            </div>
        );
    }

    return (
        <div className="plp-container">
            <button onClick={toggleFilterPanel} className="product-filter-toggle-btn">
                {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div className="plp-content">
                {/* === Main Products Section === */}
                <div className="product-grid">
                    <div className="toolbar">
                        <h2>Our Collection</h2>
                        <div className="sorting">
                            <select value={sortOption} onChange={handleSort}>
                                <option value="latest">Latest</option>
                                <option value="low">Price: Low to High</option>
                                <option value="high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="products">
                        {filtered.length > 0 ? (
                            filtered.map((product) => (
                                <div key={product._id} className="product-card" onClick={() => navigateToProductDetail(product._id)} >
                                    <div className="product-image" >
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
                                        <span className="product-page-badge badge-bestseller">
                                            Bestseller
                                        </span>
                                    </div>

                                    <div className="product-page-details" style={{ padding: "15px" }}>
                                        <h3 className="product-page-title">
                                            {product.productName}
                                        </h3>
                                        <div className="product-page-price">
                                            ${product.variations[0]?.productPrice?.discountedPrice}.00
                                            <span className="product-page-original-price">
                                                ${product.variations[0]?.productPrice?.originalPrice}
                                            </span>
                                        </div>
                                        <div className="product-page-rating"><div className="flex space-x-1 text-orange-700">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} />
                                            ))}
                                        </div></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-products">No products found</p>
                        )}
                    </div>
                </div>

                {/* === Filters Sidebar === */}
                <div
                    className={`product-filters ${showFilters ? "active" : ""}`}
                >
                    <h2 className="text-xl">Filters</h2>
                    <div className="product-filter-section">
                        <h3>Category</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="Men"
                                    onChange={(e) =>
                                        setFilters({ ...filters, category: e.target.value })
                                    }
                                />
                                Men
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="Women"
                                    onChange={(e) =>
                                        setFilters({ ...filters, category: e.target.value })
                                    }
                                />
                                Women
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="new-in"
                                    onChange={(e) =>
                                        setFilters({ ...filters, category: e.target.value })
                                    }
                                />
                                New-In
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="halloween"
                                    onChange={(e) =>
                                        setFilters({ ...filters, category: e.target.value })
                                    }
                                />
                                Halloween
                            </label>
                        </div>
                    </div>

                    <div className="product-filter-section">
                        <h3>Price</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="low"
                                    onChange={(e) =>
                                        setFilters({ ...filters, price: e.target.value })
                                    }
                                />
                                Low to High
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="high"
                                    onChange={(e) =>
                                        setFilters({ ...filters, price: e.target.value })
                                    }
                                />
                                High to Low
                            </label>
                        </div>
                    </div>

                    <button
                        className="clear-filters-btn"
                        onClick={() => setFilters({ price: "", category: "" })}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: var(--beige);
            line-height: 1.6;
        }

        /* === Layout === */
        .plp-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            overflow-x: hidden;
            max-width: 1400px;
        }

        .plp-content {
            display: flex;
        }

        /* === Filters Sidebar (Now on the Right) === */
        .product-filter-toggle-btn {
            display: none;
            background: var(--tan);
            color: var(--white);
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 15px;
            cursor: pointer;
            font-weight: 600;
            align-self: flex-start;
        }

        .product-filters {
            width: 200px;
            background: var(--white);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            order: 1;
        }

        .product-filter-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            margin-bottom: 20px;
            gap: 10px;
        }

        .product-filter-section h3 {
            font-size: 16px;
            margin-top: 14px;
            color: #374151;
            font-weight: 600;
        }

        .product-filter-option {
            display: flex;
            align-items: center;
            white-space: nowrap;
        }

        .product-filter-option label {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: #4b5563;
            transition: color 0.2s ease;
            font-size: 16px;
        }

        .product-filter-option label:hover {
            color: #00000093;
        }

        .product-filter-option input {
            accent-color: var(--blue);
            margin-right: 8px;
        }


        /* === Product Grid (Now on the Left) === */
        .product-grid {
            flex: 1;
            order: 2;
        }

        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: var(--white);
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .toolbar h2 {
            color: var(--black);
            margin: 0;
            font-size: 1.5rem;
        }

        .sorting select {
            padding: 8px 12px;
            border: 1px solid rgba(20, 11, 0, 0.43);
            border-radius: 4px;
            background: var(--white);
            color: var(--black);
            cursor: pointer;
            font-size: 14px;
        }

        .sorting select:focus {
            outline: none;
            border-color: var(--tan);
            box-shadow: 0 0 0 2px rgba(160, 109, 51, 0.2);
        }

        /* === Products Grid === */
        .products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        /* === Product Card === */
        .product-card {
            background: var(--white);
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid rgba(160, 109, 51, 0.1);
        }

        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(62, 44, 28, 0.1);
            border-color: rgba(160, 109, 51, 0.3);
        }

        .product-image {
            position: relative;
            overflow: hidden;
            height: 42vh;
            background: var(--beige);
            cursor: pointer;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.6s ease, transform 0.3s ease;
        }

        /* Default states */
        .product-image .main-image {
            opacity: 1;
        }

        .product-image .hover-image {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
        }

        /* Hover effect */
        .product-image:hover .main-image {
            opacity: 0;
            transform: scale(1.05);
        }

        .product-image:hover .hover-image {
            opacity: 1;
            transform: scale(1.05);
        }


        .product-card:hover .product-image img {
            transform: scale(1.05);
        }

        .product-page-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            color: var(--white);
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 2;
        }

        .badge-new {
            background: rgba(212, 175, 55, 0.76);
            color: var(--blue);
        }

        .badge-sale {
            background: rgba(249, 29, 5, 0.718);
            color: var(--black);
        }

        .badge-bestseller {
            background: rgba(46, 134, 193, 0.693);
            color: var(--black);
        }

        .badge-prime {
            background: #1399ffab;
            color: var(--black);
        }

        .product-page-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 12px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        }

        .product-page-price {
            font-weight: 700;
            color: var(--black);
            margin-bottom: 8px;
            font-size: 18px;
        }

        .product-page-original-price {
            text-decoration: line-through;
            color: red;
            font-size: 14px;
            margin-left: 5px;
            opacity: 0.8;
        }

        .product-page-rating {
            color: orangered;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .clear-filters-btn:hover {
            color: #0a0a0a;
        }

        .clear-filters-btn {
            color: var(--blue);
            font-weight: 800;
            border: none;
            padding: 6px 10px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 300;
            transition: background-color 0.3s ease;
        }

        .no-products {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: var(--red);
            font-size: 18px;
        }

        /* === Responsive Design === */
        @media (max-width: 768px) {
            .plp-content {
                flex-direction: column;
            }

            .product-filters {
                width: 100% !important;
                display: none;
                margin-bottom: 20px;
                order: 1;
            }

            .product-filters.active {
                display: block;
            }

            .product-grid {
                order: 2;
            }

            .products {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            }

            .product-image {
                height: 270px !important;
                ;
            }

            .product-filter-toggle-btn {
                display: inline-block;
            }

            .toolbar {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }

            .toolbar h2 {
                font-size: 1.3rem;
            }

        }

        @media (max-width: 480px) {
            .products {
                grid-template-columns: 1fr 1fr;
            }

            .product-page-details {
                padding: 10px;
            }

            .product-title {
                font-size: 13px;
                min-height: 36px;
            }
        }`}</style>
        </div >
    );
}
