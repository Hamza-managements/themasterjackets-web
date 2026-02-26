import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getProductBySubCategoryId,
  getProducts
} from "../utils/ProductServices";

const ProductContext = createContext();

const LIMIT = 40;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [mode, setMode] = useState("all"); 
  // "all" | "subcategory"

  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);

  // 🔹 FETCH ALL PRODUCTS
  const fetchProducts = async (pageToLoad = 1, append = false) => {
    try {
      setLoading(true);

      const data = await getProducts(pageToLoad, LIMIT);
      const newProducts = data?.products || [];

      setProducts(prev =>
        append ? [...prev, ...newProducts] : newProducts
      );

      setPage(pageToLoad);

      // ⭐ FRONTEND hasMore logic
      setHasMore(newProducts.length === LIMIT);
      setMode("all");

    } catch (err) {
      console.error("❌ Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 FETCH BY SUBCATEGORY
  const fetchBySubCategory = async (
    categoryId,
    subCategoryId,
    pageToLoad = 1,
    append = false
  ) => {
    try {
      setLoading(true);

      const res = await getProductBySubCategoryId(
        categoryId,
        subCategoryId,
        pageToLoad,
        LIMIT
      );

      const newProducts = res?.data || [];

      setProducts(prev =>
        append ? [...prev, ...newProducts] : newProducts
      );

      setPage(pageToLoad);

      setCurrentCategory(categoryId);
      setCurrentSubCategory(subCategoryId);

      // ⭐ FRONTEND hasMore logic
      setHasMore(newProducts.length === LIMIT);
      setMode("subcategory");

    } catch (err) {
      console.error("❌ Error fetching subcategory:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LOAD MORE (for infinite scroll)
  const loadMore = async () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;

    if (mode === "subcategory") {
      await fetchBySubCategory(
        currentCategory,
        currentSubCategory,
        nextPage,
        true
      );
    } else {
      await fetchProducts(nextPage, true);
    }
  };

  // 🔹 RESET + LOAD ALL PRODUCTS
  const refreshProducts = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  };

  // 🔹 RESET when switching category
  const resetProducts = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  };

  // // 🔹 INITIAL LOAD
  useEffect(() => {
    fetchProducts(1);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,

        page,
        hasMore,
        loadMore,

        fetchProducts,
        fetchBySubCategory,
        refreshProducts,
        resetProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);