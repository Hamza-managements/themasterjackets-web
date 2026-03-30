import React, { createContext, useCallback, useContext, useState } from "react";
import {
  getProductBySubCategoryId,
  getProducts
} from "../utils/ProductServices";

const ProductContext = createContext();

const LIMIT = 48;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0)

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [mode, setMode] = useState("all"); // "all" | "subcategory"

  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);

  // 🔹 FETCH PRODUCTS BY CATEGORY
  const fetchProducts = useCallback(async (
    categoryId,
    sortLimit,
    pageToLoad = 1,
    append = false
  ) => {
    try {
      if (!categoryId) return;

      setLoading(true);

      let data;
      if (sortLimit > 0) {
        data = await getProducts(pageToLoad, sortLimit, categoryId);
      } else {
        data = await getProducts(pageToLoad, LIMIT, categoryId);
      }
      console.log(data)
      const newProducts = data?.products || [];

      setProducts(prev =>
        append ? [...prev, ...newProducts] : newProducts
      );
      setTotalProducts(data?.totalProducts);

      setPage(pageToLoad);

      setCurrentCategory(categoryId);
      setCurrentSubCategory(null);

      setHasMore(newProducts.length === LIMIT || newProducts.length === sortLimit);
      setMode("all");

    } catch (err) {
      console.error("❌ Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 FETCH BY SUBCATEGORY
  const fetchBySubCategory = useCallback(async (
    categoryId,
    subCategoryId,
    pageToLoad = 1,
    append = false
  ) => {
    try {
      if (!categoryId || !subCategoryId) return;

      setLoading(true);
      const res = await getProductBySubCategoryId(
        categoryId,
        subCategoryId,
        pageToLoad,
        LIMIT
      );


      const newProducts = res?.data?.products || [];

      setProducts(prev =>
        append ? [...prev, ...newProducts] : newProducts
      );

      setTotalProducts(res?.data?.totalProducts);

      setPage(pageToLoad);

      setCurrentCategory(categoryId);
      setCurrentSubCategory(subCategoryId);

      setHasMore(newProducts.length === LIMIT);
      setMode("subcategory");

    } catch (err) {
      console.error("❌ Error fetching subcategory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 LOAD MORE (INFINITE SCROLL)
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
      await fetchProducts(
        currentCategory,
        48,
        nextPage,
        true
      );
    }
  };

  // 🔹 REFRESH CURRENT CATEGORY
  const refreshProducts = async () => {
    if (!currentCategory) return;

    setProducts([]);
    setPage(1);
    setHasMore(true);

    await fetchProducts(currentCategory, 0, 1, false);
  };

  // 🔹 RESET WHEN SWITCHING PAGE
  const resetProducts = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        totalProducts,

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