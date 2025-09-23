import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app, this would come from API
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [currentVariation, setCurrentVariation] = useState({
    size: '',
    color: '',
    price: 0,
    quantity: 0,
    sku: ''
  });

  // Sample products data
  const sampleProducts = [
    {
      _id: '1',
      productName: 'Premium Leather Jacket',
      slug: 'premium-leather-jacket',
      productDescription: 'High-quality genuine leather jacket with premium stitching',
      productImages: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
      stockKeepingUnit: 'JACKET-001',
      productPrice: {
        originalPrice: 199.99,
        discountedPrice: 159.99,
        currency: 'USD'
      },
      inventoryStatus: 'in stock',
      stockQuantity: 50,
      sizes: [
        { size: 'S', quantity: 15 },
        { size: 'M', quantity: 20 },
        { size: 'L', quantity: 15 }
      ],
      colors: [
        { colorName: 'Black', image: '' },
        { colorName: 'Brown', image: '' }
      ],
      attributes: {
        material: 'Genuine Leather',
        gender: 'Men'
      },
      status: true,
      categoryId: 'cat1',
      variations: [
        {
          id: 'var1',
          size: 'S',
          color: 'Black',
          price: 159.99,
          quantity: 10,
          sku: 'JACKET-001-S-BLK',
          images: []
        },
        {
          id: 'var2',
          size: 'M',
          color: 'Black',
          price: 159.99,
          quantity: 15,
          sku: 'JACKET-001-M-BLK',
          images: []
        }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      _id: '2',
      productName: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      productDescription: 'Vintage style denim jacket for casual wear',
      productImages: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
      stockKeepingUnit: 'JACKET-002',
      productPrice: {
        originalPrice: 89.99,
        discountedPrice: 79.99,
        currency: 'USD'
      },
      inventoryStatus: 'in stock',
      stockQuantity: 30,
      sizes: [
        { size: 'M', quantity: 10 },
        { size: 'L', quantity: 12 },
        { size: 'XL', quantity: 8 }
      ],
      colors: [
        { colorName: 'Blue', image: '' },
        { colorName: 'Black', image: '' }
      ],
      attributes: {
        material: 'Denim',
        gender: 'Unisex'
      },
      status: false,
      categoryId: 'cat1',
      variations: [],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ];

  useEffect(() => {
    // In real app, fetch from API
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, statusFilter, categoryFilter, products]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.stockKeepingUnit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product =>
        statusFilter === 'active' ? product.status : !product.status
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product =>
        product.attributes.gender.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const toggleProductStatus = (productId) => {
    setProducts(prev => prev.map(product =>
      product._id === productId ? { ...product, status: !product.status } : product
    ));
  };

  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product._id !== productId));
    }
  };

  const openVariationModal = (product = null) => {
    setSelectedProduct(product);
    setCurrentVariation({
      size: '',
      color: '',
      price: product?.productPrice?.discountedPrice || 0,
      quantity: 0,
      sku: ''
    });
    setShowVariationModal(true);
  };

  const closeVariationModal = () => {
    setShowVariationModal(false);
    setSelectedProduct(null);
    setCurrentVariation({
      size: '',
      color: '',
      price: 0,
      quantity: 0,
      sku: ''
    });
  };

  const addVariation = () => {
    if (!currentVariation.size || !currentVariation.color || !currentVariation.sku) {
      alert('Please fill in all required fields');
      return;
    }

    const newVariation = {
      id: `var${Date.now()}`,
      ...currentVariation
    };

    setProducts(prev => prev.map(product =>
      product._id === selectedProduct._id
        ? {
            ...product,
            variations: [...product.variations, newVariation],
            stockQuantity: product.stockQuantity + currentVariation.quantity
          }
        : product
    ));

    closeVariationModal();
  };

  const removeVariation = (productId, variationId) => {
    setProducts(prev => prev.map(product =>
      product._id === productId
        ? {
            ...product,
            variations: product.variations.filter(v => v.id !== variationId)
          }
        : product
    ));
  };

  const updateVariationStock = (productId, variationId, newQuantity) => {
    setProducts(prev => prev.map(product =>
      product._id === productId
        ? {
            ...product,
            variations: product.variations.map(v =>
              v.id === variationId ? { ...v, quantity: newQuantity } : v
            )
          }
        : product
    ));
  };

  const getStockSummary = (product) => {
    const totalStock = product.variations.reduce((sum, v) => sum + v.quantity, 0);
    const lowStock = product.variations.filter(v => v.quantity < 10).length;
    return { totalStock, lowStock };
  };

  const getStatusBadge = (status) => {
    return status ? 
      <span className="status-badge active">Active</span> : 
      <span className="status-badge inactive">Inactive</span>;
  };

  const getInventoryStatus = (quantity) => {
    if (quantity === 0) return <span className="inventory-status out-of-stock">Out of Stock</span>;
    if (quantity < 10) return <span className="inventory-status low-stock">Low Stock</span>;
    return <span className="inventory-status in-stock">In Stock</span>;
  };

  return (
    <div className="product-management-container">
      {/* Header */}
      <div className="management-header">
        <h1>Product Management</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/add-product')}
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-header">
              <div className="manage-product-image">
                <img src={product.productImages[0]} alt={product.productName} />
              </div>
              <div className="product-basic-info">
                <h3>{product.productName}</h3>
                <p className="product-sku">SKU: {product.stockKeepingUnit}</p>
                <div className="price-info">
                  <span className="current-price">${product.productPrice.discountedPrice}</span>
                  {product.productPrice.originalPrice > product.productPrice.discountedPrice && (
                    <span className="original-price">${product.productPrice.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="product-details">
              <div className="detail-row">
                <span>Status:</span>
                {getStatusBadge(product.status)}
              </div>
              <div className="detail-row">
                <span>Inventory:</span>
                {getInventoryStatus(product.stockQuantity)}
              </div>
              <div className="detail-row">
                <span>Category:</span>
                <span className="category-tag">{product.attributes.gender}</span>
              </div>
              <div className="detail-row">
                <span>Variations:</span>
                <span className="variation-count">{product.variations.length}</span>
              </div>
            </div>

            {/* Variations Section */}
            <div className="variations-section">
              <div className="variations-header">
                <h4>Product Variations</h4>
                <button 
                  className="btn-outline"
                  onClick={() => openVariationModal(product)}
                >
                  + Add Variation
                </button>
              </div>

              {product.variations.length > 0 ? (
                <div className="variations-list">
                  {product.variations.map(variation => (
                    <div key={variation.id} className="variation-item">
                      <div className="variation-info">
                        <span className="variation-sku">{variation.sku}</span>
                        <span className="variation-details">
                          {variation.size} | {variation.color} | ${variation.price}
                        </span>
                      </div>
                      <div className="variation-actions">
                        <input
                          type="number"
                          value={variation.quantity}
                          onChange={(e) => updateVariationStock(product._id, variation.id, parseInt(e.target.value) || 0)}
                          className="stock-input"
                          min="0"
                        />
                        <button 
                          className="btn-danger"
                          onClick={() => removeVariation(product._id, variation.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-variations">No variations added yet.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="btn-secondary"
                onClick={() => navigate(`/edit-product/${product._id}`)}
              >
                Edit
              </button>
              <button 
                className={product.status ? 'btn-warning' : 'btn-success'}
                onClick={() => toggleProductStatus(product._id)}
              >
                {product.status ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                className="btn-danger"
                onClick={() => deleteProduct(product._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Variation Modal */}
      {showVariationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Variation</h3>
              <button onClick={closeVariationModal} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Size *</label>
                <select
                  value={currentVariation.size}
                  onChange={(e) => setCurrentVariation(prev => ({ ...prev, size: e.target.value }))}
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                  <option value="4XL">4XL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color *</label>
                <input
                  type="text"
                  value={currentVariation.color}
                  onChange={(e) => setCurrentVariation(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Enter color name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    value={currentVariation.price}
                    onChange={(e) => setCurrentVariation(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={currentVariation.quantity}
                    onChange={(e) => setCurrentVariation(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  value={currentVariation.sku}
                  onChange={(e) => setCurrentVariation(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                  placeholder="Unique SKU for this variation"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeVariationModal} className="btn-secondary">Cancel</button>
              <button onClick={addVariation} className="btn-primary">Add Variation</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .product-management-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .management-header h1 {
          color: #333;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .filter-controls {
          display: flex;
          gap: 15px;
        }

        .filter-select {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          font-size: 14px;
        }

        .products-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
          gap: 15px;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .manage-product-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .manage-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-basic-info {
          flex: 1;
        }

        .product-basic-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
        }

        .product-sku {
          color: #666;
          font-size: 12px;
          margin: 0 0 8px 0;
        }

        .price-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .current-price {
          font-size: 18px;
          font-weight: bold;
          color: #2ecc71;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .product-details {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f8f8f8;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
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
          font-size: 12px;
          font-weight: bold;
        }

        .inventory-status.in-stock {
          color: #2ecc71;
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
          font-size: 11px;
        }

        .variation-count {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
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

        .variations-header h4 {
          margin: 0;
          color: #333;
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

        .variation-sku {
          display: block;
          font-weight: bold;
          font-size: 12px;
          color: #333;
        }

        .variation-details {
          font-size: 11px;
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
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
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
          font-size: 12px;
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
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h3 {
          margin: 0;
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
          padding: 20px;
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
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: none;
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

export default ProductManagementPage;