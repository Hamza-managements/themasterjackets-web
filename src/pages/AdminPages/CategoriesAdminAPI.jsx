import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Spinner, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen, FaSearch } from 'react-icons/fa';
import { addCategory, addSubCategory, deleteCategory, deleteSubCategory, fetchCategoriesAll, updateCategory, updateSingleSubcategory } from '../../utils/CartUtils';

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
  const [, setSubcategoryToEdit] = useState(null);
  const [parentCategoryForEdit, setParentCategoryForEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

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
      console.log(data)
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
      description: '',
      image: '',
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
  const addCategoryHandler = async (formData) => {
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
      }
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
        subCategories: [{ categoryName: formData.subCategories[0].categoryName }]
      }
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
      }
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
        await addCategoryHandler();
      } else {
        await updateCategoryHandler();
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
                              <h5 className="mb-0 me-2"> {category.mainCategoryName} </h5>
                              <h5 className="mb-0 me-2"> {category.slug} </h5>
                              <h5 className="mb-0 me-2"> {category._id} </h5>
                            </div>
                            <img src={category.image || "https://image.pngaaa.com/700/5273700-middle.png"} className='image-category-admin' alt="" />
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
                            <p className="mb-3">Description: {category.description}</p>
                            <h6 className="subcategories-title">Subcategories:</h6>
                            {category.subCategories.map((sub, index) => (
                              <div key={sub._id || `${category._id}-${index}`} className="subcategory-item">
                                <div className="subcategory-info">
                                  <h4 className="subcategory-name">{sub.categoryName}</h4>
                                  <br />
                                  <span className="subcategory-id">ID: {sub._id}</span>
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
                                    onClick={() => deleteSubCategoryHandler(category._id, sub._id, sub.categoryName)}
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
              </Form.Group><Form.Group className="mb-4">
                <Form.Label>Category Image</Form.Label>
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
        .category-manager {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);F
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.card-header-custom {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-bottom: none;
  padding: 1.5rem 2rem;
}

.alert-custom {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  background: white;
}

.filter-section {
  display: flex;
  gap: 10px;
}

.btn-filter, .btn-sort {
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.8);
  color: #495057;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.btn-filter:hover, .btn-sort:hover {
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 123, 255, 0.2);
  border-radius: 50%;
  border-top: 5px solid #007bff;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state-found {
  display: flex;
  flex-direction: column; 
  justify-content: center;
  align-items: center;
  padding: 4rem;
}

.empty-icon-found {
  font-size: 4rem;
  color: #656262;
  margin-bottom: 1rem;
}

.btn-add-no-found{
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-add, .btn-add-lg {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
}

.btn-add:hover, .btn-add-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 117, 252, 0.4);
}

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  background: linear-gradient(to right, rgba(245, 247, 250, 0.5), rgba(255, 255, 255, 0.8));
}

.category-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.category-title h5 {
  color: #2c3e50;
  margin: 0;
}

.category-title img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.category-actions .btn {
  display: flex;
  align-items: center;
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 16px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.subcategories-list {
  padding: 0 1.5rem 1.5rem;
  background: rgba(245, 247, 250, 0.5);
}

.subcategory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-top: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.subcategory-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.subcategory-name {
  font-weight: 500;
  color: #34393dff;
}
 
.subcategory-id {
  font-size: 0.85rem;
  color: #676a6eff; 
  }  

.subcategory-actions {
  display: flex;
  gap: 0.5rem;
}

.subcategory-actions .btn {
  display: flex;
  align-items: center;
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.custom-modal .modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header-custom {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
}

.modal-footer-custom {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 0 0 16px 16px;
}

.form-control-custom {
  border-radius: 10px;
  padding: 12px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-control-custom:focus {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  border-color: #007bff;
}

.btn-add-sub {
  border-radius: 20px;
  font-size: 0.85rem;
  padding: 5px 12px;
}

.btn-remove {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-save {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 50px;
  padding: 10px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 117, 252, 0.4);
}

.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.delete-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.btn-delete-confirm {
   background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 75, 43, 0.4);
}

/* Animation for expanding categories */
.subcategories-list {
  animation: slideDown 0.3s ease-out;
}

.subcategories-list p {
  margin: 0;
  color: #313232;
  font-size: 1rem;
  opacity: 0.9;
}

.subcategories-title {
  font-weight: 600;
  color: #343a40;
  margin-bottom: 10px;
  font-size: 1.1rem;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 5px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
    max-width: 100%;
  }
`}</style>
    </div>

  );
};

export default CategoryListPage;