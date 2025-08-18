import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const CategoryListPage = () => {
    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentCategory, setCurrentCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [parentCategoryId, setParentCategoryId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    axios.defaults.baseURL = "https://themasterjacketsbackend-production.up.railway.app";

    // Attach token automatically to every request
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem("token"); // safely grab token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Fetch all categories
    const getAllCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/category/fetch-all/68762589a469c496106e01d4");
            setCategories(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getAllCategories();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            isActive: true
        });
    };

    // Open modal for adding a new category
    const openAddModal = () => {
        setModalMode('add');
        resetForm();
        setShowModal(true);
    };

    // Open modal for editing a category
    const openEditModal = (category) => {
        setModalMode('edit');
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            isActive: category.isActive
        });
        setShowModal(true);
    };

    // Open modal for adding a subcategory
    const openAddSubcategoryModal = (categoryId) => {
        setParentCategoryId(categoryId);
        resetForm();
        setShowSubcategoryModal(true);
    };

    // Handle category form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await addCategory();
            } else {
                await updateCategory();
            }
            setShowModal(false);
            getAllCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // Add new category
    const addCategory = async () => {
        await axios.post('/api/categories', formData);
    };

    // Update existing category
    const updateCategory = async () => {
        await axios.put(`/api/categories/${currentCategory._id}`, formData);
    };

    // Delete category
    const deleteCategory = async () => {
        try {
            await axios.delete(`/api/categories/${currentCategory._id}`);
            setShowDeleteConfirm(false);
            getAllCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // Add subcategory
    const addSubCategory = async () => {
        try {
            await axios.post(`/api/categories/${parentCategoryId}/subcategories`, formData);
            setShowSubcategoryModal(false);
            getAllCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete subcategory
    const deleteSubCategory = async (categoryId, subcategoryId) => {
        try {
            await axios.delete(`/api/categories/${categoryId}/subcategories/${subcategoryId}`);
            getAllCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // Toggle category status
    const toggleCategoryStatus = async (categoryId, currentStatus) => {
        try {
            await axios.patch(`/api/categories/${categoryId}/status`, {
                isActive: !currentStatus
            });
            getAllCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Category Management</h2>
                <Button variant="primary" onClick={openAddModal}>
                    Add Category
                </Button>
            </div>

            {/* Categories Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        {/* <th>Description</th> */}
                        {/* <th>Status</th> */}
                        <th>Subcategories</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <React.Fragment key={category._id}>
                            <tr>
                                <td>{category.mainCategoryName}</td>
                                {/* <td>{category.description}</td> */}
                                {/* <td>
                                    <Badge pill bg={category.isActive ? 'success' : 'secondary'}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td> */}
                                <td>
                                    {category.subCategories?.length || 0}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(category)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openAddSubcategoryModal(category._id)}
                                    >
                                        Add Subcategory
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentCategory(category);
                                            setShowDeleteConfirm(true);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                    {/* <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                                    >
                                        {category.isActive ? 'Deactivate' : 'Activate'}
                                    </Button> */}
                                </td>
                            </tr>

                            {/* Subcategories */}
                            {category.subCategories?.map((subcategory) => (
                                <tr key={subcategory._id} className="bg-light">
                                    <td className="ps-5">↳ {subcategory.categoryName}</td>
                                    {/* <td>{subcategory.description}</td> */}
                                    {/* <td>
                                        <Badge pill bg={subcategory.isActive ? 'success' : 'secondary'}>
                                            {subcategory.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td> */}
                                    <td></td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => deleteSubCategory(category._id, subcategory._id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>

            {/* Category Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Add New Category' : 'Edit Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            id="isActive"
                            name="isActive"
                            label="Active"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {modalMode === 'add' ? 'Add Category' : 'Update Category'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Subcategory Add Modal */}
            <Modal show={showSubcategoryModal} onHide={() => setShowSubcategoryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Subcategory</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    addSubCategory();
                }}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            id="isActive"
                            name="isActive"
                            label="Active"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSubcategoryModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Subcategory
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the category "{currentCategory?.name}"? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteCategory}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CategoryListPage;