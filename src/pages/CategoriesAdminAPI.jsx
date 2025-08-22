import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Spinner, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen, FaSearch, FaSort, FaFilter } from 'react-icons/fa';
import './CategoriesAdminAPI.css';

const api = axios.create({
  baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CategoryListPage = () => {
  // State
  const [categories, setCategories] = useState([]);
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

  // Form state
  const [formData, setFormData] = useState({
    mainCategoryName: '',
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

  // Fetch categories
  const getAllCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/category/fetch-all/68762589a469c496106e01d4');
      setCategories(res.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  // Toast notification
  const showToast = (icon, message) => {
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

  // Reset form
  const resetForm = () => {
    setFormData({
      mainCategoryName: '',
      subCategories: [{ categoryName: '' }],
    });
  };

  // Input change (mainCategoryName only)
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
  const addCategory = async () => {
    try {
      setLoading(true);
      await api.post('/api/category/add/68762589a469c496106e01d4', formData);
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

  const updateCategory = async () => {
    try {
      setLoading(true);
      await api.put(`/api/category/update/main-category/68762589a469c496106e01d4`, {
        categoryId: currentCategory._id,
        updateMainCategoryName: formData.mainCategoryName,
      });
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

  const updateSingleSubcategory = async () => {
    try {
      setLoading(true);
      await api.put(`/api/category/add/sub-category/68762589a469c496106e01d4`, {
        categoryId: parentCategoryForEdit._id,
        subCategories: [{categoryName:formData.subCategories[0].categoryName}]
      });
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

  const deleteCategory = async () => {
    try {
      setLoading(true);
      await api.delete(
        `/api/category/delete/main-category/68762589a469c496106e01d4?mainCategoryId=${currentCategory._id}`
      );
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

  const addSubCategory = async () => {
    try {
      setLoading(true);
      await api.put(`/api/category/add/sub-category/68762589a469c496106e01d4`, {
        categoryId: parentCategoryId,
        subCategories: formData.subCategories,
      });
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

  const deleteSubCategory = async (categoryId, subcategoryId, subcategoryName) => {
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
        await api.delete(
          `/api/category/delete/sub-category/68762589a469c496106e01d4?mainCategoryId=${categoryId}&subCategoryId=${subcategoryId}`
        );
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

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.mainCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subCategories?.some(sub => 
      sub.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await addCategory();
      } else {
        await updateCategory();
      }
    } catch (err) {
      // Error handling is done in the individual functions
    }
  };

  return (
    <div className="cm-fixed-container">
      <div className="cm-fixed-header">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="glass-card">
              <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
                <div className='cm-fixed-title-section'>
                  <h4 className="mb-0"><FaFolder className="me-2" />Category Manager</h4>
                  <p className="mb-0">Manage your product categories and subcategories</p>
                </div>
                <Button variant="primary" className="btn-add" onClick={openAddModal}>
                  <FaPlus className="me-2" />Add Category
                </Button>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger" className="alert-custom">{error}</Alert>}
                {success && <Alert variant="success" className="alert-custom">{success}</Alert>}

                {/* Search and Filter Bar */}
                <div className="search-filter-bar mb-4">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  {/* <div className="filter-section">
                    <button className="btn-filter">
                      <FaFilter className="me-2" /> Filter
                    </button>
                    <button className="btn-sort">
                      <FaSort className="me-2" /> Sort
                    </button>
                  </div> */}
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="loading-spinner"></div>
                    <p className="mt-3">Loading categories...</p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-5 empty-state-found">
                    <div className="empty-icon-found">
                      <FaFolderOpen />
                    </div>
                    <h5 className='mb-2'>No categories found</h5>
                    <p className="text-muted mb-2">Get started by adding your first category.</p>
                    <button onClick={openAddModal} className="btn-add-no-found">
                      Add Category
                    </button>
                  </div>
                ) : (
                  <div className="categories-container">
                    {filteredCategories.map((category) => (
                      <div key={category._id} className="category-card">
                        <div className="category-header">
                          <div 
                            className="category-title"
                            onClick={() => toggleCategoryExpansion(category._id)}
                          >
                            <div className="d-flex align-items-center">
                              {expandedCategories.has(category._id) ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
                              <h5 className="mb-0">{category.mainCategoryName}</h5>
                            </div>
                            <Badge bg="primary" className='p-2 me-2' pill>
                              {category.subCategories?.length || 0} subcategories
                            </Badge>
                          </div>
                          <div className="category-actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2 p-3"
                              onClick={() => openEditModal(category)}
                            >
                              <FaEdit className="me-1" />Edit
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              onClick={() => openAddSubcategoryModal(category._id)}
                            >
                              <FaPlus className="me-1" />Add Subcategory
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
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
                        {expandedCategories.has(category._id) && category.subCategories?.length > 0 && (
                          <div className="subcategories-list">
                            {category.subCategories.map((sub, index) => (
                              <div key={sub._id || `${category._id}-${index}`} className="subcategory-item">
                                <div className="subcategory-info">
                                  <span className="subcategory-name">{sub.categoryName}</span>
                                </div>
                                <div className="subcategory-actions">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => openEditSubcategoryModal(category, sub)}
                                  >
                                    <FaEdit className="me-1" />Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => deleteSubCategory(category._id, sub._id, sub.categoryName)}
                                  >
                                    <FaTrash className="me-1" />Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
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

              {/* Only allow adding subcategories on add mode */}
              {modalMode !== 'edit' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="mb-0">Subcategories</Form.Label>
                    <Button variant="outline-primary" size="sm" onClick={addSubCategoryField} className="btn-add-sub">
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
              addSubCategory();
            }}
          >
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Label className="mb-0">Subcategories</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addSubCategoryField} className="btn-add-sub">
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
              updateSingleSubcategory();
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
                  'Update'
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
            <Button variant="danger" onClick={deleteCategory} disabled={loading} className="btn-delete-confirm">
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
    </div>
  );
};

export default CategoryListPage;