import React, { useState, useEffect } from 'react';
import './styles/style.css';
import { Link } from 'react-router-dom';
import { getALLProducts } from '../utils/ProductServices';

export default function FeaturedProducts({title}) {
    const [products, setProducts] = useState([]);
    const [sortedProducts, setSortedProducts] = useState([]);
    const [sortOption, setSortOption] = useState('Sort by');

    useEffect(() => {
        const product = async() => {
            const data = await getALLProducts();
            const featured = data.slice(0, 8);
            setProducts(featured);
            setSortedProducts(featured);
        }
        product();
    }, []);

    useEffect(() => {
        let sorted = [...products];
        switch (sortOption) {
            case 'Best Selling':
                sorted.sort((a, b) => b.sales - a.sales); // assuming `sales` exists
                break;
            case 'Price: Low to High':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'Price: High to Low':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'Newest':
                sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); // assuming `dateAdded` exists
                break;
            default:
                break;
        }
        setSortedProducts(sorted);
    }, [sortOption, products]);

    return (
        <div className="bj-collection">
            <div className="bj-collection-header" data-aos="fade-up">
            <h2>{title}</h2>
            <div>
                <select className="bj-sort" onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                    <option>Sort by</option>
                    <option>Best Selling</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                </select>
            </div>
            </div>


            <div className="bj-products">
                {sortedProducts.map(product => (
                    <Link
                        key={product.id}
                        to={`/products-details/${product.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div className="bj-product">
                            <div className="bj-product-badge">Sale</div>
                            <div className="bj-product-image">
                                <img src={product.image || product.productImages[0]} alt={product.title|| product.productName} />
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

        </div>
    );
}
