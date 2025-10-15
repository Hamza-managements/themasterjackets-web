import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addProductVariation, deleteProductVariation, getSingleProduct } from '../../utils/ProductServices';
import { useProducts } from "../../context/ProductContext";
import Swal from "sweetalert2";

const AllProductManagementPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [products, setProducts] = useState([]);
  const [, setSelectedProduct] = useState(null);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { refreshProducts } = useProducts();

  const emptyVariation = {
    stockKeepingUnit: "",
    variationName: "",
    productImages: [],
    productPrice: { originalPrice: 0, discountedPrice: 0, currency: "USD" },
    stockQuantity: 0,
    attributes: { color: "", size: "", material: "Leather", weight: "1.5 Kg" },
    inventoryStatus: "in stock",
    shipping: { shippingCharges: 0, isFreeShipping: false, estimatedDeliveryDays: 5 },
    ratings: { count: 5 },
  };

  const [currentVariation, setCurrentVariation] = useState(emptyVariation);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getSingleProduct(productId);
        if (res) setProducts([res]);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProduct();
  }, [productId]);

  const openVariationModal = (product = null) => {
    setSelectedProduct(product);
    setCurrentVariation(emptyVariation);
    setShowErrors(false);
    setShowVariationModal(true);
  };

  const closeVariationModal = () => {
    setShowVariationModal(false);
    setSelectedProduct(null);
    setShowErrors(false);
    setCurrentVariation(emptyVariation);
  };

  const handleAddVariation = async () => {
    const v = currentVariation;

    if (
      !v.stockKeepingUnit ||
      !v.variationName ||
      !v.productImages[0] ||
      !v.productPrice.originalPrice ||
      !v.productPrice.discountedPrice ||
      !v.stockQuantity ||
      !v.attributes.color ||
      !v.attributes.size
    ) {
      setShowErrors(true);
      return;
    }
    const res = await addProductVariation(productId, v);
    refreshProducts();

    Swal.fire({
      icon: "success",
      title: "Variation Added!",
      text: "Your product variation was added successfully.",
    })
    closeVariationModal();
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const deleteVariationHandler = (productId, variationId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const delres = await deleteProductVariation(productId, variationId);
        Swal.fire("Deleted!", "Your variation has been deleted.", "success");
        setProducts(prev => prev.map(product => product._id === productId
          ? {
            ...product,
            variations: product.variations.filter(v => v._id !== variationId),
          }
          : product
        )
        );
      }
    });
  };

  const getStatusBadge = (status) =>
    status ? (
      <span className="status-badge active">Active</span>
    ) : (
      <span className="status-badge inactive">Inactive</span>
    );

  const getInventoryStatus = (quantity) => {
    if (quantity === 0) return <span className="inventory-status out-of-stock">Out of Stock</span>;
    if (quantity < 10) return <span className="inventory-status low-stock">Low Stock</span>;
    return <span className="inventory-status in-stock">In Stock</span>;
  };

  return (
    <div className="product-management-container">
      <div className="management-header">
        <h1>Product Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/add-product')}>
            + Add New Product
          </button>
        </div>
      </div>

      <div className="single-products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-header">
              <div className="manage-product-image">
                {product.productImages?.map((img, idx) => (
                  <img key={idx} src={img} alt={product.productName} />
                ))}
              </div>
              <div className="product-basic-info">
                <h3>{product.productName}</h3>
                <p className="product-sku">SKU: {product.parentStockKeepingUnit}</p>
              </div>
            </div>

            <div className="manage-product-details">
              <div className="detail-row">
                <span>Status:</span>
                {getStatusBadge(product.status)}
              </div>
              <div className="detail-row">
                <span>Inventory:</span>
                {getInventoryStatus(product.variations?.[0]?.stockQuantity || 0)}
              </div>
              <div className="detail-row">
                <span>Category:</span>
                <span className="category-tag">{product.attributes?.gender}</span>
              </div>
              <div className="detail-row">
                <span>Variations:</span>
                <span className="variation-count">{product.variations?.length || 0}</span>
              </div>
            </div>

            <div className="variations-section">
              <div className="variations-header">
                <h3>Product Variations</h3>
                <button className="btn-outline" onClick={() => openVariationModal(product)}>
                  + Add Variation
                </button>
              </div>

              {product.variations?.length > 0 ? (
                <div className="variations-list">
                  {product?.variations?.map((variation) => (
                    <div key={variation._id} className="variation-item">
                      <div className="variation-image">
                        <img src={variation?.productImages[0]} alt={variation?.variationName} />
                      </div>
                      <div className="variation-info">
                        <span className="variation-name">{variation?.variationName}</span>
                        <span className="variation-sku">{variation?.stockKeepingUnit}</span>
                        <span className="variation-details">
                          {variation?.attributes.size} | {variation?.attributes.color} | $
                          {variation?.productPrice.originalPrice}
                        </span>
                      </div>
                      <div className="variation-actions">
                        <span className="stock-input">{variation?.stockQuantity}</span>
                        <button onClick={(e) => deleteVariationHandler(product._id, variation._id)} className="btn-danger">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-variations">No variations added yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Variation Modal */}
      {showVariationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Variation</h3>
              <button onClick={closeVariationModal} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              {/* SKU */}
              <div className={`form-group ${showErrors && !currentVariation.stockKeepingUnit ? 'error' : ''}`}>
                <label>SKU *</label>
                <input
                  type="text"
                  value={currentVariation.stockKeepingUnit}
                  placeholder='E.g., "SKU12345"'
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      stockKeepingUnit: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>

              {/* Variation Name */}
              <div className={`form-group ${showErrors && !currentVariation.variationName ? 'error' : ''}`}>
                <label>Variation Name *</label>
                <input
                  type="text"
                  placeholder='E.g., "Black Leather Jacket - Size M"'
                  value={currentVariation.variationName}
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({ ...prev, variationName: e.target.value }))
                  }
                />
              </div>

              {/* Product Image */}
              <div className="form-group">
                <label>Product Images *</label>

                {currentVariation.productImages.map((img, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="url"
                      placeholder={`Image URL ${index + 1}`}
                      value={img}
                      onChange={(e) =>
                        setCurrentVariation((prev) => {
                          const updated = [...prev.productImages];
                          updated[index] = e.target.value;
                          return { ...prev, productImages: updated };
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentVariation((prev) => ({
                          ...prev,
                          productImages: prev.productImages.filter((_, i) => i !== index),
                        }))
                      }
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ✖
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      productImages: [...prev.productImages, ""],
                    }))
                  }
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  ➕ Add Image
                </button>
              </div>

              {/* Price */}
              <div className={`form-group ${showErrors && !currentVariation.productPrice.originalPrice ? 'error' : ''}`}>
                <div>
                  <label>Original Price *</label>
                  <input
                    type="number"
                    min="0"
                    value={currentVariation.productPrice.originalPrice}
                    onChange={(e) =>
                      setCurrentVariation((prev) => ({
                        ...prev,
                        productPrice: { ...prev.productPrice, originalPrice: parseFloat(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Discounted Price *</label>
                  <input
                    type="number"
                    min="0"
                    value={currentVariation.productPrice.discountedPrice}
                    onChange={(e) =>
                      setCurrentVariation((prev) => ({
                        ...prev,
                        productPrice: { ...prev.productPrice, discountedPrice: parseFloat(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className={`form-group ${showErrors && !currentVariation.stockQuantity ? 'error' : ''}`}>
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={currentVariation.stockQuantity}
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      stockQuantity: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              {/* Attributes */}
              <div className={`form-group ${showErrors && !currentVariation.attributes.color ? 'error' : ''}`}>
                <label>Color *</label>
                <input
                  type="text"
                  value={currentVariation.attributes.color}
                  placeholder='E.g., "Black"'
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, color: e.target.value },
                    }))
                  }
                />
              </div>
              <div className={`form-group ${showErrors && !currentVariation.attributes.size ? 'error' : ''}`}>
                <label>Size *</label>
                <select
                  value={currentVariation.attributes.size}
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, size: e.target.value },
                    }))
                  }
                >
                  <option value="">Select Size</option>
                  {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Shipping Charges *</label>
                <input
                  type="number"
                  min="0"
                  value={currentVariation.shipping.shippingCharges}
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      shipping: { ...prev.shipping, shippingCharges: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <input
                  type="checkbox"
                  checked={currentVariation.shipping.isFreeShipping}
                  onChange={(e) =>
                    setCurrentVariation((prev) => ({
                      ...prev,
                      shipping: { ...prev.shipping, isFreeShipping: e.target.checked },
                    }))
                  }
                />
                <label className="ml-2">Free Shipping</label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeVariationModal} className="btn-secondary">Cancel</button>
              <button onClick={handleAddVariation} className="btn-primary">Add Variation</button>
            </div>
          </div>
        </div>
      )}



      <style>{`
        .product-management-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }

        .management-header h1 {
          color: #333;
          margin: 0;
          font-size: 32px;
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .single-products-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .product-header {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 15px;
          border-bottom: 1px solid #000000ff;
        }

        .manage-product-image {
          display: flex;
          gap: 10px;
          flex-wrap: wrap; /* so they wrap on smaller screens */
        }

        .manage-product-image img {
          width: 120px;
          height: auto;
          object-fit: cover;
          border-radius: 8px;
        }

        .product-basic-info {
          flex: 1;
        }

        .product-basic-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 24px;
        }

        .product-sku {
          color: #3b3b3bff;
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        .manage-product-details {
          margin-bottom: 2px;
        }

        .detail-row {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .inventory-status {
          font-size: 14px;
          font-weight: bold;
        }

        .inventory-status.in-stock {
          color: #23b05eff;
        }

        .inventory-status.low-stock {
          color: #f39c12;
        }

        .inventory-status.out-of-stock {
          color: #e74c3c;
        }

        .category-tag {
          background: #e8f4fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: bold;
        }

        .variation-count {
          background: #5c77efff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 14px;
        }

        .variations-section {
          margin-bottom: 20px;
        }

        .variations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .variations-header h3 {
          margin: 0;
          color: #4b4b4bff;
          font-size: 20px;
          font-weight: bold;
          text-decoration: underline 1px #0000007a;
        }

        .variations-list {
          space-y: 10px;
        }

        .variation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .variation-info {
          flex: 1;
        }

        
.variation-image{
display: flex;
  gap: 10px;
  overflow: hidden;
  margin-right: 15px;
  }

  .variation-image img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 2px;
}

        .variation-name {
          display: block;
          font-weight: bold;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }

        .variation-sku {
          display: block;
          font-size: 13px;
          color: #333;
        }

        .variation-details {
          font-size: 14px;
          color: #666;
        }

        .variation-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .stock-input {
          width: 60px;
          padding: 4px 8px;
          border: 1px solid #585656ff;
          border-radius: 4px;
          font-size: 14px;
        }

        .no-variations {
          text-align: center;
          color: #999;
          font-style: italic;
          padding: 20px;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        /* Button Styles */
        .btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger, .btn-outline {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-warning {
          background: #ffc107;
          color: #212529;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #667eea;
          color: #667eea;
        }

        .btn-primary:hover { background: #5a6fd8; }
        .btn-secondary:hover { background: #545b62; }
        .btn-success:hover { background: #218838; }
        .btn-warning:hover { background: #e0a800; }
        .btn-danger:hover { background: #c82333; }
        .btn-outline:hover { background: #667eea; color: white; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 10px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 0px 20px 20px 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-row {
          display: flex;
          gap: 15px;
        }

        .form-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #1b45ddff;
          border-radius: 6px;
          font-size: 14px;
        }
          .form-group input:focus, .form-group select:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
          }

        .error input, .error select {
          border: 2px solid #f50a0aff;
          }

        .checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.checkbox-group label {
  margin-top: 3px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"],
.checkbox-group input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #2563eb; /* modern browsers */
  cursor: pointer;
}

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 768px) {
          .single-products-grid {
            grid-template-columns: 1fr;
          }
          
          .product-header {
            flex-direction: column;
            text-align: center;
          }
          
          .manage-product-image {
            align-self: center;
          }
          
          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AllProductManagementPage;