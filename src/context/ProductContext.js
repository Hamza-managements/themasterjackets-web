import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../utils/ProductServices";

const ProductContext = createContext();
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // ✅ Move the function outside useEffect
  const fetchAllProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const cachedProducts = localStorage.getItem("allProducts");
      const cachedTime = localStorage.getItem("productsFetchedAt");
      const now = Date.now();

      // ✅ Use cache if valid and not forced to refresh
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

      // ✅ Fetch new data from API
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

      // Fallback to cache if API fails
      const fallback = localStorage.getItem("allProducts");
      if (fallback) {
        setProducts(JSON.parse(fallback));
        console.warn("⚠️ Using cached products due to API error.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts(); // initial load

    // Auto-refresh every 6 hours
    const interval = setInterval(() => fetchAllProducts(true), REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        lastFetched,
        refreshProducts: () => fetchAllProducts(true),
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
