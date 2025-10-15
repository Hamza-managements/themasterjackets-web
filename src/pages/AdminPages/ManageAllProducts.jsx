import React, { useState, useEffect, useMemo } from "react";
import {
  RotateCw,
  Plus,
  Package,
  CheckCircle,
  BarChart3,
  DollarSign,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteProduct } from "../../utils/ProductServices";
import { useProducts } from "../../context/ProductContext";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { products, loading, lastFetched, refreshProducts } = useProducts();

  // ✅ Filter + Sort + Search
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter((p) =>
        p.productTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      result = result.filter((p) => p.status === isPublished);
    }

    // Sorting
    if (sortBy === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "name")
      result.sort((a, b) =>
        a.productTitle.localeCompare(b.productTitle)
      );

    return result;
  }, [products, searchTerm, statusFilter, sortBy]);

  // ✅ Selection logic
  const toggleSelect = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]); // Unselect all
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id)); // Select all
    }
  };

  // ✅ Delete Product
  const handleDelete = async (productId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProduct(productId);
        refreshProducts();
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire("Error!", "Failed to delete product.", "error");
      }
    }
  };

  const totalRevenue = products.reduce((sum, product) => {
    const variation = product.variations?.[0];
    return sum + (variation?.productPrice?.discountedPrice || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-1">
              View and manage your entire product catalog
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastFetched ? new Date(lastFetched).toLocaleString() : "Never"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={refreshProducts} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><RotateCw size={18} /></button>
            <button
              onClick={() => navigate("/add-product")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Products"
            value={products.length}
            icon={<Package className="text-blue-600" />}
          />
          <StatCard
            title="Published"
            value={products.filter((p) => p.status === true).length}
            icon={<CheckCircle className="text-green-600" />}
          />
          <StatCard
            title="Categories"
            value={[...new Set(products.map((p) => p.categoryId))].length}
            icon={<BarChart3 className="text-purple-600" />}
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="text-green-600" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImages?.[0]}
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-500">{product.parentStockKeepingUnit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      $
                      {product.variations?.[0]?.productPrice?.discountedPrice ||
                        0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {product.status ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 flex items-center gap-3">
                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/edit-product/${product._id}`)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      {/* Manage Variations */}
                      <button
                        onClick={() =>
                          navigate(`/manage-single-product/${product._id}`)
                        }
                        className="text-purple-600 hover:text-purple-800 transition"
                        title="Manage Variations"
                      >
                        <i className="fas fa-layer-group"></i>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Product"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => navigate("/add-product")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                Add Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    {icon}
  </div>
);

export default ManageProducts;
