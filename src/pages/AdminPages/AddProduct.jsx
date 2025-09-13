import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbCameraPlus } from "react-icons/tb";
import { MdCancel } from "react-icons/md";
import { fetchCategoriesAll } from '../../components/CartUtils';

const AddProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Fetch categories from backend API
        const fetchCategories = async () => {
            try {
                const data = await fetchCategoriesAll()
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);


    const [formData, setFormData] = useState({
        productName: '',
        slug: '',
        productDescription: '',
        productImages: [],
        stockKeepingUnit: '',
        productPrice: {
            originalPrice: 0,
            discountedPrice: 0,
            currency: 'USD'
        },
        inventoryStatus: 'in stock',
        stockQuantity: 0,
        sizes: [],
        colors: [],
        meta: {
            title: '',
            description: '',
            keywords: []
        },
        faq: [],
        shipping: {
            shippingCharges: 0,
            isFreeShipping: true,
            estimatedDeliveryDays: 5
        },
        tags: [],
        attributes: {
            material: '',
            lining: '',
            closure: '',
            fit: '',
            weight: '',
            careInstructions: 'Dry clean only',
            season: [],
            style: [],
            gender: 'Men'
        },
        status: true,
        categoryId: ''
    });

    const [currentSize, setCurrentSize] = useState({ size: '', quantity: 0 });
    const [currentColor, setCurrentColor] = useState({ colorName: '', image: '' });
    const [currentFaq, setCurrentFaq] = useState({ question: '', answer: '' });
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [currentSeason, setCurrentSeason] = useState('');
    const [currentStyle, setCurrentStyle] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [errors, setErrors] = useState({});


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => {
                let updated = { ...prev, [name]: value };

                if (name === "productName") {
                    updated.slug = generateSlug(value);
                }

                return updated;
            });
        }
    };

    const handleNestedInputChange = (parent, child, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    };

    const addToArray = (path, item) => {
        if (item) {
            setFormData(prev => {
                const keys = path.split(".");
                const newFormData = { ...prev };
                let ref = newFormData;

                for (let i = 0; i < keys.length - 1; i++) {
                    ref[keys[i]] = { ...ref[keys[i]] };
                    ref = ref[keys[i]];
                }

                const lastKey = keys[keys.length - 1];
                const currentArray = Array.isArray(ref[lastKey]) ? ref[lastKey] : [];
                ref[lastKey] = [...currentArray, item];

                return newFormData;
            });
        }
    };

    // const removeFromArray = (arrayName, index) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    //     }));
    // };

    const removeFromArray = (path, index) => {
        setFormData(prev => {
            const updated = structuredClone(prev); // works in modern browsers
            const keys = path.split(".");

            // Navigate to the parent of the array
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }

            const lastKey = keys[keys.length - 1];
            obj[lastKey] = obj[lastKey].filter((_, i) => i !== index);

            return updated;
        });
    };


    // const handleImageUpload = (e) => {
    //     const files = Array.from(e.target.files);
    //     setImageFiles(files);

    //     Convert images to base64 for preview (in a real app, you'd upload to a server)
    //     const imagePromises = files.map(file => {
    //         return new Promise((resolve) => {
    //             const reader = new FileReader();
    //             reader.onload = (e) => resolve(e.target.result);
    //             reader.readAsDataURL(file);
    //         });
    //     });

    //     Promise.all(imagePromises).then(base64Images => {
    //         setFormData(prev => ({
    //             ...prev,
    //             productImages: [...prev.productImages, ...base64Images]
    //         }));
    //     });
    // };

    const handleImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedImages = [...formData.productImages];
                updatedImages[index] = reader.result;
                setFormData({ ...formData, productImages: updatedImages });
            };
            reader.readAsDataURL(file);
        }
    };


    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            productImages: prev.productImages.filter((_, i) => i !== index)
        }));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        console.log(imageFiles);
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // const handleSlugGeneration = () => {
    //     if (formData.productName) {
    //         setFormData(prev => ({
    //             ...prev,
    //             slug: generateSlug(prev.productName)
    //         }));
    //     }
    // };
    const validateForm = (onSubmit = false) => {
        const newErrors = {};

        // Product Name
        if (!formData.productName || formData.productName.trim() === "") {
            newErrors.productName = "Product name is required";
        }

        // Slug
        if (!formData.slug || formData.slug.trim() === "") {
            newErrors.slug = "Slug is required";
        }

        // Description
        if (!formData.productDescription || formData.productDescription.trim() === "") {
            newErrors.productDescription = "Product description is required";
        }

        // Images (Amazon requires at least 1, but we allowed 6 slots earlier)
        if (!formData.productImages || formData.productImages.filter(Boolean).length === 0) {
            newErrors.productImages = ["Please upload at least one product image"];
        }

        // Prices
        const checkOriginalPrice = parseFloat(formData.productPrice.originalPrice);
        const checkDiscountedPrice = parseFloat(formData.productPrice.discountedPrice);
        console.log("Validating prices:", { checkOriginalPrice, checkDiscountedPrice });

        if (isNaN(checkOriginalPrice) || checkOriginalPrice <= 0) {
            newErrors.originalPrice = "Original price must be greater than 0";
        }

        if (!isNaN(checkDiscountedPrice) && checkOriginalPrice < checkDiscountedPrice) {
            newErrors.discountedPrice = "Discounted price cannot exceed original price";
        }

        // Stock
        if (
            formData.stockQuantity === "" ||
            formData.stockQuantity === undefined ||
            Number(formData.stockQuantity) < 0
        ) {
            newErrors.stockQuantity = "Stock quantity is required and cannot be negative";
        }

        setErrors(newErrors);
        console.log("Validation errors:", newErrors);

        if (onSubmit && Object.keys(newErrors).length > 0) {
            const firstErrorKey = Object.keys(newErrors)[0];
            const errorElement = document.getElementById(firstErrorKey);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                errorElement.focus();
            }
        }
        setShowButton(Object.keys(newErrors).length === 0);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Run validation whenever formData updates
    useEffect(() => {
        validateForm(false);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isValid = validateForm(true);
            if (!isValid) {
                return;
            }

            // ✅ If form is valid, proceed
            console.log("Product data:", formData);

            // Simulate API call
            alert("Product added successfully!");
            navigate("/category/men");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Please try again.");
        }
    };


    return (
        <div className="add-product-container">
            <h1 className='mb-3'>The Master Jackets</h1>
            <hr className="border-dark border-3 opacity-75" />

            <form onSubmit={handleSubmit} className="add-product-form" noValidate>
                {/* Basic Information */}
                <h1 className='mt-3'>Add New Product</h1>
                <div className="add-product-form-section">
                    <h2>Basic Information</h2>
                    <div className="add-product-form-group">
                        <label htmlFor="productName">Product Title *</label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleInputChange}
                            required
                            maxLength={100}
                            placeholder="Enter product name"
                            className={errors.productName ? "input-error" : ""}
                        />
                        {errors.productName && (
                            <p className="error-text-amazon">{errors.productName}</p>
                        )}
                        <span className="char-count">{formData.productName.length}/100</span>
                    </div>

                    <div className="add-product-form-group">
                        <label htmlFor="slug">Slug *</label>
                        <div className="slug-input-group">
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                required
                                placeholder="product-slug"
                                className={errors.slug ? "input-error" : ""}
                            />
                            {errors.slug && (
                                <p className="error-text-amazon">{errors.slug}</p>
                            )}
                            {/* <button
                                type="button"
                                onClick={handleSlugGeneration}
                                className="generate-slug-btn"
                            >
                                Generate from Name
                            </button> */}
                        </div>

                    </div>

                    <div className="add-product-form-group">
                        <label htmlFor="productDescription">Description *</label>
                        <textarea
                            id="productDescription"
                            name="productDescription"
                            value={formData.productDescription}
                            onChange={handleInputChange}
                            required
                            minLength={20}
                            placeholder="Enter detailed product description (minimum 20 characters)"
                            className={errors.productDescription ? "input-error" : ""}
                            rows={4}
                        />
                        {errors.productDescription && (
                            <p className="error-text-amazon">{errors.productDescription}</p>
                        )}
                        <span className="char-count">{formData.productDescription.length} characters</span>
                    </div>

                    {/* Attributes */}
                    <div className="aadd-product-form-group">
                        <h2>Product Attributes</h2>

                        <div className="form-row">
                            <div className="add-product-form-group">
                                <label htmlFor="material">Material</label>
                                <input
                                    type="text"
                                    id="material"
                                    name="attributes.material"
                                    value={formData.attributes.material}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Leather, Cotton"
                                />
                            </div>

                            <div className="add-product-form-group">
                                <label htmlFor="lining">Lining</label>
                                <input
                                    type="text"
                                    id="lining"
                                    name="attributes.lining"
                                    value={formData.attributes.lining}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Polyester, Silk"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="add-product-form-group">
                                <label htmlFor="closure">Closure</label>
                                <input
                                    type="text"
                                    id="closure"
                                    name="attributes.closure"
                                    value={formData.attributes.closure}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Zipper, Buttons"
                                />
                            </div>

                            <div className="add-product-form-group">
                                <label htmlFor="fit">Fit</label>
                                <input
                                    type="text"
                                    id="fit"
                                    name="attributes.fit"
                                    value={formData.attributes.fit}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Regular, Slim"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="add-product-form-group">
                                <label htmlFor="weight">Weight</label>
                                <input
                                    type="text"
                                    id="weight"
                                    name="attributes.weight"
                                    value={formData.attributes.weight}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 1.5 kg, 3.3 lbs"
                                />
                            </div>

                            <div className="add-product-form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    name="attributes.gender"
                                    value={formData.attributes.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                        </div>

                        <div className="add-product-form-group">
                            <label htmlFor="careInstructions">Care Instructions</label>
                            <textarea
                                id="careInstructions"
                                name="attributes.careInstructions"
                                value={formData.attributes.careInstructions}
                                onChange={handleInputChange}
                                rows={2}
                                placeholder="Care instructions for the product"
                            />
                        </div>

                        {/* Seasons */}
                        <div className="add-product-form-group">
                            <label>Seasons</label>
                            <div className="array-input-group">
                                <div className="input-row">
                                    <input
                                        type="text"
                                        placeholder="Add season (e.g., Winter, Summer)"
                                        value={currentSeason}
                                        onChange={(e) => setCurrentSeason(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentSeason) {
                                                addToArray('attributes.season', currentSeason);
                                                setCurrentSeason('');
                                            }
                                        }}
                                    >
                                        Add Season
                                    </button>
                                </div>

                                <div className="array-items">
                                    {formData.attributes.season.map((season, index) => (
                                        <div key={index} className="array-item">
                                            <span>{season}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFromArray('attributes.season', index)}
                                                className="remove-btn"
                                            >
                                                <MdCancel />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Styles */}
                        <div className="add-product-form-group">
                            <label>Styles</label>
                            <div className="array-input-group">
                                <div className="input-row">
                                    <input
                                        type="text"
                                        placeholder="Add style (e.g., Casual, Formal)"
                                        value={currentStyle}
                                        onChange={(e) => setCurrentStyle(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentStyle) {
                                                addToArray('attributes.style', currentStyle);
                                                setCurrentStyle('');
                                            }
                                        }}
                                    >
                                        Add Style
                                    </button>
                                </div>

                                <div className="array-items">
                                    {formData.attributes.style.map((style, index) => (
                                        <div key={index} className="array-item">
                                            <span>{style}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFromArray('attributes.style', index)}
                                                className="remove-btn"
                                            >
                                                <MdCancel />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="add-product-form-section">
                    <h2>Product Images</h2>
                    <div className="add-product-form-group">
                        {errors.productImages && (
                            <p className="error-text-amazon">{errors.productImages}</p>
                        )}
                        <div className="image-grid">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className={`image-box ${errors.productImages && errors.productImages[index] ? "input-error" : ""}`}>
                                    {formData.productImages[index] ? (
                                        <div className="image-preview">
                                            <img
                                                src={formData.productImages[index]}
                                                alt={`Preview ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="remove-image-btn"
                                            >
                                                <MdCancel />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="upload-placeholder">
                                            <TbCameraPlus />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) => handleImageUpload(e, index)}
                                                className={errors.productImages ? "input-error" : ""}
                                            />

                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="add-product-form-section">
                    <h2>Specifications</h2>
                    <div className="add-product-form-group">
                        <label htmlFor="stockKeepingUnit">SKU (Stock Keeping Unit) *</label>
                        <input
                            type="text"
                            id="stockKeepingUnit"
                            name="stockKeepingUnit"
                            value={formData.stockKeepingUnit}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., PROD-001"
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>
                </div>

                {/* Inventory */}
                <div className="add-product-form-section">
                    <h2>Inventory Management</h2>

                    <div className="form-row">
                        <div className="add-product-form-group">
                            <label htmlFor="inventoryStatus">Inventory Status</label>
                            <select
                                id="inventoryStatus"
                                name="inventoryStatus"
                                value={formData.inventoryStatus}
                                onChange={handleInputChange}
                            >
                                <option value="in stock">In Stock</option>
                                <option value="out of stock">Out of Stock</option>
                                <option value="preorder">Preorder</option>
                            </select>
                        </div>

                        <div className="add-product-form-group">
                            <label htmlFor="stockQuantity">Stock Quantity *</label>
                            <input
                                type="number"
                                id="stockQuantity"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleInputChange}
                                required
                                min="0"
                                className={errors.stockQuantity ? "input-error" : ""}
                            />
                            {errors.stockQuantity && (
                                <p className="error-text-amazon">{errors.stockQuantity}</p>
                            )}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="add-product-form-group">
                        <label>Available Sizes</label>
                        <div className="array-input-group">
                            <div className="input-row">
                                <select
                                    value={currentSize.size}
                                    onChange={(e) => setCurrentSize({ ...currentSize, size: e.target.value })}
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
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={currentSize.quantity}
                                    onChange={(e) => setCurrentSize({ ...currentSize, quantity: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        addToArray('sizes', currentSize);
                                        setCurrentSize({ size: '', quantity: 0 });
                                    }}
                                    disabled={!currentSize.size}
                                >
                                    Add Size
                                </button>
                            </div>

                            <div className="array-items">
                                {formData.sizes.map((size, index) => (
                                    <div key={index} className="array-item">
                                        <span>{size.size} - Qty: {size.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('sizes', index)}
                                            className="remove-btn"
                                        >
                                            <MdCancel />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="add-product-form-group">
                            <div className="array-input-group">
                                <label htmlFor="colorName">Color Variation</label>
                                <div className="input-row">
                                    <input
                                        type="text"
                                        placeholder="Color Name"
                                        value={currentColor.colorName}
                                        onChange={(e) => setCurrentColor({ ...currentColor, colorName: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={currentColor.image}
                                        onChange={(e) => setCurrentColor({ ...currentColor, image: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            addToArray('colors', currentColor);
                                            setCurrentColor({ colorName: '', image: '' });
                                        }}
                                        disabled={!currentColor.colorName}
                                    >
                                        Add Color
                                    </button>
                                </div>

                                <div className="array-items">
                                    {formData.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="color-item"
                                        >
                                            <div className="color-thumb">
                                                <img src={color.image} alt={color.colorName} />
                                            </div>
                                            <span className="color-name">{color.colorName}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFromArray("colors", index)}
                                                className="color-remove-btn"
                                            >
                                                <MdCancel />
                                            </button>
                                        </div>

                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                {/* <div className="add-product-form-group">
                    <h2>Product Images</h2>

                    <div className="add-product-form-group">
                        <label>Upload Images *</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <p className="help-text">Select one or more product images</p>

                        <div className="image-previews">
                            {formData.productImages.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img src={image} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="remove-image-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div> */}

                {/* Pricing */}
                <div className="add-product-form-section">
                    <h2>Pricing Information</h2>

                    <div className="form-row">
                        <div className="add-product-form-group">
                            <label htmlFor="originalPrice">Original Price ($) *</label>
                            <input
                                type="number"
                                id="originalPrice"
                                name="productPrice.originalPrice"
                                value={formData.productPrice.originalPrice}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className={errors.originalPrice ? "input-error" : ""}
                            />
                            {errors.originalPrice && (
                                <p className="error-text-amazon">{errors.originalPrice}</p>
                            )}
                        </div>

                        <div className="add-product-form-group">
                            <label htmlFor="discountedPrice">Discounted Price ($) *</label>
                            <input
                                type="number"
                                id="discountedPrice"
                                name="productPrice.discountedPrice"
                                value={formData.productPrice.discountedPrice}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className={errors.discountedPrice ? "input-error" : ""}
                            />
                            {errors.discountedPrice && (
                                <p className="error-text-amazon">{errors.discountedPrice}</p>
                            )}
                        </div>

                        <div className="add-product-form-group">
                            <label htmlFor="currency">Currency</label>
                            <select
                                id="currency"
                                name="productPrice.currency"
                                value={formData.productPrice.currency}
                                onChange={handleInputChange}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SEO Meta */}
                <div className="add-product-form-section">
                    <h2>SEO Information</h2>

                    <div className="add-product-form-group">
                        <label htmlFor="metaTitle">Meta Title</label>
                        <input
                            type="text"
                            id="metaTitle"
                            name="meta.title"
                            value={formData.meta.title}
                            onChange={handleInputChange}
                            placeholder="Meta title for SEO"
                        />
                    </div>

                    <div className="add-product-form-group">
                        <label htmlFor="metaDescription">Meta Description</label>
                        <textarea
                            id="metaDescription"
                            name="meta.description"
                            value={formData.meta.description}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Meta description for SEO"
                        />
                    </div>

                    <div className="add-product-form-group">
                        <label>Keywords</label>
                        <div className="array-input-group">
                            <div className="input-row">
                                <input
                                    type="text"
                                    placeholder="Add keyword"
                                    value={currentKeyword}
                                    onChange={(e) => setCurrentKeyword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (currentKeyword) {
                                            addToArray('meta.keywords', currentKeyword);
                                            setCurrentKeyword('');
                                        }
                                    }}
                                >
                                    Add Keyword
                                </button>
                            </div>

                            <div className="array-items">
                                {formData.meta.keywords.map((keyword, index) => (
                                    <div key={index} className="array-item">
                                        <span>{keyword}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('meta.keywords', index)}
                                            className="remove-btn"
                                        >
                                            <MdCancel />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="add-product-form-section">
                    <h2>Product Tags</h2>

                    <div className="add-product-form-group">
                        <div className="array-input-group">
                            <div className="input-row">
                                <input
                                    type="text"
                                    placeholder="Add tag"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (currentTag) {
                                            addToArray('tags', currentTag);
                                            setCurrentTag('');
                                        }
                                    }}
                                >
                                    Add Tag
                                </button>
                            </div>

                            <div className="array-items">
                                {formData.tags.map((tag, index) => (
                                    <div key={index} className="array-item">
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('tags', index)}
                                            className="remove-btn"
                                        >
                                            <MdCancel />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div className="add-product-form-section">
                    <h2>Shipping Information</h2>

                    <div className="form-row">
                        <div className="add-product-form-group">
                            <label htmlFor="shippingCharges">Shipping Charges ($)</label>
                            <input
                                type="number"
                                id="shippingCharges"
                                name="shipping.shippingCharges"
                                value={formData.shipping.shippingCharges}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="add-product-form-group">
                            <label htmlFor="estimatedDeliveryDays">Estimated Delivery Days</label>
                            <input
                                type="number"
                                id="estimatedDeliveryDays"
                                name="shipping.estimatedDeliveryDays"
                                value={formData.shipping.estimatedDeliveryDays}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="add-product-form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="shipping.isFreeShipping"
                                checked={formData.shipping.isFreeShipping}
                                onChange={(e) => handleNestedInputChange('shipping', 'isFreeShipping', e.target.checked)}
                            />
                            Free Shipping
                        </label>
                    </div>
                </div>

                {/* Status */}
                <div className="add-product-form-section">
                    <h2>Product Status</h2>

                    <div className="add-product-form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                            />
                            Active Product
                        </label>
                    </div>

                    <div className="add-product-form-group">
                        <label htmlFor="categoryId">Category ID *</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            required
                        >
                            <option disabled value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.mainCategoryName}
                                </option>
                            ))}
                        </select>
                        {/* <input
                            type="text"
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter category ID"
                        /> */}
                    </div>
                </div>

                {/* FAQ */}
                <div className="add-product-form-section">
                    <h2>Frequently Asked Questions</h2>

                    <div className="add-product-form-group">
                        <div className="array-input-group">
                            <div className="faq-input">
                                <input
                                    type="text"
                                    placeholder="Question"
                                    value={currentFaq.question}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                />
                                <textarea
                                    placeholder="Answer"
                                    value={currentFaq.answer}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (currentFaq.question && currentFaq.answer) {
                                            addToArray('faq', currentFaq);
                                            setCurrentFaq({ question: '', answer: '' });
                                        }
                                    }}
                                >
                                    Add FAQ
                                </button>
                            </div>

                            <div className="array-items">
                                {formData.faq.map((faq, index) => (
                                    <div key={index} className="array-item faq-item">
                                        <div>
                                            <strong>Q: {faq.question}</strong>
                                            <p>A: {faq.answer}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('faq', index)}
                                            className="remove-btn"
                                        >
                                            <MdCancel />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/products')} className="cancel-btn">
                        Cancel
                    </button>
                    {showButton ? (<button type="submit" className="submit-btn">
                        Add Product
                    </button>) : (<button type="submit" className="error-btn">
                        Fix the errors to submit
                    </button>)}
                </div>
            </form>

            <style jsx>{`.add-product-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
  color: #2c1810; 
  text-align: center;
  font-size: 2rem; 
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  letter-spacing: 1px; 
  position: relative;
}

    h2 {
  color: #2c1810;
  margin-bottom: 25px;
  padding-bottom: 12px;
  font-family: Arial, Helvetica, sans-serif !important;
  font-size: 1.5rem; 
  font-weight: bold;
  border-bottom: 3px solid #D6AD60; 
  position: relative;
}

h2::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 60px;
  height: 3px;
  background-color: #3E2C1C;
}


.add-product-form-section {
    background: #fcf4e4ff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 8px;
}

.add-product-form-group {
    margin-bottom: 15px;
}

.form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
}

.form-row .add-product-form-group {
    flex: 1;
    margin-bottom: 0;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #3E2C1C;
}

input,
select,
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #a4a4a4ff;
    border-radius: 4px;
    font-size: 14px;
}

textarea {
    resize: vertical;
    min-height: 80px;
}

.char-count {
    font-size: 12px;
    color: #3E2C1C;
    display: block;
    margin-top: 5px;
}

.slug-input-group {
    display: flex;
    gap: 10px;
}

.slug-input-group input {
    flex: 1;
}

.generate-slug-btn {
    padding: 10px 15px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
}

.generate-slug-btn:hover {
    background: #0056b3;
}
///////////////////////////////////////////////////////////////////////////////////////////
.array-input-group {
    margin-top: 10px;
}

.input-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.input-row input,
.input-row select {
    flex: 1;
}

.input-row button {
    padding: 10px 15px;
    background: #3E2C1C;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
}

.input-row button:hover {
    background: #5e3b1f;
}

.input-row button:disabled {
    background: #fcedd1ff;
    cursor: not-allowed;
}

.array-items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.array-item {
    background: #fcedd1ff;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.faq-item {
    flex-direction: column;
    align-items: flex-start;
    border-radius: 8px;
    padding: 12px;
    background: #fcedd1ff;
}

.faq-item div {
    flex: 1;
}

.remove-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    padding: 0;
}

.faq-input {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.faq-input textarea {
    min-height: 60px;
}

.faq-input button {
    padding: 10px 15px;
    background: #3E2C1C;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
}

.faq-input button:hover {
    background: #5e3b1f;
}

.remove-image-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
}

.help-text {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: normal;
}

.checkbox-label input {
    width: auto;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #fcedd1ff;
}

.cancel-btn {
    padding: 12px 25px;
    background: #604949ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.submit-btn {
    padding: 12px 25px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.submit-btn:hover {
    background: #218838;
    transform: translateY(-2px);
}

.error-btn {
    padding: 12px 25px;
    background: #dc3545; 
    color: white;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
}
.error-btn:hover {
    background: #a71d2a;
    transform: translateY(-2px);
}

.error-text-amazon{
color: #e03105ff; 
  font-size: 14px;
  margin-top: 4px;
}
  .input-error {
  border: 2px solid #e03105ff !important;
  background-color: #fff5f5;
}
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
    }

    .slug-input-group {
        flex-direction: column;
    }

    .input-row {
        flex-direction: column;
    }
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.image-box {
  width: 100%;
  aspect-ratio: 1 / 1; /* keeps it square */
  border: 2px dashed #bfbfbfff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #fcedd1ff;
}

.upload-placeholder {
    font-size: 44px;
  color: #666;
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 10px;
  position: relative;
  transition: all 0.2s ease;
}

.color-item:hover {
  border-color: #3E2C1C;
  transform: translateY(-3px);
}

.color-thumb img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.color-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.color-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #b12704;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.color-remove-btn:hover {
  background: #7d1c03;
}

`}</style>
        </div>
    );
};

export default AddProductPage;

// .image-previews {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 15px;
//     margin-top: 15px;
// }

// .image-preview {
//     position: relative;
//     width: 100px;
//     height: 100px;
//     border: 1px solid #ddd;
//     border-radius: 4px;
//     overflow: hidden;
// }

// .image-preview img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
// }
