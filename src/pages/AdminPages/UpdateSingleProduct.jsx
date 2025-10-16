import React, { useState, useEffect } from 'react';
import Swal from "sweetalert2";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash,
    Upload,
    Image as ImageIcon,
    Tag,
    Eye,
    X,
    HelpCircle,
    Package,
    Ruler,
    Scissors,
    FileText,
    Search,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleProduct, updateProduct } from '../../utils/ProductServices';

const UpdateProductPage = () => {
    const { productId } = useParams();
    const [editableFormData, setEditableFormData] = useState({
        productId,
        productName: "",
        productDescription: "",
        specifications: [],
        productImages: [],
        attributes: {
            material: "",
            lining: "",
            closure: "",
            fit: "",
            weight: "",
            careInstructions: "",
            season: [],
            style: [],
            badge: "",
            gender: ""
        },
        tags: [],
        meta: {
            title: "",
            description: "",
            keywords: []
        },
        faq: [],
        refundPolicy: ""
    });

    const [activeTab, setActiveTab] = useState('basic');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [newKeyword, setNewKeyword] = useState('');
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const loadProductData = async () => {
            setIsLoading(true);
            try {
                const productData = await getSingleProduct(productId);
                setEditableFormData(productData);
                setImagePreviews(productData.productImages);
                setHasChanges(false);
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProductData();
    }, [productId]);

    const handleInputChange = (path, value) => {
        const paths = path.split('.');
        setEditableFormData(prev => {
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < paths.length - 1; i++) {
                current = current[paths[i]];
            }

            current[paths[paths.length - 1]] = value;
            return newData;
        });
        setHasChanges(true);
    };

    const handleSpecChange = (e) => {
        const value = e.target.value;
        const specifications = value
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "");

        setEditableFormData(prev => ({
            ...prev,
            specifications,
        }));
    };


    const handleArrayUpdate = (path, operation, value, index = null) => {
        const paths = path.split('.');
        setEditableFormData(prev => {
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < paths.length - 1; i++) {
                current = current[paths[i]];
            }

            const array = current[paths[paths.length - 1]];

            switch (operation) {
                case 'add':
                    current[paths[paths.length - 1]] = [...array, value];
                    break;
                case 'remove':
                    current[paths[paths.length - 1]] = array.filter((_, i) => i !== index);
                    break;
                case 'update':
                    current[paths[paths.length - 1]] = array.map((item, i) => i === index ? value : item);
                    break;
                default:
                    break;
            }

            return newData;
        });
        setHasChanges(true);
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ThemasterjacketsFrontend");

        const res = await fetch("https://api.cloudinary.com/v1_1/dekf5dyng/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file)));

        setEditableFormData(prev => ({
            ...prev,
            productImages: [...prev.productImages, ...uploadedUrls]
        }));
        setImagePreviews(prev => [...prev, ...uploadedUrls]);
        setHasChanges(true);
    };

    const removeImage = (index) => {
        setEditableFormData(prev => ({
            ...prev,
            productImages: prev.productImages.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const addTag = () => {
        if (newTag.trim()) {
            handleArrayUpdate('tags', 'add', newTag.trim());
            setNewTag('');
        }
    };

    const addKeyword = () => {
        if (newKeyword.trim()) {
            handleArrayUpdate('meta.keywords', 'add', newKeyword.trim());
            setNewKeyword('');
        }
    };

    const addFaq = () => {
        if (newFaq.question.trim() && newFaq.answer.trim()) {
            handleArrayUpdate('faq', 'add', { ...newFaq });
            setNewFaq({ question: '', answer: '' });
        }
    };

    const updateSeason = (season, checked) => {
        const currentSeasons = editableFormData.attributes.season;
        const newSeasons = checked
            ? [...currentSeasons, season]
            : currentSeasons.filter(s => s !== season);

        handleInputChange('attributes.season', newSeasons);
    };

    const updateStyle = (style, checked) => {
        const currentStyles = editableFormData.attributes.style;
        const newStyles = checked
            ? [...currentStyles, style]
            : currentStyles.filter(s => s !== style);

        handleInputChange('attributes.style', newStyles);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updateData = {
                productId,
                productName: editableFormData.productName || "",
                productDescription: editableFormData.productDescription || "",
                specifications: editableFormData.specifications || [],
                productImages: editableFormData.productImages || [],
                attributes: {
                    material: editableFormData.attributes?.material || "",
                    lining: editableFormData.attributes?.lining || "",
                    closure: editableFormData.attributes?.closure || "",
                    fit: editableFormData.attributes?.fit || "",
                    weight: editableFormData.attributes?.weight || "",
                    careInstructions: editableFormData.attributes?.careInstructions || "",
                    season: editableFormData.attributes?.season || [],
                    style: editableFormData.attributes?.style || [],
                    gender: editableFormData.attributes?.gender || "",
                    badge: editableFormData.attributes?.badge || "",
                },
                tags: editableFormData.tags || [],
                meta: {
                    title: editableFormData.meta?.title || "",
                    description: editableFormData.meta?.description || "",
                    keywords: editableFormData.meta?.keywords || [],
                },
                faq: editableFormData.faq || [],
                refundPolicy: editableFormData.refundPolicy || "",
            };

            console.log("Updating product:", JSON.stringify(updateData, null, 2));

            const res = await updateProduct(updateData);
            console.log("🟢 Update Response:", res);
            if (res.status !== true) {
                throw new Error(res.message || "Update failed");
                return;
            }
            setHasChanges(false);

            Swal.fire({
                title: "✅ Product Updated Successfully!",
                html: `
        <p style="font-size: 15px; margin-top: 6px; color: #ccc;">
          All your changes have been saved and updated successfully.
        </p>
      `,
                icon: "success",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                background: "#1e1e1e",
                color: "#fff",
                customClass: {
                    popup: "shadow-lg rounded-4 border border-gray-700",
                    title: "fw-semibold",
                },
            });

            setTimeout(() => {
                navigate("/manage-all-products");
            }, 2500);
        } catch (error) {
            console.error("Error updating product:", error);

            // ❌ Professional error alert
            Swal.fire({
                title: "⚠️ Update Failed!",
                text: "Something went wrong while updating your product. Please try again.",
                icon: "error",
                confirmButtonText: "Retry",
                background: "#1e1e1e",
                color: "#fff",
                confirmButtonColor: "#2563eb",
            });
        } finally {
            setIsLoading(false);
        }
    };


    const TabButton = ({ id, icon: Icon, label, isActive }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'All'];
    const styleOptions = ['Casual', 'Formal', 'Sport', 'Business', 'Outdoor', 'Vintage', 'Modern'];
    const genderOptions = ['Men', 'Women'];
    const badgeOptions = ['None', 'New Arrival', 'Best Seller', 'Limited Edition', 'Exclusive', 'Sale']

    if (isLoading && !editableFormData.productName) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-blue-600 rounded-lg transition-all duration-200"
                            >
                                <ArrowLeft size={20} className="text-gray-700" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Update Product</h1>
                                <p className="text-gray-600 mt-1">Edit product details and information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                <Eye size={18} />
                                Preview
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || isLoading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save size={18} />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
                            <nav className="space-y-2">
                                <TabButton
                                    id="basic"
                                    icon={FileText}
                                    label="Basic Info"
                                    isActive={activeTab === 'basic'}
                                />
                                <TabButton
                                    id="images"
                                    icon={ImageIcon}
                                    label="Product Images"
                                    isActive={activeTab === 'images'}
                                />
                                <TabButton
                                    id="attributes"
                                    icon={Ruler}
                                    label="Attributes"
                                    isActive={activeTab === 'attributes'}
                                />
                                <TabButton
                                    id="seo"
                                    icon={Search}
                                    label="SEO & Meta"
                                    isActive={activeTab === 'seo'}
                                />
                                <TabButton
                                    id="faq"
                                    icon={HelpCircle}
                                    label="FAQ"
                                    isActive={activeTab === 'faq'}
                                />
                            </nav>

                            {hasChanges && (
                                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        You have unsaved changes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Basic Information Tab */}
                        {activeTab === 'basic' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={editableFormData.productName}
                                            onChange={(e) => handleInputChange('productName', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter product name..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Description *
                                        </label>
                                        <textarea
                                            value={editableFormData.productDescription}
                                            onChange={(e) => handleInputChange('productDescription', e.target.value)}
                                            rows={6}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe your product in detail..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bullet Points *
                                        </label>
                                        <textarea
                                            onChange={handleSpecChange}
                                            rows={5}
                                            style={{ border: '1px solid #2564eb7e' }}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Bullet point specifications, one per line"
                                        />

                                        {editableFormData.specifications?.length > 0 && (
                                            <ul className="mt-3 list-disc ps-4 text-gray-600">
                                                {editableFormData.specifications.map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Refund Policy
                                        </label>
                                        <input
                                            type="text"
                                            value={editableFormData.refundPolicy}
                                            onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe your refund policy..."
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Tags
                                        </label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                placeholder="Add a tag and press Enter"
                                                className="flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={addTag}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {editableFormData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    <Tag size={14} />
                                                    {tag}
                                                    <button
                                                        onClick={() => handleArrayUpdate('tags', 'remove', null, index)}
                                                        className="hover:text-blue-900"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Product Images Tab */}
                        {activeTab === 'images' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                    {imagePreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="relative group overflow-visible"
                                            style={{ position: "relative", zIndex: 10 }}
                                        >
                                            <img
                                                src={preview}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg border z-0"
                                            />

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 px-1 py-1 rounded text-xs z-40 cusor-pointer"
                                            >
                                                <Trash size={16} color="white" />
                                            </button>
                                            {/* Main Badge */}
                                            {index === 0 && (
                                                <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-40">
                                                    Main
                                                </span>
                                            )}
                                        </div>

                                    ))}

                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Upload Image</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Use high-quality, professional images</li>
                                        <li>• First image will be used as the main product image</li>
                                        <li>• Recommended size: 1000x1000 pixels</li>
                                        <li>• Supported formats: JPG, PNG, WebP</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Attributes Tab */}
                        {activeTab === 'attributes' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Attributes</h2>

                                <div className="grid grid-cols-1 gap-8">
                                    {/* Physical Attributes */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <Ruler size={20} />
                                            Physical Attributes
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Material
                                            </label>
                                            <input
                                                type="text"
                                                value={editableFormData.attributes.material}
                                                onChange={(e) => handleInputChange('attributes.material', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Cotton, Polyester, Leather"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lining
                                            </label>
                                            <input
                                                type="text"
                                                value={editableFormData.attributes.lining}
                                                onChange={(e) => handleInputChange('attributes.lining', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Silk, Polyester"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Weight
                                            </label>
                                            <input
                                                type="text"
                                                value={editableFormData.attributes.weight}
                                                onChange={(e) => handleInputChange('attributes.weight', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 0.5 kg, 1.2 lbs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Care Instructions
                                            </label>
                                            <textarea
                                                value={editableFormData.attributes.careInstructions}
                                                onChange={(e) => handleInputChange('attributes.careInstructions', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Provide care instructions..."
                                            />
                                        </div>
                                    </div>

                                    {/* Style & Category */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <Scissors size={20} />
                                            Style & Category
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                value={editableFormData.attributes.gender}
                                                onChange={(e) => handleInputChange('attributes.gender', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Gender</option>
                                                {genderOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Badge
                                            </label>
                                            <div className="flex flex-col items-start space-y-2">
                                                <select
                                                    value={editableFormData.attributes.badge}
                                                    onChange={(e) => handleInputChange('attributes.badge', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {badgeOptions.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}

                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Closure
                                            </label>
                                            <input
                                                type="text"
                                                value={editableFormData.attributes.closure}
                                                onChange={(e) => handleInputChange('attributes.closure', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Zipper, Buttons, Velcro"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fit
                                            </label>
                                            <input
                                                type="text"
                                                value={editableFormData.attributes.fit}
                                                onChange={(e) => handleInputChange('attributes.fit', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Slim, Regular, Relaxed"
                                            />
                                        </div>

                                        <div className='text-left'>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Season
                                            </label>
                                            <div className="flex flex-col items-start space-y-2">
                                                {seasonOptions.map((season) => (
                                                    <label key={season} className="flex items-center space-x-2">
                                                        <input
                                                            style={{ border: '1px solid #2564eb7e' }}
                                                            type="checkbox"
                                                            checked={editableFormData.attributes.season.includes(season)}
                                                            onChange={(e) => updateSeason(season, e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{season}</span>
                                                    </label>
                                                ))}
                                            </div>

                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Style
                                            </label>
                                            <div className="flex flex-col items-start space-y-2">
                                                {styleOptions.map(style => (
                                                    <label key={style} className="flex items-center space-x-2">
                                                        <input
                                                            style={{ border: '1px solid #2564eb7e' }}
                                                            type="checkbox"
                                                            checked={editableFormData.attributes.style.includes(style)}
                                                            onChange={(e) => updateStyle(style, e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{style}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO & Meta Tab */}
                        {activeTab === 'seo' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO & Meta Information</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Title *
                                            <span className="text-xs text-gray-500 ml-2">
                                                {editableFormData.meta.title.length}/60 characters
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editableFormData.meta.title}
                                            onChange={(e) => handleInputChange('meta.title', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Optimized meta title for search engines"
                                            maxLength={60}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Description *
                                            <span className="text-xs text-gray-500 ml-2">
                                                {editableFormData.meta.description.length}/160 characters
                                            </span>
                                        </label>
                                        <textarea
                                            value={editableFormData.meta.description}
                                            onChange={(e) => handleInputChange('meta.description', e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Compelling meta description that encourages clicks"
                                            maxLength={160}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keywords
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newKeyword}
                                                    onChange={(e) => setNewKeyword(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                                    placeholder="Add keyword and press Enter"
                                                    className="flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={addKeyword}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {editableFormData.meta.keywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                                    >
                                                        #{keyword}
                                                        <button
                                                            onClick={() => handleArrayUpdate('meta.keywords', 'remove', null, index)}
                                                            className="hover:text-purple-900"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SEO Preview */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border">
                                            <div className="text-blue-600 text-lg font-medium mb-1">
                                                {editableFormData.meta.title || "Your meta title will appear here"}
                                            </div>
                                            <div className="text-green-600 text-sm mb-2">
                                                https://themasterjackets.com/products/{editableFormData.slug || "your-product-slug"}
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                                {editableFormData.meta.description || "Your meta description will appear here in search results..."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAQ Tab */}
                        {activeTab === 'faq' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>

                                <div className="space-y-6">
                                    {editableFormData.faq.map((faq, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">FAQ {index + 1}</h3>
                                                <button
                                                    onClick={() => handleArrayUpdate('faq', 'remove', null, index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                                    <input
                                                        type="text"
                                                        value={faq.question}
                                                        onChange={(e) => handleArrayUpdate('faq', 'update', { ...faq, question: e.target.value }, index)}
                                                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                                    <textarea
                                                        value={faq.answer}
                                                        onChange={(e) => handleArrayUpdate('faq', 'update', { ...faq, answer: e.target.value }, index)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New FAQ</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                                <input
                                                    type="text"
                                                    value={newFaq.question}
                                                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter frequently asked question"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                                <textarea
                                                    value={newFaq.answer}
                                                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                                                    rows={3}
                                                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Provide a clear and helpful answer"
                                                />
                                            </div>
                                            <button
                                                onClick={addFaq}
                                                disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Add FAQ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* MODAL */}
                    {isPreviewOpen && (
                        <div
                            className="modal fade show d-block"
                            tabIndex="-1"
                            style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
                                    {/* Header */}
                                    <div className="modal-header bg-dark text-white">
                                        <h5 className="modal-title fw-bold">Product Preview</h5>
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white"
                                            onClick={() => setIsPreviewOpen(false)}
                                        ></button>
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="modal-body"
                                        style={{ maxHeight: "75vh", overflowY: "auto" }}
                                    >
                                        {/* Image Carousel */}
                                        {editableFormData.productImages.length > 0 && (
                                            <div
                                                id="previewCarousel"
                                                className="carousel slide mb-4"
                                                data-bs-ride="carousel"
                                            >
                                                <div className="carousel-inner rounded-3 shadow-sm">
                                                    {editableFormData.productImages.map((img, i) => (
                                                        <div
                                                            key={i}
                                                            className={`carousel-item ${i === 0 ? "active" : ""}`}
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`Product ${i + 1}`}
                                                                className="d-block w-100"
                                                                style={{ objectFit: "cover", maxHeight: "500px" }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    className="carousel-control-prev"
                                                    type="button"
                                                    data-bs-target="#previewCarousel"
                                                    data-bs-slide="prev"
                                                >
                                                    <span
                                                        className="carousel-control-prev-icon"
                                                        aria-hidden="true"
                                                    ></span>
                                                </button>

                                                <button
                                                    className="carousel-control-next"
                                                    type="button"
                                                    data-bs-target="#previewCarousel"
                                                    data-bs-slide="next"
                                                >
                                                    <span
                                                        className="carousel-control-next-icon"
                                                        aria-hidden="true"
                                                    ></span>
                                                </button>
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <h4 className="fw-bold mb-2">Title : {editableFormData.productName}</h4>
                                        <p className="text-muted mb-3">des: {editableFormData.productDescription}</p>

                                        <hr />

                                        <h6 className="fw-bold text-primary my-2">Attributes</h6>
                                        <ul className="list-unstyled">
                                            <li><strong>Material:</strong> {editableFormData.attributes.material}</li>
                                            <li><strong>Lining:</strong> {editableFormData.attributes.lining}</li>
                                            <li><strong>Closure:</strong> {editableFormData.attributes.closure}</li>
                                            <li><strong>Fit:</strong> {editableFormData.attributes.fit}</li>
                                            <li><strong>Weight:</strong> {editableFormData.attributes.weight}</li>
                                            <li><strong>Care:</strong> {editableFormData.attributes.careInstructions}</li>
                                            <li><strong>Gender:</strong> {editableFormData.attributes.gender}</li>
                                            <li><strong>Seasons:</strong> {editableFormData.attributes.season.join(", ")}</li>
                                            <li><strong>Style:</strong> {editableFormData.attributes.style.join(", ")}</li>
                                        </ul>

                                        <hr />

                                        <h6 className="fw-bold text-primary mb-2">Tags</h6>
                                        {editableFormData.tags.length ? (
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                {editableFormData.tags.map((tag, i) => (
                                                    <span key={i} className="badge bg-secondary">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No tags added</p>
                                        )}

                                        <hr />

                                        <h6 className="fw-bold text-primary">Meta Information</h6>
                                        <p><strong>Title:</strong> {editableFormData.meta.title}</p>
                                        <p><strong>Description:</strong> {editableFormData.meta.description}</p>
                                        <p><strong>Keywords:</strong> {editableFormData.meta.keywords.join(", ")}</p>

                                        <hr />

                                        <h6 className="fw-bold text-primary mb-2">FAQs</h6>
                                        {editableFormData.faq.length ? (
                                            <div className="border rounded p-3 bg-dark-subtle">
                                                {editableFormData.faq.map((faq, i) => (
                                                    <div key={i} className="mb-3 border-bottom pb-2">
                                                        <h6 className="fw-bold mb-1">{faq.question}</h6>
                                                        <p className="text-secondary mb-0">{faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No FAQs added</p>
                                        )}
                                        <hr />

                                        <h6 className="fw-bold text-primary">Refund Policy</h6>
                                        <p>{editableFormData.refundPolicy}</p>
                                    </div>

                                    {/* Footer */}
                                    <div className="modal-footer bg-light">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setIsPreviewOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>
                {`
                input, textarea {
                    border: 1px solid #2564eb7e;
                }
                `}
            </style>
        </div>
    );
};

export default UpdateProductPage;