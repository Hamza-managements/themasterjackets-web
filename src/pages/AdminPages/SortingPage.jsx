import { useContext, useEffect, useState } from "react";
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
import { resetProductDisplayOrder, SortProducts } from "../../utils/ProductServices";
import { fetchCategoriesAll } from "../../utils/CartUtils";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Layers, GripVertical } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

function SortableItem({ product, isHighlighted, index, pushToTop }) {
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
        border: isHighlighted ? "2px solid #22c55e" : undefined
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                bg-gradient-to-r from-gray-900 to-gray-800 
                rounded-lg p-3 mb-2 
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
                </div>
                <div>
                    <h3 className="text-white text-sm font-medium line-clamp-1">{product.parentStockKeepingUnit}</h3>
                </div>
                <button
                    onClick={() => pushToTop(index)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Push
                </button>
            </div>
            <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
    );
}

export default function ProductSort() {
    const { products, loading, fetchProducts, } = useProducts();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [orderedProducts, setOrderedProducts] = useState([]);
    const [saving, setSaving] = useState(false);
    const [reseting, setReseting] = useState(false);

    // 🔹 Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResultIndex, setSearchResultIndex] = useState(null);

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

    useEffect(() => {
        if (!selectedCategory) return;
        fetchProducts(selectedCategory, 200);
    }, [selectedCategory, fetchProducts]);

    useEffect(() => {
        if (products?.length) setOrderedProducts(products);
    }, [products]);

    // 🔹 Search logic
    useEffect(() => {
        if (!searchQuery) {
            setSearchResultIndex(null);
            return;
        }
        const idx = orderedProducts.findIndex(p =>
            p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.parentStockKeepingUnit.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResultIndex(idx !== -1 ? idx : null);
    }, [searchQuery, orderedProducts]);

    // 🔹 Drag logic
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setOrderedProducts(prev => {
            const oldIndex = prev.findIndex(p => p._id === active.id);
            const newIndex = prev.findIndex(p => p._id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    // 🔹 Save logic
    const handleSave = async () => {
        if (!selectedCategory) return alert("Select a category first");
        setSaving(true);
        try {
            const payload = {
                categoryId: selectedCategory,
                products: orderedProducts.map(p => ({ productId: p._id }))
            };
            await SortProducts(payload, user?.uid);
            alert("Order updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving order");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedCategory) return alert("Please select a category first");

        if (!window.confirm("Are you sure you want to reset the order for this category?")) return;

        setReseting(true);

        try {
            // Call your backend API that resets the category order
            let payload = {
                categoryId: selectedCategory
            };

            await resetProductDisplayOrder(payload, user?.uid);

            alert("Order has been reset!");
            // Re-fetch products to reflect the reset
            fetchProducts(selectedCategory, 200);
        } catch (err) {
            console.error(err);
            alert("Failed to reset order.");
        }
        finally {
            setReseting(false);
        }
    };

    // 🔹 Move selected product to top/bottom
    const pushToTop = (index = null) => {
        const targetIndex = index !== null ? index : searchResultIndex;

        if (targetIndex === null || targetIndex === undefined) return;

        setOrderedProducts(prev => {
            const item = prev[targetIndex];
            const newArr = prev.filter((_, i) => i !== targetIndex);
            return [item, ...newArr];
        });

        // Only clear search if it came from search
        if (index === null) {
            setSearchQuery("");
        }
    };

    const pushToBottom = () => {
        if (searchResultIndex === null) return;
        setOrderedProducts(prev => {
            const item = prev.splice(searchResultIndex, 1)[0];
            return [...prev, item];
        });
        setSearchQuery(""); // Clear search after moving
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-auto scroll-smooth">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
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
                            alt="TMJ Logo"
                            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                        />
                    </Link>
                    <div className="flex items-center gap-2">
                        {selectedCategory && !loading && (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !selectedCategory || orderedProducts.length === 0}
                                    className={`${(saving) ? 'cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded'}`}
                                >
                                    {saving ? (
                                        "Saving..."
                                    ) : (
                                        "Save"
                                    )}
                                </button>

                                <button
                                    onClick={handleReset}
                                    disabled={reseting || !selectedCategory}
                                    className={`${(reseting) ? 'cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded'}`}
                                >
                                    {reseting ? (
                                        "Resetting..."
                                    ) : (
                                        "Reset Order"
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Category */}
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                    >
                        <option value="">Choose a category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.mainCategoryName}</option>
                        ))}
                    </select>
                </div>

                {/* Search Bar + Buttons */}
                {selectedCategory && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search product..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700"
                        />
                        <button onClick={pushToTop} disabled={searchResultIndex === null} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                            Push to Top
                        </button>
                        <button onClick={pushToBottom} disabled={searchResultIndex === null} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                            Push to Bottom
                        </button>
                    </div>
                )}

                {/* Highlight info */}
                {searchResultIndex !== null && (
                    <p className="text-green-400 text-sm mb-2">
                        "{orderedProducts[searchResultIndex].productName}" is at position #{searchResultIndex + 1}
                    </p>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Loading products...</p>
                    </div>
                ) : (
                    selectedCategory && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={orderedProducts.map(p => p._id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                                    {orderedProducts.map((product, index) => (
                                        <SortableItem
                                            key={product._id}
                                            product={product}
                                            isHighlighted={index === searchResultIndex}
                                            index={index}
                                            pushToTop={pushToTop}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )
                )}

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
        </div >
    );
}