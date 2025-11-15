import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Spinner, Alert, Card, Badge, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen, FaSearch, FaInfoCircle, FaBox, FaFilter, FaSort } from 'react-icons/fa';
import { addCategory, addSubCategory, deleteCategory, deleteSubCategory, fetchCategoriesAll, updateCategory, updateSingleSubcategory } from '../../utils/CartUtils';
import { getProducts } from '../../utils/ProductServices';

const CategoryListPage = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState(null);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false);
  const [subcategoryToEdit, setSubcategoryToEdit] = useState(null);
  const [parentCategoryForEdit, setParentCategoryForEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all'); // all, with-products, without-products
  const [sortBy, setSortBy] = useState('name'); // name, productCount, date

  // Form state
  const [formData, setFormData] = useState({
    mainCategoryName: '',
    description: '',
    image: '',
    subCategories: [{ categoryName: '' }],
  });

  // Mock product data - replace with actual API call
  const mockProducts = [
    { _id: '1', name: 'Product 1', category: 'cat1', subcategory: 'sub1' },
    { _id: '2', name: 'Product 2', category: 'cat1', subcategory: 'sub2' },
    { _id: '3', name: 'Product 3', category: 'cat2', subcategory: 'sub3' },
    { _id: '4', name: 'Product 4', category: 'cat1', subcategory: 'sub1' },
  ];

  // Calculate product counts
  const calculateProductCounts = useCallback((categories) => {
    return categories.map(category => {
      const categoryProducts = mockProducts.filter(product =>
        product.category === category._id
      );

      const subcategoryProducts = category.subCategories?.map(sub => {
        const subProducts = mockProducts.filter(product =>
          product.subcategory === sub._id
        );
        return {
          ...sub,
          productCount: subProducts.length
        };
      }) || [];

      return {
        ...category,
        productCount: categoryProducts.length,
        subCategories: subcategoryProducts
      };
    });
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Toast notification
  const showToast = useCallback((icon, message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: message
    });
  }, []);

  // Fetch categories
  const getAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategoriesAll();
      const categoriesWithCounts = calculateProductCounts(data);
      setCategories(categoriesWithCounts);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [showToast, calculateProductCounts]);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Fetch All Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };

    fetchProducts();
  }, []);

  const productsByCategory = {};
  const productsBySubCategory = {};

  allProducts.forEach((p) => {
    // Group by main category
    if (!productsByCategory[p.categoryId]) {
      productsByCategory[p.categoryId] = [];
    }
    productsByCategory[p.categoryId].push(p);

    // Group by subcategory
    if (!productsBySubCategory[p.subCategoryId]) {
      productsBySubCategory[p.subCategoryId] = [];
    }
    productsBySubCategory[p.subCategoryId].push(p);
  });

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Expand/Collapse all
  const toggleExpandAll = () => {
    if (expandedCategories.size === filteredCategories.length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(filteredCategories.map(cat => cat._id)));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      mainCategoryName: '',
      description: '',
      image: '',
      subCategories: [{ categoryName: '' }],
    });
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Subcategory input change
  const handleSubCategoryChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.subCategories];
      updated[index].categoryName = value;
      return { ...prev, subCategories: updated };
    });
  };

  const addSubCategoryField = () => {
    if (
      formData.subCategories.length === 0 ||
      formData.subCategories[formData.subCategories.length - 1].categoryName.trim() !== ''
    ) {
      setFormData((prev) => ({
        ...prev,
        subCategories: [...prev.subCategories, { categoryName: '' }],
      }));
    } else {
      showToast('warning', 'Please fill the previous subcategory before adding a new one.');
    }
  };

  const removeSubCategoryField = (index) => {
    if (formData.subCategories.length > 1) {
      setFormData((prev) => {
        const updated = [...prev.subCategories];
        updated.splice(index, 1);
        return { ...prev, subCategories: updated };
      });
    }
  };

  // Open modals
  const openAddModal = () => {
    setModalMode('add');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setFormData({
      mainCategoryName: category.mainCategoryName,
      description: category.description,
      image: category.image,
      subCategories: category.subCategories || [],
    });
    setShowModal(true);
  };

  const openAddSubcategoryModal = (categoryId) => {
    setParentCategoryId(categoryId);
    setFormData({ subCategories: [{ categoryName: '' }] });
    setShowSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (category, subcategory) => {
    setParentCategoryForEdit(category);
    setSubcategoryToEdit(subcategory);
    setFormData({
      subCategories: [{ categoryName: subcategory.categoryName }],
    });
    setShowEditSubcategoryModal(true);
  };

  // API calls
  const addCategoryHandler = async () => {
    try {
      setLoading(true);
      await addCategory(formData);
      showToast('success', 'Category added successfully!');
      setShowModal(false);
      getAllCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add category';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryHandler = async () => {
    try {
      setLoading(true);
      const updatedData = {
        categoryId: currentCategory._id,
        description: formData.description,
        image: formData.image,
        mainCategoryName: formData.mainCategoryName,
      };
      await updateCategory(updatedData);
      showToast('success', 'Category updated successfully!');
      setShowModal(false);
      getAllCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update category';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateSingleSubcategoryHandler = async () => {
    try {
      setLoading(true);
      const updatedData = {
        categoryId: parentCategoryForEdit._id,
        subCategoryId: subcategoryToEdit._id,
        categoryName: formData.subCategories[0].categoryName
      };
      await updateSingleSubcategory(updatedData);
      showToast('success', 'Subcategory updated successfully!');
      setShowEditSubcategoryModal(false);
      getAllCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update subcategory';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryHandler = async () => {
    try {
      setLoading(true);
      await deleteCategory(currentCategory._id);
      showToast('success', 'Category deleted successfully!');
      setShowDeleteConfirm(false);
      getAllCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete category';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addSubCategoryHandler = async () => {
    try {
      setLoading(true);
      const data = {
        categoryId: parentCategoryId,
        subCategories: formData.subCategories,
      };
      await addSubCategory(data);
      showToast('success', 'Subcategory added successfully!');
      setShowSubcategoryModal(false);
      getAllCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add subcategory';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategoryHandler = async (categoryId, subcategoryId, subcategoryName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${subcategoryName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await deleteSubCategory(categoryId, subcategoryId);
        showToast('success', 'Subcategory deleted successfully!');
        getAllCategories();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to delete subcategory';
        setError(errorMsg);
        showToast('error', errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.mainCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subCategories?.some(sub =>
          sub.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilter = filterStatus === 'all' ? true :
        filterStatus === 'with-products' ? category.productCount > 0 :
          category.productCount === 0;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'productCount':
          return b.productCount - a.productCount;
        case 'name':
          return a.mainCategoryName.localeCompare(b.mainCategoryName);
        case 'date':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  // Stats calculation
  const stats = {
    totalCategories: categories.length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
    categoriesWithProducts: categories.filter(cat => cat.productCount > 0).length,
    totalSubcategories: categories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0)
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await addCategoryHandler();
      } else {
        await updateCategoryHandler();
      }
    } catch (err) {
      // Error handling is done in the individual functions
    }
  };

  // Tooltip components
  const ProductCountTooltip = (props) => (
    <Tooltip id="product-count-tooltip" {...props}>
      Number of products in this category
    </Tooltip>
  );

  return (
    <div className="cm-fixed-container">
      <div className="cm-fixed-header">
        <Row className="justify-content-center">
          <Col lg={12} xl={10}>
            <Card className="glass-card">
              <Card.Header className="card-header-custom">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="cm-fixed-title-section">
                    <h4 className="mb-1"><FaFolder className="me-2" />Category Manager</h4>
                    <p className="mb-0 text-light opacity-75">Manage your product categories and subcategories</p>
                  </div>
                  <Button variant="primary" className="btn-add" onClick={openAddModal}>
                    <FaPlus className="me-2" />Add Category
                  </Button>
                </div>

                {/* Statistics Cards */}
                <Row className="mt-4 g-3">
                  <Col xs={6} md={3}>
                    <div className="stat-card">
                      <div className="stat-icon total-categories">
                        <FaFolder />
                      </div>
                      <div className="stat-content">
                        <h5>{stats.totalCategories}</h5>
                        <span>Total Categories</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="stat-card">
                      <div className="stat-icon total-products">
                        <FaBox />
                      </div>
                      <div className="stat-content">
                        <h5>{stats.totalProducts}</h5>
                        <span>Total Products</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="stat-card">
                      <div className="stat-icon active-categories">
                        <FaFolderOpen />
                      </div>
                      <div className="stat-content">
                        <h5>{stats.categoriesWithProducts}</h5>
                        <span>Active Categories</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="stat-card">
                      <div className="stat-icon total-subcategories">
                        <FaFolder />
                      </div>
                      <div className="stat-content">
                        <h5>{stats.totalSubcategories}</h5>
                        <span>Subcategories</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body>
                {error && <Alert variant="danger" className="alert-custom">{error}</Alert>}
                {success && <Alert variant="success" className="alert-custom">{success}</Alert>}

                {/* Enhanced Search and Filter Bar */}
                <div className="search-filter-bar mb-4">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search categories or subcategories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="admin-filter-controls">
                    <div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="form-select filter-select"
                      >
                        <option value="all">All Categories</option>
                        <option value="with-products">With Products</option>
                        <option value="without-products">Without Products</option>
                      </select>

                    </div>
                    <div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="form-select sort-select"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="productCount">Sort by Product Count</option>
                        <option value="date">Sort by Date</option>
                      </select>
                    </div>
                    <div>

                      <Button
                        variant="outline-secondary"
                        onClick={toggleExpandAll}
                        className="btn-expand-all"
                      >
                        {expandedCategories.size === filteredCategories.length ? 'Collapse All' : 'Expand All'}
                      </Button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="loading-spinner"></div>
                    <p className="mt-3 text-muted">Loading categories...</p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-5 empty-state-found text-center">
                    <div className="empty-icon-found">
                      <FaFolderOpen />
                    </div>
                    <h5 className='mb-2'>No categories found</h5>
                    <p className="text-muted mb-4">Try adjusting your search or filter criteria</p>
                    <button onClick={openAddModal} className="btn-add-no-found">
                      <FaPlus className="me-2" />Add Your First Category
                    </button>
                  </div>
                ) : (
                  <div className="categories-container">
                    {filteredCategories.map((category) => (
                      <div key={category._id} className="admin-category-card">
                        <div className="category-header">
                          <div
                            className="category-title"
                            onClick={() => toggleCategoryExpansion(category._id)}
                          >
                            <div className="d-flex align-items-center flex-wrap">
                              <div className="category-icon">
                                {expandedCategories.has(category._id) ?
                                  <FaFolderOpen className="text-primary" /> :
                                  <FaFolder className="text-primary" />
                                }
                              </div>
                              <div className="category-info">
                                <h5 className="category-name">{category.mainCategoryName}</h5>
                                <div className="category-meta">
                                  <Badge bg="outline-primary" className="me-2">
                                    ID: {category._id}
                                  </Badge>
                                  <Badge bg="outline-secondary">
                                    Slug: {category.slug}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="category-stats">
                              <OverlayTrigger placement="top" overlay={ProductCountTooltip}>
                                <Badge bg="success" className="product-count-badge">
                                  <FaBox className="me-1" />
                                  {productsByCategory[category._id]?.length || 0} Products
                                </Badge>
                              </OverlayTrigger>
                              <Badge bg="primary" className="subcategory-count">
                                {category.subCategories?.length || 0} Subcategories
                              </Badge>
                            </div>
                          </div>

                          <div className="category-actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2 action-btn"
                              onClick={() => openEditModal(category)}
                            >
                              <FaEdit className="me-1" />Edit
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2 action-btn"
                              onClick={() => openAddSubcategoryModal(category._id)}
                            >
                              <FaPlus className="me-1" />Add Sub
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="action-btn"
                              onClick={() => {
                                setCurrentCategory(category);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <FaTrash className="me-1" />Delete
                            </Button>
                          </div>
                        </div>

                        {/* Subcategories */}
                        {expandedCategories.has(category._id) && (
                          <div className="category-details">
                            <div className="category-description">
                              <p><strong>Description:</strong> {category.description || 'No description provided'}</p>
                            </div>

                            {category.image && (
                              <div className="category-image-section">
                                <img
                                  src={category.image}
                                  className="image-category-admin"
                                  alt={category.mainCategoryName}
                                  onError={(e) => {
                                    e.target.src = "https://image.pngaaa.com/700/5273700-middle.png";
                                  }}
                                />
                              </div>
                            )}

                            {category.subCategories?.length > 0 && (
                              <div className="subcategories-section">
                                <h6 className="subcategories-title">
                                  <FaFolderOpen className="me-2" />
                                  Subcategories ({category.subCategories.length})
                                </h6>
                                <div className="subcategories-list">
                                  {category.subCategories.map((sub, index) => (
                                    <div key={sub._id || `${category._id}-${index}`} className="subcategory-item">
                                      <div className="subcategory-info">
                                        <div className="subcategory-main">
                                          <h6 className="subcategory-name">{sub.categoryName}</h6>
                                          <OverlayTrigger placement="top" overlay={ProductCountTooltip}>
                                            <Badge bg="outline-success" className="sub-product-count">
                                              <FaBox className="me-1" />
                                              {productsBySubCategory[sub._id]?.length || 0} Products
                                            </Badge>
                                          </OverlayTrigger>
                                        </div>
                                        <span className="subcategory-id">ID: {sub._id}</span>
                                      </div>
                                      <div className="subcategory-actions">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="me-2 action-btn"
                                          onClick={() => openEditSubcategoryModal(category, sub)}
                                        >
                                          <FaEdit className="me-1" />Edit
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          className="action-btn"
                                          onClick={() => deleteSubCategoryHandler(category._id, sub._id, sub.categoryName)}
                                        >
                                          <FaTrash className="me-1" />Delete
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Add/Edit Category Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="custom-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-4">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  name="mainCategoryName"
                  value={formData.mainCategoryName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter category name"
                  className="form-control-custom"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Category Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter category description"
                  className="form-control-custom"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Category Image URL</Form.Label>
                <Form.Control
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter category image URL"
                  className="form-control-custom"
                />
              </Form.Group>

              {/* Only allow adding subcategories on add mode */}
              {modalMode !== 'edit' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="mb-0">Subcategories</Form.Label>
                    <Button variant="outline-primary" size="sm" onClick={addSubCategoryField} className="btn-add-sub d-flex align-items-center">
                      <FaPlus className="me-1" />Add Another
                    </Button>
                  </div>
                  {formData.subCategories?.map((sub, i) => (
                    <div key={i} className="d-flex align-items-center mb-3">
                      <Form.Control
                        type="text"
                        placeholder={`Subcategory ${i + 1}`}
                        value={sub.categoryName}
                        onChange={(e) => handleSubCategoryChange(i, e.target.value)}
                        required
                        className="form-control-custom me-2"
                      />
                      {formData.subCategories.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeSubCategoryField(i)}
                          className="btn-remove"
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="btn-save">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {modalMode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    {modalMode === 'add' ? 'Add Category' : 'Update Category'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Add Subcategory Modal */}
        <Modal show={showSubcategoryModal} onHide={() => setShowSubcategoryModal(false)} centered className="custom-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Add Subcategory</Modal.Title>
          </Modal.Header>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              addSubCategoryHandler();
            }}
          >
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Label className="mb-0">Subcategories</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addSubCategoryField} className="btn-add-sub d-flex align-items-center">
                  <FaPlus className="me-1" />Add Another
                </Button>
              </div>
              {formData.subCategories?.map((sub, i) => (
                <div key={i} className="d-flex align-items-center mb-3">
                  <Form.Control
                    type="text"
                    placeholder={`Subcategory ${i + 1}`}
                    value={sub.categoryName}
                    onChange={(e) => handleSubCategoryChange(i, e.target.value)}
                    required
                    className="form-control-custom me-2"
                  />
                  {formData.subCategories.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeSubCategoryField(i)}
                      className="btn-remove"
                    >
                      &times;
                    </Button>
                  )}
                </div>
              ))}
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={() => setShowSubcategoryModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="btn-save">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Adding...
                  </>
                ) : (
                  'Add Subcategory'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit Subcategory Modal */}
        <Modal show={showEditSubcategoryModal} onHide={() => setShowEditSubcategoryModal(false)} centered className="custom-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Edit Subcategory</Modal.Title>
          </Modal.Header>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              updateSingleSubcategoryHandler();
            }}
          >
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Subcategory Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.subCategories[0]?.categoryName || ''}
                  onChange={(e) => handleSubCategoryChange(0, e.target.value)}
                  required
                  placeholder="Enter subcategory name"
                  className="form-control-custom"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={() => setShowEditSubcategoryModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="btn-save">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Subcategory'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered className="custom-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="delete-confirmation">
              <div className="delete-icon">
                <FaTrash />
              </div>
              <h5>Delete Category</h5>
              <p>Are you sure you want to delete the category <strong>"{currentCategory?.mainCategoryName}"</strong>? This will also delete all its subcategories. This action cannot be undone.</p>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteCategoryHandler} disabled={loading} className="btn-delete-confirm">
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-1" />Delete
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        .cm-fixed-container {
          background: linear-gradient(135deg, #dadadaff 0%, #c6c6c6ff 100%);
          min-height: 100vh;
          padding: 20px 0;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .card-header-custom {
          background: linear-gradient(135deg, #373738ff 0%, #0d0d0dff 100%);
          color: white;
          border-bottom: none;
          padding: 2rem;
        }

        /* Statistics Cards */
        .stat-card {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-icon.total-categories { background: #1d1d1dff; }
        .stat-icon.total-products { background: #1d1d1dff; }
        .stat-icon.active-categories { background: #1d1d1dff; }
        .stat-icon.total-subcategories { background: #1d1d1dff; }

        .stat-content h5 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .stat-content span {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        /* Enhanced Search and Filter */
        .search-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #171717ff;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        }

        .admin-filter-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-select, .sort-select {
          border-radius: 25px;
          border: 2px solid #e9ecef;
          padding: 8px 15px;
          background: white;
          min-width: 160px;
        }

        .btn-expand-all {
          border-radius: 25px;
          padding: 8px 20px;
          font-weight: 500;
        }

        /* Enhanced Category Cards */
        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-category-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .admin-category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
          background: linear-gradient(to right, rgba(245, 247, 250, 0.8), rgba(255, 255, 255, 0.9));
          transition: all 0.3s ease;
        }

        .category-header:hover {
          background: linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(255, 255, 255, 0.95));
        }

        .category-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          gap: 1rem;
        }

        .category-icon {
          font-size: 1.8rem;
          margin-right: 1rem;
        }

        .category-info {
          flex: 1;
        }

        .category-name {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          font-size: 1.3rem;
        }

        .category-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-stats {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .product-count-badge, .subcategory-count {
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .category-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          border-radius: 10px;
          font-size: 0.8rem;
          padding: 8px 16px;
          transition: all 0.2s ease;
          font-weight: 500;
          border: 2px solid;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Category Details */
        .category-details {
          padding: 0 1.5rem 1.5rem;
          background: rgba(245, 247, 250, 0.5);
        }

        .category-description {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }

        .category-description p {
          margin: 0;
          color: #555;
          line-height: 1.6;
        }

        .category-image-section {
          text-align: center;
          margin: 1rem 0;
        }

        .image-category-admin {
          max-width: 200px;
          height: 120px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        /* Subcategories Section */
        .subcategories-section {
          margin-top: 1.5rem;
        }

        .subcategories-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
        }

        .subcategories-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .subcategory-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          border-left: 4px solid #667eea;
        }

        .subcategory-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .subcategory-info {
          flex: 1;
        }

        .subcategory-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .subcategory-name {
          font-weight: 600;
          color: #34495e;
          margin: 0;
          font-size: 1rem;
        }

        .sub-product-count {
          display: flex;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .subcategory-id {
          font-size: 0.8rem;
          color: #7f8c8d;
          font-family: 'Courier New', monospace;
        }

        .subcategory-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Badge Styles */
        .badge.bg-outline-primary, .badge.bg-outline-secondary, .badge.bg-outline-success {
          background: transparent !important;
          border: 1px solid;
          color: inherit;
        }

        .badge.bg-outline-primary { border-color: #007bff; color: #007bff; }
        .badge.bg-outline-secondary { border-color: #6c757d; color: #6c757d; }
        .badge.bg-outline-success { border-color: #28a745; color: #28a745; }

        /* Buttons */
        .btn-add {
          background: #007bff;
          border: none;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .btn-add:hover {
          transform: translateY(-2px);
        }

        .btn-add-no-found {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          margin: 0 auto;
        }

        .btn-add-no-found:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* Empty State */
        .empty-state-found {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem 2rem;
        }

        .empty-icon-found {
          font-size: 4rem;
          color: #bdc3c7;
          margin-bottom: 1.5rem;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-radius: 50%;
          border-top: 4px solid #667eea;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .category-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .category-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .category-stats {
            width: 100%;
            justify-content: flex-start;
          }
          
          .category-actions {
            width: 100%;
            justify-content: flex-end;
          }
          
          .search-filter-bar {
            flex-direction: column;
            gap: 1rem;
          }
          
          .search-box {
            min-width: 100%;
          }
          
          .admin-filter-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .filter-select, .sort-select {
            flex: 1;
          }
          
          .subcategory-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .subcategory-actions {
            width: 100%;
            justify-content: flex-end;
          }
          
          .stat-card {
            padding: 1rem;
          }
          
          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }

        @media (max-width: 576px) {
          .card-header-custom {
            padding: 1.5rem 1rem;
          }
          
          .category-header {
            padding: 1rem;
          }
          
          .category-details {
            padding: 0 1rem 1rem;
          }
          
          .admin-filter-controls {
            flex-direction: column;
          }
          
          .filter-select, .sort-select, .btn-expand-all {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryListPage;