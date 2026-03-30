import { useEffect, useState, useRef } from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove
} from "@dnd-kit/sortable";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";
import { useProducts } from "../../context/ProductContext";
import { SortProducts } from "../../utils/ProductServices";
import { fetchCategoriesAll } from "../../utils/CartUtils";
import { Link, useNavigate } from "react-router-dom";
import { RotateCw, Plus, ChevronLeft, Grid3x3, Layers, Package, GripVertical } from "lucide-react";

// 🔹 Sortable Item Component - Smaller & Compact
function SortableItem({ product }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                bg-gradient-to-r from-gray-900 to-gray-800 
                border border-gray-700 rounded-lg p-3 mb-2 
                flex items-center justify-between cursor-grab
                hover:border-gray-600 transition-all duration-200
                ${isDragging ? 'shadow-xl scale-[1.02] opacity-80' : 'shadow-md'}
            `}
        >
            <div className="flex items-center gap-3">
                <img
                    src={product.productImages?.[0]}
                    alt={product.productName}
                    className="w-10 h-10 object-cover rounded-md shadow-sm"
                />
                <div>
                    <h3 className="text-white text-sm font-medium line-clamp-1">{product.productName}</h3>
                    {product.price && (
                        <p className="text-gray-400 text-xs">${product.price}</p>
                    )}
                </div>
            </div>
            <div className="text-gray-500">
                <GripVertical className="w-4 h-4" />
            </div>
        </div>
    );
}

export default function ProductSort() {
    const { products, loading, fetchProducts, hasMore, loadMore } = useProducts();
    const navigate = useNavigate();
    const [lastFetched, setLastFetched] = useState(null);
    const loaderRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [orderedProducts, setOrderedProducts] = useState([]);
    const [saving, setSaving] = useState(false);

    // ✅ 1. Fetch categories ONCE
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategoriesAll();
                setCategories(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadCategories();
    }, []);

    // ✅ 2. Fetch products WHEN category changes
    useEffect(() => {
        if (!selectedCategory) return;

        fetchProducts(selectedCategory, 200);
        setLastFetched(new Date());
    }, [selectedCategory, fetchProducts]);

    useEffect(() => {
        const node = loaderRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: "300px",
                threshold: 0
            }
        );

        observer.observe(node);

        return () => observer.unobserve(node);
    }, [hasMore, loading, loadMore]);

    // ✅ 3. Sync products → local reorder state
    useEffect(() => {
        if (products?.length) {
            setOrderedProducts(products);
        }
    }, [products]);

    // 🔹 Drag logic
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setOrderedProducts((prev) => {
            const oldIndex = prev.findIndex(p => p._id === active.id);
            const newIndex = prev.findIndex(p => p._id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    // 🔹 Save with categoryId
    const handleSave = async () => {
        if (!selectedCategory) {
            alert("Please select a category first");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                categoryId: selectedCategory,
                products: orderedProducts.map((p) => ({
                    productId: p._id
                }))
            };

            console.log("Saving order with payload:", payload);

            await SortProducts(payload);
            alert("Order updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving order");
        } finally {
            setSaving(false);
        }
    };

    // 🔹 Refresh products
    const refreshProducts = () => {
        if (selectedCategory) {
            fetchProducts(selectedCategory, 150);
            setLastFetched(new Date());
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-auto scroll-smooth">
            {/* Modern Header - Compact */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    {/* Top Bar - Compact */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <ChevronLeft size={16} />
                            <span>Back</span>
                        </button>

                        <Link to="/" target="_blank" className="flex items-center gap-2 group">
                            <img
                                src="https://res.cloudinary.com/dekf5dyng/image/upload/v1761554899/TMJ_logo_dark_kyarf4.png"
                                alt="TheMasterJacketsLOGO"
                                className="h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                            />
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={refreshProducts}
                                disabled={!selectedCategory}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200 border border-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCw size={14} />
                                <span className="hidden sm:inline text-xs">Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate("/admin/add-product")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-md text-sm"
                            >
                                <Plus size={14} />
                                <span className="hidden sm:inline">Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Title Section - Compact */}
                    <div className="mt-3">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Products Sorting
                        </h1>
                        <p className="text-gray-400 text-xs mt-1">
                            Drag and drop to reorder your product catalog
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Last updated: {lastFetched ? new Date(lastFetched).toLocaleString() : "Never"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content - Compact */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Category Selector - Compact */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700/50 backdrop-blur-sm">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="">Choose a category to reorder products</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.mainCategoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Drag and Drop List - Compact */}
                {selectedCategory && (
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-white">Reorder Products</h2>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Grid3x3 className="w-3.5 h-3.5" />
                                <span>Drag to reorder</span>
                            </div>
                        </div>

                        {orderedProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No products found in this category</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={orderedProducts.map(p => p._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2 max-h-[60vh] overflow-y-auto scroll-smooth pr-1">
                                        {orderedProducts.map((product) => (
                                            <SortableItem key={product._id} product={product} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}

                        {/* Save Button - Compact */}
                        {!loading && !hasMore &&
                            <button
                                onClick={handleSave}
                                disabled={saving || !selectedCategory || orderedProducts.length === 0}
                                className={`
                                w-full mt-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                                ${(saving || !selectedCategory || orderedProducts.length === 0)
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md'
                                    }
                            `}
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </div>
                                ) : (
                                    "Save Order"
                                )}
                            </button>
                        }

                    </div>
                )}

                <div ref={loaderRef} style={{ height: "60px", textAlign: "center" }}>
                    <div className="flex justify-center items-center my-4 text-white">
                        {loading ? (
                            <p>Loading More Products..</p>
                        ) : (
                            <p style={{ visibility: "hidden" }}>Placeholder</p>
                        )}
                    </div>
                </div>

                {/* Empty State for No Category - Compact */}
                {!selectedCategory && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-xl mb-4">
                            <Layers className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">No Category Selected</h3>
                        <p className="text-gray-400 text-sm">Please select a category above to start reordering products</p>
                    </div>
                )}
            </div>
        </div>
    );
}
