const ProductCardSkeleton = () => {
  return (
    <div className="subcategory-product-card skeleton-card">
      <div className="subcategory-product-image">
        <div className="skeleton-image-block" />

        <div className="product-badges">
          <span className="badge skeleton-badge" />
        </div>
      </div>

      <div className="product-details">
        <div className="skeleton-title" />
        <div className="skeleton-price" />
        <div className="skeleton-rating" />

        <div className="skeleton-colors">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;