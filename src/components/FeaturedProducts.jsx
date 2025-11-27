import { useState, useEffect } from 'react';
import './styles/style.css';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/ProductServices';

export default function FeaturedProducts({ title }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [sortedProducts, setSortedProducts] = useState([]);
    const [sortOption, setSortOption] = useState('Sort by');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const cachedProducts = localStorage.getItem("allProducts");
                if (cachedProducts) {
                    const parsed = JSON.parse(cachedProducts);
                    const cachedBestSellers = parsed.filter(
                        (product) =>
                            product?.attributes?.badge?.toLowerCase() === "best seller" ||
                            product?.attributes?.badge?.toLowerCase() === "bestseller"
                    );
                    const featuredFromCache = cachedBestSellers.slice(0, 12);
                    setProducts(featuredFromCache);
                    setSortedProducts(featuredFromCache);
                }


                const data = await getProducts();
                if (!data || !Array.isArray(data)) return;
                localStorage.setItem("allProducts", JSON.stringify(data));
                const bestSellers = data.filter(
                    (product) =>
                        product?.attributes?.badge?.toLowerCase() === "best seller" ||
                        product?.attributes?.badge?.toLowerCase() === "bestseller"
                );
                const featured = bestSellers.slice(0, 16);
                setProducts(featured);
                setSortedProducts(featured);

            } catch (error) {
                console.error("Error fetching products from features products:", error);
            }
        };

        fetchProducts();
    }, []);



    useEffect(() => {
        let sorted = [...products];
        switch (sortOption) {
            case 'Best Selling':
                sorted.sort((a, b) => b.sales - a.sales);
                break;
            case 'Price: Low to High':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'Price: High to Low':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'Newest':
                sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            default:
                break;
        }
        setSortedProducts(sorted);
    }, [sortOption, products]);


    const navigateToProductDetail = (productId) => {
        navigate(`/products-details/${productId}`);
    };

    return (
        <div className="bj-collection">
            <div className="bj-collection-header" data-aos="fade-up">
                <h2>{title}</h2>
                <div className='bj-sort-container'>
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
                {sortedProducts?.map((product) => (
                    <div
                        className="bj-product"
                        key={product?._id || product?.id}
                        onClick={() => product?._id && navigateToProductDetail(product._id)}
                    >
                        <div className="featured-product-image">
                            {product?.attributes?.badge && (
                                <div className="featured-product-badge">
                                    {product.attributes.badge}
                                </div>
                            )}

                            <img
                                src={
                                    product?.productImages?.[0] ||
                                    product?.variations?.[0]?.productImages?.[0]
                                }
                                alt={product?.productName || "Product image"}
                                className="main-image"
                            />

                            <img
                                src={
                                    product?.productImages?.[1] ||
                                    product?.variations?.[0]?.productImages?.[1] ||
                                    product?.productImages?.[0]
                                }
                                alt={`${product?.productName || "Product"} - hover`}
                                className="hover-image"
                            />
                        </div>

                        <div className="featured-product-info">
                            <h3>{product?.productName || "Unnamed Product"}</h3>
                            <div className="featured-product-price">
                                $
                                {Number(
                                    product?.variations?.[0]?.productPrice?.discountedPrice || 0
                                ).toFixed(2)}

                                {product?.variations?.[0]?.productPrice?.originalPrice && (
                                    <span className="featured-product-original-price">
                                        $
                                        {Number(
                                            product?.variations?.[0]?.productPrice?.originalPrice || 0
                                        ).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
