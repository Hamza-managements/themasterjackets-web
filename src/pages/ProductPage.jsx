import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ProductPage.css';
import { getProducts } from '../components/ProductServices';

const ProductListingPage = () => {
    const navigate = useNavigate();

    // State declarations
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filters, setFilters] = useState({
        category: ['all'],
        price: 'all',
        color: 'all',
        delivery: 'all'
    });
    const [sortOption, setSortOption] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();

        // Initialize cart count
        const cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];
        // You would update cart count in your header component here
    }, []);

    // Apply filters and sorting when dependencies change
    useEffect(() => {
        if (products.length) {
            applyFiltersAndSort();
        }
    }, [filters, sortOption, products]);

    const fetchProducts = async () => {
        try {
            // In a real app, you would fetch from your API
            // For demo purposes, we'll use mock data
            const products = await getProducts();
            if (!products || products.length === 0) {
                console.warn("No products found in localStorage or API.");
            }
            setProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...products];

        // Apply category filter
        if (!filters.category.includes('all')) {
            filtered = filtered.filter(product =>
                filters.category.some(category =>
                    (product.category || "").toLowerCase().includes(category.toLowerCase())
                )
            );
        }

        // Apply price filter
        if (filters.price !== 'all') {
            filtered = filtered.filter(product => {
                const price = Number(product.price);
                switch (filters.price) {
                    case '0-50': return price <= 50;
                    case '50-100': return price > 50 && price <= 100;
                    case '100-200': return price > 100 && price <= 200;
                    case '200+': return price > 200;
                    default: return true;
                }
            });
        }

        // Apply color filter
        if (filters.color !== 'all') {
            filtered = filtered.filter(product =>
                (product.color || "").toLowerCase().includes(filters.color.toLowerCase())
            );
        }

        // Apply delivery filter
        if (filters.delivery !== 'all') {
            filtered = filtered.filter(product =>
                (product.delivery || "").toLowerCase().includes(filters.delivery.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'newest': return b.id - a.id; // Using ID as a proxy for "newest"
                case 'rating': return b.rating - a.rating;
                default: return 0; // featured - no sorting
            }
        });

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (filterType, value, isCheckbox = false) => {
        if (isCheckbox) {
            setFilters(prev => {
                if (value === 'all') {
                    return { ...prev, [filterType]: ['all'] };
                } else {
                    const newValues = prev[filterType].includes(value)
                        ? prev[filterType].filter(v => v !== value)
                        : [...prev[filterType], value];

                    // Remove 'all' if other options are selected
                    const filteredValues = newValues.filter(v => v !== 'all');
                    return {
                        ...prev,
                        [filterType]: filteredValues.length > 0 ? filteredValues : ['all']
                    };
                }
            });
        } else {
            setFilters(prev => ({ ...prev, [filterType]: value }));
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const addToCart = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        const products = JSON.parse(localStorage.getItem('products')) || [];
        const cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];

        const productIndex = cartItems.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            cartItems[productIndex].quantity += 1;
        } else {
            const product = products.find(p => p.id === productId);
            if (product) {
                cartItems.push({
                    id: product.id,
                    quantity: 1,
                    title: product.title,
                    price: product.price,
                    image: product.image
                });
            }
        }

        localStorage.setItem('cartsItems', JSON.stringify(cartItems));

        // Update cart count in header
        const cartElement = document.getElementById('cart-count');
        if (cartElement) cartElement.innerText = cartItems.length;

        alert('Product added to cart');
    };

    const formatBadgeText = (badge) => {
        const badges = { sale: 'Sale', new: 'New', bestseller: 'Bestseller', prime: 'Prime' };
        return badges[badge] || badge;
    };

    const generateStarRating = (rating) => {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
        return fullStars + emptyStars;
    };

    const navigateToProductDetail = (productId) => {
        navigate(`/products-details/${productId}`);
    };

    return (
        <div className="plp-container">
            {/* Filters Toggle Button */}
            <button className="filter-toggle-btn" onClick={toggleFilters}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="plp-content">
                {/* Filters Sidebar */}
                <aside className={`product-filters ${showFilters ? 'active' : ''}`}>
                    <div className="product-filter-section">
                        <h3>Categories</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="checkbox"
                                    name="category"
                                    value="all"
                                    checked={filters.category.includes('all')}
                                    onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                />All Products
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="checkbox"
                                    name="category"
                                    value="black leather jacket"
                                    checked={filters.category.includes('black leather jacket')}
                                    onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                /> Black leather jacket
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="checkbox"
                                    name="category"
                                    value="clothing"
                                    checked={filters.category.includes('clothing')}
                                    onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                /> Clothing
                            </label>
                        </div>
                    </div>

                    <div className="product-filter-section">
                        <h3>Price Range</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="all"
                                    checked={filters.price === 'all'}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                /> All Prices
                            </label>
                        </div>

                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="50-100"
                                    checked={filters.price === '50-100'}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                />
                                $50 - $100
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="100-200"
                                    checked={filters.price === '100-200'}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                />
                                $100 - $200
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="100-200"
                                    checked={filters.price === '100-200'}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                /> $100 - $200
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    value="200+"
                                    checked={filters.price === '200+'}
                                    onChange={(e) => handleFilterChange('price', e.target.value)}
                                /> $200+
                            </label>
                        </div>
                    </div>

                    <div className="product-filter-section">
                        <h3>Colors</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="color"
                                    value="all"
                                    checked={filters.color === 'all'}
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                /> All colors
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="color"
                                    value="red"
                                    checked={filters.color === 'red'}
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                /> Red
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="color"
                                    value="black"
                                    checked={filters.color === 'black'}
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                /> Black
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="color"
                                    value="brown"
                                    checked={filters.color === 'brown'}
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                /> Brown
                            </label>
                        </div>
                    </div>

                    <div className="product-filter-section">
                        <h3>Also available in</h3>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="delivery"
                                    value="all"
                                    checked={filters.delivery === 'all'}
                                    onChange={(e) => handleFilterChange('delivery', e.target.value)}
                                /> All
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <label>
                                <input
                                    type="radio"
                                    name="delivery"
                                    value="prime"
                                    checked={filters.delivery === 'prime'}
                                    onChange={(e) => handleFilterChange('delivery', e.target.value)}
                                />
                                <span style={{ marginRight: '8px' }}>Amazon Prime</span>
                                <i className="fa-brands fa-amazon"></i>
                            </label>
                        </div>
                        <div className="product-filter-option">
                            <div className='flex items-center gap-2'>
                                <label>
                                    <input
                                        type="radio"
                                        name="delivery"
                                        value="express"
                                        checked={filters.delivery === 'express'}
                                        onChange={(e) => handleFilterChange('delivery', e.target.value)}
                                    /> Express
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <main className="product-grid">
                    <div className="toolbar">
                        <div className="results-count">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                        </div>
                        <div>
                            <h2>Men's Leather Jackets</h2>
                        </div>
                        <div className="sorting">
                            <select value={sortOption} onChange={handleSortChange}>
                                <option value="featured">Sort by: Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="rating">Best Rated</option>
                            </select>
                        </div>
                    </div>

                    <div className="products">
                        {filteredProducts.length === 0 ? (
                            <p className="no-products">No products match your filters.</p>
                        ) : (
                            filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <div
                                        className="product-image"
                                        onClick={() => navigateToProductDetail(product.id)}
                                    >
                                        <img src={product.image} alt={product.title} />
                                        {product.badge && (
                                            <span className={`product-badge badge-${product.badge}`}>
                                                {formatBadgeText(product.badge)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-page-details">
                                        <h3
                                            className="product-page-title"
                                            onClick={() => navigateToProductDetail(product.id)}
                                        >
                                            {product.title}
                                        </h3>
                                        <div className="product-page-price">
                                            ${Number(product.price).toFixed(2)}
                                            {product.originalPrice && (
                                                <span className="product-page-original-price">
                                                    ${Number(product.originalPrice).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="product-page-rating">
                                            {generateStarRating(product.rating)}
                                            (<span style={{ color: 'rgba(0,0,0,0.7)' }}>{product.reviews}</span>)
                                        </div>
                                        {/* <button
                                            className="add-to-cart"
                                            onClick={(e) => addToCart(product.id, e)}
                                        >
                                            Add to Cart
                                        </button> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

        </div>
    );
};

export default ProductListingPage;