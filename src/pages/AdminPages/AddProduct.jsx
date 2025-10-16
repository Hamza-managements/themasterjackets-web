import { useState, useContext, useEffect } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Tag,
  Info,
  Layers,
  Search,
  Hash,
  Key,
  Globe,
  Ruler,
  Scissors,
  Badge,
} from 'lucide-react';
import { AuthContext } from '../../components/auth/AuthProvider';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { fetchCategoriesAll } from '../../utils/CartUtils';


const AmazonStyleProductPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    parentStockKeepingUnit: '',
    specifications: [],
    productImages: [],
    variations: [],
    meta: {
      title: '',
      description: '',
      keywords: []
    },
    faq: [],
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
      gender: 'Men',
      badge: ""
    },
    refundPolicy: '30-day return & refund policy',
    categoryId: '',
    subCategoryId: ''
  });


  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  useEffect(() => {
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

  useEffect(() => {
    console.log("Fetched categories:", categories);
    console.log("updated formData:", formData);
  }, [categories, formData]);

  const addVariation = () => {
    setFormData((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          stockKeepingUnit: "",
          variationName: "",
          productImages: [],
          productPrice: { originalPrice: 0, discountedPrice: 0, currency: "USD" },
          stockQuantity: 0,
          attributes: { color: "", size: "", material: "", weight: "" },
          inventoryStatus: "in stock",
          shipping: { shippingCharges: 0, isFreeShipping: true, estimatedDeliveryDays: 5 },
          ratings: { count: 5 },
        }
      ]
    }));
  };

  const updateVariation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const updateNestedVariation = (index, parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index ? {
          ...variation,
          [parent]: { ...variation[parent], [field]: value }
        } : variation
      )
    }));
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (e) => {
    const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
    setFormData((prev) => ({
      ...prev,
      specifications: lines
    }));
  };

  // Upload a single file to Cloudinary and return its URL
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

  const handleImageUpload = async (e, variationIndex = null) => {
    const files = Array.from(e.target.files);

    const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file)));

    if (variationIndex !== null) {
      setFormData(prev => ({
        ...prev,
        variations: prev.variations.map((variation, i) =>
          i === variationIndex
            ? { ...variation, productImages: [...variation.productImages, ...uploadedUrls] }
            : variation
        )
      }));
    } else {
      // Main product images
      setFormData(prev => ({
        ...prev,
        productImages: [...prev.productImages, ...uploadedUrls]
      }));
      setImagePreviews(prev => [...prev, ...uploadedUrls]);
    }
  };

  // Remove image (works for both main & variation images)
  const removeImage = (index, variationIndex = null) => {
    if (variationIndex !== null) {
      setFormData(prev => ({
        ...prev,
        variations: prev.variations.map((variation, i) =>
          i === variationIndex
            ? {
              ...variation,
              productImages: variation.productImages.filter((_, imgIndex) => imgIndex !== index)
            }
            : variation
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productImages: prev.productImages.filter((_, i) => i !== index)
      }));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };


  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          keywords: [...prev.meta.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        keywords: prev.meta.keywords.filter((_, i) => i !== index)
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFormData(prev => ({
        ...prev,
        faq: [...prev.faq, { ...newFaq }]
      }));
      setNewFaq({ question: '', answer: '' });
    }
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const updateAttribute = (field, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [field]: value
      }
    }));
  };

  const updateSeason = (season, checked) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        season: checked
          ? [...prev.attributes.season, season]
          : prev.attributes.season.filter(s => s !== season)
      }
    }));
  };

  const updateStyle = (style, checked) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        style: checked
          ? [...prev.attributes.style, style]
          : prev.attributes.style.filter(s => s !== style)
      }
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const isValid = validateForm(true);
      // if (!isValid) return;

      const res = await fetch(
        `https://themasterjacketsbackend-production.up.railway.app/api/product/save/${user.uid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData)
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      if (!res.ok) {
        console.error("❌ API Error:", data);
        console.error("❌ Sent Data:", formData);
        console.error("❌ Response Status:", res.status);
        throw new Error(data.message || "Server error");
      }

      Swal.fire({
        title: "🎉 Product Added Successfully!",
        html: `
    <p style="font-size: 15px; margin-top: 6px; color: #555;">
      Your product has been saved and is now visible in your inventory.
    </p>
  `,
        icon: "success",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: "#f9fafb",
        color: "#111827",
        customClass: {
          popup: "shadow-lg rounded-4",
          title: "fw-semibold",
        },
      });
      setTimeout(() => {
        navigate("/manage-all-products");
      }, 2500);

    } catch (e) {
      console.error("Error adding product:", e.message);
      Swal.fire({
        title: "Error",
        text: e.message || "Failed to add product. Please try again.",
        icon: "error",
      });
    }
  };

  const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'All'];
  const styleOptions = ['Casual', 'Formal', 'Sport', 'Business', 'Vintage', 'Modern'];
  const fitOptions = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
  const closureOptions = ['Zipper', 'Buttons', 'Velcro', 'Snap', 'Elastic'];
  const genderOptions = ['Men', 'Women'];
  const badgeOptions = ['None', 'New Arrival', 'Best Seller', 'Limited Edition', 'Exclusive', 'Sale']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product listing with variations</p>
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
                  icon={Edit}
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
                  icon={Tag}
                  label="Attributes"
                  isActive={activeTab === 'attributes'}
                />
                <TabButton
                  id="variations"
                  icon={Layers}
                  label="Variations"
                  isActive={activeTab === 'variations'}
                />
                <TabButton
                  id="seo"
                  icon={Search}
                  label="SEO & Meta"
                  isActive={activeTab === 'seo'}
                />
              </nav>
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
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      style={{ border: '1px solid #2564eb7e' }}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product Title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description *
                    </label>
                    <textarea
                      value={formData.productDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                      rows={6}
                      style={{ border: '1px solid #2564eb7e' }}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your product in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bullet Points *
                    </label>
                    <textarea
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          specifications: e.target.value.split('\n'), // split text by new lines
                        }))
                      }
                      value={
                        Array.isArray(formData.specifications)
                          ? formData.specifications.join('\n') // join array by new lines for textarea
                          : formData.specifications || ''
                      }
                      rows={5}
                      style={{ border: '1px solid #2564eb7e' }}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bullet point specifications, one per line"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent SKU
                    </label>
                    <input
                      type="text"
                      value={formData.parentStockKeepingUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentStockKeepingUnit: e.target.value.toLocaleUpperCase() }))}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SKU-001"
                      style={{ textTransform: 'uppercase', border: '1px solid #2564eb7e' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Product Images Tab */}
            {activeTab === 'images' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

                {/* Main Product Images */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Main Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <label className="flex flex-col items-center justify-center w-full h-32rounded-lg cursor-pointer transition-colors label-border">
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
                </div>
              </div>
            )}

            {/* Variations Tab */}
            {activeTab === 'variations' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Variations</h2>
                  <button
                    onClick={addVariation}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Variation
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Variation {index + 1}
                        </h3>
                        <button
                          onClick={() => removeVariation(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variation Name
                          </label>
                          <input
                            type="text"
                            value={variation.variationName}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateVariation(index, 'variationName', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Blue, Large"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={variation.stockKeepingUnit}
                            style={{ border: '1px solid #2564eb7e', textTransform: 'uppercase' }}
                            onChange={(e) => updateVariation(index, 'stockKeepingUnit', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="SKU-001-BL-L"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <input
                            type="text"
                            style={{ border: '1px solid #2564eb7e' }}
                            value={variation.attributes.color}
                            onChange={(e) => updateNestedVariation(index, 'attributes', 'color', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Blue"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-medium">Size</label>
                          <select
                            value={variation.attributes.size}
                            onChange={(e) => updateNestedVariation(index, 'attributes', 'size', e.target.value)}
                            style={{ border: '1px solid #2564eb7e' }}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                          >
                            <option value="" disabled>Select size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>


                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight
                          </label>
                          <input
                            type="text"
                            value={variation.attributes.weight}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateNestedVariation(index, 'attributes', 'weight', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="1.5 kg, 800 g, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Material
                          </label>
                          <input
                            type="text"
                            value={variation.attributes.material}
                            onChange={(e) => updateNestedVariation(index, 'attributes', 'material', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Leather, Cotton, etc."
                            style={{ border: '1px solid #2564eb7e' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Original Price ($)
                          </label>
                          <input
                            type="number"
                            value={variation.productPrice.originalPrice}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateNestedVariation(index, 'productPrice', 'originalPrice', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discounted Price ($)
                          </label>
                          <input
                            type="number"
                            value={variation.productPrice.discountedPrice}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateNestedVariation(index, 'productPrice', 'discountedPrice', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={variation.stockQuantity}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateVariation(index, 'stockQuantity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inventory Status
                          </label>
                          <select
                            value={variation.inventoryStatus}
                            onChange={(e) => updateVariation(index, 'inventoryStatus', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="in stock">In Stock</option>
                            <option value="out of stock">Out of Stock</option>
                            <option value="backorder">Backorder</option>
                          </select>
                        </div>
                      </div>
                      {/* Shipping Information */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Shipping Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shipping Charges
                          </label>
                          <input
                            type="number"
                            value={variation.shipping.shippingCharges}
                            style={{ border: '1px solid #2564eb7e' }}
                            onChange={(e) => updateNestedVariation(index, 'shipping', 'shippingCharges', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min={0}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                            Free Shipping
                          </label>
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" style={{ border: '1px solid #2564eb7e' }} checked={variation.shipping.isFreeShipping}
                              onChange={(e) =>
                                updateNestedVariation(index, 'shipping', 'isFreeShipping', e.target.checked)
                              } />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Delivery Days
                          </label>
                          <input
                            type="number"
                            style={{ border: '1px solid #2564eb7e' }}
                            value={variation.shipping.estimatedDeliveryDays}
                            onChange={(e) => updateNestedVariation(index, 'shipping', 'estimatedDeliveryDays', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min={0}
                          />
                        </div>
                      </div>

                      {/* Variation Images */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Variation Images
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {variation.productImages.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={image}
                                alt={`Variation ${index + 1} - ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => removeImage(imgIndex, index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}

                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            <Upload size={20} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Add Image</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.variations.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Layers size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No variations added</h3>
                      <p className="text-gray-500 mb-4">Add variations to create different product options</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Attributes</h2>

                <div className="grid grid-cols-1 gap-8">
                  {/* Basic Attributes */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Ruler size={20} />
                      Basic Attributes
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <input
                        style={{ border: '1px solid #2564eb7e' }}
                        type="text"
                        value={formData.attributes.material}
                        onChange={(e) => updateAttribute('material', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Cotton, Polyester, Leather"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lining
                      </label>
                      <input
                        style={{ border: '1px solid #2564eb7e' }}
                        type="text"
                        value={formData.attributes.lining}
                        onChange={(e) => updateAttribute('lining', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Silk, Polyester"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        style={{ border: '1px solid #2564eb7e' }}
                        type="text"
                        value={formData.attributes.weight}
                        onChange={(e) => updateAttribute('weight', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 0.5 kg, 1.2 lbs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Care Instructions
                      </label>
                      <select
                        value={formData.attributes.careInstructions}
                        onChange={(e) => updateAttribute('careInstructions', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Dry clean only">Dry clean only</option>
                        <option value="Machine wash">Machine wash</option>
                        <option value="Hand wash only">Hand wash only</option>
                        <option value="Do not wash">Do not wash</option>
                        <option value="Wash cold">Wash cold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: selectedId,
                            subCategoryId: "",
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option disabled value="">
                          Select Category
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.mainCategoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Category *
                      </label>
                      <select
                        value={formData.subCategoryId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subCategoryId: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!formData.categoryId} // disable until category selected
                      >
                        <option disabled value="">
                          {formData.categoryId ? "Select Sub Category" : "Select a Category first"}
                        </option>
                        {categories
                          .find((cat) => cat._id === formData.categoryId)
                          ?.subCategories?.map((subCat) => (
                            <option key={subCat._id} value={subCat._id}>
                              {subCat.categoryName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Style & Fit */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Scissors size={20} />
                      Style & Fit
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.attributes.gender}
                        onChange={(e) => updateAttribute('gender', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {genderOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge
                      </label>
                      <select
                        value={formData.attributes.badge}
                        onChange={(e) => updateAttribute('badge', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {badgeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fit
                      </label>
                      <select
                        value={formData.attributes.fit}
                        onChange={(e) => updateAttribute('fit', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Fit</option>
                        {fitOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Closure
                      </label>
                      <select
                        value={formData.attributes.closure}
                        onChange={(e) => updateAttribute('closure', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Closure</option>
                        {closureOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
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
                              checked={formData.attributes.season.includes(season)}
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
                              checked={formData.attributes.style.includes(style)}
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

                <div className="space-y-8">
                  {/* Meta Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Globe size={20} />
                      Meta Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title *
                        <span className="text-xs text-gray-500 ml-2">
                          {formData.meta.title.length}/60 characters
                        </span>
                      </label>
                      <input
                        style={{ border: '1px solid #2564eb7e' }}
                        type="text"
                        value={formData.meta.title}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          meta: { ...prev.meta, title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Optimized meta title for search engines"
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description *
                        <span className="text-xs text-gray-500 ml-2">
                          {formData.meta.description.length}/160 characters
                        </span>
                      </label>
                      <textarea
                        value={formData.meta.description}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          meta: { ...prev.meta, description: e.target.value }
                        }))}
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
                            style={{ border: '1px solid #2564eb7e' }}
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
                          {formData.meta.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <Hash size={14} />
                              {keyword}
                              <button
                                onClick={() => removeKeyword(index)}
                                className="hover:text-blue-900"
                              >
                                <Trash2 size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Tags */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Tag size={20} />
                      Product Tags
                    </h3>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          style={{ border: '1px solid #2564eb7e' }}
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add product tag"
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
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            <Key size={14} />
                            {tag}
                            <button
                              onClick={() => removeTag(index)}
                              className="hover:text-green-900"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Info size={20} />
                      Frequently Asked Questions
                    </h3>

                    <div className="space-y-4">
                      {formData.faq.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{faq.question}</h4>
                            <button
                              onClick={() => removeFaq(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm">{faq.answer}</p>
                        </div>
                      ))}

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Add New FAQ</h4>
                        <div className="space-y-4">
                          <input
                            style={{ border: '1px solid #2564eb7e' }}
                            type="text"
                            value={newFaq.question}
                            onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter question"
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            style={{ border: '1px solid #2564eb7e' }}
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                            placeholder="Enter answer"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={addFaq}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={18} />
                            Add FAQ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Preview */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="text-blue-600 text-lg font-medium mb-1">
                        {formData.meta.title || "Your meta title will appear here"}
                      </div>
                      <div className="text-green-600 text-sm mb-2">
                        https://themasterjackets.com/products/{"your-product-slug"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {formData.meta.description || "Your meta description will appear here in search results..."}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Save as Draft
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleSubmit}>
                    Publish Product
                  </button>
                </div>
              </div>
            )}
            <div style={{ height: "180px" }}></div>
          </div>
        </div>
      </div>
      <style>{`
        .label-border{
           padding: 30px;
           border: 1px dashed #2564ebae;  
           border-radius: 8px;
           cursor: pointer;
           transition: border-color 0.3s ease;
        }
        .label-border:hover{
          border: 2px dashed #2564eb;
        }
      `}</style>
    </div>
  );
};

export default AmazonStyleProductPage;