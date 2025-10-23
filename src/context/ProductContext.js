import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../utils/ProductServices";

const ProductContext = createContext();
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // 🔍 Global search states
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ✅ Fetch all products (with caching)
  const fetchAllProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const cachedProducts = localStorage.getItem("allProducts");
      const cachedTime = localStorage.getItem("productsFetchedAt");
      const now = Date.now();

      // 🧠 Use cache if valid and not forcing refresh
      if (
        cachedProducts &&
        cachedTime &&
        !forceRefresh &&
        now - parseInt(cachedTime) < REFRESH_INTERVAL
      ) {
        setProducts(JSON.parse(cachedProducts));
        setLastFetched(parseInt(cachedTime));
        setLoading(false);
        return;
      }

      const data = await getProducts();

      if (data && Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem("allProducts", JSON.stringify(data));
        localStorage.setItem("productsFetchedAt", now.toString());
        setLastFetched(now);
      } else {
        console.warn("⚠️ API returned invalid product data.");
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);

      const fallback = localStorage.getItem("allProducts");
      if (fallback) {
        setProducts(JSON.parse(fallback));
        console.warn("⚠️ Using cached products due to API error.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto refresh every 6 hours
  useEffect(() => {
    fetchAllProducts();
    const interval = setInterval(() => fetchAllProducts(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Global Search Logic
  const handleGlobalSearch = (input) => {
    setQuery(input);

    if (!input.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerInput = input.toLowerCase();

    const filtered = products.filter((product) => {
      const nameMatch = product.productName?.toLowerCase().includes(lowerInput);
      const descMatch = product.productDescription?.toLowerCase().includes(lowerInput);

      const tagMatch = Array.isArray(product.tags)
        ? product.tags.some((tag) => tag.toLowerCase().includes(lowerInput))
        : false;

      return nameMatch || descMatch || tagMatch;
    });

    setSearchResults(filtered);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        lastFetched,
        refreshProducts: () => fetchAllProducts(true),

        query,
        searchResults,
        handleGlobalSearch,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
