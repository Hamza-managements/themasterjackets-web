import { useState, useEffect, useCallback } from 'react';
import Swal from "sweetalert2";
import { useNavigate, useParams } from 'react-router-dom';
import {
    Filter,
    X,
    Crown,
    Zap,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { getProductBySubCategoryId } from '../utils/ProductServices';
import { fetchCategoriesAll } from '../utils/CartUtils';
import { FaStar } from 'react-icons/fa';

const SubCategoryProductPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: ['all'],
        price: 'all',
        color: 'all',
        delivery: 'all'
    });
    const [sortOption, setSortOption] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        color: true,
        delivery: true
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const categoryRes = await fetchCategoriesAll();
            const categories = categoryRes || [];

            let matchedCategory = null;
            let matchedSubCategory = null;

            for (const category of categories) {
                const sub = category.subCategories.find(
                    (subCat) => subCat.slug === slug
                );
                if (sub) {
                    matchedCategory = category;
                    matchedSubCategory = sub;
                    break;
                }
            }

            if (!matchedSubCategory) {
                Swal.fire("Not Found", "No subcategory found for this URL.", "warning");
                setProducts([]);
                return;
            }

            const res = await getProductBySubCategoryId(matchedCategory._id, matchedSubCategory._id);
            setProducts(res.data || []);
        } catch (error) {
            Swal.fire("Not Found", "No subcategory found for this URL.", "warning");
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...products];

        if (!filters.category.includes('all')) {
            filtered = filtered.filter(product =>
                filters.category.some(category =>
                    (product.category || "").toLowerCase().includes(category.toLowerCase())
                )
            );
        }

        if (filters.price !== 'all') {
            filtered = filtered.filter(product => {
                const minPrice = Math.min(...product.variations.map(v =>
                    v.productPrice?.discountedPrice || v.productPrice?.originalPrice || 0
                ));

                switch (filters.price) {
                    case '0-50': return minPrice <= 50;
                    case '50-100': return minPrice > 50 && minPrice <= 100;
                    case '100-200': return minPrice > 100 && minPrice <= 200;
                    case '200+': return minPrice > 200;
                    default: return true;
                }
            });
        }

        if (filters.color !== 'all') {
            filtered = filtered.filter(product =>
                product.variations.some(variation =>
                    variation.attributes?.color?.toLowerCase().includes(filters.color.toLowerCase())
                )
            );
        }

        if (filters.delivery !== 'all') {
            filtered = filtered.filter(product =>
                product.variations.some(variation => {
                    if (filters.delivery === 'prime') {
                        return variation.shipping?.isFreeShipping;
                    } else if (filters.delivery === 'express') {
                        return variation.shipping?.estimatedDeliveryDays <= 3;
                    }
                    return true;
                })
            );
        }

        filtered.sort((a, b) => {
            const getMinPrice = (product) =>
                Math.min(...product.variations.map(v =>
                    v.productPrice?.discountedPrice || v.productPrice?.originalPrice || Infinity
                ));

            const getMaxRating = (product) =>
                Math.max(...product.variations.map(v => v.ratings?.count || 0));

            switch (sortOption) {
                case 'price-low':
                    return getMinPrice(a) - getMinPrice(b);
                case 'price-high':
                    return getMinPrice(b) - getMinPrice(a);
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'rating':
                    return getMaxRating(b) - getMaxRating(a);
                default:
                    return 0; // featured - no sorting
            }
        });

        setFilteredProducts(filtered);
    }, [products, filters, sortOption]);

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

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            category: ['all'],
            price: 'all',
            color: 'all',
            delivery: 'all'
        });
    };

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

    const getProductPriceRange = (product) => {
        const prices = product.variations.map(v =>
            v.productPrice?.discountedPrice || v.productPrice?.originalPrice || 0
        );
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `$${minPrice.toFixed(2)}`;
        }
        return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    };

    const getProductColors = (product) => {
        const colors = [...new Set(product.variations
            .map(v => v.attributes?.color)
            .filter(color => color && color.trim() !== '')
        )];
        return colors;
    };

    const hasActiveFilters = () => {
        return filters.category.some(cat => cat !== 'all') ||
            filters.price !== 'all' ||
            filters.color !== 'all' ||
            filters.delivery !== 'all';
    };

    useEffect(() => {
        fetchProducts();
    }, [slug]);

    useEffect(() => {
        if (products.length > 0) {
            applyFiltersAndSort();
        }
    }, [applyFiltersAndSort, products]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
        );
    }

    return (
        <div className="plp-container">
            {/* Mobile Filter Header */}
            <div className="mobile-filter-header">
                <button
                    className="filter-toggle-btn"
                    onClick={toggleFilters}
                >
                    <Filter size={18} />
                    Filters
                    {hasActiveFilters() && <span className="filter-indicator"></span>}
                </button>

                <div className="sorting-mobile">
                    <select value={sortOption} onChange={handleSortChange}>
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                        <option value="rating">Best Rated</option>
                    </select>
                </div>
            </div>

            <div className="plp-content">
                {/* Filters Sidebar */}
                <aside className={`product-filters ${showFilters ? 'active' : ''}`}>
                    <div className="filter-header">
                        <h2>Filters</h2>
                        <div className="filter-actions">
                            {hasActiveFilters() && (
                                <button className="clear-filters" onClick={clearAllFilters}>
                                    Clear All
                                </button>
                            )}
                            <button className="close-filters" onClick={toggleFilters}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Categories Filter */}
                    <div className="product-filter-section">
                        <div className="section-header" onClick={() => toggleSection('category')}>
                            <h3>Categories</h3>
                            {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {expandedSections.category && (
                            <div className="filter-options">
                                <div className="product-filter-option">
                                    <label className="filter-label">
                                        <input
                                            type="checkbox"
                                            name="category"
                                            value="all"
                                            checked={filters.category.includes('all')}
                                            onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                        />
                                        <span className="checkmark"></span>
                                        All Products
                                    </label>
                                </div>
                                <div className="product-filter-option">
                                    <label className="filter-label">
                                        <input
                                            type="checkbox"
                                            name="category"
                                            value="jacket"
                                            checked={filters.category.includes('jacket')}
                                            onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                        />
                                        <span className="checkmark"></span>
                                        Jackets
                                    </label>
                                </div>
                                <div className="product-filter-option">
                                    <label className="filter-label">
                                        <input
                                            type="checkbox"
                                            name="category"
                                            value="clothing"
                                            checked={filters.category.includes('clothing')}
                                            onChange={(e) => handleFilterChange('category', e.target.value, true)}
                                        />
                                        <span className="checkmark"></span>
                                        Clothing
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div className="product-filter-section">
                        <div className="section-header" onClick={() => toggleSection('price')}>
                            <h3>Price Range</h3>
                            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {expandedSections.price && (
                            <div className="filter-options">
                                {[
                                    { value: 'all', label: 'All Prices' },
                                    { value: '0-50', label: 'Under $50' },
                                    { value: '50-100', label: '$50 - $100' },
                                    { value: '100-200', label: '$100 - $200' },
                                    { value: '200+', label: '$200+' }
                                ].map(option => (
                                    <div key={option.value} className="product-filter-option">
                                        <label className="filter-label">
                                            <input
                                                type="radio"
                                                name="price"
                                                value={option.value}
                                                checked={filters.price === option.value}
                                                onChange={(e) => handleFilterChange('price', e.target.value)}
                                            />
                                            <span className="radiomark"></span>
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Colors Filter */}
                    <div className="product-filter-section">
                        <div className="section-header" onClick={() => toggleSection('color')}>
                            <h3>Colors</h3>
                            {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {expandedSections.color && (
                            <div className="filter-options">
                                {[
                                    { value: 'all', label: 'All Colors' },
                                    { value: 'red', label: 'Red' },
                                    { value: 'black', label: 'Black' },
                                    { value: 'blue', label: 'Blue' },
                                    { value: 'brown', label: 'Brown' },
                                    { value: 'white', label: 'White' }
                                ].map(option => (
                                    <div key={option.value} className="product-filter-option">
                                        <label className="filter-label">
                                            <input
                                                type="radio"
                                                name="color"
                                                value={option.value}
                                                checked={filters.color === option.value}
                                                onChange={(e) => handleFilterChange('color', e.target.value)}
                                            />
                                            <span className="radiomark"></span>
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delivery Filter */}
                    <div className="product-filter-section">
                        <div className="section-header" onClick={() => toggleSection('delivery')}>
                            <h3>Delivery Options</h3>
                            {expandedSections.delivery ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {expandedSections.delivery && (
                            <div className="filter-options">
                                {[
                                    { value: 'all', label: 'All Options', icon: null },
                                    { value: 'prime', label: 'Prime', icon: Crown },
                                    { value: 'express', label: 'Express', icon: Zap }
                                ].map(option => {
                                    const IconComponent = option.icon;
                                    return (
                                        <div key={option.value} className="product-filter-option">
                                            <label className="filter-label">
                                                <input
                                                    type="radio"
                                                    name="delivery"
                                                    value={option.value}
                                                    checked={filters.delivery === option.value}
                                                    onChange={(e) => handleFilterChange('delivery', e.target.value)}
                                                />
                                                <span className="radiomark"></span>
                                                {IconComponent && <IconComponent size={16} className="icon" />}
                                                {option.label}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Product Grid */}
                <main className="product-grid">
                    <div className="toolbar">
                        <div className="toolbar-left">
                            <h1 className="page-title">
                                {slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                            </h1>
                            <div className="results-count">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                {hasActiveFilters() && ' (Filtered)'}
                            </div>
                        </div>
                        <div className="toolbar-right">
                            <div className="sorting">
                                <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                                <select
                                    id="sort-select"
                                    value={sortOption}
                                    onChange={handleSortChange}
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="rating">Best Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.length === 0 ? (
                            <div className="no-products">
                                <div className="no-products-content">
                                    <h3>No products found</h3>
                                    <p>Try adjusting your filters or search terms</p>
                                    <button className="clear-all-btn" onClick={clearAllFilters}>
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const mainImage = product.productImages?.[0];
                                const rating = Math.max(...product.variations.map(v => v.ratings?.count || 0));
                                const isExpress = product.variations.some(v => v.shipping?.estimatedDeliveryDays <= 3);

                                return (
                                    <div key={product._id} className="product-card" >
                                        <div
                                            className="product-image"
                                            onClick={() => navigateToProductDetail(product._id)}
                                        >
                                            <img
                                                src={mainImage}
                                                alt={product.productName}
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/300/300';
                                                }}
                                            />
                                            <div className="product-badges">
                                                <span className={`badge badge-prime`}>
                                                    {/* <Truck size={12} /> */}
                                                    {product.variations.badge}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="product-details">
                                            <h3
                                                className="product-title"
                                                onClick={() => navigateToProductDetail(product._id)}
                                            >
                                                {product.productName}
                                            </h3>
                                            <div className="product-price">
                                                {getProductPriceRange(product)}
                                                <span className="product-page-original-price">
                                                    ${product.variations[0]?.productPrice?.originalPrice}
                                                </span>
                                            </div>
                                            <div className="product-rating">
                                                <div className="stars">
                                                    {generateStarRating(rating)}
                                                </div>
                                                <span className="rating-count">({rating})</span>
                                            </div>
                                            <div className="product-colors">
                                                {getProductColors(product).map(color => (
                                                    <span
                                                        key={color}
                                                        className="color-chip"
                                                        style={{
                                                            backgroundColor: color.toLowerCase(),
                                                            border: color.toLowerCase() === 'white' ? '1px solid #e5e5e5' : 'none'
                                                        }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
            <style>
                {`
            .plp-container {
    max-width: 1400px;
    margin: 0 auto;
}

/* Mobile Filter Header */
.mobile-filter-header {
    display: none;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5e5;
}

.filter-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--light-red);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    font-size: 14px;
}

.filter-indicator {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
}

.sorting-mobile {
    display: none;
}

/* Main Layout */
.plp-content {
    display: grid;
    grid-template-columns: 250px 1fr;
    align-items: start;
    gap: 20px;
}

/* Filters Sidebar */
.product-filters {
    background: white;
    border-radius: 12px;
    padding: 12px;
    height: fit-content;
    position: sticky;
    top: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border: 1px solid #e5e5e5;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
}

.filter-header h2 {
    font-size: 20px;
    font-weight: 300;
    color: #0d0d0dff;
    margin: 0;
}

.filter-actions {
    display: flex;
    align-items: center;
}

.clear-filters {
    color: #2563eb;
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
    padding: 8px 4px;
    border-radius: 4px;
}

.clear-filters:hover {
    background: #f8fafc;
}

.close-filters {
    display: none;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
}

.close-filters:hover {
    background: #f3f4f6;
}

/* Filter Sections */
.product-filter-section {
    border-bottom: 1px solid #f8fafc;
    padding-bottom: 20px;
}

.product-filter-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 8px 0;
    margin-bottom: 8px;
}

.section-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0;
}

.section-header svg {
    color: #9ca3af;
    transition: transform 0.2s ease;
}

.filter-options {
    display: flex;
    flex-direction: column;
}

.product-filter-option {
    margin: 0;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 14px;
    color: #4b5563;
    padding: 8px 4px;
    margin: 0;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.filter-label:hover {
    background: #f8fafc;
}

.filter-label input {
    display: none;
}

.checkmark, .radiomark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.radiomark {
    border-radius: 50%;
}

.filter-label input:checked + .checkmark {
    background: #2563eb;
    border-color: #2563eb;
}

.filter-label input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.filter-label input:checked + .radiomark {
    border-color: #2563eb;
}

.filter-label input:checked + .radiomark::after {
    content: '';
    width: 8px;
    height: 8px;
    background: #2563eb;
    border-radius: 50%;
}

.filter-label .icon {
    color: #f59e0b;
    flex-shrink: 0;
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    gap: 20px;
}

.toolbar-left {
    flex: 1;
    min-width: 0;
}

.page-title {
    font-size: 1.5rem;
    color: var(--black);
    margin: 0 0 8px 0;
    line-height: 1.2;
}

.results-count {
    color: #6b7280;
    font-size: 16px;
    font-weight: 500;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.sorting {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
}

.sort-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.sorting select {
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    min-width: 180px;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.sorting select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Active Filters */
.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
}

.active-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 20px;
    font-size: 14px;
    color: #1e40af;
    font-weight: 500;
}

.active-filter button {
    background: none;
    border: none;
    color: #1e40af;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.active-filter button:hover {
    background: #dbeafe;
}

/* Products Grid */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    align-items: start;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid #f0f0f0;
    height: fit-content;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #e5e5e5;
}

.product-image {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f8fafc;
    height: 42vh;
    background: var(--beige);
    cursor: pointer;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

.product-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-prime {
    background: #ff9900;
}

.badge-express {
    background: #00a8e1;
}

.badge-sale {
    background: #ef4444;
}

.badge-new {
    background: #10b981;
}

/* Product Details */
.product-details {
    padding: 20px;
}

.product-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.8em;
}

.product-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--black);
    margin-bottom: 8px;
}

.product-page-original-price {
    text-decoration: line-through;
    color: red;
    font-size: 14px;
    margin-left: 5px;
    opacity: 0.8;
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

.product-colors {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.color-chip {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* No Products State */
.no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
}

.no-products-content h3 {
    font-size: 24px;
    color: #1f2937;
    margin: 0 0 12px 0;
    font-weight: 600;
}

.no-products-content p {
    color: #6b7280;
    margin: 0 0 24px 0;
    font-size: 16px;
}

.clear-all-btn {
    padding: 12px 24px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: background-color 0.2s ease;
}

.clear-all-btn:hover {
    background: #1d4ed8;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .plp-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .product-filters {
        position: fixed;
        top: 0;
        left: -100%;
        width: 380px;
        max-width: 90vw;
        height: 100vh;
        z-index: 1000;
        transition: left 0.3s ease;
        overflow-y: auto;
        border-radius: 0;
        border-right: 1px solid #e5e5e5;
    }

    .product-filters.active {
        left: 0;
    }

    .close-filters {
        display: block;
    }

    .mobile-filter-header {
        display: flex;
    }

    .sorting-mobile {
        display: block;
    }

    .toolbar-right .sorting {
        display: none;
    }
}

@media (max-width: 768px) {
    .plp-container {
        padding: 16px;
    }

    .toolbar {
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
    }

    .page-title {
        font-size: 28px;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .product-filters {
        width: 100%;
        max-width: none;
    }
}

@media (max-width: 640px) {
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .product-details {
        padding: 16px;
    }

    .product-title {
        font-size: 14px;
    }

    .product-price {
        font-size: 18px;
    }

    .page-title {
        font-size: 24px;
    }

    .mobile-filter-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .filter-toggle-btn,
    .sorting-mobile select {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .products-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .plp-container {
        padding: 12px;
    }
}

/* Utility Classes */
.hidden {
    display: none !important;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.gap-2 {
    gap: 8px;
}

.gap-4 {
    gap: 16px;
}

.text-gray-500 {
    color: #6b7280;
}

.text-gray-600 {
    color: #4b5563;
}

.text-gray-700 {
    color: #374151;
}

.text-gray-900 {
    color: #1f2937;
}

.bg-blue-600 {
    background: #2563eb;
}

.text-white {
    color: white;
}

.rounded-lg {
    border-radius: 8px;
}

.shadow-sm {
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Focus states for accessibility */
button:focus-visible,
select:focus-visible,
.filter-label:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
}

/* Smooth scrolling for filter sidebar */
.product-filters {
    scroll-behavior: smooth;
}

/* Custom scrollbar for filters */
.product-filters::-webkit-scrollbar {
    width: 6px;
}

.product-filters::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.product-filters::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.product-filters::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}`}
            </style>
        </div>
    );
};

export default SubCategoryProductPage;