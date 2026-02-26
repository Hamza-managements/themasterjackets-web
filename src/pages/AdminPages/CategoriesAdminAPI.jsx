import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Spinner, Alert, Card, Badge, Row, Col, Tooltip, OverlayTrigger, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen, FaSearch, FaBox, FaEye, FaEyeSlash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { addCategory, addSubCategory, deleteCategory, deleteSubCategory, fetchCategoriesAll, updateCategory, updateSingleSubcategory } from '../../utils/CartUtils';
import { getProducts } from '../../utils/ProductServices';
import { Link } from 'react-router-dom';

const ManageCategoryListPage = () => {
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Form state
  const [formData, setFormData] = useState({
    mainCategoryName: '',
    description: '',
    image: '',
    subCategories: [{ categoryName: '' }],
  });

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
      setCategories(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Fetch All Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data.products);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };

    fetchProducts();
  }, []);

  // Calculate product counts
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

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.mainCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subCategories?.some(sub =>
          sub.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const categoryProductCount = productsByCategory[category._id]?.length || 0;
      const matchesFilter = filterStatus === 'all' ? true :
        filterStatus === 'with-products' ? categoryProductCount > 0 :
          categoryProductCount === 0;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aProductCount = productsByCategory[a._id]?.length || 0;
      const bProductCount = productsByCategory[b._id]?.length || 0;

      switch (sortConfig.key) {
        case 'name':
          return sortConfig.direction === 'asc'
            ? a.mainCategoryName.localeCompare(b.mainCategoryName)
            : b.mainCategoryName.localeCompare(a.mainCategoryName);
        case 'products':
          return sortConfig.direction === 'asc'
            ? aProductCount - bProductCount
            : bProductCount - aProductCount;
        case 'subcategories':
          const aSubCount = a.subCategories?.length || 0;
          const bSubCount = b.subCategories?.length || 0;
          return sortConfig.direction === 'asc'
            ? aSubCount - bSubCount
            : bSubCount - aSubCount;
        case 'date':
        default:
          const aDate = new Date(a.createdAt || 0);
          const bDate = new Date(b.createdAt || 0);
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });

  // Stats calculation
  const stats = {
    totalCategories: categories.length,
    totalProducts: allProducts.length,
    categoriesWithProducts: categories.filter(cat => productsByCategory[cat._id]?.length > 0).length,
    totalSubcategories: categories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0)
  };

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

  // const addSubCategoryField = () => {
  //   if (
  //     formData.subCategories.length === 0 ||
  //     formData.subCategories[formData.subCategories.length - 1].categoryName.trim() !== ''
  //   ) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       subCategories: [...prev.subCategories, { categoryName: '' }],
  //     }));
  //   } else {
  //     showToast('warning', 'Please fill the previous subcategory before adding a new one.');
  //   }
  // };

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
      const addFormData = {
        mainCategoryName: formData.mainCategoryName,
        description: formData.description,
        image: formData.image,
      }
      await addCategory(addFormData);
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
        mainCategoryId: parentCategoryForEdit._id,
        subCategoryId: subcategoryToEdit._id,
        subCategoryUpdatedName: formData.subCategories[0].categoryName
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
        subCategoryName: formData?.subCategories[0]?.categoryName,
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
    <div className="category-table-container">
      <div className="category-table-header">
        <Row className="justify-content-center">
          <Col lg={12} xl={10}>
            <Card className="table-glass-card">
              <Card.Header className="table-card-header-custom">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex flex-col">
                    <Link className='text-3xl mb-2' target='_blank' to="/" ><img className="fs-logo" alt='TheMasterJacketsLOGO' src='https://res.cloudinary.com/dekf5dyng/image/upload/v1761554899/TMJ_logo_dark_kyarf4.png'></img></Link>
                    <h5 className="d-flex"><FaFolder className="me-2" />Category Management</h5>
                    <p className="text-light opacity-75">Manage your product categories and subcategories in table format</p>
                  </div>
                  <div>
                    <Button variant="primary" className="btn-add-table" onClick={openAddModal}>
                      <FaPlus className="me-2" />Add Category
                    </Button>
                    <br />
                    <Link variant="primary" className="btn-add-table" target='_blank' style={{ "color": "white" }} to={'/admin/add-product'}>
                      <FaPlus className="me-2" />Add Product
                    </Link>
                  </div>
                </div>

                {/* Statistics Cards */}
                <Row className="mt-2 g-3">
                  <Col xs={6} md={3}>
                    <div className="table-stat-card">
                      <div className="table-stat-icon total-categories">
                        <FaFolder />
                      </div>
                      <div className="table-stat-content">
                        <h5>{stats.totalCategories}</h5>
                        <span>Total Categories</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="table-stat-card">
                      <div className="table-stat-icon total-products">
                        <FaBox />
                      </div>
                      <div className="table-stat-content">
                        <h5>{stats.totalProducts}</h5>
                        <span>Total Products</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="table-stat-card">
                      <div className="table-stat-icon total-subcategories">
                        <FaFolder />
                      </div>
                      <div className="table-stat-content">
                        <h5>{stats.totalSubcategories}</h5>
                        <span>Subcategories</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="table-stat-card">
                      <div className="table-stat-icon active-categories">
                        <FaFolderOpen />
                      </div>
                      <div className="table-stat-content">
                        <h5>{stats.categoriesWithProducts}</h5>
                        <span>Active Categories</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body className="p-0">
                {error && <Alert variant="danger" className="alert-custom m-3">{error}</Alert>}
                {success && <Alert variant="success" className="alert-custom m-3">{success}</Alert>}

                {/* Enhanced Search and Filter Bar */}
                <div className="table-controls-bar">
                  <div className="table-search-box">
                    <FaSearch className="table-search-icon" />
                    <input
                      type="text"
                      placeholder="Search categories or subcategories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="table-search-input"
                    />
                  </div>
                  <div className="table-filter-controls">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="form-select table-filter-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="with-products">With Products</option>
                      <option value="without-products">Without Products</option>
                    </select>

                    <Button
                      variant="outline-secondary"
                      onClick={toggleExpandAll}
                      className="table-btn-expand-all"
                    >
                      {expandedCategories.size === filteredCategories.length ?
                        <><FaEyeSlash className="me-1" />Collapse All</> :
                        <><FaEye className="me-1" />Expand All</>
                      }
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="loading-spinner"></div>
                    <p className="mt-3 text-muted">Loading categories...</p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-5 empty-state-table text-center">
                    <div className="empty-icon-table">
                      <FaFolderOpen />
                    </div>
                    <h5 className='mb-2'>No categories found</h5>
                    <p className="text-muted mb-4">Try adjusting your search or filter criteria</p>
                    <button onClick={openAddModal} className="btn-add-table-empty">
                      <FaPlus className="me-2" />Add Your First Category
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="category-table">
                      <thead className="table-header-custom">
                        <tr>
                          <th width="5%"></th>
                          <th width="25%" onClick={() => handleSort('name')} className="sortable-header">
                            <div className="d-flex align-items-center">
                              Category Name
                              <span className="sort-icon ms-1">{getSortIcon('name')}</span>
                            </div>
                          </th>
                          <th width="20%">Description</th>
                          <th width="15%" onClick={() => handleSort('products')} className="sortable-header">
                            <div className="d-flex align-items-center">
                              Products
                              <span className="sort-icon ms-1">{getSortIcon('products')}</span>
                            </div>
                          </th>
                          <th width="15%" onClick={() => handleSort('subcategories')} className="sortable-header">
                            <div className="d-flex align-items-center">
                              Subcategories
                              <span className="sort-icon ms-1">{getSortIcon('subcategories')}</span>
                            </div>
                          </th>
                          <th width="20%" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      {filteredCategories.map((category) => (
                        <tbody key={category._id} >
                          <tr className="category-main-row">
                            <td>
                              <Button
                                variant="link"
                                className="expand-btn p-0"
                                onClick={() => toggleCategoryExpansion(category._id)}
                              >
                                {expandedCategories.has(category._id) ?
                                  <FaFolderOpen className="text-primary" /> :
                                  <FaFolder className="text-primary" />
                                }
                              </Button>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {category.image && (
                                  <img
                                    src={category.image}
                                    className="table-category-image me-2"
                                    alt={category.mainCategoryName}
                                    onError={(e) => {
                                      e.target.src = "https://image.pngaaa.com/700/5273700-middle.png";
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="category-name-table fw-semibold">
                                    {category.mainCategoryName}
                                  </div>
                                  <div className="category-meta-table">
                                    <small className="text-muted">ID: {category._id}</small>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="category-description-table">
                                {category.description || 'No description'}
                              </div>
                            </td>
                            <td>
                              <OverlayTrigger placement="top" overlay={ProductCountTooltip}>
                                <Badge bg="success" className="table-product-count">
                                  <FaBox className="me-1" />
                                  {productsByCategory[category._id]?.length || 0}
                                </Badge>
                              </OverlayTrigger>
                            </td>
                            <td>
                              <Badge bg="primary" className="table-subcategory-count">
                                {category.subCategories?.length || 0}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="table-action-btn"
                                  onClick={() => openEditModal(category)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="table-action-btn"
                                  onClick={() => openAddSubcategoryModal(category._id)}
                                >
                                  <FaPlus />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="table-action-btn"
                                  onClick={() => {
                                    setCurrentCategory(category);
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {expandedCategories.has(category._id) && category.subCategories?.length > 0 && (
                            <tr className="subcategory-row">
                              <td colSpan={6}>
                                <div className="subcategories-table-section">
                                  <h6 className="subcategories-table-title mb-3">
                                    <FaFolderOpen className="me-2" />
                                    Subcategories ({category.subCategories.length})
                                  </h6>
                                  <Table size="sm" className="subcategories-table">
                                    <thead>
                                      <tr>
                                        <th width="40%">Subcategory Name</th>
                                        <th width="20%">Products</th>
                                        <th width="20%">ID</th>
                                        <th width="20%" className="text-center">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {category.subCategories.map((sub, index) => (
                                        <tr key={sub._id || `${category._id}-${index}`} className="subcategory-table-row">
                                          <td>
                                            <Link
                                              to={`/products/${category.slug}/${sub.slug}`}
                                              className="subcategory-name-link"
                                            >
                                              {sub.categoryName}
                                            </Link>
                                          </td>
                                          <td>
                                            <OverlayTrigger placement="top" overlay={ProductCountTooltip}>
                                              <Badge bg="outline-success" className="table-sub-product-count">
                                                <FaBox className="me-1" />
                                                {productsBySubCategory[sub._id]?.length || 0}
                                              </Badge>
                                            </OverlayTrigger>
                                          </td>
                                          <td>
                                            <code className="subcategory-id-table">{sub._id}</code>
                                          </td>
                                          <td>
                                            <div className="d-flex justify-content-center gap-2">
                                              <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="table-sub-action-btn"
                                                onClick={() => openEditSubcategoryModal(category, sub)}
                                              >
                                                <FaEdit />
                                              </Button>
                                              <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="table-sub-action-btn"
                                                onClick={() => deleteSubCategoryHandler(category._id, sub._id, sub.categoryName)}
                                              >
                                                <FaTrash />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      ))}
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Keep all your existing modals here */}
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
              {/* {modalMode !== 'edit' && (
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
              )} */}
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
                {/* <Button variant="outline-primary" size="sm" onClick={addSubCategoryField} className="btn-add-sub d-flex align-items-center">
                  <FaPlus className="me-1" />Add Another
                </Button> */}
              </div>
              {formData.subCategories?.map((sub, i) => (
                <div key={i + 10} className="d-flex align-items-center mb-3">
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

      <style>{`
        .category-table-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding: 20px 0;
        }

        .table-glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .table-card-header-custom {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          border-bottom: none;
          padding: 1.5rem;
        }

        /* Statistics Cards */
        .table-stat-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .table-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .table-stat-icon.total-categories { background: #3498db; }
        .table-stat-icon.total-products { background: #2ecc71; }
        .table-stat-icon.active-categories { background: #e74c3c; }
        .table-stat-icon.total-subcategories { background: #9b59b6; }

        .table-stat-content h5 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .table-stat-content span {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        /* Table Controls */
        .table-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .table-search-box {
          position: relative;
          width: 70%;
          flex: 1;
        }

        .table-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 2;
        }

        .table-search-input {
          width: 100%;
          padding: 10px 10px 10px 40px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          background: white;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .table-search-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .table-filter-controls {
          width: 30%;
          display: flex;
          flex-direction: row !important;
          gap: 0.75rem;
          align-items: center;
        }

        .table-filter-select {
          width: 60%;
          border-radius: 6px;
          border: 1px solid #ced4da;
          padding: 8px 12px;
          background: white;
        }

        .table-btn-expand-all {
         display: flex;
          align-items: center;
          justify-content: center;
          width: 40%;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        /* Main Table */
        .category-table {
          margin: 0;
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-header-custom {
          background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
          color: white;
        }

        .table-header-custom th {
          border: none;
          padding: 1rem 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .sortable-header {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .sortable-header:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .sort-icon {
          font-size: 0.8rem;
        }

        /* Table Rows */
        .category-main-row {
          background: white;
          transition: all 0.2s ease;
        }

        .category-main-row:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .category-main-row td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .expand-btn {
          color: #3498db;
          transition: all 0.2s ease;
        }

        .expand-btn:hover {
          color: #2980b9;
          transform: scale(1.1);
        }

        .table-category-image {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid #e9ecef;
        }

        .category-name-table {
          color: #2c3e50;
          font-size: 0.95rem;
        }

        .category-meta-table {
          font-size: 0.8rem;
        }

        .category-description-table {
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1.4;
        }

        .table-product-count, .table-subcategory-count, .table-sub-product-count {
          padding: 6px 10px;
          border-radius: 15px;
          font-weight: 600;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          }
          
          .table-sub-product-count {
            color: #6c757d;
          }

        .table-action-btn, .table-sub-action-btn {
          border-radius: 6px;
          padding: 6px 10px;
          transition: all 0.2s ease;
          border-width: 1px;
        }

        .table-action-btn:hover, .table-sub-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Subcategories Section */
        .subcategory-row {
          background: #f8f9fa;
        }

        .subcategory-row td {
          padding: 0;
          border-bottom: 2px solid #dee2e6;
        }

        .subcategories-table-section {
          padding: 1.5rem;
          background: linear-gradient(to right, #f8f9fa, #ffffff);
        }

        .subcategories-table-title {
          color: #2c3e50;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
        }

        .subcategories-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .subcategories-table thead {
          background: #e9ecef;
        }

        .subcategories-table th {
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: #495057;
          border-bottom: 1px solid #dee2e6;
        }

        .subcategory-table-row {
          transition: all 0.2s ease;
        }

        .subcategory-table-row:hover {
          background: #f8f9fa;
        }

        .subcategory-table-row td {
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .subcategory-name-link {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .subcategory-name-link:hover {
          color: #2980b9;
          text-decoration: underline;
        }

        .subcategory-id-table {
          font-size: 0.8rem;
          color: #6c757d;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        /* Buttons */
        .btn-add-table {
          background: #3498db;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .btn-add-table:hover {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .btn-add-table-empty {
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          margin: 0 auto;
        }

        .btn-add-table-empty:hover {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        /* Empty State */
        .empty-state-table {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
        }

        .empty-icon-table {
          font-size: 3rem;
          color: #bdc3c7;
          margin-bottom: 1rem;
        }

        .delete-confirmation{
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .delete-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
          
        .btn-delete-confirm {
          display: flex;
          align-items: center;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(52, 152, 219, 0.2);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .table-controls-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .table-search-box {
            min-width: 100%;
          }
          
          .table-filter-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .category-table {
            font-size: 0.875rem;
          }
          
          .table-action-btn, .table-sub-action-btn {
            padding: 4px 8px;
            font-size: 0.8rem;
          }
          
          .table-stat-card {
            padding: 0.75rem;
          }
          
          .table-stat-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }

        @media (max-width: 576px) {
          .table-card-header-custom {
            padding: 1rem;
          }
          
          .table-controls-bar {
            padding: 0.75rem 1rem;
          }
          
          .category-main-row td {
            padding: 0.75rem 0.5rem;
          }
          
          .subcategories-table-section {
            padding: 1rem;
          }
          
          .table-filter-controls {
            flex-direction: column;
          }
          
          .table-filter-select, .table-btn-expand-all {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
export default ManageCategoryListPage;
